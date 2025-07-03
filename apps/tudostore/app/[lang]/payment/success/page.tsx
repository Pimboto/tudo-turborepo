// app/[lang]/payment/success/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Coins, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { useUser, useAuth } from "@clerk/nextjs";
import type { Locale } from "@/middleware";

interface PaymentSuccessPageProps {
  params: Promise<{ lang: Locale }>;
}

interface PaymentVerification {
  purchase: {
    id: string;
    credits: number;
    amount: number;
    status: string;
  };
  stripeSession: {
    payment_status: string;
  };
}

export default function PaymentSuccessPage({ params }: PaymentSuccessPageProps) {
  const { lang } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState<PaymentVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    console.log('Payment success page loaded');
    console.log('Session ID from URL:', sessionId);
    console.log('User loaded:', isLoaded);
    
    if (!sessionId) {
      // Si no hay session_id, intentar recuperar de sessionStorage
      const storedSessionId = sessionStorage.getItem('lastCheckoutSessionId');
      if (storedSessionId) {
        console.log('Using stored session ID:', storedSessionId);
        router.replace(`/${lang}/payment/success?session_id=${storedSessionId}`);
        return;
      }
      setError('No payment session found. Please check your email for confirmation.');
      setLoading(false);
      return;
    }

    if (isLoaded && user) {
      verifyPaymentWithRetry(sessionId);
    }
  }, [searchParams, user, isLoaded, lang]);

  const verifyPaymentWithRetry = async (sessionId: string, attempt = 1) => {
    const maxAttempts = 5;
    const delay = 2000; // 2 segundos entre intentos

    try {
      console.log(`Verifying payment (attempt ${attempt}/${maxAttempts})...`);
      const token = await getToken();
      
      const response = await fetch(`/api/payments/verify-session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Verification response:', data);

      if (response.ok && data.success) {
        if (data.data.purchase.status === 'COMPLETED') {
          // Pago completado exitosamente
          setPaymentInfo(data.data);
          setLoading(false);
          
          // Actualizar créditos en la UI
          window.dispatchEvent(new Event('credits-updated'));
          
          // Limpiar sessionStorage
          sessionStorage.removeItem('lastCheckoutSessionId');
        } else if (data.data.purchase.status === 'PENDING' && attempt < maxAttempts) {
          // Si aún está pendiente y no hemos alcanzado el máximo de intentos
          console.log('Payment still pending, retrying...');
          setRetryCount(attempt);
          setTimeout(() => {
            verifyPaymentWithRetry(sessionId, attempt + 1);
          }, delay);
        } else {
          // Se acabaron los intentos o hay otro estado
          setPaymentInfo(data.data);
          setLoading(false);
        }
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      
      if (attempt < maxAttempts) {
        console.log('Error occurred, retrying...');
        setRetryCount(attempt);
        setTimeout(() => {
          verifyPaymentWithRetry(sessionId, attempt + 1);
        }, delay);
      } else {
        setError('Unable to verify payment status. Please check your dashboard.');
        setLoading(false);
      }
    }
  };

  const handleContinue = () => {
    const returnUrl = sessionStorage.getItem('checkoutReturnUrl') || `/${lang}/dashboard`;
    sessionStorage.removeItem('checkoutReturnUrl');
    router.push(returnUrl);
  };

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Verifying your payment...</p>
                <p className="text-sm text-muted-foreground">
                  This usually takes just a few seconds
                </p>
                {retryCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Checking status... (attempt {retryCount})
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Unable to Verify Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              {error}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Your payment may have been processed successfully. Please check your dashboard or email for confirmation.
            </p>
            <Button onClick={handleContinue} className="w-full">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  const isCompleted = paymentInfo?.purchase?.status === 'COMPLETED';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 h-16 w-16 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isCompleted ? 'Payment Successful!' : 'Payment Processing'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentInfo?.purchase && (
            <>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Points Purchased</span>
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="font-bold text-lg">{paymentInfo.purchase.credits}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-semibold">${paymentInfo.purchase.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-semibold ${
                    isCompleted ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {isCompleted ? 'Completed' : 'Processing'}
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                {isCompleted
                  ? 'Your points have been added to your account and are ready to use!'
                  : 'Your payment is being processed. This may take a few moments.'}
              </p>
            </>
          )}

          <Button onClick={handleContinue} className="w-full">
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}