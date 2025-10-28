import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";

const authSchema = z.object({
  email: z.string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  full_name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  phone_number: z.string()
    .trim()
    .regex(/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$|^(\+44\s?[1-9]\d{1,4}|\(?0[1-9]\d{1,4}\)?)\s?\d{3,4}\s?\d{3,4}$/, "Please enter a valid UK phone number (e.g., +44 7123 456789 or 020 1234 5678)")
    .max(20, "Phone number must be less than 20 characters")
    .optional(),
  company_name: z.string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  postal_code: z.string()
    .trim()
    .max(20, "Postal code must be less than 20 characters")
    .optional(),
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaEnrollment, setMfaEnrollment] = useState<{ qr: string; secret: string; factorId: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect on sign in events, not on initial load or sign out
      if (event === 'SIGNED_IN' && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reset email.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    const validationData = isSignUp 
      ? { email, password, full_name: fullName, phone_number: phoneNumber, company_name: companyName, postal_code: postalCode }
      : { email, password };
    
    const result = authSchema.safeParse(validationData);
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: result.error.errors[0].message,
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: result.data.email,
          password: result.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: result.data.full_name || "",
              phone_number: result.data.phone_number || "",
              company_name: result.data.company_name || "",
              postal_code: result.data.postal_code || "",
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        });
        setIsSignUp(false);
        setFullName("");
        setPhoneNumber("");
        setCompanyName("");
        setPostalCode("");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: result.data.email,
          password: result.data.password,
        });

        if (error) throw error;

        // Check if 2FA is required system-wide
        const { data: settings } = await supabase
          .from('system_settings')
          .select('setting_value')
          .eq('setting_key', 'require_2fa')
          .single();

        const require2FA = settings?.setting_value || false;

        if (require2FA) {
          // Check if user has MFA enrolled
          const { data: factors } = await supabase.auth.mfa.listFactors();
          
          if (factors && factors.totp && factors.totp.length > 0) {
            // User has MFA enrolled, show verification screen
            setMfaRequired(true);
          } else {
            // No MFA enrolled, prompt user to enroll
            await enrollMFA();
          }
        } else {
          // 2FA not required, proceed to dashboard
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          setLoading(false);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during authentication.",
      });
      setLoading(false);
    }
  };

  const enrollMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) throw error;

      setMfaEnrollment({
        qr: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id
      });
      
      toast({
        title: "2FA Setup Required",
        description: "Scan the QR code with your authenticator app.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to setup 2FA.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMFAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mfaEnrollment) {
        // Verifying during enrollment
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId: mfaEnrollment.factorId,
          code: verificationCode
        });

        if (error) throw error;

        toast({
          title: "2FA Enabled!",
          description: "Two-factor authentication is now active.",
        });
        
        // Clear MFA states and navigate to dashboard
        setMfaEnrollment(null);
        setVerificationCode("");
        navigate("/dashboard");
      } else {
        // Verifying during login
        const { data: factors } = await supabase.auth.mfa.listFactors();
        if (!factors?.totp?.[0]) throw new Error("No MFA factor found");

        const factorId = factors.totp[0].id;
        
        const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
          factorId
        });

        if (challengeError) throw challengeError;

        const { error: verifyError } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challenge.id,
          code: verificationCode
        });

        if (verifyError) throw verifyError;

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        setMfaRequired(false);
        setVerificationCode("");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "Invalid verification code.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show MFA enrollment screen
  if (mfaEnrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Set Up 2-Factor Authentication
            </CardTitle>
            <CardDescription>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMFAVerification} className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={mfaEnrollment.qr} size={200} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Or enter this code manually:</p>
                  <code className="bg-muted px-3 py-1 rounded text-sm font-mono break-all">
                    {mfaEnrollment.secret}
                  </code>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading || verificationCode.length !== 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify and Enable 2FA
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show MFA verification screen
  if (mfaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              2-Factor Authentication
            </CardTitle>
            <CardDescription>
              Enter the verification code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMFAVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || verificationCode.length !== 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={async () => {
                  await supabase.auth.signOut();
                  setMfaRequired(false);
                  setVerificationCode("");
                }}
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Sign In"}
          </CardTitle>
          <CardDescription>
            {isForgotPassword
              ? "Enter your email to receive a password reset link"
              : isSignUp
              ? "Enter your details to create a new account"
              : "Enter your credentials to access the dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isForgotPassword ? handleForgotPassword : handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+44 7123 456789"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      // Real-time validation
                      const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$|^(\+44\s?[1-9]\d{1,4}|\(?0[1-9]\d{1,4}\)?)\s?\d{3,4}\s?\d{3,4}$/;
                      if (e.target.value && !phoneRegex.test(e.target.value.trim())) {
                        e.target.setCustomValidity("Please enter a valid UK phone number");
                      } else {
                        e.target.setCustomValidity("");
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="ACME Corp"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postcode</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    placeholder="SW1A 1AA"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isForgotPassword ? "Send Reset Link" : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            {!isForgotPassword && !isSignUp && (
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setIsForgotPassword(true)}
              >
                Forgot password?
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setIsForgotPassword(false);
              }}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
            {isForgotPassword && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsForgotPassword(false)}
              >
                Back to sign in
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;