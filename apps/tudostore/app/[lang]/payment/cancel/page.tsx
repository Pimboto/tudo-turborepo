// app/[lang]/payment/cancel/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import type { Locale } from "@/middleware";

export default function PaymentCancelPage({ params }: { params: { lang: Locale } }) {
  const router = useRouter();

  const handleReturn = () => {
    const returnUrl = sessionStorage.getItem('checkoutReturnUrl') || `/${params.lang}`;
    sessionStorage.removeItem('checkoutReturnUrl');
    router.push(returnUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Your payment was cancelled. No charges were made to your account.
          </p>
          
          <Button onClick={handleReturn} className="w-full" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}