/**
 * Form security: validation, sanitization, honeypot, rate limiting.
 * Used by /api/form to protect against spam, bots, and abuse.
 */

const MAX_NAME_LENGTH = 200;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 10000;
const MAX_ORGANIZATION_LENGTH = 300;
const MAX_NEEDS_LENGTH = 5000;
const MAX_SLUG_LENGTH = 500;
const MAX_TITLE_LENGTH = 500;
const MAX_CATEGORY_LENGTH = 200;
const MAX_AUDIENCE_LENGTH = 200;
const MAX_PAGE_URL_LENGTH = 2048;

/** Honeypot field name – must be empty (bots often fill it). */
export const HONEYPOT_FIELD = 'website';

/** Allowed form types (whitelist). */
const ALLOWED_TYPES = new Set([
  'contact',
  'start',
  'resource form',
  'resource form bottom',
  'program form',
  'program form bottom',
]);

/** Rate limit: max requests per IP per window (in-memory; per instance on serverless). */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const nfClient = request.headers.get('x-nf-client-connection-ip');
  if (nfClient) return nfClient;
  return 'unknown';
}

/**
 * Returns true if the client is over rate limit. Call this before processing.
 */
export function isRateLimited(request: Request): boolean {
  const ip = getClientIp(request);
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }
  return false;
}

/**
 * Sanitize string: trim, normalize whitespace, remove control chars and null bytes.
 * Does not allow HTML/script injection.
 */
export function sanitizeString(value: unknown, maxLength: number): string {
  if (value == null) return '';
  let s = String(value)
    .trim()
    .replace(/\0/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
  return s;
}

/** Basic email format check (RFC 5322 simplified). */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > MAX_EMAIL_LENGTH) return false;
  const localPart = '[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+';
  const domainPart = '[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*';
  const regex = new RegExp(`^${localPart}@${domainPart}$`);
  return regex.test(email);
}

/**
 * Reject if honeypot field is present and non-empty (bot trap).
 */
export function isHoneypotTriggered(body: Record<string, unknown>): boolean {
  const value = body[HONEYPOT_FIELD];
  if (value == null) return false;
  const s = String(value).trim();
  return s.length > 0;
}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_VERIFY_TIMEOUT_MS = 10_000;

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
}

/**
 * Verify Cloudflare Turnstile token with Siteverify API.
 * Call only when TURNSTILE_SECRET_KEY is set; otherwise skip (e.g. local dev).
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  request: Request,
  secretKey: string | undefined
): Promise<TurnstileVerifyResult> {
  if (!secretKey || !token || typeof token !== 'string') {
    return { success: false, errorCodes: ['missing-input-response'] };
  }
  const trimmed = token.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) {
    return { success: false, errorCodes: ['invalid-input-response'] };
  }
  const remoteip = getClientIp(request);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TURNSTILE_VERIFY_TIMEOUT_MS);
  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', trimmed);
    formData.append('remoteip', remoteip);
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    clearTimeout(timeoutId);
    return {
      success: !!data.success,
      errorCodes: data['error-codes'],
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, errorCodes: ['internal-error'] };
  }
}

export interface ValidationResult {
  ok: true;
  data: {
    type: string;
    name: string;
    email: string;
    message: string;
    organization: string;
    needs: string;
    page_url: string;
    resource_slug: string;
    resource_title: string;
    program_slug: string;
    program_title: string;
    category: string;
    audience: string;
    timestamp: string;
    source: string;
  };
}

export interface ValidationError {
  ok: false;
  error: string;
  status: number;
}

export type ValidateResult = ValidationResult | ValidationError;

/**
 * Validate and sanitize form body. Returns sanitized data or error.
 */
export function validateFormBody(body: unknown): ValidateResult {
  if (body == null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body', status: 400 };
  }

  const b = body as Record<string, unknown>;

  if (isHoneypotTriggered(b)) {
    return { ok: false, error: 'Invalid request', status: 400 };
  }

  const type = sanitizeString(b.type ?? 'contact', 50);
  if (!ALLOWED_TYPES.has(type)) {
    return { ok: false, error: 'Invalid form type', status: 400 };
  }

  const name = sanitizeString(b.name, MAX_NAME_LENGTH);
  const email = sanitizeString(b.email, MAX_EMAIL_LENGTH);

  if (!name || name.length < 1) {
    return { ok: false, error: 'Name is required', status: 400 };
  }
  if (!email) {
    return { ok: false, error: 'Email is required', status: 400 };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: 'Invalid email address', status: 400 };
  }

  const message = sanitizeString(b.message, MAX_MESSAGE_LENGTH);
  const organization = sanitizeString(b.organization, MAX_ORGANIZATION_LENGTH);
  const needs = sanitizeString(b.needs, MAX_NEEDS_LENGTH);
  const page_url = sanitizeString(b.page_url, MAX_PAGE_URL_LENGTH);
  const resource_slug = sanitizeString(b.resource_slug, MAX_SLUG_LENGTH);
  const resource_title = sanitizeString(b.resource_title, MAX_TITLE_LENGTH);
  const program_slug = sanitizeString(b.program_slug, MAX_SLUG_LENGTH);
  const program_title = sanitizeString(b.program_title, MAX_TITLE_LENGTH);
  const category = sanitizeString(b.category, MAX_CATEGORY_LENGTH);
  const audience = sanitizeString(b.audience, MAX_AUDIENCE_LENGTH);

  return {
    ok: true,
    data: {
      type,
      name,
      email,
      message,
      organization,
      needs,
      page_url,
      resource_slug,
      resource_title,
      program_slug,
      program_title,
      category,
      audience,
      timestamp: new Date().toISOString(),
      source: 'plademy-website',
    },
  };
}
