'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { adminApi } from '../admin-api';
import AdminColorManager from '@/components/admin/AdminColorManager';
import AdminImageManager from '@/components/admin/AdminImageManager';
import AdminRelationPicker from '@/components/admin/AdminRelationPicker';
import AdminVariantMatrix from '@/components/admin/AdminVariantMatrix';
import SeoTab from '@/components/seo/SeoTab';
import { formatPrice, useEntityList } from '../_components/hooks';
import { AlertDialog, Button, Card, Dialog, EmptyState, Input, Label, Textarea, Toggle } from '../_components/ui';
import type { Product, ProductAttribute, ProductVariant } from '../types';
import { productHref } from '@/lib/product-normalization';

const fallbackBadgeOptions = ['new', 'sale', 'final_sale', 'best_seller', 'limited'];
const emptyProduct: Omit<Product, 'id'> = { title: '', code: '', price: 0, discount_price: 0, description: '', short_description: '', images: [], category: '', collection: '', sizes: [], colors: [], cup_size: '', material: '', brand: '', stock: 0, is_active: true, is_featured: false, wash_instructions: '', product_type: '', tags: [], features: [], cups: [], badges: [], variants: [], color_swatches: [], complete_the_look_ids: [], similar_product_ids: [], details: '', size_fit: '', fabric_care: '', shipping_returns: '', complete_the_look_enabled: true, weight: 0, avg_rating: 0, review_count: 0 };
const splitLines = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const imageUrl = (image?: string | { url?: string }) => typeof image === 'string' ? image : image?.url || '';
const totalStock = (product: Pick<Product, 'variants' | 'stock'>) => product.variants?.length ? product.variants.reduce((sum, variant) => sum + Number(variant.stock ?? variant.inventory ?? 0), 0) : Number(product.stock ?? 0);
const onlyDigits = (value: string) => value.replace(/[^0-9]/g, '');
const formatNumericInput = (value?: number) => value ? Number(value).toLocaleString('en-US') : '';
const uniqueOptions = (...groups: Array<Array<string | undefined>>) => Array.from(new Set(groups.flat().map((item) => (item || '').trim()).filter(Boolean)));
const attributeValues = (items: ProductAttribute[], type: string) => items.filter((item) => item.type === type).map((item) => item.value || item.name).filter(Boolean);
const attributeOptions = (items: ProductAttribute[], type: string, fallback: Array<string | undefined> = []) => uniqueOptions(attributeValues(items, type), fallback);
const variantTitle = (variant: ProductVariant) => [variant.color && `رنگ ${variant.color}`, variant.size && `سایز ${variant.size}`, variant.cup && `کاپ ${variant.cup}`].filter(Boolean).join(' / ') || 'وریانت پیش‌فرض';
const stripHtml = (value = '') => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const truncateText = (value: string, max: number) => value.length > max ? `${value.slice(0, max - 1).trim()}…` : value;

function makeProductSeoPayload(product: Product, siteUrl = '') {
  const title = product.title || product.name || 'محصول نوشه';
  const summarySource = stripHtml(product.short_description || product.description || product.details || product.fabric_care || '');
  const summary = truncateText(summarySource || `${title} را با کیفیت و طراحی اختصاصی از فروشگاه نوشه تهیه کنید.`, 158);
  const focus = product.category || product.product_type || product.brand || title.split(' ').slice(0, 3).join(' ');
  const image = imageUrl(product.images?.[0]) || product.cover_image || '';
  const canonicalBase = siteUrl.replace(/\/$/, '');
  return {
    entity_type: 'product',
    entity_id: product.id,
    meta_title: truncateText(`${title}${product.category ? ` | ${product.category}` : ''}`, 60),
    meta_description: summary,
    focus_keyword: focus,
    canonical_url: canonicalBase ? `${canonicalBase}${productHref(product)}` : productHref(product),
    og_title: truncateText(title, 70),
    og_description: summary,
    og_image: image,
    twitter_title: truncateText(title, 70),
    twitter_description: summary,
    twitter_image: image,
    robots_index: product.is_active !== false,
    robots_follow: true
  };
}

