// app/[lang]/sso-callback/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useApiWithAuth } from "@/lib/api";
import type { Locale } from "@/middleware";
import { CheckCircle, AlertCircle } from "lucide-react";

interface SSOCallbackProps {
  params: Promise<{ lang: Locale }>;
}

export default function SSOCallback({ params }: SSOCallbackProps) {
  const { lang } = use(params);
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    
    // Avoid infinite loop by only running once when conditions are met
    if (status !== 'loading') return;

    const handleRedirect = () => {
      if (!isSignedIn || !user) {
        setStatus('error');
        setError('Authentication failed. Please try again.');
        return;
      }

      try {
        setStatus('success');
        
        // Simple redirect - let onboarding handle all the backend sync
        setTimeout(() => {
          router.push(`/${lang}/onboarding/preferences`);
        }, 1000);
      } catch (err) {
        console.error('SSO Redirect error:', err);
        setStatus('error');
        setError('Something went wrong. Please try again.');
      }
    };

    // Simple redirect once everything is loaded
    handleRedirect();
  }, [isLoaded, isSignedIn, user, status, router, lang]);

  const handleRetry = () => {
    setStatus('loading');
    setError("");
    // Simple page refresh to restart the process
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push(`/${lang}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8">
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative h-12 w-48">
              <Image
                src="/images/tudo-logo.png"
                alt="TUDO Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
          </div>

          {/* Status Content */}
          {status === 'loading' && (
            <>
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-heading text-gray-900 mb-2">
                  Completing sign up...
                </h1>
                <p className="text-gray-600">
                  Please wait while we set up your account.
                </p>
              </div>
            </>
          )}



          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-heading text-gray-900 mb-2">
                  Welcome to TUDO Fitness!
                </h1>
                <p className="text-gray-600">
                  Your account has been successfully created. Redirecting...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-heading text-gray-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mb-4">
                  {error || "We couldn't complete your sign up. Please try again."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleGoHome}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
