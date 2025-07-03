"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/middleware";
import { useApiWithAuth, User as ApiUser } from "@/lib/api";
import { 
  Calendar, 
  CreditCard, 
  MapPin, 
  Settings,
  User,
  Building,
  CheckCircle,
  TrendingUp,
  Award,
  Clock,
  Mail,
  Phone,
  MapPin as Location,
  Heart,
  Zap,
  Star,
  Users,
  Activity
} from "lucide-react";

interface DashboardProps {
  params: Promise<{ lang: Locale }>;
}

export default function Dashboard({ params }: DashboardProps) {
  const { lang } = use(params);
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const api = useApiWithAuth();
  
  // API User data state
  const [userData, setUserData] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);


  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoaded || !isSignedIn || !clerkUser || hasFetched) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        setHasFetched(true);
        
        console.log('📊 Fetching user data from API...');
        const result = await api.getCurrentUser();
        
        if (result.success && result.data) {
          console.log('✅ User data loaded:', result.data);
          setUserData(result.data);
        } else {
          console.error('❌ Failed to load user data:', result.error);
          setError(result.error || "Failed to load user data");
        }
      } catch (err) {
        console.error('💥 Error fetching user data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (errorMessage.includes('Failed to fetch')) {
          setError("Unable to connect to the server. Please make sure the backend is running on port 3001.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, isSignedIn, clerkUser, hasFetched]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(`/${lang}/login`);
    }
  }, [isLoaded, isSignedIn, router, lang]);

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn || !clerkUser) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-heading text-gray-900">Unable to load dashboard</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => {
              setHasFetched(false);
              setError("");
              setLoading(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show fallback if no API data but Clerk user exists
  const displayName = userData?.profile?.fullName || clerkUser.firstName || 'User';
  const memberSince = userData?.stats?.memberSince ? new Date(userData.stats.memberSince).toLocaleDateString() : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/${lang}`} className="flex items-center">
                <div className="relative h-8 w-32">
                  <Image
                    src="/images/tudo-logo.png"
                    alt="TUDO Logo"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </Link>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <span className="hidden sm:block text-sm text-gray-600">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/${lang}/settings`}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                {userData?.profile?.avatarUrl ? (
                  <Image
                    src={userData.profile.avatarUrl}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-heading text-gray-900">
                  Welcome back, {displayName}!
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userData?.role === 'PARTNER' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userData?.role || 'CLIENT'}
                  </span>
                  {userData?.verified && (
                    <span className="inline-flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs">Verified</span>
                    </span>
                  )}
                  {memberSince && (
                    <span className="text-xs text-gray-500">
                      Member since {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {userData?.referralCode && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Your referral code</p>
                <code className="text-lg font-mono font-medium text-primary">{userData.referralCode}</code>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Credits</p>
                <p className="text-2xl font-bold text-gray-900">{userData?.credits || 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{userData?.stats?.totalBookings || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Classes Completed</p>
                <p className="text-2xl font-bold text-gray-900">{userData?.stats?.completedClasses || 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userData?.stats?.totalBookings && userData?.stats?.completedClasses 
                    ? Math.round((userData.stats.completedClasses / userData.stats.totalBookings) * 100)
                    : 0}%
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Partner Section */}
        {userData?.role === 'PARTNER' && userData?.partner && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Building className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-heading text-gray-900">Partner Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="font-medium text-gray-900">{userData.partner.companyName}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userData.partner.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {userData.partner.isVerified ? 'Verified Partner' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href={`/${lang}/search`}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-gray-900">Find Classes</h3>
                <p className="text-sm text-gray-600">Discover fitness classes near you</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/${lang}/bookings`}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-gray-900">My Bookings</h3>
                <p className="text-sm text-gray-600">View and manage your bookings</p>
              </div>
            </div>
          </Link>

          <Link
            href={`/${lang}/pricing`}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-gray-900">Buy Credits</h3>
                <p className="text-sm text-gray-600">Purchase credits for classes</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Profile Section */}
        {userData?.profile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-heading text-gray-900 mb-4">Profile Information</h2>
              <div className="space-y-4">
                {userData.profile.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{userData.profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{userData.email}</span>
                </div>
                {userData.profile.address && (
                  <div className="flex items-center space-x-3">
                    <Location className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{userData.profile.address}</span>
                  </div>
                )}
              </div>
              <Link
                href={`/${lang}/profile`}
                className="inline-flex items-center mt-4 text-sm text-primary hover:underline"
              >
                Edit profile →
              </Link>
            </div>

            {/* Preferences */}
            {userData.profile.preferences && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-heading text-gray-900 mb-4">Your Preferences</h2>
                <div className="space-y-4">
                  {userData.profile.preferences.classTypes && userData.profile.preferences.classTypes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Favorite Classes</p>
                      <div className="flex flex-wrap gap-2">
                        {userData.profile.preferences.classTypes.map((classType) => (
                          <span
                            key={classType}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            <Heart className="w-3 h-3 mr-1" />
                            {classType}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Email notifications</span>
                    <span className={`text-sm font-medium ${
                      userData.profile.preferences.emailNotifications ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {userData.profile.preferences.emailNotifications ? 'On' : 'Off'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">SMS notifications</span>
                    <span className={`text-sm font-medium ${
                      userData.profile.preferences.smsNotifications ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {userData.profile.preferences.smsNotifications ? 'On' : 'Off'}
                    </span>
                  </div>

                  {userData.profile.preferences.reminderHours && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Reminder timing</span>
                      <span className="text-sm font-medium text-gray-900">
                        {userData.profile.preferences.reminderHours}h before
                      </span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/${lang}/settings`}
                  className="inline-flex items-center mt-4 text-sm text-primary hover:underline"
                >
                  Update preferences →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
