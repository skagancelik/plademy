// Netlify Edge Function for form submissions
// Uses Deno runtime

export default async (request: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Get webhook URL
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured');
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate
    if (!body.name || !body.email) {
      return new Response(
        JSON.stringify({ error: 'Name and email required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Prepare data
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

    console.log('Forwarding to webhook...');

    // Send to n8n
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      console.error('Webhook error:', response.status);
      return new Response(
        JSON.stringify({ error: 'Webhook failed' }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const config = { path: '/api/form' };

