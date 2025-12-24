// Netlify Edge Function for form submissions
// Path: /api/form

export default async (request: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    // Get webhook URL from environment
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.error('N8N_WEBHOOK_URL is not configured');
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Basic validation
    if (!body.name || !body.email) {
      return new Response(
        JSON.stringify({ error: 'Name and email are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Prepare data to send
    const formData = {
      type: String(body.type || 'contact'),
      name: String(body.name || '').slice(0, 200),
      email: String(body.email || '').toLowerCase().slice(0, 255),
      message: String(body.message || '').slice(0, 5000),
      organization: String(body.organization || '').slice(0, 200),
      needs: String(body.needs || '').slice(0, 5000),
      page_url: String(body.page_url || '').slice(0, 500),
      timestamp: new Date().toISOString(),
      source: 'plademy-website',
    };

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
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};
