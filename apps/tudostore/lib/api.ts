// API configuration and services
import { useAuth, useUser } from '@clerk/nextjs';

// Base API URL - use proxy for development to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User Types
export type UserRole = 'CLIENT' | 'PARTNER';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserProfile {
  id?: string;
  fullName: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bio?: string;
  preferences?: {
    amenities?: string[];
    classTypes?: string[];
    zones?: string[];
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    reminderHours?: number;
  };
}

export interface User {
  id: string;
  email: string;
  clerkId?: string;
  role: UserRole;
  verified: boolean;
  credits?: number;
  referralCode?: string;
  profile?: UserProfile;
  partner?: {
    id: string;
    companyName: string;
    isVerified: boolean;
  };
  stats?: {
    totalBookings: number;
    completedClasses: number;
    memberSince: string;
  };
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderHours: number;
  favoriteClasses: string[];
  preferredRadius: number;
}

// API Service Class
class ApiService {
  private getAuthToken(): string | null {
    // This will be set by the component using useAuth
    return null;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🌐 API Request:', {
      url,
      method: options.method || 'GET',
      endpoint,
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      API_BASE_URL
    });
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ API Error Response:', data);
        throw new Error(data.error || data.message || 'API request failed');
      }

      console.log('✅ API Success:', data);
      return data;
    } catch (error) {
      console.error('💥 API Error:', {
        url,
        error: error instanceof Error ? error.message : error,
        endpoint
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Auth endpoints
  registerUser = async (userData: {
    clerkId: string;
    email: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    referralCode?: string;
    companyName?: string;
    taxInfo?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    return this.makeRequest<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  completeProfile = async (profileData: {
    clerkId: string;
    profile: {
      fullName: string;
      phone?: string;
      address?: string;
      avatarUrl?: string;
      preferences?: {
        amenities?: string[];
        classTypes?: string[];
        zones?: string[];
        emailNotifications?: boolean;
        smsNotifications?: boolean;
        reminderHours?: number;
      };
    };
  }): Promise<ApiResponse<{ user: User }>> => {
    return this.makeRequest<{ user: User }>('/api/auth/complete-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  syncWithClerk = async (token: string): Promise<ApiResponse<{ user: User }>> => {
    return this.makeRequest<{ user: User }>('/api/auth/sync', {
      method: 'POST',
    }, token);
  }

  getCurrentUser = async (token: string): Promise<ApiResponse<User>> => {
    return this.makeRequest<User>('/api/auth/me', {
      method: 'GET',
    }, token);
  }

  // User endpoints
  updateProfile = async (
    profileData: Partial<UserProfile>, 
    token: string
  ): Promise<ApiResponse<{ profile: UserProfile }>> => {
    return this.makeRequest<{ profile: UserProfile }>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }, token);
  }

  getPreferences = async (token: string): Promise<ApiResponse<{ preferences: UserPreferences }>> => {
    return this.makeRequest<{ preferences: UserPreferences }>('/api/users/preferences', {
      method: 'GET',
    }, token);
  }

  updatePreferences = async (
    preferences: UserPreferences, 
    token: string
  ): Promise<ApiResponse<{ preferences: UserPreferences }>> => {
    return this.makeRequest<{ preferences: UserPreferences }>('/api/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }, token);
  }
}

export const apiService = new ApiService();

// Custom hook for API calls with auth
export function useApiWithAuth() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const makeAuthenticatedRequest = async <T>(
    apiCall: (token: string) => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> => {
    try {
      console.log('🔐 Getting Clerk token...');
      const token = await getToken();
      
      console.log('🔑 Token received:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenType: typeof token,
        tokenStart: token ? token.substring(0, 10) : 'null'
      });

      // 🚨 TEMPORAL: JWT completo para debugging/testing
      if (token) {
        console.log('🎯 FULL JWT TOKEN (for manual testing):');
        console.log('======================================');
        console.log(token);
        console.log('======================================');
        console.log('💡 Copy this token to test manually in Postman/curl');
      }
      
      if (!token) {
        console.error('❌ No token received from Clerk');
        return {
          success: false,
          error: 'Authentication required',
        };
      }
      
      return await apiCall(token);
    } catch (error) {
      console.error('Auth API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  };

  // Complete registration flow for OAuth users
  const registerAndCompleteProfile = async (preferences?: UserPreferences): Promise<ApiResponse<{ user: User }>> => {
    try {
      const token = await getToken();
      if (!token || !user) {
        return {
          success: false,
          error: 'Authentication required',
        };
      }

      // Get stored role from localStorage (set during OAuth signup)
      const storedRole = localStorage.getItem('pending_user_role') as UserRole;
      
      console.log('🚀 Starting registration → profile flow...', {
        storedRole,
        userEmail: user.emailAddresses?.[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        clerkId: user.id
      });

      // Validate required data
      if (!storedRole || !user.emailAddresses?.[0]?.emailAddress || !user.id) {
        console.log('❌ Missing required data for registration', {
          hasStoredRole: !!storedRole,
          hasEmail: !!user.emailAddresses?.[0]?.emailAddress,
          hasClerkId: !!user.id
        });
        return {
          success: false,
          error: 'Missing required user data. Please complete signup first.',
        };
      }

      // Step 1: Register user
      console.log('📝 Step 1: Registering user...');
      const fullName = `${user.firstName || 'User'} ${user.lastName || 'User'}`.trim();
      const registrationData = {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        fullName: fullName,
        phone: user.phoneNumbers?.[0]?.phoneNumber || '',
        role: storedRole,
      };

      console.log('📋 Registration data:', registrationData);
      
      const registerResult = await apiService.registerUser(registrationData);
      
      if (!registerResult.success) {
        console.log('❌ Registration failed:', registerResult.error);
        return registerResult;
      }

      console.log('✅ Step 1: Registration successful!');

      // Step 2: Complete profile with preferences (if provided)
      if (preferences) {
        console.log('📋 Step 2: Completing profile...');
        const profileData = {
          clerkId: user.id,
          profile: {
            fullName: fullName,
            phone: user.phoneNumbers?.[0]?.phoneNumber || '',
            avatarUrl: user.imageUrl || '',
            preferences: {
              classTypes: preferences.favoriteClasses,
              emailNotifications: preferences.emailNotifications,
              smsNotifications: preferences.smsNotifications,
              reminderHours: preferences.reminderHours,
            }
          }
        };

        console.log('📋 Profile data:', profileData);

        const profileResult = await apiService.completeProfile(profileData);
        
        if (!profileResult.success) {
          console.log('❌ Profile completion failed:', profileResult.error);
          return profileResult;
        }

        console.log('✅ Step 2: Profile completed successfully!');
        return profileResult;
      } else {
        console.log('⏭️ Step 2: Skipping profile completion (no preferences provided)');
        return registerResult;
      }

    } catch (error) {
      console.error('Registration/Profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  };

  return {
    registerAndCompleteProfile,
    getCurrentUser: () => makeAuthenticatedRequest(apiService.getCurrentUser),
    updateProfile: (data: Partial<UserProfile>) => 
      makeAuthenticatedRequest((token) => apiService.updateProfile(data, token)),
    getPreferences: () => makeAuthenticatedRequest(apiService.getPreferences),
    updatePreferences: (data: UserPreferences) => 
      makeAuthenticatedRequest((token) => apiService.updatePreferences(data, token)),
  };
} 
