import { createHmac, timingSafeEqual } from 'crypto';

type JwtPayload = Record<string, unknown> & { exp?: number };

function base64Url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function getJwtSecret() {
  return process.env.JWT_SECRET || '';
}

export function isJwtConfigured() {
  return Boolean(getJwtSecret());
}

export function signJwt(payload: JwtPayload, expiresInSeconds = 60 * 60 * 8) {
  const secret = getJwtSecret();
  if (!secret) throw new Error('JWT_SECRET is not configured');
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedBody = base64Url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedBody}`;
  const signature = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyJwt(token: string): JwtPayload | null {
  const secret = getJwtSecret();
  if (!secret) return null;
  const [encodedHeader, encodedBody, signature] = token.split('.');
  if (!encodedHeader || !encodedBody || !signature) return null;
  const data = `${encodedHeader}.${encodedBody}`;
  const expected = createHmac('sha256', secret).update(data).digest('base64url');
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;
  const payload = JSON.parse(Buffer.from(encodedBody, 'base64url').toString('utf8')) as JwtPayload;
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

export function getBearerToken(request: Request) {
  const header = request.headers.get('authorization') || '';
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
}

export function isAdminRequest(request: Request) {
  const token = getBearerToken(request);
  const payload = token ? verifyJwt(token) : null;
  return payload?.role === 'admin';
}
