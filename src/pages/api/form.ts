import type { APIRoute } from 'astro';
import {
  isRateLimited,
  validateFormBody,
  verifyTurnstile,
} from '@lib/formSecurity';

export const prerender = false;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': 'https://plademy.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Rate limit: reject excessive requests per IP
    if (isRateLimited(request)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: corsHeaders }
      );
    }

    // Only accept same-origin or our site (no wildcard CORS for POST)
    const origin = request.headers.get('origin');
    const allowedOrigins = ['https://plademy.com', 'http://localhost:4321', 'http://localhost:8888'];
    const responseOrigin = origin && allowedOrigins.includes(origin) ? origin : 'https://plademy.com';
    const responseCors = { ...corsHeaders, 'Access-Control-Allow-Origin': responseOrigin };

    const webhookUrl = process.env.N8N_WEBHOOK_URL || import.meta.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL is not configured');
      return new Response(
        JSON.stringify({
          error: 'Service not configured',
          details: 'N8N_WEBHOOK_URL environment variable is missing',
        }),
        { status: 500, headers: responseCors }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: responseCors }
      );
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY;
    const rawBody = body as Record<string, unknown>;
    const turnstileToken =
      (rawBody.cf_turnstile_response as string | undefined) ??
      (rawBody['cf-turnstile-response'] as string | undefined);

    if (turnstileSecret) {
      const turnstileResult = await verifyTurnstile(turnstileToken, request, turnstileSecret);
      if (!turnstileResult.success) {
        return new Response(
          JSON.stringify({
            error: 'Verification failed. Please complete the security check and try again.',
          }),
          { status: 400, headers: responseCors }
        );
      }
    }

    const validation = validateFormBody(body);
    if (!validation.ok) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: validation.status, headers: responseCors }
      );
    }

    const formPayload = validation.data;

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formPayload),
    });

    if (!webhookResponse.ok) {
      const responseText = await webhookResponse.text().catch(() => 'Unable to read response');
      console.error('Webhook failed:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        url: webhookUrl.substring(0, 50) + '...',
      });
      return new Response(
        JSON.stringify({
          error: 'Failed to process form',
          details: `Webhook returned ${webhookResponse.status}: ${webhookResponse.statusText}`,
        }),
        { status: 500, headers: responseCors }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: responseCors }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('API error:', errorMessage);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: errorMessage,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const OPTIONS: APIRoute = async ({ request }) => {
  const origin = request.headers.get('origin');
  const allowedOrigins = ['https://plademy.com', 'http://localhost:4321', 'http://localhost:8888'];
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : 'https://plademy.com';
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

