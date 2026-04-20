const crypto = require('crypto');

const allowedOrigins = [
  'https://devicesf2.com',
  'https://www.devicesf2.com',
  'https://devicesf2.netlify.app',
  'http://localhost:8000',
  'http://localhost:3000',
  'http://localhost:8888',
  'http://localhost:8080',
  'http://localhost:4000',
  'http://localhost:3999',
  'https://localhost:8888',
  'https://localhost:8080',
  'https://localhost:3000'
];

const RATE_LIMIT_STORE = new Map();

function resolveOrigin(event) {
  const headers = (event && event.headers) || {};
  const explicitOrigin = headers.origin || headers.Origin;
  if (explicitOrigin) return explicitOrigin;

  const host = (headers.host || headers.Host || '').toLowerCase();
  if (!host) return '';

  const forwardedProto = String(headers['x-forwarded-proto'] || '').toLowerCase();
  const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('::1');
  const protocol = forwardedProto === 'https' ? 'https' : (forwardedProto === 'http' || isLocalhost ? 'http' : 'https');
  return `${protocol}://${host}`;
}

function resolveHost(event) {
  return (event && event.headers && (event.headers.host || event.headers.Host) || '').toLowerCase();
}

function resolveUserAgent(event) {
  return (event && event.headers && (event.headers['user-agent'] || event.headers['User-Agent']) || '').slice(0, 180);
}

function buildCorsHeaders(origin) {
  const safeOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': safeOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function isAllowedOrigin(origin) {
  return !origin || allowedOrigins.includes(origin);
}

function isStrictAllowedOrigin(origin) {
  return Boolean(origin) && allowedOrigins.includes(origin);
}

function buildRateLimitKey(prefix, event) {
  const ip = getClientIp(event);
  const ua = resolveUserAgent(event);
  const fingerprint = crypto.createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 16);
  return `${prefix}:${fingerprint}`;
}

function jsonResponse(statusCode, payload, origin = '') {
  return {
    statusCode,
    headers: buildCorsHeaders(origin),
    body: JSON.stringify(payload)
  };
}

function parseJsonBody(event) {
  if (!event || !event.body) {
    return {};
  }
  return JSON.parse(event.body);
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const idx = part.indexOf('=');
      if (idx <= 0) return acc;
      const key = decodeURIComponent(part.slice(0, idx).trim());
      const value = decodeURIComponent(part.slice(idx + 1).trim());
      acc[key] = value;
      return acc;
    }, {});
}

function createSignedToken(payload, secret, ttlMs) {
  const data = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + ttlMs
  };
  const encoded = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verifySignedToken(token, secret) {
  if (!token || !secret || !token.includes('.')) {
    return { valid: false };
  }

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) {
    return { valid: false };
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(encoded)
    .digest('base64url');

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length) {
    return { valid: false };
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false };
  }

  try {
    const data = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!data.exp || Date.now() > data.exp) {
      return { valid: false };
    }
    return { valid: true, payload: data };
  } catch (error) {
    return { valid: false };
  }
}

function buildSessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secure}`;
}

function clearSessionCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const state = RATE_LIMIT_STORE.get(key) || [];
  const recent = state.filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= maxRequests) {
    RATE_LIMIT_STORE.set(key, recent);
    return false;
  }

  recent.push(now);
  RATE_LIMIT_STORE.set(key, recent);
  return true;
}

function getClientIp(event) {
  const raw =
    (event && event.headers && (event.headers['x-forwarded-for'] || event.headers['client-ip'])) ||
    '';
  return raw.split(',')[0].trim() || 'unknown';
}

module.exports = {
  isAllowedOrigin,
  isStrictAllowedOrigin,
  resolveOrigin,
  resolveHost,
  jsonResponse,
  parseJsonBody,
  parseCookies,
  createSignedToken,
  verifySignedToken,
  buildSessionCookie,
  clearSessionCookie,
  checkRateLimit,
  getClientIp,
  buildRateLimitKey
};
