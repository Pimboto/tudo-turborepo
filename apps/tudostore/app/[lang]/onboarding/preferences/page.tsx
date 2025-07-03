"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { UserPreferences, useApiWithAuth } from "@/lib/api";
import type { Locale } from "@/middleware";
import { 
  CheckCircle, 
  Mail, 
  MessageSquare, 
  Clock, 
  MapPin,
  Zap,
  Heart,
  Target,
  Plus,
  X
} from "lucide-react";

interface PreferencesPageProps {
  params: Promise<{ lang: Locale }>;
}

type ClassType = string;

const availableClassTypes = [
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'pilates', name: 'Pilates', icon: '🤸' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'crossfit', name: 'CrossFit', icon: '🏋️' },
  { id: 'spinning', name: 'Spinning', icon: '🚴' },
  { id: 'dance', name: 'Dance', icon: '💃' },
  { id: 'boxing', name: 'Boxing', icon: '🥊' },
  { id: 'swimming', name: 'Swimming', icon: '🏊' },
  { id: 'running', name: 'Running', icon: '🏃' },
  { id: 'martial-arts', name: 'Martial Arts', icon: '🥋' },
  { id: 'meditation', name: 'Meditation', icon: '🧘‍♀️' },
  { id: 'stretching', name: 'Stretching', icon: '🤲' },
];

const reminderOptions = [
  { value: 2, label: '2 hours before' },
  { value: 4, label: '4 hours before' },
  { value: 12, label: '12 hours before' },
  { value: 24, label: '1 day before' },
  { value: 48, label: '2 days before' },
];

const radiusOptions = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 15, label: '15 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
];

export default function PreferencesPage({ params }: PreferencesPageProps) {
  const { lang } = use(params);
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const api = useApiWithAuth();

  // Form state
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    reminderHours: 24,
    favoriteClasses: [],
    preferredRadius: 10,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async () => {
    // Verify user is properly authenticated
    if (!isLoaded || !isSignedIn || !user) {
      setError("Please wait while we verify your authentication...");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('🔐 User authentication status:', {
        isLoaded,
        isSignedIn,
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.emailAddresses?.[0]?.emailAddress
      });

      // Complete registration flow - register + profile
      console.log('Starting registration and profile completion...');
      const result = await api.registerAndCompleteProfile(preferences);
      
      if (!result.success) {
        setError(result.error || "Failed to complete registration");
        setLoading(false);
        return;
      }

      // Clear any stored role after successful registration
      localStorage.removeItem('pending_user_role');

      // Registration and profile completed successfully
      setSuccess(true);
      
      // Wait a moment to show success, then redirect to dashboard
      setTimeout(() => {
        router.push(`/${lang}/dashboard`);
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to complete registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle skip (use defaults)
  const handleSkip = async () => {
    // Verify user is properly authenticated
    if (!isLoaded || !isSignedIn || !user) {
      setError("Please wait while we verify your authentication...");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log('🔐 User authentication status (skip):', {
        isLoaded,
        isSignedIn,
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.emailAddresses?.[0]?.emailAddress
      });

      // Registration flow without preferences (skip)
      console.log('Starting registration (skipping preferences)...');
      const result = await api.registerAndCompleteProfile();
      
      if (!result.success) {
        setError(result.error || "Failed to complete registration");
        setLoading(false);
        return;
      }

      // Clear any stored role after successful registration
      localStorage.removeItem('pending_user_role');

      // Redirect to dashboard
      router.push(`/${lang}/dashboard`);
    } catch (err) {
      console.error("Registration error:", err);
      setError("Failed to complete registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite class
  const toggleFavoriteClass = (classType: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteClasses: prev.favoriteClasses.includes(classType)
        ? prev.favoriteClasses.filter(c => c !== classType)
        : [...prev.favoriteClasses, classType]
    }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not signed in, redirect to login
  if (isLoaded && !isSignedIn) {
    router.push(`/${lang}/login`);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-heading text-gray-900">
            Welcome to TUDO Fitness!
          </h1>
          <p className="text-gray-600">
            Your preferences have been saved. Redirecting to your dashboard...
          </p>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative h-8 w-32">
                <Image
                  src="/images/tudo-logo.png"
                  alt="TUDO Logo"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <span className="hidden sm:block text-sm text-gray-600">Setup</span>
            </div>
            <button
              onClick={handleSkip}
              disabled={loading}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Skip for now"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading gradient-text mb-2">
            Let's personalize your experience
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Help us recommend the best classes and studios for you by sharing your preferences.
            You can always change these later in your settings.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <X className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notifications */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-heading">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email notifications</p>
                  <p className="text-sm text-gray-600">Booking confirmations and updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      emailNotifications: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS notifications</p>
                  <p className="text-sm text-gray-600">Quick reminders and alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.smsNotifications}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      smsNotifications: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-heading">Reminder Timing</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              When would you like to be reminded about your upcoming classes?
            </p>
            <div className="grid grid-cols-1 gap-2">
              {reminderOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="reminderHours"
                    value={option.value}
                    checked={preferences.reminderHours === option.value}
                    onChange={() => setPreferences(prev => ({
                      ...prev,
                      reminderHours: option.value
                    }))}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Radius */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-heading">Search Radius</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              How far are you willing to travel for a great class?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {radiusOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="preferredRadius"
                    value={option.value}
                    checked={preferences.preferredRadius === option.value}
                    onChange={() => setPreferences(prev => ({
                      ...prev,
                      preferredRadius: option.value
                    }))}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Favorite Classes - Full Width */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-5 h-5 text-primary mr-2" />
              <h2 className="text-lg font-heading">Favorite Class Types</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Select the types of fitness classes you're most interested in. We'll prioritize these in your recommendations.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableClassTypes.map((classType) => {
                const isSelected = preferences.favoriteClasses.includes(classType.id);
                return (
                  <button
                    key={classType.id}
                    onClick={() => toggleFavoriteClass(classType.id)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 hover-lift
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="text-2xl mb-2">{classType.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{classType.name}</div>
                    {isSelected && (
                      <div className="mt-2">
                        <CheckCircle className="w-4 h-4 text-primary mx-auto" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {preferences.favoriteClasses.length > 0 && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <p className="text-sm text-primary">
                  <Target className="w-4 h-4 inline mr-1" />
                  Great! You've selected {preferences.favoriteClasses.length} favorite class types.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Skip for now"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Setting up your account...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Save & Continue
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            You can always update these preferences later in your{" "}
            <Link href={`/${lang}/settings`} className="text-primary hover:underline">
              account settings
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 
