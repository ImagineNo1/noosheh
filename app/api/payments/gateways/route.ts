import { NextResponse } from 'next/server';
import { listPaymentGateways } from '@/lib/payments/service';

export async function GET() {
  const gateways = await listPaymentGateways({ publicOnly: true });
  return NextResponse.json(gateways);
}
