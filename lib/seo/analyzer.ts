export type SeoCheckSeverity = 'info' | 'warning' | 'error';
export type SeoCheck = { key: string; passed: boolean; message: string; severity: SeoCheckSeverity };

export function analyzeSeoContent(input: {
  title?: string;
  description?: string;
  slug?: string;
  focusKeyword?: string;
  content?: string;
}) {
  const checks: SeoCheck[] = [];
  const title = input.title?.trim() || '';
  const description = input.description?.trim() || '';
  const slug = input.slug?.trim() || '';
  const focus = input.focusKeyword?.trim().toLowerCase() || '';
  const content = input.content?.trim() || '';

  checks.push({ key: 'title_exists', passed: !!title, message: 'Meta title exists', severity: 'error' });
  checks.push({ key: 'title_length', passed: title.length >= 30 && title.length <= 60, message: 'Title length should be 30-60', severity: 'warning' });
  checks.push({ key: 'description_exists', passed: !!description, message: 'Meta description exists', severity: 'error' });
  checks.push({ key: 'description_length', passed: description.length >= 70 && description.length <= 160, message: 'Description length should be 70-160', severity: 'warning' });
  checks.push({ key: 'slug_exists', passed: !!slug, message: 'Slug exists', severity: 'error' });
  checks.push({ key: 'slug_lowercase', passed: slug === slug.toLowerCase(), message: 'Slug should be lowercase', severity: 'warning' });
  checks.push({ key: 'focus_in_title', passed: focus ? title.toLowerCase().includes(focus) : true, message: 'Focus keyword should be in title', severity: 'warning' });
  checks.push({ key: 'focus_in_description', passed: focus ? description.toLowerCase().includes(focus) : true, message: 'Focus keyword should be in description', severity: 'warning' });
  checks.push({ key: 'content_length', passed: content.length >= 250, message: 'Content should be at least 250 chars', severity: 'warning' });

  const passCount = checks.filter((c) => c.passed).length;
  const seoScore = Math.round((passCount / checks.length) * 100);
  const readabilityScore = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, (content.match(/\n/g)?.length || 0) - 25))));

  return {
    seoScore,
    readabilityScore,
    passedChecks: checks.filter((c) => c.passed).map((c) => c.key),
    warnings: checks.filter((c) => !c.passed && c.severity === 'warning').map((c) => c.message),
    errors: checks.filter((c) => !c.passed && c.severity === 'error').map((c) => c.message),
    suggestions: checks.filter((c) => !c.passed).map((c) => c.message),
    checks
  };
}
