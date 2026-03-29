const crypto = require('crypto');

const allowedOrigins = [
  'https://devicesf2.com',
  'https://www.devicesf2.com',
  'https://devicesf2.netlify.app',
  'http://localhost:8000',
  'http://localhost:3000'
];

const RATE_LIMIT_STORE = new Map();

function resolveOrigin(event) {
  return (event && event.headers && (event.headers.origin || event.headers.Origin)) || '';
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
  const expected = crypto
    .createHmac('sha256', secret)
    .update(encoded)
    .digest('base64url');

  if (signature !== expected) {
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
  resolveOrigin,
  jsonResponse,
  parseJsonBody,
  parseCookies,
  createSignedToken,
  verifySignedToken,
  buildSessionCookie,
  clearSessionCookie,
  checkRateLimit,
  getClientIp
};
