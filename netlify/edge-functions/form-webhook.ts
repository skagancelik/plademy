// Netlify Edge Function for form submissions
// This hides the n8n webhook URL from client-side code
// Path: /form-webhook (auto-discovered) or /api/form (if path mapping works)

// Input validation and sanitization helpers
function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  // Remove potentially dangerous characters and limit length
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .trim();
}

function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

interface FormData {
  type?: string;
  name?: string;
  email?: string;
  organization?: string;
  message?: string;
  needs?: string;
  resource_slug?: string;
  resource_title?: string;
  program_slug?: string;
  program_title?: string;
  category?: string;
  source?: string;
  page_url?: string;
}

interface ValidationResult {
  valid: boolean;
  sanitized?: Record<string, unknown>;
  error?: string;
}

function validateFormData(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request data' };
  }

  const formData = data as FormData;

  // Validate required fields
  if (!formData.name || typeof formData.name !== 'string' || formData.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (!formData.email || !validateEmail(formData.email)) {
    return { valid: false, error: 'Valid email is required' };
  }

  // Sanitize all string fields
  const sanitized: Record<string, unknown> = {
    type: sanitizeString(formData.type, 50),
    name: sanitizeString(formData.name, 200),
    email: formData.email.toLowerCase().trim().slice(0, 255),
    timestamp: new Date().toISOString(),
    source: 'plademy-website',
  };

  // Optional fields with sanitization
  if (formData.organization) {
    sanitized.organization = sanitizeString(formData.organization, 200);
  }
  if (formData.message) {
    sanitized.message = sanitizeString(formData.message, 5000);
  }
  if (formData.needs) {
    sanitized.needs = sanitizeString(formData.needs, 5000);
  }
  if (formData.resource_slug) {
    sanitized.resource_slug = sanitizeString(formData.resource_slug, 200);
  }
  if (formData.resource_title) {
    sanitized.resource_title = sanitizeString(formData.resource_title, 500);
  }
  if (formData.program_slug) {
    sanitized.program_slug = sanitizeString(formData.program_slug, 200);
  }
  if (formData.program_title) {
    sanitized.program_title = sanitizeString(formData.program_title, 500);
  }
  if (formData.category) {
    sanitized.category = sanitizeString(formData.category, 200);
  }
  if (formData.source) {
    sanitized.source = sanitizeString(formData.source, 100);
  }
  if (formData.page_url) {
    // Validate URL format
    try {
      const url = new URL(formData.page_url);
      sanitized.page_url = url.toString().slice(0, 500);
    } catch {
      // Invalid URL, skip it
    }
  }

  return { valid: true, sanitized };
}

export default async (request: Request) => {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');

  if (!n8nWebhookUrl) {
    console.error('N8N_WEBHOOK_URL not configured');
    return new Response(
      JSON.stringify({ error: 'Service temporarily unavailable' }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    // Parse and validate request body
    let formData: unknown;
    try {
      formData = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate and sanitize form data
    const validation = validateFormData(formData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error || 'Invalid form data' }),
        {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Forward to n8n webhook with sanitized data
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validation.sanitized),
    });

    if (!response.ok) {
      console.error(`n8n webhook failed: ${response.status} ${response.statusText}`);
      throw new Error(`Webhook service error: ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process form submission. Please try again later.',
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};