function RichTextField({ label, value, onChange, short = false }: { label: string; value?: string; onChange: (value: string) => void; short?: boolean }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const exec = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || '');
  };
  const uploadImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await adminApi.upload(file);
      exec('insertImage', result.file_url);
    } finally {
      setUploading(false);
    }
  };
  const toolbar = [
    ['B', 'bold'], ['I', 'italic'], ['U', 'underline'], ['S', 'strikeThrough'],
    ['H2', 'formatBlock', 'h2'], ['H3', 'formatBlock', 'h3'], ['نقل‌قول', 'formatBlock', 'blockquote'],
    ['• لیست', 'insertUnorderedList'], ['۱. لیست', 'insertOrderedList'], ['راست', 'justifyRight'], ['وسط', 'justifyCenter'], ['چپ', 'justifyLeft']
  ] as const;
  return (
    <div className="admin-rich-field">
      <Label>{label}</Label>
      <div className="admin-rich-editor">
        <div className="admin-rich-toolbar">
          {toolbar.map(([text, command, commandValue]) => <button key={`${label}-${text}`} type="button" onClick={() => exec(command, commandValue)}>{text}</button>)}
          <button type="button" onClick={() => { const url = window.prompt('آدرس لینک را وارد کنید'); if (url) exec('createLink', url); }}>لینک</button>
          <button type="button" onClick={() => exec('removeFormat')}>پاک‌سازی</button>
          <label className={uploading ? 'disabled' : ''}>↥ عکس<input type="file" accept="image/*" hidden disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} /></label>
        </div>
        <div ref={editorRef} className={`admin-rich-surface ${short ? 'short' : ''}`} contentEditable suppressContentEditableWarning onInput={(event) => onChange((event.currentTarget as HTMLDivElement).innerHTML)} dangerouslySetInnerHTML={{ __html: value || '' }} />
      </div>
    </div>
  );
}

function AdminCreatableDropdown({
  label,
  value,
  selectedValues,
  options,
  placeholder,
  multiple = false,
  onChange,
  onCreate
}: {
  label: string;
  value?: string;
  selectedValues?: string[];
  options: string[];
  placeholder?: string;
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  onCreate: (value: string) => Promise<void>;
}) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const selected = selectedValues || [];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = useMemo(() => options
    .filter((option) => !multiple || !selected.includes(option))
    .filter((option) => !normalizedQuery || option.toLowerCase().includes(normalizedQuery))
    .slice(0, 8), [multiple, normalizedQuery, options, selected]);
  const exactExists = options.some((option) => option.toLowerCase() === normalizedQuery);
  const canCreate = Boolean(query.trim()) && !exactExists;

  const choose = (option: string) => {
    if (multiple) onChange(uniqueOptions(selected, [option]));
    else onChange(option);
    setQuery('');
    setOpen(false);
  };

  const remove = (option: string) => onChange(selected.filter((item) => item !== option));

  const createOption = async () => {
    const nextValue = query.trim();
    if (!nextValue || creating) return;
    setCreating(true);
    try {
      await onCreate(nextValue);
      choose(nextValue);
    } finally {
      setCreating(false);
    }
  };

  const commitKeyboardSelection = async () => {
    const exactOption = options.find((option) => option.toLowerCase() === normalizedQuery);
    if (exactOption) {
      choose(exactOption);
      return;
    }
    if (filteredOptions.length === 1 && filteredOptions[0].toLowerCase().startsWith(normalizedQuery)) {
      choose(filteredOptions[0]);
      return;
    }
    if (canCreate) await createOption();
  };

  return (
    <div className="admin-combobox">
      <Label>{label}</Label>
      {multiple && selected.length > 0 && <div className="admin-combobox-chips">{selected.map((item) => <span key={item} className="relation-chip"><b>{item}</b><button type="button" onClick={() => remove(item)} aria-label={`حذف ${item}`}>×</button></span>)}</div>}
      <div className="admin-combobox-input-wrap">
        <Input
          value={multiple ? query : (open ? query : value || '')}
          onFocus={() => { setQuery(value || ''); setOpen(true); }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (!multiple) onChange(event.target.value);
          }}
          onKeyDown={async (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            if (event.key === ' ' && (!open || query.trim().includes(' ') || (!exactExists && filteredOptions.length !== 1))) return;
            if (!query.trim()) return;
            event.preventDefault();
            await commitKeyboardSelection();
          }}
          placeholder={placeholder || 'جستجو یا تایپ کنید...'}
        />
        {canCreate && <button type="button" className="admin-combobox-add" onMouseDown={(event) => event.preventDefault()} onClick={createOption} disabled={creating} aria-label={`افزودن ${query}`}>＋</button>}
      </div>
      {open && (filteredOptions.length > 0 || canCreate) && (
        <div className="admin-combobox-menu">
          {filteredOptions.map((option) => <button type="button" key={option} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)}>{option}</button>)}
          {canCreate && <button type="button" className="create" onMouseDown={(event) => event.preventDefault()} onClick={createOption} disabled={creating}>＋ افزودن «{query.trim()}» به پیش‌فرض‌ها</button>}
        </div>
      )}
    </div>
  );
}


