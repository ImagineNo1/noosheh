'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/app/admin/admin-api';
import SeoTab from '@/components/seo/SeoTab';
import type { ProductAttribute } from '@/app/admin/types';

const fallbackImage = '/store/noosheh-hero-editorial.png';

type EditorForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author_name: string;
  publish_at: string;
  seo_title: string;
  seo_description: string;
  og_image: string;
};

function Section({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.6rem] border border-[#eaded5] bg-white/90 p-5 shadow-[0_18px_55px_rgba(74,36,31,0.06)]">
      <div className="mb-5 border-b border-[#f0e4dc] pb-4">
        <p className="text-[11px] font-black tracking-[0.2em] text-[#970f35]">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-black text-[#2d1b18]">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-[#7d6660]">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, helper, children, required }: { label: string; helper?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-2 text-sm font-black text-[#3a211d]">
      <span>{label}{required && <span className="text-[#970f35]"> *</span>}</span>
      {children}
      {helper && <span className="block text-xs font-medium leading-6 text-[#9b857b]">{helper}</span>}
    </label>
  );
}

const uniqueOptions = (...groups: Array<Array<string | undefined>>) => Array.from(new Set(groups.flat().map((item) => (item || '').trim()).filter(Boolean)));
const attributeValues = (items: ProductAttribute[], type: string) => items.filter((item) => item.type === type).map((item) => item.value || item.name).filter(Boolean);

const inputClass = 'w-full rounded-2xl border border-[#eaded5] bg-[#fffaf5] px-4 py-3 text-sm text-[#3a211d] outline-none transition placeholder:text-[#b09b92] focus:border-[#970f35] focus:ring-4 focus:ring-[#970f35]/10';


function BlogCategoryDropdown({ value, options, onChange, onCreate }: { value: string; options: string[]; onChange: (value: string) => void; onCreate: (value: string) => Promise<void> }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = useMemo(() => options.filter((option) => !normalizedQuery || option.toLowerCase().includes(normalizedQuery)).slice(0, 8), [normalizedQuery, options]);
  const exactExists = options.some((option) => option.toLowerCase() === normalizedQuery);
  const canCreate = Boolean(query.trim()) && !exactExists;

  const choose = (option: string) => {
    onChange(option);
    setQuery('');
    setOpen(false);
  };

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
    if (exactOption) return choose(exactOption);
    if (filteredOptions.length === 1 && filteredOptions[0].toLowerCase().startsWith(normalizedQuery)) return choose(filteredOptions[0]);
    if (canCreate) await createOption();
  };

  return (
    <div className="admin-combobox">
      <div className="admin-combobox-input-wrap">
        <input
          className={inputClass}
          value={open ? query : value || ''}
          onFocus={() => { setQuery(value || ''); setOpen(true); }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); onChange(event.target.value); }}
          onKeyDown={async (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            if (event.key === ' ' && (!open || query.trim().includes(' ') || (!exactExists && filteredOptions.length !== 1))) return;
            if (!query.trim()) return;
            event.preventDefault();
            await commitKeyboardSelection();
          }}
          placeholder="جستجو یا تایپ دسته‌بندی..."
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

const editorActions: Array<{ label: string; command: string; value?: string }> = [
  { label: 'Bold', command: 'bold' },
  { label: 'Italic', command: 'italic' },
  { label: 'Underline', command: 'underline' },
  { label: 'Strike', command: 'strikeThrough' },
  { label: 'H1', command: 'formatBlock', value: 'h1' },
  { label: 'H2', command: 'formatBlock', value: 'h2' },
  { label: 'H3', command: 'formatBlock', value: 'h3' },
  { label: '• لیست', command: 'insertUnorderedList' },
  { label: '۱. لیست', command: 'insertOrderedList' },
  { label: 'نقل‌قول', command: 'formatBlock', value: 'blockquote' },
  { label: 'راست', command: 'justifyRight' },
  { label: 'وسط', command: 'justifyCenter' },
  { label: 'چپ', command: 'justifyLeft' },
  { label: 'تورفتگی', command: 'indent' },
  { label: 'برگشت تورفتگی', command: 'outdent' }
];

function normalizeSlug(value: string) {
  return value.trim().replace(/\s+/g, '-').replace(/-{2,}/g, '-');
}

