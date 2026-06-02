import type { PaymentGateway } from '@/app/admin/types';

export type PaymentProviderKey =
  | 'zarinpal'
  | 'zibal'
  | 'idpay'
  | 'payir'
  | 'nextpay'
  | 'behpardakht_mellat'
  | 'parsian'
  | 'saman'
  | 'manual_card';

export type PaymentRequest = {
  orderId: string;
  orderNumber: string;
  amount: number;
  callbackUrl: string;
  description?: string;
};

export type PaymentCreateResult = {
  status: 'redirect' | 'manual_pending' | 'failed';
  redirectUrl?: string;
  authority?: string;
  refId?: string;
  errorCode?: string;
  errorMessage?: string;
  manualInstructions?: Record<string, string>;
};

export type PaymentVerifyResult = {
  status: 'verified' | 'failed' | 'cancelled';
  refId?: string;
  trackId?: string;
  raw?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
};

export interface PaymentProvider {
  key: PaymentProviderKey;
  createPayment(gateway: PaymentGateway, request: PaymentRequest): Promise<PaymentCreateResult>;
  verifyPayment(gateway: PaymentGateway, payload: Record<string, unknown>): Promise<PaymentVerifyResult>;
  parseCallback(request: Request): Promise<Record<string, unknown>>;
}

async function parseRequestPayload(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return { ...query, ...(await request.json().catch(() => ({}))) };
    const form = await request.formData().catch(() => null);
    if (form) return { ...query, ...Object.fromEntries(Array.from(form.entries()).map(([key, value]) => [key, String(value)])) };
  }
  return query;
}

class StubOnlineProvider implements PaymentProvider {
  constructor(public key: PaymentProviderKey, private title: string) {}

  async createPayment(): Promise<PaymentCreateResult> {
    return {
      status: 'failed',
      errorCode: 'PROVIDER_NOT_VALIDATED',
      errorMessage: `${this.title} به تنظیم credential و اعتبارسنجی مستندات رسمی نیاز دارد. پرداخت موفق جعلی ساخته نشد.`
    };
  }

  async verifyPayment(): Promise<PaymentVerifyResult> {
    return {
      status: 'failed',
      errorCode: 'PROVIDER_NOT_VALIDATED',
      errorMessage: `${this.title} هنوز برای verify زنده فعال نشده است.`
    };
  }

  parseCallback(request: Request) {
    return parseRequestPayload(request);
  }
}

class ManualCardProvider implements PaymentProvider {
  key: PaymentProviderKey = 'manual_card';

  async createPayment(gateway: PaymentGateway): Promise<PaymentCreateResult> {
    const credentials = gateway.credentials || {};
    return {
      status: 'manual_pending',
      manualInstructions: {
        card_number: credentials.card_number || '',
        card_owner: credentials.card_owner || '',
        sheba: credentials.sheba || '',
        bank_name: credentials.bank_name || '',
        instructions: credentials.instructions || gateway.description || 'پس از کارت به کارت، شماره سفارش را برای پشتیبانی ارسال کنید.'
      }
    };
  }

  async verifyPayment(): Promise<PaymentVerifyResult> {
    return { status: 'failed', errorCode: 'MANUAL_REVIEW_REQUIRED', errorMessage: 'پرداخت کارت به کارت باید توسط مدیر تایید شود.' };
  }

  parseCallback(request: Request) {
    return parseRequestPayload(request);
  }
}

export const providerTitles: Record<PaymentProviderKey, string> = {
  zarinpal: 'زرین پال',
  zibal: 'زیبال',
  idpay: 'آیدی پی',
  payir: 'Pay.ir',
  nextpay: 'نکست پی',
  behpardakht_mellat: 'به پرداخت ملت',
  parsian: 'پارسیان',
  saman: 'سامان',
  manual_card: 'کارت به کارت'
};

export const paymentProviders: Record<PaymentProviderKey, PaymentProvider> = {
  zarinpal: new StubOnlineProvider('zarinpal', providerTitles.zarinpal),
  zibal: new StubOnlineProvider('zibal', providerTitles.zibal),
  idpay: new StubOnlineProvider('idpay', providerTitles.idpay),
  payir: new StubOnlineProvider('payir', providerTitles.payir),
  nextpay: new StubOnlineProvider('nextpay', providerTitles.nextpay),
  behpardakht_mellat: new StubOnlineProvider('behpardakht_mellat', providerTitles.behpardakht_mellat),
  parsian: new StubOnlineProvider('parsian', providerTitles.parsian),
  saman: new StubOnlineProvider('saman', providerTitles.saman),
  manual_card: new ManualCardProvider()
};

export function getPaymentProvider(provider: string) {
  return paymentProviders[provider as PaymentProviderKey] || null;
}
