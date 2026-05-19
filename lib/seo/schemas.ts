type ParseResult<T> = { success: true; data: T } | { success: false; error: Record<string, string> };

export function validateSeoMeta(payload: Record<string, unknown>): ParseResult<Record<string, unknown>> {
  const errors: Record<string, string> = {};
  if (!payload.entityType || typeof payload.entityType !== 'string') errors.entityType = 'entityType is required';
  if (!payload.entityId || typeof payload.entityId !== 'string') errors.entityId = 'entityId is required';
  if (payload.metaTitle && String(payload.metaTitle).length > 70) errors.metaTitle = 'metaTitle max length is 70';
  if (payload.metaDescription && String(payload.metaDescription).length > 320) errors.metaDescription = 'metaDescription max length is 320';
  if (payload.canonicalUrl) {
    try { new URL(String(payload.canonicalUrl)); } catch { errors.canonicalUrl = 'canonicalUrl must be an absolute URL'; }
  }
  return Object.keys(errors).length ? { success: false, error: errors } : { success: true, data: payload };
}
