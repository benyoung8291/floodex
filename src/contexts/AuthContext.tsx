import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'super_admin' | 'tenant_admin' | 'supervisor' | 'technician';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  fullName: string | null;
  tenantId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  isPasswordRecovery: boolean;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isSuperAdmin: boolean;
  isTenantAdmin: boolean;
  isSupervisor: boolean;
  // Impersonation
  impersonatedTenantId: string | null;
  impersonatedTenantName: string | null;
  isImpersonating: boolean;
  effectiveTenantId: string | null;
  startImpersonation: (tenantId: string, tenantName: string) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [fullName, setFullName] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  
  // Impersonation state
  const [impersonatedTenantId, setImpersonatedTenantId] = useState<string | null>(null);
  const [impersonatedTenantName, setImpersonatedTenantName] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() =>
    typeof window !== 'undefined' && window.location.hash.includes('type=recovery')
  );

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesData) {
        setRoles(rolesData.map(r => r.role as AppRole));
      }

      // Fetch tenant_id and display name from profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('tenant_id, full_name')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setTenantId(profileData.tenant_id);
        setFullName(profileData.full_name);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase calls with setTimeout to avoid deadlock
          // fetchUserData will set loading to false when complete
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setRoles([]);
          setFullName(null);
          setTenantId(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          company_name: companyName, // Trigger handles tenant/role creation
        },
      },
    });

    return { error: error ? (error as Error) : null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (!error) {
      setIsPasswordRecovery(false);
    }
    return { error: error as Error | null };
  };

  const signOut = async () => {
    // Clear impersonation on sign out
    setImpersonatedTenantId(null);
    setImpersonatedTenantName(null);
    await supabase.auth.signOut();
    setRoles([]);
    setFullName(null);
    setTenantId(null);
  };

  const hasRole = (role: AppRole) => roles.includes(role);
  const isSuperAdmin = hasRole('super_admin');
  const isTenantAdmin = hasRole('tenant_admin');
  const isSupervisor = hasRole('supervisor');

  // Impersonation methods
  const isImpersonating = impersonatedTenantId !== null;
  const effectiveTenantId = isImpersonating ? impersonatedTenantId : tenantId;

  const startImpersonation = (newTenantId: string, newTenantName: string) => {
    // Only super_admins can impersonate
    if (!isSuperAdmin) {
      console.warn('Only super_admins can impersonate tenants');
      return;
    }
    setImpersonatedTenantId(newTenantId);
    setImpersonatedTenantName(newTenantName);
  };

  const stopImpersonation = () => {
    setImpersonatedTenantId(null);
    setImpersonatedTenantName(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        roles,
        fullName,
        tenantId,
        signIn,
        signUp,
        resetPassword,
        updatePassword,
        isPasswordRecovery,
        signOut,
        hasRole,
        isSuperAdmin,
        isTenantAdmin,
        isSupervisor,
        // Impersonation
        impersonatedTenantId,
        impersonatedTenantName,
        isImpersonating,
        effectiveTenantId,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
