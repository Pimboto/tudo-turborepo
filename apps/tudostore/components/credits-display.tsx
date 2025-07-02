// components/credits-display.tsx
"use client";

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@clerk/nextjs";
import { CreditsModal } from "./credits-modal";

interface CreditsDisplayProps {
  variant?: "light" | "dark";
}

export function CreditsDisplay({ variant = "dark" }: CreditsDisplayProps) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch user credits
  useEffect(() => {
    if (isLoaded && user) {
      fetchCredits();
    }
  }, [isLoaded, user]);

  const fetchCredits = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/payments/credits', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCredits(data.data.currentCredits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditsUpdate = () => {
    fetchCredits();
    setIsModalOpen(false);
  };

  const buttonColor = variant === "dark" 
    ? "bg-white/10 hover:bg-white/20 text-white border-white/20" 
    : "bg-black/5 hover:bg-black/10 text-gray-800 border-gray-200";

  if (!isLoaded || !user || loading) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center gap-2 ${buttonColor}`}
        onClick={() => setIsModalOpen(true)}
      >
        <Coins className="h-4 w-4" />
        <span className="font-semibold">{credits}</span>
        <span className="hidden sm:inline">Points</span>
      </Button>

      <CreditsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentCredits={credits}
        onSuccess={handleCreditsUpdate}
      />
    </>
  );
}