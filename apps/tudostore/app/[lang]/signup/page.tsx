// app/[lang]/signup/page.tsx
"use client"

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { useSignUp } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import RoleSelection from "@/components/auth/role-selection";
import { UserRole } from "@/lib/api";
import type { Locale } from "@/middleware";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface RegisterPageProps {
  params: Promise<{ lang: Locale }>;
}

type Step = 'role' | 'details' | 'verification';

export default function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = use(params);
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  // Form states
  const [currentStep, setCurrentStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // UI states
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(25);

  // Dictionary
  const dict = {
    navbar: {
      searchClasses: "Search Classes",
      pricing: "Pricing",
      about: "About",
      login: "Log In",
      signup: "Sign Up",
      business: "Business",
      hello: "Hello",
    },
    register: {
      title: "Create your TUDO account",
      description: "Join the fitness community that fits your lifestyle",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      password: "Password",
      terms: "I agree to the",
      termsLink: "terms of service",
      privacyLink: "privacy policy",
      termsAnd: "and",
      signUpButton: "Create Account",
      haveAccount: "Already have an account?",
      logIn: "Log in",
      code: "Verification Code",
      verify: "Verify Email",
      checkEmail: "We've sent a verification code to your email.",
      back: "Back",
      continue: "Continue",
    }
  };

  // Update progress based on step
  useEffect(() => {
    switch (currentStep) {
      case 'role': setProgress(25); break;
      case 'details': setProgress(50); break;
      case 'verification': setProgress(100); break;
    }
  }, [currentStep]);

  // Handle role selection
  const handleRoleSelection = () => {
    if (!selectedRole) return;
    setCurrentStep('details');
  };

  // Handle Google signup
  const handleGoogleSignUp = async () => {
    if (!signUp || !selectedRole) return;
    
    setLoading(true);
    setError("");
    
    try {
      localStorage.setItem('pending_user_role', selectedRole);
      
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `/${lang}/sso-callback`,
        redirectUrlComplete: `/${lang}/sso-callback`,
      });
    } catch (err: any) {
      console.error("Google signup error:", err);
      setError("Error with Google sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Apple signup
  const handleAppleSignUp = async () => {
    if (!signUp || !selectedRole) return;
    
    setLoading(true);
    setError("");
    
    try {
      localStorage.setItem('pending_user_role', selectedRole);
      
      await signUp.authenticateWithRedirect({
        strategy: "oauth_apple",
        redirectUrl: `/${lang}/sso-callback`,
        redirectUrlComplete: `/${lang}/sso-callback`,
      });
    } catch (err: any) {
      console.error("Apple signup error:", err);
      setError("Error with Apple sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle email/password signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !isLoaded || !selectedRole) return;

    setLoading(true);
    setError("");

    try {
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });
      
      localStorage.setItem('pending_user_role', selectedRole);
      
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCurrentStep('verification');
    } catch (err: any) {
      console.error("Email signup error:", err);
      
      if (err.errors && err.errors[0]) {
        const error = err.errors[0];
        if (error.code === 'form_identifier_exists') {
          setError('This email is already registered. Please sign in instead.');
        } else if (error.code === 'form_password_pwned') {
          setError('This password is too weak. Please choose a stronger password.');
        } else if (error.code === 'form_password_validation_failed') {
          setError('Password must be at least 8 characters long.');
        } else {
          setError(error.message || "An error occurred during signup");
        }
      } else {
        setError("An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle verification
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Redirect to onboarding instead of syncing here
        redirectToOnboarding();
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      
      if (err.errors && err.errors[0]) {
        const error = err.errors[0];
        if (error.code === 'verification_failed') {
          setError('Incorrect verification code. Please try again.');
        } else if (error.code === 'verification_expired') {
          setError('Verification code expired. Please request a new one.');
        } else {
          setError(error.message || "Invalid verification code");
        }
      } else {
        setError("Invalid verification code");
      }
    } finally {
      setLoading(false);
    }
  };

  // Redirect to onboarding after successful signup
  const redirectToOnboarding = () => {
    // Keep the role for onboarding, don't remove it here
    router.push(`/${lang}/onboarding/preferences`);
  };

  // Resend verification code
  const resendVerificationCode = async () => {
    if (!signUp) return;
    
    setLoading(true);
    setError("");
    
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setError("New verification code sent to your email.");
    } catch (err) {
      console.error("Failed to resend code:", err);
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar
        lang={lang}
        dictionary={dict.navbar}
        variant="light"
        transparentOnTop={false}
      />

      <div className="flex-1 flex items-center justify-center py-12 px-4 pt-24">
        <div className="w-full max-w-2xl space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Account Setup</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 space-y-1">
              <div className="flex items-center justify-between">
                {currentStep !== 'role' && (
                  <button
                    onClick={() => {
                      if (currentStep === 'details') setCurrentStep('role');
                      if (currentStep === 'verification') setCurrentStep('details');
                    }}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors p-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {dict.register.back}
                  </button>
                )}
                <div className="flex-1" />
                <div className="flex justify-center">
                  <div className="relative h-8 w-32">
                    <Image
                      src="/images/tudo-logo.png"
                      alt="TUDO Logo"
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
                <div className="flex-1" />
              </div>
              
              <h1 className="text-2xl font-heading text-center">
                {currentStep === 'role' && "Choose Your Journey"}
                {currentStep === 'details' && dict.register.title}
                {currentStep === 'verification' && dict.register.verify}
              </h1>
              
              <p className="text-center text-gray-600">
                {currentStep === 'role' && "Select how you want to experience TUDO Fitness"}
                {currentStep === 'details' && dict.register.description}
                {currentStep === 'verification' && dict.register.checkEmail}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Global Error Message */}
              {error && (
                <div className={`flex items-center p-4 rounded-lg ${error.includes("sent") ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"}`}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Role Selection Step */}
              {currentStep === 'role' && (
                <RoleSelection
                  selectedRole={selectedRole}
                  onRoleSelect={setSelectedRole}
                  onContinue={handleRoleSelection}
                  loading={loading}
                />
              )}

              {/* Details Step */}
              {currentStep === 'details' && (
                <div className="space-y-4">
                  {/* OAuth Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={handleGoogleSignUp}
                      disabled={loading}
                      className="h-12 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Continue with Google
                    </button>
                    <button 
                      onClick={handleAppleSignUp}
                      disabled={loading}
                      className="h-12 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Continue with Apple
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email Signup Form */}
                  <form onSubmit={handleEmailSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="first-name" className="text-sm font-medium text-gray-700">
                          {dict.register.firstName}
                        </label>
                        <input 
                          id="first-name" 
                          type="text"
                          placeholder="John" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="last-name" className="text-sm font-medium text-gray-700">
                          {dict.register.lastName}
                        </label>
                        <input 
                          id="last-name" 
                          type="text"
                          placeholder="Doe" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        {dict.register.email}
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        {dict.register.password}
                      </label>
                      <input 
                        id="password" 
                        type="password" 
                        placeholder="Minimum 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input 
                        id="terms" 
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        required 
                        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="terms" className="text-sm leading-none text-gray-700">
                        {dict.register.terms}{" "}
                        <Link href={`/${lang}/terms`} className="text-primary hover:underline">
                          {dict.register.termsLink}
                        </Link>{" "}
                        {dict.register.termsAnd}{" "}
                        <Link href={`/${lang}/privacy`} className="text-primary hover:underline">
                          {dict.register.privacyLink}
                        </Link>
                      </label>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="w-full h-12 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50" 
                      disabled={loading || !acceptedTerms}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Creating account...
                        </div>
                      ) : (
                        dict.register.signUpButton
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Verification Step */}
              {currentStep === 'verification' && (
                <form onSubmit={handleVerification} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="code" className="text-sm font-medium text-gray-700">
                      {dict.register.code}
                    </label>
                    <input
                      id="code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:ring-2 focus:ring-primary focus:border-transparent"
                      maxLength={6}
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full h-12 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Verifying...
                      </div>
                    ) : (
                      dict.register.verify
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={resendVerificationCode}
                    disabled={loading}
                    className="w-full h-12 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </form>
              )}


            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="text-sm text-center text-gray-600">
                {dict.register.haveAccount}{" "}
                <Link href={`/${lang}/login`} className="text-primary hover:underline">
                  {dict.register.logIn}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
