import { redirect } from 'next/navigation';

export default function PaymentSuccessShortcut() {
  redirect('/payment/result?status=success');
}
