'use client';

import { useState } from 'react';
import { adminApi } from '../admin-api';
import { formatDate, formatPrice, useEntityList } from '../_components/hooks';
import { Button, Card, Dialog, EmptyState, Input, Label, Select } from '../_components/ui';
import type { Order } from '../types';

const statusMap: Record<string, { label: string; cls: string }> = {
  pending: { label: 'در انتظار', cls: 'warning' },
  processing: { label: 'در حال پردازش', cls: 'info' },
  shipped: { label: 'ارسال شده', cls: 'purple' },
  delivered: { label: 'تحویل شده', cls: 'success' },
  cancelled: { label: 'لغو شده', cls: 'danger' }
};

const paymentMap: Record<string, { label: string; cls: string }> = {
  unpaid: { label: 'پرداخت نشده', cls: 'danger' },
  paid: { label: 'پرداخت شده', cls: 'success' },
  refunded: { label: 'بازگشت وجه', cls: 'warning' }
};

function Badge({ item }: { item: { label: string; cls: string } }) {
  return <span className={`admin-badge ${item.cls}`}>{item.label}</span>;
}

export default function Orders() {
  const { data: orders, isLoading, reload, setData } = useEntityList<Order>('Order', '-created_date', 100);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const patchOrder = async (orderId: string, data: Partial<Order>) => {
    const updated = await adminApi.update<Order>('Order', orderId, data);
    setData((current) => current.map((order) => order.id === orderId ? updated : order));
    setSelectedOrder((current) => current?.id === orderId ? { ...current, ...updated } : current);
    await reload();
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">مدیریت سفارشات</h1>

      {isLoading ? (
        <div className="admin-list-skeleton">{Array.from({ length: 5 }).map((_, i) => <div key={i} />)}</div>
      ) : orders.length === 0 ? (
        <EmptyState icon="◈" text="هنوز سفارشی ثبت نشده" />
      ) : (
        <Card className="overflow-hidden">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>شماره سفارش</th><th>مشتری</th><th>مبلغ</th><th>وضعیت</th><th>پرداخت</th><th>تاریخ</th><th>عملیات</th></tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const status = statusMap[order.status] || statusMap.pending;
                  const payment = paymentMap[order.payment_status] || paymentMap.unpaid;
                  return (
                    <tr key={order.id}>
                      <td className="bold">{order.order_number}</td>
                      <td>{order.customer_name} {order.customer_family}</td>
                      <td>{formatPrice(order.total_amount)} ریال</td>
                      <td><Badge item={status} /></td>
                      <td><Badge item={payment} /></td>
                      <td className="admin-muted small">{formatDate(order.created_date)}</td>
                      <td><Button className="ghost" onClick={() => setSelectedOrder(order)}>👁</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={!!selectedOrder} title={`جزئیات سفارش ${selectedOrder?.order_number || ''}`} onClose={() => setSelectedOrder(null)}>
        {selectedOrder && (
          <div className="admin-order-detail">
            <div className="admin-soft-box">
              <p><strong>مشتری:</strong> {selectedOrder.customer_name} {selectedOrder.customer_family}</p>
              <p><strong>تلفن:</strong> {selectedOrder.customer_phone}</p>
              <p><strong>ایمیل:</strong> {selectedOrder.customer_email}</p>
              <p><strong>آدرس:</strong> {selectedOrder.province} - {selectedOrder.city} - {selectedOrder.address}</p>
              <p><strong>کدپستی:</strong> {selectedOrder.postal_code}</p>
              {selectedOrder.notes && <p><strong>یادداشت:</strong> {selectedOrder.notes}</p>}
            </div>

            <div>
              <h3>آیتم‌ها</h3>
              <div className="admin-order-items">
                {(selectedOrder.items || []).map((item, index) => (
                  <div key={`${item.title}-${index}`} className="admin-order-item">
                    {item.image && <img src={item.image} alt="" />}
                    <div><p>{item.title}</p><small>{item.quantity} عدد × {formatPrice(item.price)} ریال{item.color && ` | رنگ: ${item.color}`}{item.size && ` | سایز: ${item.size}`}</small></div>
                    <strong>{formatPrice(item.price * item.quantity)} ریال</strong>
                  </div>
                ))}
              </div>
              <p className="admin-total">مجموع: {formatPrice(selectedOrder.total_amount)} ریال</p>
            </div>

            <div className="admin-form-grid">
              <div><Label>وضعیت سفارش</Label><Select value={selectedOrder.status} onChange={(value) => patchOrder(selectedOrder.id, { status: value })}>{Object.entries(statusMap).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</Select></div>
              <div><Label>وضعیت پرداخت</Label><Select value={selectedOrder.payment_status} onChange={(value) => patchOrder(selectedOrder.id, { payment_status: value })}>{Object.entries(paymentMap).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</Select></div>
            </div>
            <div><Label>کد رهگیری پست</Label><Input defaultValue={selectedOrder.tracking_code || ''} onBlur={(event) => patchOrder(selectedOrder.id, { tracking_code: event.target.value })} dir="ltr" /></div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
