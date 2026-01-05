import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Droplets, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useValidateInvitation, useAcceptInvitation } from '@/hooks/useTeamInvitations';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
});

const acceptInviteSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check for invitation token
  const inviteToken = searchParams.get('invite');
  const { data: invitation, isLoading: inviteLoading } = useValidateInvitation(inviteToken);
  const acceptInvitation = useAcceptInvitation();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupCompanyName, setSignupCompanyName] = useState('');

  // Accept invite form state
  const [acceptFullName, setAcceptFullName] = useState('');
  const [acceptPassword, setAcceptPassword] = useState('');

  // Redirect if already logged in (only if not accepting an invitation)
  useEffect(() => {
    if (user && !inviteToken) {
      navigate('/dashboard');
    }
  }, [user, inviteToken, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = loginSchema.parse({ email: loginEmail, password: loginPassword });
      const { error } = await signIn(validated.email, validated.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = signupSchema.parse({
        email: signupEmail,
        password: signupPassword,
        fullName: signupFullName,
        companyName: signupCompanyName,
      });

      const { error } = await signUp(
        validated.email,
        validated.password,
        validated.fullName,
        validated.companyName
      );

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created! Your 14-day trial has started.');
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken) return;

    try {
      const validated = acceptInviteSchema.parse({
        password: acceptPassword,
        fullName: acceptFullName,
      });

      await acceptInvitation.mutateAsync({
        token: inviteToken,
        password: validated.password,
        fullName: validated.fullName,
      });

      // Clear the invite token from URL and redirect to login
      navigate('/auth', { replace: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    }
  };

  // Show invitation acceptance UI if we have a valid invite token
  if (inviteToken) {
    if (inviteLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!invitation) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                <UserPlus className="w-10 h-10 text-destructive" />
              </div>
              <CardTitle>Invalid Invitation</CardTitle>
              <CardDescription>
                This invitation link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/auth')}>
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const roleLabels: Record<string, string> = {
      technician: 'Technician',
      supervisor: 'Supervisor',
      tenant_admin: 'Admin',
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
              <Droplets className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">FloodEx</h1>
          </div>

          <Card className="border-border">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>You're Invited!</CardTitle>
              <CardDescription>
                Join <strong>{(invitation as any).tenants?.name}</strong> as a{' '}
                <strong>{roleLabels[invitation.role] || invitation.role}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAcceptInvite} className="space-y-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Your email</p>
                  <p className="font-medium">{invitation.email}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accept-name">Your Name</Label>
                  <Input
                    id="accept-name"
                    type="text"
                    placeholder="John Smith"
                    value={acceptFullName}
                    onChange={(e) => setAcceptFullName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accept-password">Create Password</Label>
                  <Input
                    id="accept-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={acceptPassword}
                    onChange={(e) => setAcceptPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12" 
                  disabled={acceptInvitation.isPending}
                >
                  {acceptInvitation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Accept & Create Account'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <Droplets className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">FloodEx</h1>
          <p className="text-muted-foreground mt-2">Flood Restoration Management</p>
        </div>

        <Card className="border-border">
          <Tabs defaultValue="login">
            <CardHeader className="pb-0">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Start Trial</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="pt-6">
              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <CardTitle className="text-xl mb-2">Welcome back</CardTitle>
                <CardDescription className="mb-6">
                  Sign in to access your restoration dashboard
                </CardDescription>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup" className="mt-0">
                <CardTitle className="text-xl mb-2">Start your free trial</CardTitle>
                <CardDescription className="mb-6">
                  14 days of full access. No credit card required.
                </CardDescription>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Your Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Smith"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-company">Company Name</Label>
                    <Input
                      id="signup-company"
                      type="text"
                      placeholder="ABC Restoration"
                      value={signupCompanyName}
                      onChange={(e) => setSignupCompanyName(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Work Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@company.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={loading}>
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Start Free Trial'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
