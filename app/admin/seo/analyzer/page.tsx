'use client';

import { useMemo, useState } from 'react';
import { useEntityList } from '../../_components/hooks';
import { AssistantPage, Badge, Card, CardTitle, ProgressBar, SeoMetaRow, entityLabel, mainProblem, scoreStatus, toFa } from '../SeoAssistantUI';

const typeFilters = [
  ['all', 'همه صفحه‌ها'],
  ['product', 'Products'],
  ['category', 'Categories'],
  ['blog_post', 'Blog'],
  ['page', 'Pages']
];

const issueFilters = [
  ['all', 'همه وضعیت‌ها'],
  ['missing-title', 'Missing title'],
  ['missing-description', 'Missing description'],
  ['missing-image', 'Missing image'],
  ['canonical', 'Canonical issues']
];

export default function AnalyzerPage() {
  const { data, isLoading } = useEntityList<SeoMetaRow>('SeoMeta', '-created_date', 200);
  const [type, setType] = useState('all');
  const [issue, setIssue] = useState('all');
  const [scoreRange, setScoreRange] = useState('all');

  const rows = useMemo(() => data.filter((row) => {
    const score = Number(row.seo_score || 0);
    if (type !== 'all' && row.entity_type !== type) return false;
    if (scoreRange === 'good' && score < 80) return false;
    if (scoreRange === 'review' && (score < 55 || score >= 80)) return false;
    if (scoreRange === 'bad' && score >= 55) return false;
    if (issue === 'missing-title' && row.meta_title) return false;
    if (issue === 'missing-description' && row.meta_description) return false;
    if (issue === 'missing-image' && row.og_image) return false;
    if (issue === 'canonical' && row.canonical_url) return false;
    return true;
  }), [data, issue, scoreRange, type]);

  return (
    <AssistantPage title="آنالایزر صفحات" description="مرکز بررسی صفحه‌ها، با امتیاز و اقدام‌های ساده به جای اصطلاحات پیچیده.">
      <Card>
        <CardTitle title="فیلترها" subtitle="صفحه‌هایی را ببینید که برای فروشگاه امروز مهم‌تر هستند." />
        <div className="seo-filter-row">
          <select value={type} onChange={(event) => setType(event.target.value)}>{typeFilters.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select value={scoreRange} onChange={(event) => setScoreRange(event.target.value)}>
            <option value="all">همه امتیازها</option>
            <option value="good">۸۰ تا ۱۰۰</option>
            <option value="review">۵۵ تا ۷۹</option>
            <option value="bad">کمتر از ۵۵</option>
          </select>
          <select value={issue} onChange={(event) => setIssue(event.target.value)}>{issueFilters.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </div>
      </Card>

      <Card>
        <CardTitle title="گزارش سریع صفحات" subtitle={`${toFa(rows.length)} مورد مطابق فیلتر فعلی`} />
        <div className="seo-table-wrap">
          <table className="seo-table">
            <thead><tr><th>نوع صفحه</th><th>عنوان صفحه</th><th>امتیاز</th><th>وضعیت</th><th>مشکل اصلی</th><th>اقدام</th></tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6}>در حال بارگذاری...</td></tr> : rows.map((row) => {
                const score = Number(row.seo_score || 0);
                const status = scoreStatus(score);
                return (
                  <tr key={row.id || row.entity_id}>
                    <td>{entityLabel(row.entity_type)}</td>
                    <td>{row.meta_title || row.entity_id || 'صفحه بدون عنوان'}</td>
                    <td><ProgressBar value={score} tone={status.tone} />{toFa(score)}</td>
                    <td><Badge tone={status.tone}>{status.label}</Badge></td>
                    <td>{mainProblem(row)}</td>
                    <td><div className="seo-row-actions"><button>مشاهده</button><button>اصلاح</button><button>نادیده گرفتن</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AssistantPage>
  );
}
