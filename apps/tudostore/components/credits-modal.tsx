// components/credits-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, TrendingUp, Star } from "lucide-react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  onSuccess: () => void;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerCredit: number;
  popular?: boolean;
  savings?: string;
  description: string;
}

export function CreditsModal({ isOpen, onClose, currentCredits, onSuccess }: CreditsModalProps) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Paquetes predefinidos
  const packages: CreditPackage[] = [
    {
      id: "basic",
      name: "Basic Pack",
      credits: 10,
      price: 10.00,
      pricePerCredit: 1.00,
      description: "Perfect for trying out",
    },
    {
      id: "standard",
      name: "Standard Pack",
      credits: 50,
      price: 45.00,
      pricePerCredit: 0.90,
      popular: true,
      savings: "Save 10%",
      description: "Most popular choice",
    },
    {
      id: "premium",
      name: "Premium Pack",
      credits: 100,
      price: 80.00,
      pricePerCredit: 0.80,
      savings: "Save 20%",
      description: "Best value",
    },
    {
      id: "ultimate",
      name: "Ultimate Pack",
      credits: 250,
      price: 175.00,
      pricePerCredit: 0.70,
      savings: "Save 30%",
      description: "For power users",
    },
  ];

  const handlePurchase = async (credits: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/payments/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ credits }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirigir a Stripe Checkout
      if (data.data?.url) {
        // Guardar la URL actual para regresar después del pago
        sessionStorage.setItem('checkoutReturnUrl', pathname);
        window.location.href = data.data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error creating checkout session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPurchase = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount) && amount > 0 && amount <= 1000) {
      handlePurchase(amount);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Buy Points
          </DialogTitle>
          <DialogDescription>
            Choose a package or enter a custom amount. Points never expire!
          </DialogDescription>
        </DialogHeader>

        {/* Current balance */}
        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-bold text-lg">{currentCredits} Points</span>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={cn(
                "relative p-4 cursor-pointer transition-all hover:shadow-lg",
                selectedPackage === pkg.id && "ring-2 ring-primary",
                pkg.popular && "border-primary"
              )}
              onClick={() => {
                setSelectedPackage(pkg.id);
                setCustomAmount("");
              }}
            >
              {pkg.popular && (
                <Badge className="absolute -top-2 -right-2 bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
              
              <div className="space-y-2">
                <h3 className="font-semibold">{pkg.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{pkg.credits}</span>
                  <span className="text-muted-foreground">points</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ${pkg.price.toFixed(2)}
                </div>
                {pkg.savings && (
                  <Badge variant="secondary" className="text-xs">
                    {pkg.savings}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">{pkg.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Custom amount */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium">Or enter custom amount</label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter points (1-1000)"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedPackage(null);
              }}
              min="1"
              max="1000"
              className="flex-1"
            />
            <Button
              onClick={handleCustomPurchase}
              disabled={!customAmount || loading || parseInt(customAmount) <= 0}
            >
              Buy Custom
            </Button>
          </div>
          {customAmount && parseInt(customAmount) > 0 && (
            <p className="text-sm text-muted-foreground">
              Total: ${(parseInt(customAmount) * 1.00).toFixed(2)} (${1.00}/point)
            </p>
          )}
        </div>

        {/* Purchase button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const pkg = packages.find(p => p.id === selectedPackage);
              if (pkg) handlePurchase(pkg.credits);
            }}
            disabled={!selectedPackage || loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Buy {selectedPackage && packages.find(p => p.id === selectedPackage)?.credits} Points
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Points can be used to book any class on TUDO
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}