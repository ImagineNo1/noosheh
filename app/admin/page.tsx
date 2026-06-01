'use client';

import { Card } from './_components/ui';
import { formatDate, formatPrice, useEntityList } from './_components/hooks';
import type { Order, Product, Review } from './types';

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: 'در انتظار', cls: 'warning' },
  processing: { label: 'در حال پردازش', cls: 'info' },
  shipped: { label: 'ارسال شده', cls: 'purple' },
  delivered: { label: 'تحویل شده', cls: 'success' },
  cancelled: { label: 'لغو شده', cls: 'danger' }
};

function StatusBadge({ status }: { status: string }) {
  const item = statusMap[status] || { label: status, cls: 'neutral' };
  return <span className={`admin-badge ${item.cls}`}>{item.label}</span>;
}

export default function Dashboard() {
  const { data: products } = useEntityList<Product>('Product');
  const { data: orders } = useEntityList<Order>('Order', '-created_date');
  const { data: reviews } = useEntityList<Review>('Review', '-created_date');

  const totalRevenue = orders.filter((order) => order.payment_status === 'paid').reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const pendingReviews = reviews.filter((review) => review.status === 'pending').length;

  const stats = [
    { title: 'محصولات', value: products.length.toLocaleString('fa-IR'), icon: '▣', tone: 'blue' },
    { title: 'سفارشات', value: orders.length.toLocaleString('fa-IR'), icon: '◈', tone: 'green' },
    { title: 'نظرات', value: reviews.length.toLocaleString('fa-IR'), icon: '☷', tone: 'orange' },
    { title: 'در انتظار بررسی', value: pendingReviews.toLocaleString('fa-IR'), icon: '↗', tone: 'pink' }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-title">داشبورد</h1><p className="admin-muted small">نمای کلی محصولات، سفارشات و نظرات فروشگاه</p></div><strong className="admin-price">درآمد پرداخت‌شده: {formatPrice(totalRevenue)} ریال</strong></div>

      <div className="admin-stats-grid">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <div className="admin-stat-card">
              <div><p>{stat.title}</p><strong>{stat.value}</strong></div>
              <span className={`admin-stat-icon ${stat.tone}`}>{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="admin-card-header"><h2>آخرین سفارشات</h2></div>
        {orders.length === 0 ? <p className="admin-muted center pad-lg">هنوز سفارشی ثبت نشده</p> : (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>شماره</th><th>مشتری</th><th>مبلغ</th><th>وضعیت</th><th>تاریخ</th></tr></thead><tbody>{orders.slice(0, 10).map((order) => <tr key={order.id}><td className="bold">{order.order_number}</td><td>{order.customer_name} {order.customer_family}</td><td>{formatPrice(order.total_amount)} ریال</td><td><StatusBadge status={order.status} /></td><td className="admin-muted">{formatDate(order.created_date)}</td></tr>)}</tbody></table></div>
        )}
      </Card>
    </div>
  );
}
