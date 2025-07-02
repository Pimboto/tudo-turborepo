// app/[lang]/signup/page.tsx
"use client"

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/middleware";

interface RegisterPageProps {
  params: { lang: Locale };
}

export default function RegisterPage({ params: { lang } }: RegisterPageProps) {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  console.log("🔍 RegisterPage rendered with lang:", lang);
  console.log("🔍 signUp object:", signUp);
  console.log("🔍 isLoaded:", isLoaded);

  // Get dictionary statically or use default values
  const dict = {
    navbar: {
      searchClasses: "Search Classes",
      pricing: "Pricing",
      about: "About",
      login: "Log In",
      signup: "Sign Up",
      business: "Business",
    },
    register: {
      title: "Create an account",
      description: "Enter your information to create your TUDO account",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      password: "Password",
      terms: "I agree to the",
      termsLink: "terms of service",
      privacyLink: "privacy policy",
      termsAnd: "and",
      signUpButton: "Sign up for free trial",
      haveAccount: "Already have an account?",
      logIn: "Log in",
      code: "Verification Code",
      verify: "Verify Email",
      checkEmail: "Please check your email and enter the verification code below.",
    }
  };

  const handleGoogleSignUp = async () => {
    console.log("🔍 Starting Google signup...");
    console.log("🔍 signUp object:", signUp);
    
    if (!signUp) {
      console.error("❌ signUp is null");
      return;
    }
    
    try {
      console.log("🔄 Redirecting to Google...");
      const result = await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `/${lang}/sso-callback`,
        redirectUrlComplete: `/${lang}`,
      });
      console.log("✅ Google redirect result:", result);
    } catch (err) {
      console.error("❌ Google signup error:", err);
      console.error("❌ Error details:", JSON.stringify(err, null, 2));
      setError("Error with Google sign up. Please try again.");
    }
  };

  const handleAppleSignUp = async () => {
    console.log("🔍 Starting Apple signup...");
    console.log("🔍 signUp object:", signUp);
    
    if (!signUp) {
      console.error("❌ signUp is null");
      return;
    }
    
    try {
      console.log("🔄 Redirecting to Apple...");
      const result = await signUp.authenticateWithRedirect({
        strategy: "oauth_apple",
        redirectUrl: `/${lang}/sso-callback`,
        redirectUrlComplete: `/${lang}`,
      });
      console.log("✅ Apple redirect result:", result);
    } catch (err) {
      console.error("❌ Apple signup error:", err);
      console.error("❌ Error details:", JSON.stringify(err, null, 2));
      setError("Error with Apple sign up. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Starting signup process...");
    console.log("🔍 signUp object:", signUp);
    console.log("🔍 isLoaded:", isLoaded);
    
    if (!signUp || !isLoaded) {
      console.error("❌ signUp or isLoaded is false");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("📝 Creating user with data:", {
        firstName,
        lastName,
        emailAddress: email,
        password: "***"
      });
      
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });
      
      console.log("✅ User created successfully:", result);
      console.log("📧 Preparing email verification...");
      
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      console.log("✅ Email verification prepared");
      setPendingVerification(true);
    } catch (err: any) {
      console.error("❌ Error during signup:", err);
      console.error("❌ Error details:", JSON.stringify(err, null, 2));
      
      // Manejar errores específicos
      if (err.errors && err.errors[0]) {
        const error = err.errors[0];
        console.error("❌ Specific error:", error);
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

  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔐 Starting verification process...");
    console.log("🔍 Verification code:", verificationCode);
    
    if (!signUp || !isLoaded) {
      console.error("❌ signUp or isLoaded is false");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔒 Attempting email verification...");
      
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      
      console.log("✅ Verification result:", completeSignUp);
      console.log("📊 Status:", completeSignUp.status);
      
      if (completeSignUp.status === "complete") {
        console.log("🎉 Verification successful!");
        console.log("🔑 Session ID:", completeSignUp.createdSessionId);
        
        await setActive({ session: completeSignUp.createdSessionId });
        console.log("✅ Session activated");
        
        router.push(`/${lang}`);
      } else {
        console.warn("⚠️ Verification not complete, status:", completeSignUp.status);
        console.warn("⚠️ Complete object:", completeSignUp);
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("❌ Error during verification:", err);
      console.error("❌ Error details:", JSON.stringify(err, null, 2));
      
      if (err.errors && err.errors[0]) {
        const error = err.errors[0];
        console.error("❌ Specific error:", error);
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

  // Función para reenviar código de verificación
  const resendVerificationCode = async () => {
    if (!signUp) return;
    
    setLoading(true);
    setError("");
    
    try {
      console.log("📧 Resending verification code...");
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setError("New verification code sent to your email.");
      console.log("✅ Verification code resent");
    } catch (err) {
      console.error("❌ Failed to resend code:", err);
      setError("Failed to resend verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
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
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="relative h-12 w-48">
                <Image
                  src="/images/tudo-logo.png"
                  alt="TUDO Logo"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-heading text-center">
              {dict.register.title}
            </CardTitle>
            <CardDescription className="text-center">
              {pendingVerification ? dict.register.checkEmail : dict.register.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!pendingVerification ? (
              <>
                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleGoogleSignUp}
                    disabled={loading}
                  >
                    Continue with Google
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleAppleSignUp}
                    disabled={loading}
                  >
                    Continue with Apple
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {error && (
                      <div className="text-sm text-red-600 text-center">
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="first-name"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {dict.register.firstName}
                        </label>
                        <Input 
                          id="first-name" 
                          placeholder="John" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="last-name"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {dict.register.lastName}
                        </label>
                        <Input 
                          id="last-name" 
                          placeholder="Doe" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {dict.register.email}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {dict.register.password}
                      </label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        minLength={8}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" required />
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {dict.register.terms}{" "}
                        <Link
                          href={`/${lang}/terms`}
                          className="text-primary hover:underline"
                        >
                          {dict.register.termsLink}
                        </Link>{" "}
                        {dict.register.termsAnd}{" "}
                        <Link
                          href={`/${lang}/privacy`}
                          className="text-primary hover:underline"
                        >
                          {dict.register.privacyLink}
                        </Link>
                      </label>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : dict.register.signUpButton}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              /* Verification Form */
              <form onSubmit={onPressVerify}>
                <div className="space-y-4">
                  {error && (
                    <div className="text-sm text-red-600 text-center">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label
                      htmlFor="code"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {dict.register.code}
                    </label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : dict.register.verify}
                  </Button>
                  
                  {/* Reenviar código */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={resendVerificationCode}
                    disabled={loading}
                  >
                    Resend code
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              {dict.register.haveAccount}{" "}
              <Link
                href={`/${lang}/login`}
                className="text-primary hover:underline"
              >
                {dict.register.logIn}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
