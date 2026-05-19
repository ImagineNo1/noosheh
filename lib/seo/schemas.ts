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

export function validateRedirect(payload: Record<string, unknown>): ParseResult<Record<string, unknown>> {
  const errors: Record<string, string> = {};
  if (!payload.fromPath || typeof payload.fromPath !== 'string' || !String(payload.fromPath).startsWith('/')) errors.fromPath = 'fromPath must start with /';
  const statusCode = Number(payload.statusCode);
  if (![301, 302, 307, 308, 410].includes(statusCode)) errors.statusCode = 'statusCode is invalid';
  if (statusCode !== 410) {
    if (!payload.toPath || typeof payload.toPath !== 'string' || !String(payload.toPath).startsWith('/')) errors.toPath = 'toPath must start with /';
  }
  return Object.keys(errors).length ? { success: false, error: errors } : { success: true, data: payload };
}

export function validateSeoSettings(payload: Record<string, unknown>): ParseResult<Record<string, unknown>> {
  const errors: Record<string, string> = {};
  if (payload.defaultOgImage) {
    try { new URL(String(payload.defaultOgImage)); } catch { errors.defaultOgImage = 'defaultOgImage must be an absolute URL'; }
  }
  if (payload.defaultMetaTitle && String(payload.defaultMetaTitle).length > 70) errors.defaultMetaTitle = 'defaultMetaTitle max length is 70';
  if (payload.defaultMetaDescription && String(payload.defaultMetaDescription).length > 320) errors.defaultMetaDescription = 'defaultMetaDescription max length is 320';
  return Object.keys(errors).length ? { success: false, error: errors } : { success: true, data: payload };
}
