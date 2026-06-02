import { redirect } from 'next/navigation';

export default function PaymentFailedShortcut() {
  redirect('/payment/result?status=failed');
}
