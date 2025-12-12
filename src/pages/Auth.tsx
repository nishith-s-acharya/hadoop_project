import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ShieldAlert, Lock, Mail, User, Fingerprint, ScanEye, Binary } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  useEffect(() => {
    // Simulated Biometric Scan Sequence
    const timer = setTimeout(() => {
      setIsScanning(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulated "Processing" delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      toast.error('ACCESS DENIED', {
        description: 'Biometric mismatch. Check credentials.',
      });
    } else {
      toast.success('IDENTITY CONFIRMED', {
        description: 'Welcome back, Commander.',
        icon: <Fingerprint className="h-4 w-4 text-primary" />,
      });
      navigate('/');
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (signupPassword.length < 6) {
      toast.error('SECURITY ERROR', { description: 'Password entropy too low (min 6 chars).' });
      setIsSubmitting(false);
      return;
    }

    const { error } = await signUp(signupEmail, signupPassword, signupName);

    if (error) {
      toast.error('REGISTRATION FAILED', { description: error.message });
    } else {
      toast.success('NEW IDENTITY CREATED', { description: 'Clearance level: Analyst assigned.' });
      navigate('/');
    }
    setIsSubmitting(false);
  };

  if (loading || isScanning) {
    return (
      <div className="min-h-screen bg-black cyber-grid flex flex-col items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none scanlines opacity-50" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <Fingerprint className="h-24 w-24 text-primary animate-pulse" />
            <div className="absolute inset-0 border-t-2 border-primary animate-scan-down opacity-50"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-mono font-bold text-primary tracking-widest animate-pulse">
              INITIALIZING BIOMETRIC SEQUENCE
            </h2>
            <p className="text-xs font-mono text-muted-foreground">
              Verifying retinal patterns...
            </p>
          </div>

          <div className="w-64 h-1 bg-secondary/30 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black cyber-grid flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 pointer-events-none scanlines opacity-20" />

      <Card variant="cyber" className="w-full max-w-md border-primary/30 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative z-10 backdrop-blur-xl bg-black/80">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20 relative group overflow-hidden">
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            <ShieldAlert className="h-10 w-10 text-primary relative z-10" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold text-white tracking-tight flex items-center justify-center gap-2">
              <Binary className="h-5 w-5 text-primary opacity-50" />
              NEXUS<span className="text-primary">SOC</span>
            </CardTitle>
            <CardDescription className="font-mono text-primary/60 text-xs tracking-widest uppercase">
              Secure Access Terminal v9.0
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/50 border border-primary/20">
              <TabsTrigger value="login" className="font-mono data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                ACCESS
              </TabsTrigger>
              <TabsTrigger value="signup" className="font-mono data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                REGISTER
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="font-mono text-xs text-primary/80 uppercase">Identity ID (Email)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="analyst@nexus.sec"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="pl-10 font-mono bg-black/50 border-primary/20 focus:border-primary/50 transition-all hover:bg-primary/5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="font-mono text-xs text-primary/80 uppercase">Passcode</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="pl-10 font-mono bg-black/50 border-primary/20 focus:border-primary/50 transition-all hover:bg-primary/5"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full font-monoh-11 mt-4 bg-primary hover:bg-primary/90 text-black font-bold tracking-wider relative overflow-hidden group"
                  disabled={isSubmitting}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      'AUTHENTICATING...'
                    ) : (
                      <>
                        <ScanEye className="h-4 w-4" /> INIT_SESSION
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="font-mono text-xs text-primary/80 uppercase">Agent Designation</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Agent Name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10 font-mono bg-black/50 border-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="font-mono text-xs text-primary/80 uppercase">Identity ID</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="analyst@nexus.sec"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                      className="pl-10 font-mono bg-black/50 border-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="font-mono text-xs text-primary/80 uppercase">Set Passcode</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 font-mono bg-black/50 border-primary/20"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full font-mono mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'CREATING RECORD...' : 'ENLIST AGENT'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 text-center w-full text-[10px] font-mono text-primary/30 uppercase">
        Restricted Access // Auth Node 51 // Secure Connection
      </div>
    </div>
  );
}