export default function Products() {
  const { data: products, isLoading, reload } = useEntityList<Product>('Product', '-created_date', 100);
  const { data: attributes, reload: reloadAttributes } = useEntityList<ProductAttribute>('ProductAttribute', 'type', 500);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [tagsInput, setTagsInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [editorTab, setEditorTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sizeOptions = attributeValues(attributes, 'size');
  const colorOptions = attributeValues(attributes, 'color');
  const cupOptions = attributeValues(attributes, 'cup');
  const brandOptions = attributeOptions(attributes, 'brand', products.map((product) => product.brand));
  const collectionOptions = attributeOptions(attributes, 'collection', products.map((product) => product.collection));
  const categoryOptions = attributeOptions(attributes, 'category', products.map((product) => product.category));
  const productTypeOptions = attributeOptions(attributes, 'product_type', products.map((product) => product.product_type));
  const tagOptions = attributeOptions(attributes, 'tag', products.flatMap((product) => product.tags || []));
  const featureOptions = attributeOptions(attributes, 'feature', products.flatMap((product) => product.features || []));
  const badgeOptions = attributeOptions(attributes, 'badge', fallbackBadgeOptions);

  const hydrateInputs = (product?: Product) => { setTagsInput((product?.tags || []).join('\n')); setFeaturesInput((product?.features || []).join('\n')); };
  const openCreate = () => { setEditingProduct(null); setForm(emptyProduct); hydrateInputs(); setSaveError(''); setEditorTab('basic'); setDialogOpen(true); };
  const openEdit = (product: Product) => { setEditingProduct(product); setForm({ ...emptyProduct, ...product, stock: totalStock(product) }); hydrateInputs(product); setSaveError(''); setEditorTab('basic'); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditingProduct(null); };
  const updateField = <K extends keyof Omit<Product, 'id'>>(key: K, value: Omit<Product, 'id'>[K]) => setForm((current) => ({ ...current, [key]: value }));
  const addAttributeDefault = async (type: string, value: string) => {
    const normalizedValue = value.trim();
    if (!normalizedValue || attributes.some((item) => item.type === type && (item.value || item.name).toLowerCase() === normalizedValue.toLowerCase())) return;
    await adminApi.create<ProductAttribute>('ProductAttribute', { type, name: normalizedValue, value: normalizedValue });
    await reloadAttributes();
  };

  const upsertProductSeo = async (product: Product) => {
    const [seoRows, settingsRows] = await Promise.all([
      adminApi.list<any>('SeoMeta', '-created_date', 500).catch(() => []),
      adminApi.list<any>('SeoSettings', '-updated_date', 1).catch(() => [])
    ]);
    const siteUrl = String(settingsRows?.[0]?.site_url || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
    const payload = makeProductSeoPayload(product, siteUrl);
    const existingSeo = seoRows.find((row: any) => row.entity_type === 'product' && row.entity_id === product.id);
    if (existingSeo?.id) await adminApi.update('SeoMeta', existingSeo.id, payload);
    else await adminApi.create('SeoMeta', payload);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return setSaveError('نام محصول الزامی است.');
    if (!Number(form.price)) return setSaveError('قیمت محصول الزامی است.');
    setSaving(true); setSaveError('');
    try {
      const variants = (form.variants || []).map((variant) => ({ ...variant, id: variant.id || variant.product_variant_id, product_variant_id: variant.product_variant_id || variant.id, stock: Number(variant.inventory ?? variant.stock ?? 0), inventory: Number(variant.inventory ?? variant.stock ?? 0), discount_price: variant.discount_price || undefined }));
      const data = { ...form, tags: splitLines(tagsInput), features: splitLines(featuresInput), price: Number(form.price) || 0, discount_price: Number(form.discount_price) || 0, stock: variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0), weight: Number(form.weight) || 0, badges: form.badges || [], complete_the_look_ids: form.complete_the_look_ids || [], similar_product_ids: form.similar_product_ids || [], has_cup_option: Boolean(form.cups?.length), variants, color_swatches: (form.color_swatches || []).map((color) => ({ ...color, value: color.slug || (color.value?.startsWith('#') ? '' : color.value) || color.name, active: color.active !== false && color.is_active !== false })) };
      const savedProduct = editingProduct ? await adminApi.update<Product>('Product', editingProduct.id, data) : await adminApi.create<Product>('Product', data);
      await upsertProductSeo(savedProduct);
      await reload(); closeDialog();
    } catch (error) { setSaveError(error instanceof Error ? error.message : 'خطا در ذخیره محصول'); } finally { setSaving(false); }
  };

  const handleDelete = async () => { if (!deleteTarget) return; setDeleteLoading(true); await adminApi.delete('Product', deleteTarget.id); await reload(); setDeleteLoading(false); setDeleteTarget(null); };
  const handleDeleteAll = async () => { setDeleteLoading(true); await Promise.all(products.map((product) => adminApi.delete('Product', product.id))); await reload(); setDeleteLoading(false); setDeleteAllOpen(false); };

  return <div className="admin-page">
    <div className="admin-page-header"><h1 className="admin-title">مدیریت محصولات</h1><div className="admin-actions-row"><Button className="ghost danger" onClick={() => setDeleteAllOpen(true)} disabled={!products.length || deleteLoading}>حذف همه محصولات</Button><Button className="primary" onClick={openCreate}>＋ افزودن محصول</Button></div></div>
    {isLoading ? <div className="admin-grid cards-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="admin-skeleton" />)}</div> : products.length === 0 ? <EmptyState icon="▣" text="هنوز محصولی اضافه نشده"><Button className="primary" onClick={openCreate}>＋ اولین محصول را اضافه کنید</Button></EmptyState> : <Card className="overflow-hidden"><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>تصویر</th><th>نام محصول</th><th>قیمت</th><th>موجودی</th><th>دسته‌بندی</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{products.map((product) => { const previewImage = imageUrl(product.images?.[0] as string | { url?: string }) || product.cover_image || ''; const stock = totalStock(product); return <tr key={product.id}><td>{previewImage ? <img src={previewImage} alt="" className="admin-table-image" /> : <span className="admin-table-placeholder">▣</span>}</td><td className="bold">{product.title}</td><td className="admin-price">{formatPrice(product.discount_price && product.discount_price < product.price ? product.discount_price : product.price)} ریال</td><td>{stock.toLocaleString('fa-IR')}</td><td>{product.category || '-'}</td><td><span className={`admin-badge ${product.is_active !== false && stock > 0 ? 'success' : 'neutral'}`}>{product.is_active !== false && stock > 0 ? 'موجود' : 'ناموجود'}</span></td><td><div className="admin-actions-row"><Link href={productHref(product)} target="_blank" className="admin-btn ghost icon-only" title="مشاهده" aria-label={`مشاهده ${product.title}`}>👁</Link><Button className="ghost" onClick={() => openEdit(product)} aria-label={`ویرایش ${product.title}`}>✎</Button><Button className="ghost danger" onClick={() => setDeleteTarget(product)} aria-label={`حذف ${product.title}`}>🗑</Button></div></td></tr>; })}</tbody></table></div></Card>}
    <AlertDialog open={!!deleteTarget} title="حذف محصول" description={deleteTarget ? <>آیا از حذف محصول <b>{deleteTarget.title}</b> مطمئن هستید؟</> : ''} confirmText="حذف محصول" danger loading={deleteLoading} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />
    <AlertDialog open={deleteAllOpen} title="حذف همه محصولات" description={<>آیا از حذف همه <b>{products.length.toLocaleString('fa-IR')}</b> محصول مطمئن هستید؟ این عملیات قابل بازگشت نیست.</>} confirmText="حذف همه محصولات" danger loading={deleteLoading} onConfirm={handleDeleteAll} onClose={() => setDeleteAllOpen(false)} />
    <Dialog open={dialogOpen} title={editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'} onClose={closeDialog} wide><div className="admin-form"><div className="store-tab-list">{[['basic', 'اطلاعات پایه'], ['images', 'تصاویر'], ['variants', 'رنگ، سایز و کاپ'], ['content', 'توضیحات'], ['relations', 'محصولات مرتبط'], ['seo', 'SEO']].map(([key, label]) => <button key={key} type="button" className={editorTab === key ? 'active' : ''} onClick={() => setEditorTab(key)}>{label}</button>)}</div>{saveError && <div className="admin-alert destructive">{saveError}</div>}
      {editorTab === 'basic' && <>
        <div className="admin-form-grid">
          <div><Label>نام محصول *</Label><Input value={form.title} onChange={(e) => updateField('title', e.target.value)} /></div>
          <div><Label>کد/اسلاگ محصول</Label><Input value={form.code} onChange={(e) => updateField('code', e.target.value)} dir="ltr" /></div>
          <AdminCreatableDropdown label="برند" value={form.brand || ''} options={brandOptions} onChange={(value) => updateField('brand', value as string)} onCreate={(value) => addAttributeDefault('brand', value)} />
          <AdminCreatableDropdown label="کالکشن" value={form.collection || ''} options={collectionOptions} onChange={(value) => updateField('collection', value as string)} onCreate={(value) => addAttributeDefault('collection', value)} />
          <AdminCreatableDropdown label="دسته‌بندی" value={form.category || ''} options={categoryOptions} onChange={(value) => updateField('category', value as string)} onCreate={(value) => addAttributeDefault('category', value)} />
          <AdminCreatableDropdown label="نوع محصول" value={form.product_type || ''} options={productTypeOptions} onChange={(value) => updateField('product_type', value as string)} onCreate={(value) => addAttributeDefault('product_type', value)} />
          <div><Label>قیمت (ریال) *</Label><Input inputMode="numeric" value={formatNumericInput(form.price)} onChange={(e) => updateField('price', Number(onlyDigits(e.target.value)))} dir="ltr" placeholder="0" /></div>
          <div><Label>قیمت با تخفیف (ریال)</Label><Input inputMode="numeric" value={formatNumericInput(form.discount_price)} onChange={(e) => updateField('discount_price', Number(onlyDigits(e.target.value)))} dir="ltr" placeholder="0" /></div>
          <div><Label>وزن (گرم)</Label><Input type="number" value={form.weight} onChange={(e) => updateField('weight', Number(e.target.value))} dir="ltr" /></div>
        </div>
        <div><Label>توضیح کوتاه</Label><Textarea value={form.short_description} onChange={(e) => updateField('short_description', e.target.value)} className="short" /></div>
        <AdminCreatableDropdown label="تگ‌ها" multiple selectedValues={splitLines(tagsInput)} options={tagOptions} onChange={(values) => setTagsInput((values as string[]).join('\n'))} onCreate={(value) => addAttributeDefault('tag', value)} />
        <AdminCreatableDropdown label="ویژگی‌ها" multiple selectedValues={splitLines(featuresInput)} options={featureOptions} onChange={(values) => setFeaturesInput((values as string[]).join('\n'))} onCreate={(value) => addAttributeDefault('feature', value)} />
        <AdminCreatableDropdown label="بج‌ها" multiple selectedValues={form.badges || []} options={badgeOptions} onChange={(values) => updateField('badges', values as string[])} onCreate={(value) => addAttributeDefault('badge', value)} />
        <div className="admin-toggle-row"><div className="admin-inline"><Toggle checked={form.is_active !== false} onChange={(value) => updateField('is_active', value)} /><Label>محصول فعال</Label></div><div className="admin-inline"><Toggle checked={!!form.is_featured} onChange={(value) => updateField('is_featured', value)} /><Label>محصول ویژه</Label></div></div>
      </>}
      {editorTab === 'images' && <AdminImageManager coverImage={(form.images || [])[0]} images={(form.images || []).slice(1)} onCoverChange={(url) => updateField('images', url ? [url, ...(form.images || []).slice(1)] : (form.images || []).slice(1))} onImagesChange={(images) => updateField('images', [(form.images || [])[0], ...images.map((image) => typeof image === 'string' ? image : image.url || '')].filter(Boolean))} />}
      {editorTab === 'variants' && <div className="admin-manager-stack"><AdminColorManager colors={form.color_swatches || []} colorOptions={colorOptions} onChange={(colors) => updateField('color_swatches', colors)} /><AdminVariantMatrix sizes={form.sizes || []} cups={form.cups || []} hasCup={!!form.cups?.length || !!form.has_cup_option} colors={form.color_swatches || []} variants={form.variants || []} sizeOptions={sizeOptions} cupOptions={cupOptions} onSizesChange={(sizes) => updateField('sizes', sizes)} onCupsChange={(cups) => updateField('cups', cups)} onHasCupChange={(hasCup) => updateField('has_cup_option', hasCup)} onVariantsChange={(variants) => updateField('variants', variants)} onCreateSize={(value) => addAttributeDefault('size', value)} onCreateCup={(value) => addAttributeDefault('cup', value)} /><div><Label>سایز کاپ پیش‌فرض</Label><Input value={form.cup_size} onChange={(e) => updateField('cup_size', e.target.value)} /></div></div>}
      {editorTab === 'content' && <><RichTextField label="توضیحات" value={form.description} onChange={(value) => updateField('description', value)} /><RichTextField label="Product Details" value={form.details || ''} onChange={(value) => updateField('details', value)} /><RichTextField label="Size & Fit" value={form.size_fit || ''} onChange={(value) => updateField('size_fit', value)} short /><RichTextField label="Fabric & Care" value={form.fabric_care || ''} onChange={(value) => updateField('fabric_care', value)} short /><RichTextField label="Shipping & Returns" value={form.shipping_returns || ''} onChange={(value) => updateField('shipping_returns', value)} short /><RichTextField label="FAQ / راهنمای شستشو" value={form.faq || form.wash_instructions || ''} onChange={(value) => { updateField('faq', value); updateField('wash_instructions', value); }} short /></>}
      {editorTab === 'relations' && <div className="admin-manager-stack"><AdminRelationPicker label="استایلتان را تکمیل کنید" products={products} excludeId={editingProduct?.id} contextProduct={{ ...form, id: editingProduct?.id || '' } as Product} relationType="complete" selectedIds={form.complete_the_look_ids || []} onChange={(ids) => updateField('complete_the_look_ids', ids)} /><AdminRelationPicker label="محصولات مشابه" products={products} excludeId={editingProduct?.id} contextProduct={{ ...form, id: editingProduct?.id || '' } as Product} relationType="similar" selectedIds={form.similar_product_ids || []} onChange={(ids) => updateField('similar_product_ids', ids)} /></div>}
      {editorTab === 'seo' && (editingProduct ? <SeoTab entity={form} entityType='product' entityId={editingProduct.id} defaultCollapsed /> : <div className='admin-soft-box'>ابتدا محصول را ذخیره کنید سپس تنظیمات SEO را انجام دهید.</div>)}
    </div><div className="admin-dialog-footer"><Button className="outline" onClick={closeDialog}>انصراف</Button><Button className="primary" onClick={handleSubmit} disabled={!form.title || saving}>{saving ? 'در حال ذخیره...' : editingProduct ? 'ذخیره تغییرات' : 'افزودن محصول'}</Button></div></Dialog>
  </div>;
}
