'use client';

import { useMemo } from 'react';
import { useEntityList } from '../../_components/hooks';
import { AssistantPage, Badge, Card, CardTitle } from '../SeoAssistantUI';

export default function RobotsPage() {
  const { data } = useEntityList<any>('SeoSettings');
  const content = data[0]?.robots_txt || `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: https://noosheh.com/sitemap.xml`;

  const parsed = useMemo(() => {
    const lines = String(content).split('\n').map((line) => line.trim()).filter(Boolean);
    return {
      allowed: lines.filter((line) => line.toLowerCase().startsWith('allow:')).map((line) => line.replace(/^allow:\s*/i, '')),
      blocked: lines.filter((line) => line.toLowerCase().startsWith('disallow:')).map((line) => line.replace(/^disallow:\s*/i, '')),
      hasSitemap: lines.some((line) => line.toLowerCase().startsWith('sitemap:')),
      blocksStore: lines.some((line) => /^disallow:\s*\/$/i.test(line))
    };
  }, [content]);

  const warnings = [
    parsed.blocksStore ? { tone: 'bad' as const, text: 'کل سایت برای گوگل بسته شده است.' } : null,
    !parsed.hasSitemap ? { tone: 'warn' as const, text: 'آدرس Sitemap داخل Robots دیده نمی‌شود.' } : null
  ].filter(Boolean) as Array<{ tone: 'bad' | 'warn'; text: string }>;

  return (
    <AssistantPage title="مدیریت Robots.txt" description="Robots.txt به موتورهای جست‌وجو می‌گوید کدام بخش‌های فروشگاه را ببینند و کدام بخش‌ها را کنار بگذارند.">
      <div className="seo-robots-grid">
        <Card>
          <CardTitle title="بخش‌های مجاز" subtitle="این مسیرها برای گوگل قابل مشاهده هستند." />
          <div className="seo-pill-list">{(parsed.allowed.length ? parsed.allowed : ['/']).map((item) => <Badge key={item} tone="good">{item}</Badge>)}</div>
        </Card>
        <Card>
          <CardTitle title="بخش‌های بسته‌شده" subtitle="معمولا پنل مدیریت، API و مراحل حساب کاربری نباید وارد گوگل شوند." />
          <div className="seo-pill-list">{parsed.blocked.map((item) => <Badge key={item} tone="blush">{item}</Badge>)}</div>
        </Card>
        <Card>
          <CardTitle title="هشدارها" subtitle="رنگ سبز یعنی امن، زرد یعنی بهتر است بررسی شود، قرمز یعنی مشکل." />
          <div className="seo-warning-list">
            {warnings.length ? warnings.map((item) => <p key={item.text}><Badge tone={item.tone}>{item.tone === 'bad' ? 'Problem' : 'Review'}</Badge>{item.text}</p>) : <p><Badge tone="good">Safe</Badge>وضعیت Robots امن به نظر می‌رسد.</p>}
          </div>
        </Card>
      </div>

      <Card>
        <CardTitle title="پیش‌نمایش Robots.txt" subtitle="برای تغییر متن، به تنظیمات پایه SEO بروید." />
        <pre className="seo-code-preview" dir="ltr">{content}</pre>
      </Card>
    </AssistantPage>
  );
}
