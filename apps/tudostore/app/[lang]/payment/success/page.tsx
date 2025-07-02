// app/[lang]/payment/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Coins, ArrowRight } from "lucide-react";
import { useUser, useAuth } from "@clerk/nextjs";
import type { Locale } from "@/middleware";

export default function PaymentSuccessPage({ params }: { params: { lang: Locale } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && user) {
      fetchPaymentInfo(sessionId);
    }
  }, [searchParams, user]);

  const fetchPaymentInfo = async (sessionId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/payments/success?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    // Recuperar la URL guardada o ir al home
    const returnUrl = sessionStorage.getItem('checkoutReturnUrl') || `/${params.lang}`;
    sessionStorage.removeItem('checkoutReturnUrl');
    router.push(returnUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
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
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Your points have been added to your account and are ready to use!
              </p>
            </>
          )}

          <Button onClick={handleContinue} className="w-full">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}