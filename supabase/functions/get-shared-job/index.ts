import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShareLinkData {
  id: string;
  tenant_id: string;
  job_id: string;
  token: string;
  access_type: string;
  pin_hash: string | null;
  can_view_photos: boolean;
  can_view_readings: boolean;
  can_view_documents: boolean;
  can_view_floor_plans: boolean;
  can_view_equipment: boolean;
  can_view_work_logs: boolean;
  recipient_name: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  view_count: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client to bypass RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { token, pin } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the share link
    const { data: shareLink, error: linkError } = await supabase
      .from('job_share_links')
      .select('*')
      .eq('token', token)
      .single();

    if (linkError || !shareLink) {
      console.error('Share link not found:', linkError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired share link' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const link = shareLink as ShareLinkData;

    // Check if link is revoked
    if (link.revoked_at) {
      return new Response(
        JSON.stringify({ error: 'This share link has been revoked' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if link is expired
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'This share link has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check PIN if required
    if (link.pin_hash) {
      if (!pin) {
        return new Response(
          JSON.stringify({ error: 'PIN required', requiresPin: true }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // Simple hash comparison (in production, use proper bcrypt)
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (pinHash !== link.pin_hash) {
        return new Response(
          JSON.stringify({ error: 'Invalid PIN' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch job data
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', link.job_id)
      .single();

    if (jobError || !job) {
      console.error('Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch tenant/company info
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, logo_url, contact_phone, contact_email')
      .eq('id', link.tenant_id)
      .single();

    // Build response based on permissions
    const response: Record<string, unknown> = {
      job: {
        id: job.id,
        customer_name: job.customer_name,
        address: job.address,
        city: job.city,
        state: job.state,
        zip_code: job.zip_code,
        status: job.status,
        days_drying: job.days_drying,
        loss_type: job.loss_type,
        start_date: job.start_date,
        outdoor_temperature: job.outdoor_temperature,
        outdoor_humidity: job.outdoor_humidity,
        outdoor_gpp: job.outdoor_gpp,
      },
      company: tenant || { name: 'Restoration Company' },
      permissions: {
        can_view_photos: link.can_view_photos,
        can_view_readings: link.can_view_readings,
        can_view_documents: link.can_view_documents,
        can_view_floor_plans: link.can_view_floor_plans,
        can_view_equipment: link.can_view_equipment,
        can_view_work_logs: link.can_view_work_logs,
      },
    };

    // Fetch chambers for readings context
    const { data: chambers } = await supabase
      .from('drying_chambers')
      .select('*')
      .eq('job_id', link.job_id)
      .order('created_at', { ascending: true });

    response.chambers = chambers || [];

    // Fetch photos if permitted
    if (link.can_view_photos) {
      const { data: photos } = await supabase
        .from('job_photos')
        .select('*')
        .eq('job_id', link.job_id)
        .order('taken_at', { ascending: false });

      response.photos = photos || [];
    }

    // Fetch readings if permitted
    if (link.can_view_readings) {
      const { data: readings } = await supabase
        .from('moisture_readings')
        .select('*')
        .eq('job_id', link.job_id)
        .order('logged_at', { ascending: false });

      response.readings = readings || [];
    }

    // Fetch documents if permitted
    if (link.can_view_documents) {
      const { data: forms } = await supabase
        .from('job_forms')
        .select('id, title, form_type, status, signed_at, created_at')
        .eq('job_id', link.job_id)
        .eq('status', 'signed')
        .order('signed_at', { ascending: false });

      response.documents = forms || [];
    }

    // Fetch floor plans if permitted
    if (link.can_view_floor_plans) {
      const { data: floorPlans } = await supabase
        .from('floor_plans')
        .select('id, name, floor_number, thumbnail_path, background_image_path')
        .eq('job_id', link.job_id)
        .order('floor_number', { ascending: true });

      response.floorPlans = floorPlans || [];
    }

    // Fetch equipment assignments if permitted
    if (link.can_view_equipment) {
      const { data: assignments } = await supabase
        .from('equipment_assignments')
        .select(`
          id,
          assigned_at,
          removed_at,
          equipment:equipment_id (id, name, type, serial_number),
          chamber:chamber_id (id, name)
        `)
        .eq('job_id', link.job_id)
        .is('removed_at', null);

      response.equipment = assignments || [];
    }

    // Fetch work logs if permitted
    if (link.can_view_work_logs) {
      const { data: workLogs } = await supabase
        .from('job_work_logs')
        .select('*')
        .eq('job_id', link.job_id)
        .order('attendance_date', { ascending: false });

      response.workLogs = workLogs || [];
    }

    // Update view count and last viewed
    await supabase
      .from('job_share_links')
      .update({
        view_count: link.view_count + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', link.id);

    // Log the view
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    await supabase
      .from('job_share_views')
      .insert({
        share_link_id: link.id,
        ip_address: clientIp,
        user_agent: userAgent,
        sections_viewed: Object.entries(link)
          .filter(([key, value]) => key.startsWith('can_view_') && value === true)
          .map(([key]) => key.replace('can_view_', '')),
      });

    console.log(`Share link ${token} accessed. View count: ${link.view_count + 1}`);

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing shared job request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
