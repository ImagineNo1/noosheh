export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) return `${field} is required`;
  return null;
}

export function sanitizeHtml(input: string) {
  return input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/on\w+=/g, '');
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-\u0600-\u06FF]/g, '');
}
