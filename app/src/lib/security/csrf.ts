/**
 * CSRF Protection Utilities
 * 
 * Implements Double Submit Cookie pattern for CSRF protection
 * https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie
 */

import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set CSRF token cookie
 */
export async function setCsrfToken(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return token;
}

/**
 * Get CSRF token from cookie
 */
export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Verify CSRF token from request
 * Validates the token sent in the header matches the cookie
 */
export async function verifyCsrfToken(request: NextRequest): Promise<boolean> {
  // Skip CSRF check for GET, HEAD, OPTIONS requests
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true;
  }
  
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = await getCsrfToken();
  
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  // Use timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(headerToken, 'hex'),
      Buffer.from(cookieToken, 'hex')
    );
  } catch {
    // Buffer length mismatch or invalid hex
    return false;
  }
}

/**
 * Middleware to enforce CSRF protection
 * Use this in API routes that require CSRF protection
 */
export async function requireCsrf(request: NextRequest): Promise<{
  success: boolean;
  error?: string;
}> {
  const isValid = await verifyCsrfToken(request);
  
  if (!isValid) {
    return {
      success: false,
      error: 'Invalid or missing CSRF token',
    };
  }
  
  return { success: true };
}

/**
 * Clear CSRF token (on logout)
 */
export async function clearCsrfToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_COOKIE_NAME);
}
