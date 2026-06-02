import { NextResponse } from 'next/server';
import { handleGatewayCallback } from '@/lib/payments/service';

async function handle(request: Request, provider: string) {
  try {
    const result = await handleGatewayCallback(request, provider);
    const status = result.status === 'verified' || result.status === 'already_verified' ? 'success' : 'failed';
    const order = result.transaction.order_number || '';
    return NextResponse.redirect(new URL(`/payment/result?status=${status}&order=${encodeURIComponent(order)}`, request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PAYMENT_CALLBACK_FAILED';
    return NextResponse.redirect(new URL(`/payment/result?status=failed&error=${encodeURIComponent(message)}`, request.url));
  }
}

export async function GET(request: Request, { params }: { params: { provider: string } }) {
  return handle(request, params.provider);
}

export async function POST(request: Request, { params }: { params: { provider: string } }) {
  return handle(request, params.provider);
}
