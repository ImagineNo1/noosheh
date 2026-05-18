'use client';

import { useState } from 'react';
import { adminApi } from '../admin-api';
import AdminColorManager from '@/components/admin/AdminColorManager';
import AdminImageManager from '@/components/admin/AdminImageManager';
import AdminRelationPicker from '@/components/admin/AdminRelationPicker';
import AdminVariantMatrix from '@/components/admin/AdminVariantMatrix';
import { formatPrice, useEntityList } from '../_components/hooks';
import { AlertDialog, Button, Card, Dialog, EmptyState, Input, Label, Textarea, Toggle } from '../_components/ui';
import type { Product } from '../types';

const badgeOptions = ['new', 'sale', 'final_sale', 'best_seller', 'limited'];

const emptyProduct: Omit<Product, 'id'> = {
  title: '', code: '', price: 0, discount_price: 0, description: '', short_description: '',
  images: [], category: '', collection: '', sizes: [], colors: [], cup_size: '', material: '',
  brand: '', stock: 0, is_active: true, is_featured: false, wash_instructions: '', product_type: '',
  tags: [], features: [], cups: [], badges: [], variants: [], color_swatches: [], complete_the_look_ids: [],
  similar_product_ids: [], details: '', size_fit: '', fabric_care: '', shipping_returns: '', complete_the_look_enabled: true,
  weight: 0, avg_rating: 0, review_count: 0
};

const splitLines = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const splitComma = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);

