import { NextResponse } from 'next/server';
import { initiatePayment } from '@/lib/payments/service';

const errorMessages: Record<string, string> = {
  PAYMENT_GATEWAY_INACTIVE: 'درگاه پرداخت فعال نیست.',
  PAYMENT_PROVIDER_NOT_SUPPORTED: 'درگاه پرداخت پشتیبانی نمی شود.',
  INVALID_PAYMENT_AMOUNT: 'مبلغ پرداخت معتبر نیست.'
};

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const result = await initiatePayment(request, payload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PAYMENT_INIT_FAILED';
    return NextResponse.json({ error: errorMessages[message] || message }, { status: 400 });
  }
}
