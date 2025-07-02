// app/[lang]/login/page.tsx
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
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/middleware";

interface LoginPageProps {
  params: { lang: Locale };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function LoginPage({ params: { lang }, searchParams }: LoginPageProps) {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("🔍 LoginPage rendered with lang:", lang);
  console.log("🔍 signIn object:", signIn);
  console.log("🔍 isLoaded:", isLoaded);

  // Get dictionary statically or use default values
  const dict = {
    navbar: {
      searchClasses: "Search Classes",
      pricing: "Pricing",
      about: "About",
      login: "Login",
      signup: "Sign Up",
      business: "Business",
    },
    login: {
      title: "Welcome back",
      description: "Enter your email and password to log in to your account",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot password?",
      loginButton: "Log in",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
    }
  };

  const handleGoogleSignIn = async () => {
    console.log("🔍 Starting Google signin...");
    console.log("🔍 signIn object:", signIn);
    
    if (!signIn) {
      console.error("❌ signIn is null");
      return;
    }
    
    try {
      console.log("🔄 Redirecting to Google...");
      const result = await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `/${lang}/sso-callback`,
        redirectUrlComplete: `/${lang}`,
      });
      console.log("✅ Google redirect result:", result);
    } catch (err) {
      console.error("❌ Google signin error:", err);
      console.error("❌ Error details:", JSON.stringify(err, null, 2));
      setError("Error signing in with Google. Please try again.");
    }
  };

  const handleAppleSignIn = async () => {
    console.log("🔍 Starting Apple signin...");
    console.log("🔍 signIn object:", signIn);
    
    if (!signIn) {
      console.error("❌ signIn is null");
      return;
    }
    
    try {
      console.log("🔄 Redirecting to Apple...");
      const result = await signIn.authenticateWithRedirect({
        strategy: "oauth_apple",
        redirectUrl: `/${lang}/sso-callback`,
        redirectUrlComplete: `/${lang}`,
      });
      console.log("✅ Apple redirect result:", result);
    } catch (err) {
      console.error("❌ Apple signin error:", err);
      console.error("❌ Error details:", JSON.stringify(err, null, 2));
      setError("Error signing in with Apple. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Starting signin process...");
    console.log("🔍 signIn object:", signIn);
    console.log("🔍 isLoaded:", isLoaded);
    
    if (!signIn || !isLoaded) {
      console.error("❌ signIn or isLoaded is false");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔑 Attempting signin with email:", email);
      
      const signInAttempt = await signIn.create({
        identifier: email,
        password: password,
      });

      console.log("✅ SignIn result:", signInAttempt);
      console.log("📊 Status:", signInAttempt.status);

      if (signInAttempt.status === "complete") {
        console.log("🎉 SignIn successful!");
        console.log("🔑 Session ID:", signInAttempt.createdSessionId);
        
        await setActive({ session: signInAttempt.createdSessionId });
        console.log("✅ Session activated");
        
        router.push(`/${lang}`);
      } else {
        // Handle other statuses (needs verification, etc.)
        console.error("⚠️ SignIn not complete:", signInAttempt);
        console.error("⚠️ Status:", signInAttempt.status);
        console.error("⚠️ Complete object:", signInAttempt);
        setError("Sign in requires additional steps. Please check your email or contact support.");
      }
    } catch (err: any) {
      console.error("❌ Error during signin:", err);
      console.error("❌ Error details:", JSON.stringify(err, null, 2));
      
      // Manejar errores específicos de Clerk
      if (err.errors && err.errors[0]) {
        const error = err.errors[0];
        console.error("❌ Specific error:", error);
        if (error.code === 'form_identifier_not_found') {
          setError('This email is not registered. Please sign up or try a different email.');
        } else if (error.code === 'form_password_incorrect') {
          setError('Incorrect password. Please try again.');
        } else if (error.code === 'too_many_attempts') {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(error.message || 'Invalid email or password');
        }
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar
        lang={lang}
        dictionary={dict.navbar}
        variant="light"
        transparentOnTop={false}
      />

      <main className="min-h-screen flex flex-col pt-24 pb-12 px-4">
        <div className="flex-1 flex items-center justify-center">
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
                {dict.login.title}
              </CardTitle>
              <CardDescription className="text-center">
                {dict.login.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  Continue with Google
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleAppleSignIn}
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

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {error && (
                    <div className="text-sm text-red-600 text-center">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {dict.login.email}
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
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {dict.login.password}
                      </label>
                      <Link
                        href={`/${lang}/forgot-password`}
                        className="text-sm text-primary hover:underline"
                      >
                        {dict.login.forgotPassword}
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Loading..." : dict.login.loginButton}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                {dict.login.noAccount}{" "}
                <Link
                  href={`/${lang}/signup`}
                  className="text-primary hover:underline"
                >
                  {dict.login.signUp}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  );
}
