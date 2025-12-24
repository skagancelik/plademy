// Netlify Edge Function for form submissions
// This hides the n8n webhook URL from client-side code
// Path: /api/form

// Input validation and sanitization helpers
function sanitizeString(input: any, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  // Remove potentially dangerous characters and limit length
  return input
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .trim();
}

function validateEmail(email: any): boolean {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function validateFormData(data: any): { valid: boolean; sanitized?: any; error?: string } {
  // Validate required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }

  if (!data.email || !validateEmail(data.email)) {
    return { valid: false, error: 'Valid email is required' };
  }

  // Sanitize all string fields
  const sanitized: any = {
    type: sanitizeString(data.type, 50),
    name: sanitizeString(data.name, 200),
    email: data.email.toLowerCase().trim().slice(0, 255),
    timestamp: new Date().toISOString(),
    source: 'plademy-website',
  };

  // Optional fields with sanitization
  if (data.organization) {
    sanitized.organization = sanitizeString(data.organization, 200);
  }
  if (data.message) {
    sanitized.message = sanitizeString(data.message, 5000);
  }
  if (data.needs) {
    sanitized.needs = sanitizeString(data.needs, 5000);
  }
  if (data.resource_slug) {
    sanitized.resource_slug = sanitizeString(data.resource_slug, 200);
  }
  if (data.resource_title) {
    sanitized.resource_title = sanitizeString(data.resource_title, 500);
  }
  if (data.program_slug) {
    sanitized.program_slug = sanitizeString(data.program_slug, 200);
  }
  if (data.program_title) {
    sanitized.program_title = sanitizeString(data.program_title, 500);
  }
  if (data.category) {
    sanitized.category = sanitizeString(data.category, 200);
  }
  if (data.source) {
    sanitized.source = sanitizeString(data.source, 100);
  }
  if (data.page_url) {
    // Validate URL format
    try {
      const url = new URL(data.page_url);
      sanitized.page_url = url.toString().slice(0, 500);
    } catch {
      // Invalid URL, skip it
    }
  }

  return { valid: true, sanitized };
}

export default async (request: Request, context: any) => {
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
    let formData: any;
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

