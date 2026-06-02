import { createEntity, listEntity, updateEntity } from '@/lib/admin-store';
import type { Order, PaymentGateway, PaymentTransaction } from '@/app/admin/types';
import { getPaymentProvider, providerTitles, type PaymentProviderKey } from './providers';

type AnyRecord = Record<string, any>;

const defaultManualGateway: PaymentGateway = {
  id: 'default-manual-card',
  provider: 'manual_card',
  title: 'کارت به کارت',
  is_active: true,
  is_sandbox: true,
  priority: 900,
  credentials: {},
  description: 'پرداخت کارت به کارت با بررسی مدیر'
};

export async function listPaymentGateways({ publicOnly = false } = {}) {
  const gateways = await listEntity('payment_gateways', 'priority', '100').catch(() => [] as PaymentGateway[]);
  const normalized = (gateways as PaymentGateway[]).length ? gateways as PaymentGateway[] : [defaultManualGateway];
  const active = normalized.filter((gateway) => gateway.is_active !== false).sort((a, b) => Number(a.priority || 0) - Number(b.priority || 0));
  if (!publicOnly) return normalized;
  return active.map(({ credentials, ...gateway }) => ({
    ...gateway,
    is_configured: gateway.provider === 'manual_card' || Boolean(credentials && Object.values(credentials).some(Boolean))
  }));
}

export async function getGateway(provider: string) {
  const gateways = await listPaymentGateways();
  return (gateways as PaymentGateway[]).find((gateway) => gateway.provider === provider && gateway.is_active !== false) || null;
}

function absoluteUrl(request: Request, path: string) {
  const url = new URL(request.url);
  return `${url.origin}${path}`;
}

export async function initiatePayment(request: Request, payload: AnyRecord) {
  const providerKey = String(payload.provider || payload.payment_gateway || 'manual_card') as PaymentProviderKey;
  const gateway = await getGateway(providerKey);
  if (!gateway) throw new Error('PAYMENT_GATEWAY_INACTIVE');
  const provider = getPaymentProvider(providerKey);
  if (!provider) throw new Error('PAYMENT_PROVIDER_NOT_SUPPORTED');

  const orderNumber = payload.order_number || `NP-${Date.now().toString(36).toUpperCase()}`;
  const amount = Number(payload.total ?? payload.total_amount ?? payload.amount ?? 0);
  if (!amount || amount <= 0) throw new Error('INVALID_PAYMENT_AMOUNT');

  const isManual = providerKey === 'manual_card';
  const order = await createEntity('orders', {
    ...payload,
    order_number: orderNumber,
    total: amount,
    total_amount: amount,
    status: isManual ? 'pending_payment' : 'pending_payment',
    payment_method: providerKey,
    payment_gateway: providerKey,
    payment_status: isManual ? 'manual_pending' : 'pending',
    manual_payment_status: isManual ? 'pending' : undefined
  }) as Order;

  const transaction = await createEntity('payment_transactions', {
    order_id: order.id,
    order_number: order.order_number,
    provider: providerKey,
    amount,
    currency: payload.currency || 'IRR',
    status: isManual ? 'manual_pending' : 'initiated'
  }) as PaymentTransaction;

  const result = await provider.createPayment(gateway, {
    orderId: order.id,
    orderNumber: order.order_number,
    amount,
    callbackUrl: absoluteUrl(request, `/api/payments/callback/${providerKey}`),
    description: `سفارش ${order.order_number}`
  });

  if (result.status === 'failed') {
    await updateEntity('payment_transactions', transaction.id, {
      status: 'failed',
      error_code: result.errorCode,
      error_message: result.errorMessage
    });
    await updateEntity('orders', order.id, { payment_status: 'failed' });
  }

  if (result.status === 'redirect') {
    await updateEntity('payment_transactions', transaction.id, {
      status: 'redirected',
      authority: result.authority,
      ref_id: result.refId
    });
  }

  return {
    order,
    transaction,
    payment: result,
    resultUrl: `/payment/result?order=${encodeURIComponent(order.order_number)}&status=${encodeURIComponent(result.status)}`
  };
}

export async function handleGatewayCallback(request: Request, providerKey: string) {
  const gateway = await getGateway(providerKey);
  const provider = gateway ? getPaymentProvider(providerKey) : null;
  if (!gateway || !provider) throw new Error('PAYMENT_GATEWAY_INACTIVE');
  const payload = await provider.parseCallback(request);
  const orderNumber = String(payload.order_number || payload.OrderId || payload.order || '');
  const transactions = await listEntity('payment_transactions', '-created_date', '200') as PaymentTransaction[];
  const transaction = transactions.find((item) => item.provider === providerKey && (!orderNumber || item.order_number === orderNumber));
  if (!transaction) throw new Error('PAYMENT_TRANSACTION_NOT_FOUND');

  if (['paid', 'verified'].includes(transaction.status)) {
    return { transaction, status: 'already_verified' };
  }

  const verify = await provider.verifyPayment(gateway, payload);
  await updateEntity('payment_transactions', transaction.id, {
    status: verify.status === 'verified' ? 'verified' : verify.status,
    callback_payload: payload,
    verify_payload: verify.raw,
    ref_id: verify.refId,
    track_id: verify.trackId,
    error_code: verify.errorCode,
    error_message: verify.errorMessage
  });

  const orders = await listEntity('orders', '-created_date', '200') as Order[];
  const order = orders.find((item) => item.id === transaction.order_id);
  if (order) {
    await updateEntity('orders', order.id, verify.status === 'verified'
      ? { payment_status: 'paid', status: 'processing', paid_at: new Date().toISOString(), payment_tracking_code: verify.refId || verify.trackId }
      : { payment_status: verify.status === 'cancelled' ? 'failed' : 'failed' });
  }

  return { transaction, status: verify.status };
}

export function providerDefaults() {
  return Object.entries(providerTitles).map(([provider, title], index) => ({
    provider,
    title,
    is_active: provider === 'manual_card',
    is_sandbox: true,
    priority: (index + 1) * 10,
    credentials: {},
    description: provider === 'manual_card' ? 'پرداخت کارت به کارت با بررسی مدیر' : 'برای فعال سازی، credential رسمی و تست verify لازم است.'
  }));
}
