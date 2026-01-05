import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, password, full_name } = await req.json();

    if (!token || !password || !full_name) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get the invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('*, tenants(name)')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      console.error('Invitation lookup error:', inviteError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired invitation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found invitation for email:', invitation.email);

    // Create the user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
      },
    });

    if (authError) {
      console.error('User creation error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.user.id;
    console.log('Created user:', userId);

    // Accept the invitation using the database function
    const { data: acceptResult, error: acceptError } = await supabaseAdmin
      .rpc('accept_team_invitation', {
        p_token: token,
        p_user_id: userId,
      });

    if (acceptError) {
      console.error('Accept invitation error:', acceptError);
      // Try to clean up the created user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to accept invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!acceptResult?.success) {
      console.error('Accept invitation failed:', acceptResult?.error);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(
        JSON.stringify({ success: false, error: acceptResult?.error || 'Failed to process invitation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the profile with full_name
    await supabaseAdmin
      .from('profiles')
      .update({ full_name: full_name })
      .eq('id', userId);

    console.log('Invitation accepted successfully for:', invitation.email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account created successfully',
        email: invitation.email,
        tenantName: invitation.tenants?.name,
        role: invitation.role,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
