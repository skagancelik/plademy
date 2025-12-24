import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    // Try both import.meta.env and process.env for Netlify compatibility
    const webhookUrl = import.meta.env.N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL is not configured');
      console.error('Available env vars:', {
        hasImportMeta: !!import.meta.env.N8N_WEBHOOK_URL,
        hasProcess: !!process.env.N8N_WEBHOOK_URL,
        importMetaKeys: Object.keys(import.meta.env || {}),
      });
      return new Response(
        JSON.stringify({ 
          error: 'Service not configured',
          details: 'N8N_WEBHOOK_URL environment variable is missing'
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate required fields
    if (!body.name || !body.email) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Prepare form data
    const formData = {
      type: body.type || 'contact',
      name: body.name,
      email: body.email,
      message: body.message || '',
      organization: body.organization || '',
      needs: body.needs || '',
      page_url: body.page_url || '',
      resource_slug: body.resource_slug || '',
      resource_title: body.resource_title || '',
      program_slug: body.program_slug || '',
      program_title: body.program_title || '',
      category: body.category || '',
      timestamp: new Date().toISOString(),
      source: 'plademy-website',
    };

    console.log('Sending form data to webhook...');

    // Forward to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      console.error('Webhook failed:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to process form' }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('Form submitted successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('API error:', {
      message: errorMessage,
      stack: errorStack,
    });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: errorMessage,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