export default function Products() {
  const { data: products, isLoading, reload } = useEntityList<Product>('Product', '-created_date', 100);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [cupsInput, setCupsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [editorTab, setEditorTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const hydrateInputs = (product?: Product) => {
    setSizesInput((product?.sizes || []).join(', '));
    setColorsInput((product?.colors || []).join(', '));
    setCupsInput((product?.cups || []).join(', '));
    setTagsInput((product?.tags || []).join('\n'));
    setFeaturesInput((product?.features || []).join('\n'));
  };

  const openCreate = () => { setEditingProduct(null); setForm(emptyProduct); hydrateInputs(); setSaveError(''); setEditorTab('basic'); setDialogOpen(true); };
  const openEdit = (product: Product) => { setEditingProduct(product); setForm({ ...emptyProduct, ...product }); hydrateInputs(product); setSaveError(''); setEditorTab('basic'); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditingProduct(null); };
  const updateField = <K extends keyof Omit<Product, 'id'>>(key: K, value: Omit<Product, 'id'>[K]) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return setSaveError('نام محصول الزامی است.');
    if (!Number(form.price)) return setSaveError('قیمت محصول الزامی است.');
    setSaving(true);
    setSaveError('');
    try {
      const data = {
        ...form,
        sizes: splitComma(sizesInput),
        colors: splitComma(colorsInput),
        cups: splitComma(cupsInput),
        tags: splitLines(tagsInput),
        features: splitLines(featuresInput),
        price: Number(form.price) || 0,
        discount_price: Number(form.discount_price) || 0,
        stock: Number(form.stock) || 0,
        weight: Number(form.weight) || 0,
        badges: form.badges || [],
        complete_the_look_ids: form.complete_the_look_ids || [],
        similar_product_ids: form.similar_product_ids || [],
        has_cup_option: !!cupsInput.trim(),
        variants: (form.variants || []).map((variant) => ({ ...variant, stock: variant.inventory ?? variant.stock ?? 0, discount_price: variant.discount_price || undefined })),
        color_swatches: (form.color_swatches || []).map((color) => ({ ...color, value: color.slug || (color.value?.startsWith('#') ? '' : color.value) || color.name, active: color.active !== false && color.is_active !== false }))
      };
      if (editingProduct) await adminApi.update<Product>('Product', editingProduct.id, data);
      else await adminApi.create<Product>('Product', data);
      await reload();
      closeDialog();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'خطا در ذخیره محصول');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await adminApi.delete('Product', deleteTarget.id);
    await reload();
    setDeleteLoading(false);
    setDeleteTarget(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header"><h1 className="admin-title">مدیریت محصولات</h1><Button className="primary" onClick={openCreate}>＋ افزودن محصول</Button></div>

      {isLoading ? <div className="admin-grid cards-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="admin-skeleton" />)}</div>
        : products.length === 0 ? <EmptyState icon="▣" text="هنوز محصولی اضافه نشده"><Button className="primary" onClick={openCreate}>＋ اولین محصول را اضافه کنید</Button></EmptyState>
        : <Card className="overflow-hidden"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>تصویر</th><th>نام محصول</th><th>قیمت</th><th>دسته‌بندی</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td>{product.images?.[0] ? <img src={product.images[0]} alt="" className="admin-table-image" /> : <span className="admin-table-placeholder">▣</span>}</td><td className="bold">{product.title}</td><td className="admin-price">{formatPrice(product.discount_price && product.discount_price < product.price ? product.discount_price : product.price)} تومان</td><td>{product.category || '-'}</td><td><span className={`admin-badge ${product.is_active !== false ? 'success' : 'neutral'}`}>{product.is_active !== false ? 'فعال' : 'غیرفعال'}</span></td><td><div className="admin-actions-row"><Button className="ghost" onClick={() => openEdit(product)} aria-label={`ویرایش ${product.title}`}>✎</Button><Button className="ghost danger" onClick={() => setDeleteTarget(product)} aria-label={`حذف ${product.title}`}>🗑</Button></div></td></tr>)}</tbody></table></div></Card>}

      <AlertDialog open={!!deleteTarget} title="حذف محصول" description={deleteTarget ? <>آیا از حذف محصول <b>{deleteTarget.title}</b> مطمئن هستید؟ این عملیات قابل بازگشت نیست.</> : ''} confirmText="حذف محصول" danger loading={deleteLoading} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />

      <Dialog open={dialogOpen} title={editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'} onClose={closeDialog} wide>
        <div className="admin-form">
          <div className="store-tab-list">{[['basic', 'اطلاعات پایه'], ['images', 'تصاویر'], ['variants', 'رنگ، سایز و کاپ'], ['content', 'توضیحات'], ['relations', 'محصولات مرتبط']].map(([key, label]) => <button key={key} type="button" className={editorTab === key ? 'active' : ''} onClick={() => setEditorTab(key)}>{label}</button>)}</div>
          {saveError && <div className="admin-alert destructive">{saveError}</div>}

          {editorTab === 'basic' && <><div className="admin-form-grid"><div><Label>نام محصول *</Label><Input value={form.title} onChange={(e) => updateField('title', e.target.value)} /></div><div><Label>کد/اسلاگ محصول</Label><Input value={form.code} onChange={(e) => updateField('code', e.target.value)} dir="ltr" /></div><div><Label>برند</Label><Input value={form.brand} onChange={(e) => updateField('brand', e.target.value)} /></div><div><Label>کالکشن</Label><Input value={form.collection} onChange={(e) => updateField('collection', e.target.value)} /></div><div><Label>دسته‌بندی</Label><Input value={form.category} onChange={(e) => updateField('category', e.target.value)} /></div><div><Label>نوع محصول</Label><Input value={form.product_type} onChange={(e) => updateField('product_type', e.target.value)} placeholder="مثلاً: سوتین، شورت، تاپ" /></div><div><Label>قیمت (تومان) *</Label><Input type="number" value={form.price} onChange={(e) => updateField('price', Number(e.target.value))} dir="ltr" /></div><div><Label>قیمت با تخفیف</Label><Input type="number" value={form.discount_price} onChange={(e) => updateField('discount_price', Number(e.target.value))} dir="ltr" /></div><div><Label>وزن (گرم)</Label><Input type="number" value={form.weight} onChange={(e) => updateField('weight', Number(e.target.value))} dir="ltr" /></div><div><Label>موجودی</Label><Input type="number" value={form.stock} onChange={(e) => updateField('stock', Number(e.target.value))} dir="ltr" /></div></div><div><Label>توضیح کوتاه</Label><Textarea value={form.short_description} onChange={(e) => updateField('short_description', e.target.value)} className="short" /></div><div><Label>تگ‌ها (هر خط یک تگ)</Label><Textarea value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="short" /></div><div><Label>ویژگی‌ها (هر خط یک ویژگی)</Label><Textarea value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} className="short" /></div><div><Label>بج‌ها</Label><div className="admin-actions-row">{badgeOptions.map((badge) => <label key={badge} className="admin-inline small"><input type="checkbox" checked={(form.badges || []).includes(badge)} onChange={(e) => updateField('badges', e.target.checked ? [...(form.badges || []), badge] : (form.badges || []).filter((item) => item !== badge))} /> {badge}</label>)}</div></div><div className="admin-toggle-row"><div className="admin-inline"><Toggle checked={form.is_active !== false} onChange={(value) => updateField('is_active', value)} /><Label>محصول فعال</Label></div><div className="admin-inline"><Toggle checked={!!form.is_featured} onChange={(value) => updateField('is_featured', value)} /><Label>محصول ویژه</Label></div></div></>}

          {editorTab === 'images' && <AdminImageManager coverImage={(form.images || [])[0]} images={(form.images || []).slice(1)} onCoverChange={(url) => updateField('images', url ? [url, ...(form.images || []).slice(1)] : (form.images || []).slice(1))} onImagesChange={(images) => updateField('images', [(form.images || [])[0], ...images.map((image) => typeof image === 'string' ? image : image.url || '')].filter(Boolean))} />}

          {editorTab === 'variants' && <div className="admin-manager-stack"><AdminColorManager colors={form.color_swatches || []} onChange={(colors) => { updateField('color_swatches', colors); setColorsInput(colors.map((color) => color.name || color.value || color.slug || '').filter(Boolean).join(', ')); }} /><AdminVariantMatrix sizes={splitComma(sizesInput)} cups={splitComma(cupsInput)} hasCup={!!cupsInput.trim()} colors={form.color_swatches || []} variants={form.variants || []} onSizesChange={(sizes) => setSizesInput(sizes.join(', '))} onCupsChange={(cups) => setCupsInput(cups.join(', '))} onHasCupChange={(hasCup) => !hasCup && setCupsInput('')} onVariantsChange={(variants) => updateField('variants', variants)} /><div><Label>سایز کاپ پیش‌فرض</Label><Input value={form.cup_size} onChange={(e) => updateField('cup_size', e.target.value)} /></div></div>}

          {editorTab === 'content' && <><div><Label>توضیحات</Label><Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} /></div><div><Label>Product Details</Label><Textarea value={form.details || ''} onChange={(e) => updateField('details', e.target.value)} /></div><div><Label>Size & Fit</Label><Textarea value={form.size_fit || ''} onChange={(e) => updateField('size_fit', e.target.value)} className="short" /></div><div><Label>Fabric & Care</Label><Textarea value={form.fabric_care || ''} onChange={(e) => updateField('fabric_care', e.target.value)} className="short" /></div><div><Label>Shipping & Returns</Label><Textarea value={form.shipping_returns || ''} onChange={(e) => updateField('shipping_returns', e.target.value)} className="short" /></div><div><Label>FAQ / راهنمای شستشو</Label><Textarea value={form.faq || form.wash_instructions || ''} onChange={(e) => { updateField('faq', e.target.value); updateField('wash_instructions', e.target.value); }} className="short" /></div></>}

          {editorTab === 'relations' && <div className="admin-manager-stack"><div className="admin-toggle-row"><div className="admin-inline"><Toggle checked={form.complete_the_look_enabled !== false} onChange={(value) => updateField('complete_the_look_enabled', value)} /><Label>Complete the Look فعال</Label></div></div><AdminRelationPicker label="Complete the Look" products={products} excludeId={editingProduct?.id} selectedIds={form.complete_the_look_ids || []} onChange={(ids) => updateField('complete_the_look_ids', ids)} /><AdminRelationPicker label="محصولات مشابه" products={products} excludeId={editingProduct?.id} selectedIds={form.similar_product_ids || []} onChange={(ids) => updateField('similar_product_ids', ids)} /></div>}
        </div>
        <div className="admin-dialog-footer"><Button className="outline" onClick={closeDialog}>انصراف</Button><Button className="primary" onClick={handleSubmit} disabled={!form.title || saving}>{saving ? 'در حال ذخیره...' : editingProduct ? 'ذخیره تغییرات' : 'افزودن محصول'}</Button></div>
      </Dialog>
    </div>
  );
}
