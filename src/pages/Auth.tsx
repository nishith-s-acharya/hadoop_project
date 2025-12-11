import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ShieldAlert, Lock, Mail, User } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back, analyst');
      navigate('/');
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      setIsSubmitting(false);
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, signupName);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please log in.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created successfully');
      navigate('/');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="text-primary animate-pulse font-mono">Initializing...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4">
      <Card variant="cyber" className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center cyber-glow">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            NEXUS<span className="text-primary">SOC</span>
          </CardTitle>
          <CardDescription className="font-mono text-muted-foreground">
            Threat Intelligence Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="font-mono">Login</TabsTrigger>
              <TabsTrigger value="signup" className="font-mono">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="analyst@nexus.sec"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-4 w-4" /> Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-mono"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Authenticating...' : 'Access Terminal'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" /> Display Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Security Analyst"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="analyst@nexus.sec"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-4 w-4" /> Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full font-mono"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Register Analyst'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
