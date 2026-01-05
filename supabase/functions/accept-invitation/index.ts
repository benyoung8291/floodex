import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Error codes for structured error handling
const ErrorCodes = {
  MISSING_FIELDS: 'MISSING_FIELDS',
  INVALID_INVITATION: 'INVALID_INVITATION',
  EXPIRED_INVITATION: 'EXPIRED_INVITATION',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  USER_CREATION_FAILED: 'USER_CREATION_FAILED',
  ROLE_ASSIGNMENT_FAILED: 'ROLE_ASSIGNMENT_FAILED',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
} as const;

function createErrorResponse(code: string, message: string, status: number = 400) {
  return new Response(
    JSON.stringify({ success: false, error: message, code }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function parseAuthError(errorMessage: string): { code: string; message: string } {
  const lowerMessage = errorMessage.toLowerCase();
  
  if (lowerMessage.includes('already registered') || lowerMessage.includes('already been registered')) {
    return {
      code: ErrorCodes.EMAIL_ALREADY_REGISTERED,
      message: 'An account with this email already exists. Please sign in instead.',
    };
  }
  
  if (lowerMessage.includes('password') && (lowerMessage.includes('weak') || lowerMessage.includes('short') || lowerMessage.includes('at least'))) {
    return {
      code: ErrorCodes.WEAK_PASSWORD,
      message: 'Password is too weak. Please use at least 6 characters.',
    };
  }
  
  if (lowerMessage.includes('password')) {
    return {
      code: ErrorCodes.WEAK_PASSWORD,
      message: errorMessage,
    };
  }
  
  return {
    code: ErrorCodes.USER_CREATION_FAILED,
    message: errorMessage,
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, password, full_name } = await req.json();

    // Validate required fields
    if (!token) {
      console.error('Missing invitation token');
      return createErrorResponse(ErrorCodes.MISSING_FIELDS, 'Invitation token is required');
    }
    
    if (!password) {
      console.error('Missing password');
      return createErrorResponse(ErrorCodes.MISSING_FIELDS, 'Password is required');
    }
    
    if (!full_name || full_name.trim().length < 2) {
      console.error('Missing or invalid full_name');
      return createErrorResponse(ErrorCodes.MISSING_FIELDS, 'Please enter your full name (at least 2 characters)');
    }

    // Validate password strength
    if (password.length < 6) {
      console.error('Password too short');
      return createErrorResponse(ErrorCodes.WEAK_PASSWORD, 'Password must be at least 6 characters');
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get the invitation
    console.log('Looking up invitation with token:', token.substring(0, 8) + '...');
    
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('*, tenants(name)')
      .eq('token', token)
      .single();

    if (inviteError || !invitation) {
      console.error('Invitation lookup error:', inviteError);
      return createErrorResponse(ErrorCodes.INVALID_INVITATION, 'This invitation link is invalid. Please request a new invitation from your administrator.');
    }

    // Check invitation status
    if (invitation.status !== 'pending') {
      console.error('Invitation is not pending, status:', invitation.status);
      if (invitation.status === 'accepted') {
        return createErrorResponse(ErrorCodes.INVALID_INVITATION, 'This invitation has already been used. Please sign in instead.');
      }
      if (invitation.status === 'revoked') {
        return createErrorResponse(ErrorCodes.INVALID_INVITATION, 'This invitation was revoked. Please request a new invitation from your administrator.');
      }
      return createErrorResponse(ErrorCodes.INVALID_INVITATION, 'This invitation is no longer valid.');
    }

    // Check expiration
    if (new Date(invitation.expires_at) < new Date()) {
      console.error('Invitation expired at:', invitation.expires_at);
      return createErrorResponse(ErrorCodes.EXPIRED_INVITATION, 'This invitation has expired. Please request a new invitation from your administrator.');
    }

    console.log('Found valid invitation for email:', invitation.email);

    // Check if email is already registered
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === invitation.email.toLowerCase()
    );

    if (emailExists) {
      console.error('Email already registered:', invitation.email);
      return createErrorResponse(
        ErrorCodes.EMAIL_ALREADY_REGISTERED,
        'An account with this email already exists. Please sign in instead, or contact your administrator if you need help.'
      );
    }

    // Create the user account
    console.log('Creating user account for:', invitation.email);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name.trim(),
      },
    });

    if (authError) {
      console.error('User creation error:', authError);
      const parsed = parseAuthError(authError.message);
      return createErrorResponse(parsed.code, parsed.message);
    }

    const userId = authData.user.id;
    console.log('Created user with ID:', userId);

    // Accept the invitation using the database function
    console.log('Accepting invitation for user:', userId);
    const { data: acceptResult, error: acceptError } = await supabaseAdmin
      .rpc('accept_team_invitation', {
        p_token: token,
        p_user_id: userId,
      });

    if (acceptError) {
      console.error('Accept invitation RPC error:', acceptError);
      // Clean up the created user
      console.log('Cleaning up user after failed invitation acceptance');
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return createErrorResponse(
        ErrorCodes.ROLE_ASSIGNMENT_FAILED,
        'Failed to set up your account permissions. Please try again or contact your administrator.'
      );
    }

    if (!acceptResult?.success) {
      console.error('Accept invitation failed:', acceptResult?.error);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return createErrorResponse(
        ErrorCodes.ROLE_ASSIGNMENT_FAILED,
        acceptResult?.error || 'Failed to process your invitation. Please try again.'
      );
    }

    // Update the profile with full_name
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ full_name: full_name.trim() })
      .eq('id', userId);

    if (profileError) {
      console.warn('Profile update warning (non-critical):', profileError);
      // Don't fail the whole operation for this
    }

    console.log('Invitation accepted successfully for:', invitation.email, 'with role:', invitation.role);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Your account has been created successfully!',
        email: invitation.email,
        tenantName: invitation.tenants?.name,
        role: invitation.role,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return createErrorResponse(
      ErrorCodes.UNEXPECTED_ERROR,
      'An unexpected error occurred. Please try again.',
      500
    );
  }
});