export default function BlogEditor({ id }: { id?: string }) {
  const isEditing = !!id;
  const router = useRouter();
  const [form, setForm] = useState<EditorForm>({ title: '', slug: '', excerpt: '', content: '', cover_image: '', category: '', tags: [], status: 'draft', author_name: '', publish_at: '', seo_title: '', seo_description: '', og_image: '' });
  const [tagInput, setTagInput] = useState('');
  const [blogCategoryDefaults, setBlogCategoryDefaults] = useState<ProductAttribute[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    adminApi.list<ProductAttribute>('ProductAttribute').then((items) => setBlogCategoryDefaults(items.filter((item) => item.type === 'blog_category')));
    if (id) {
      adminApi.list<any>('BlogPost').then((rows) => {
        const post = rows.find((item) => item.id === id);
        if (post) setForm((current) => ({ ...current, ...post, tags: Array.isArray(post.tags) ? post.tags : [] }));
      });
    }
  }, [id]);

  const generatedSlug = useMemo(() => normalizeSlug(form.slug || form.title), [form.slug, form.title]);
  const seoTitleLength = (form.seo_title || form.title).length;
  const seoDescriptionLength = (form.seo_description || form.excerpt).length;
  const blogCategoryOptions = uniqueOptions(attributeValues(blogCategoryDefaults, 'blog_category'), form.category ? [form.category] : []);

  const metadataValid = seoTitleLength >= 20 && seoTitleLength <= 70 && seoDescriptionLength >= 70 && seoDescriptionLength <= 170;

  const save = async (nextStatus = form.status) => {
    setSaving(true);
    const derivedSeoTitle = form.seo_title || form.title;
    const derivedSeoDescription = form.seo_description || form.excerpt || form.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 165);
    const payload = { ...form, status: nextStatus, slug: generatedSlug || normalizeSlug(form.title), seo_title: derivedSeoTitle, seo_description: derivedSeoDescription, og_image: form.og_image || form.cover_image };
    if (isEditing) await adminApi.update('BlogPost', id!, payload);
    else await adminApi.create('BlogPost', payload);
    setSaving(false);
    router.push('/admin/blog/posts');
  };

  const execEditor = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const uploadImage = async (file?: File, target: 'cover' | 'content' = 'content') => {
    if (!file || uploadingImage) return;
    setUploadingImage(true);
    try {
      const result = await adminApi.upload(file);
      if (target === 'cover') setForm((current) => ({ ...current, cover_image: result.file_url, og_image: current.og_image || result.file_url }));
      else execEditor('insertImage', result.file_url);
    } finally {
      setUploadingImage(false);
    }
  };

  const addBlogCategoryDefault = async (value: string) => {
    const normalizedValue = value.trim();
    if (!normalizedValue || blogCategoryDefaults.some((item) => (item.value || item.name).toLowerCase() === normalizedValue.toLowerCase())) return;
    await adminApi.create<ProductAttribute>('ProductAttribute', { type: 'blog_category', name: normalizedValue, value: normalizedValue });
    const items = await adminApi.list<ProductAttribute>('ProductAttribute');
    setBlogCategoryDefaults(items.filter((item) => item.type === 'blog_category'));
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || form.tags.includes(value)) return;
    setForm({ ...form, tags: [...form.tags, value] });
    setTagInput('');
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[2rem] bg-[#fbf6f0] p-4 text-[#3a211d] sm:p-6" dir="rtl">
      <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-[#eaded5] bg-[#fffaf5] p-5 shadow-[0_24px_70px_rgba(74,36,31,0.07)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link href="/admin/blog/posts" className="text-xs font-bold text-[#970f35]">بازگشت به مقالات</Link>
          <h1 className="mt-3 text-3xl font-black text-[#2d1b18]">{isEditing ? 'ویرایش مقاله' : 'مقاله جدید'}</h1>
          <p className="mt-2 text-sm leading-7 text-[#7d6660]">گردش‌کار انتشار مجله نوشه؛ از ایده و تصویر شاخص تا SEO و انتشار نهایی.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => save('draft')} disabled={saving} className="rounded-2xl border border-[#eaded5] bg-white px-4 py-3 text-sm font-black text-[#4a241f] hover:text-[#970f35] disabled:opacity-60">ذخیره پیش‌نویس</button>
          <button onClick={() => setPreviewMode(!previewMode)} className="rounded-2xl border border-[#eaded5] bg-[#f7eee8] px-4 py-3 text-sm font-black text-[#970f35]">پیش‌نمایش</button>
          <button onClick={() => save('published')} disabled={saving} className="rounded-2xl bg-[#970f35] px-5 py-3 text-sm font-black text-white shadow-[0_16px_35px_rgba(151,15,53,0.24)] hover:bg-[#7d0b2b] disabled:opacity-60">ذخیره و انتشار</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <main className="space-y-6">
          <Section eyebrow="01" title="اطلاعات اصلی" description="عنوان، نامک، خلاصه و دسته‌بندی ستون اصلی تجربه تحریریه هستند.">
            <Field label="عنوان مقاله" required><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="راهنمای انتخاب سایز مناسب لباس زیر" /></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="نامک (Slug)" helper={`پیش‌نمایش: /blog/${generatedSlug || 'article-slug'}`}><input className={inputClass} dir="ltr" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="article-slug" /></Field>
              <Field label="نویسنده"><input className={inputClass} value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="تیم نویسندگان نوشه" /></Field>
            </div>
            <Field label="خلاصه مقاله" helper="یک لید کوتاه و مجله‌ای برای کارت‌ها، متادیتا و ابتدای صفحه."><textarea className={`${inputClass} min-h-28`} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="یک خلاصه کوتاه و جذاب درباره مقاله بنویسید..." /></Field>
          </Section>

          <Section eyebrow="02" title="محتوا" description="ویرایشگر تمیز با کنترل تیتر، لیست، لینک و حالت پیش‌نمایش برای تولید محتوای بلند.">
            <div className="overflow-hidden rounded-[1.4rem] border border-[#eaded5] bg-[#fffaf5]">
              <div className="flex flex-wrap gap-2 border-b border-[#eaded5] bg-white/80 p-3">
                {editorActions.map((action) => <button key={action.label} type="button" className="rounded-xl border border-[#eaded5] bg-[#fffaf5] px-3 py-2 text-xs font-black text-[#4a241f] hover:text-[#970f35]" onClick={() => execEditor(action.command, action.value)}>{action.label}</button>)}
                <button type="button" className="rounded-xl border border-[#eaded5] bg-[#fffaf5] px-3 py-2 text-xs font-black text-[#4a241f] hover:text-[#970f35]" onClick={() => { const url = window.prompt('لینک را وارد کنید'); if (url) execEditor('createLink', url); }}>لینک</button>
                <label className="cursor-pointer rounded-xl border border-[#eaded5] bg-[#fffaf5] px-3 py-2 text-xs font-black text-[#4a241f] hover:text-[#970f35]">↥ آپلود عکس<input type="file" accept="image/*" hidden disabled={uploadingImage} onChange={(event) => uploadImage(event.target.files?.[0], 'content')} /></label>
                <button type="button" className="rounded-xl border border-[#eaded5] bg-[#fffaf5] px-3 py-2 text-xs font-black text-[#4a241f] hover:text-[#970f35]" onClick={() => execEditor('removeFormat')}>پاک‌سازی</button>
              </div>
              {previewMode ? <article className="min-h-80 px-5 py-6 text-base leading-9 text-[#4a241f] [&_a]:text-[#970f35] [&_blockquote]:border-r-4 [&_blockquote]:border-[#970f35] [&_blockquote]:bg-[#f8eee8] [&_blockquote]:p-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-black [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-black" dangerouslySetInnerHTML={{ __html: form.content || '<p>پیش‌نمایش محتوا اینجا نمایش داده می‌شود.</p>' }} /> : <div className="min-h-80 px-5 py-6 text-base leading-9 text-[#4a241f] outline-none empty:before:text-[#b09b92]" contentEditable suppressContentEditableWarning onInput={(e) => setForm({ ...form, content: (e.currentTarget as HTMLDivElement).innerHTML })} dangerouslySetInnerHTML={{ __html: form.content || '' }} />}
            </div>
            <p className="text-xs leading-6 text-[#9b857b]">برای تیترهای مقاله از H2 و H3 استفاده کنید تا فهرست مطالب، SEO و خوانایی بهتر شود.</p>
          </Section>

          <Section eyebrow="04" title="SEO" description="پیش‌نمایش زنده نتیجه جستجو، نامک و اعتبارسنجی متادیتا بدون تغییر معماری SEO موجود.">
            <div className="rounded-2xl border border-[#eaded5] bg-[#fffaf5] p-4">
              <p className="text-xs text-[#6f5a54]">noosheh.com/blog/{generatedSlug || 'article-slug'}</p>
              <h3 className="mt-2 text-lg font-black text-[#1a0dab]">{form.seo_title || form.title || 'عنوان سئو مقاله'}</h3>
              <p className="mt-2 text-sm leading-7 text-[#545454]">{form.seo_description || form.excerpt || 'توضیحات متا مقاله اینجا نمایش داده می‌شود تا قبل از انتشار طول و کیفیت آن را بررسی کنید.'}</p>
            </div>
            <Field label="Meta title" helper={`${seoTitleLength.toLocaleString('fa-IR')} کاراکتر؛ پیشنهاد ۲۰ تا ۷۰ کاراکتر.`}><input className={inputClass} value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} placeholder="عنوان سئو" /></Field>
            <Field label="Meta description" helper={`${seoDescriptionLength.toLocaleString('fa-IR')} کاراکتر؛ پیشنهاد ۷۰ تا ۱۷۰ کاراکتر.`}><textarea className={`${inputClass} min-h-24`} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} placeholder="توضیحات متا" /></Field>
            <Field label="OG image" helper="در صورت خالی بودن، تصویر شاخص آپلودشده برای شبکه‌های اجتماعی استفاده می‌شود."><div className="flex gap-2"><input className={inputClass} dir="ltr" value={form.og_image} onChange={(e) => setForm({ ...form, og_image: e.target.value })} placeholder="/uploads/..." /><label className="cursor-pointer rounded-2xl bg-[#970f35] px-4 py-3 text-sm font-black text-white">آپلود<input type="file" accept="image/*" hidden disabled={uploadingImage} onChange={(event) => uploadImage(event.target.files?.[0], 'cover')} /></label></div></Field>
            <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${metadataValid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>{metadataValid ? 'متادیتا از نظر طول آماده انتشار است.' : 'برای نتیجه بهتر، طول عنوان و توضیحات متا را به محدوده پیشنهادی نزدیک کنید.'}</div>
            {isEditing && id ? <SeoTab entity={form} entityType="blog_post" entityId={id} /> : <div className="rounded-2xl border border-dashed border-[#eaded5] bg-white/70 px-4 py-3 text-sm leading-7 text-[#7d6660]">پس از اولین ذخیره، پنل تخصصی SEO و اسکیما فعال می‌شود.</div>}
          </Section>
        </main>

        <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <Section eyebrow="03" title="تصویر شاخص" description="تصویر بزرگ و لطیف، حس مجله مد را به مقاله می‌دهد.">
            <div className="overflow-hidden rounded-[1.4rem] border border-[#eaded5] bg-[#f7eee8]">
              <Image src={form.cover_image || fallbackImage} alt="تصویر شاخص" width={640} height={420} unoptimized className="h-56 w-full object-cover" />
            </div>
            <Field label="آپلود تصویر شاخص" helper="برای تصویر شاخص لینک وارد نمی‌کنیم؛ فایل را از سیستم انتخاب و آپلود کنید."><label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#970f35]/35 bg-white px-4 py-4 text-sm font-black text-[#970f35] hover:bg-[#fff5f8]">{uploadingImage ? 'در حال آپلود...' : 'انتخاب و آپلود تصویر از سیستم'}<input type="file" accept="image/*" hidden disabled={uploadingImage} onChange={(event) => uploadImage(event.target.files?.[0], 'cover')} /></label>{form.cover_image && <p className="break-all rounded-xl bg-[#fffaf5] p-3 text-xs font-medium text-[#7d6660]" dir="ltr">{form.cover_image}</p>}</Field>
          </Section>

          <Section eyebrow="05" title="انتشار" description="وضعیت، تاریخ انتشار، دسته‌بندی و برچسب‌های تحریریه را کنترل کنید.">
            <Field label="وضعیت"><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EditorForm['status'] })}><option value="draft">پیش‌نویس</option><option value="published">منتشر شده</option><option value="archived">بایگانی</option></select></Field>
            <Field label="تاریخ انتشار"><input className={inputClass} type="datetime-local" value={form.publish_at ? form.publish_at.slice(0, 16) : ''} onChange={(e) => setForm({ ...form, publish_at: e.target.value })} /></Field>
            <Field label="دسته‌بندی"><BlogCategoryDropdown value={form.category} options={blogCategoryOptions} onChange={(category) => setForm({ ...form, category })} onCreate={addBlogCategoryDefault} /></Field>
            <Field label="برچسب‌ها"><div className="flex gap-2"><input className={inputClass} value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="مثال: ساتن" /><button type="button" onClick={addTag} className="rounded-2xl bg-[#970f35] px-4 font-black text-white">+</button></div></Field>
            <div className="flex flex-wrap gap-2">{form.tags.map((tag) => <button type="button" key={tag} onClick={() => setForm({ ...form, tags: form.tags.filter((item) => item !== tag) })} className="rounded-full bg-[#f7e8ee] px-3 py-1.5 text-xs font-bold text-[#970f35]">{tag} ×</button>)}</div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
