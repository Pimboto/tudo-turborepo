# 🔐 TUDO Fitness - Authentication & Registration Flow

## 📋 Overview

This document describes the complete authentication and registration flow for TUDO Fitness, including role selection, API synchronization, and preferences setup.

## 🎯 Flow Architecture

```
1. User visits /signup
   ↓
2. Role Selection (CLIENT/PARTNER)
   ↓
3. Registration Options:
   - Google OAuth
   - Apple OAuth  
   - Email/Password
   ↓
4. Email Verification (if email/password)
   ↓
5. SSO Callback (/sso-callback)
   ↓
6. Backend Sync (POST /api/auth/sync)
   ↓
7. Preferences Setup (/onboarding/preferences)
   ↓
8. Dashboard (/dashboard)
```

## 📁 File Structure

```
apps/tudostore/
├── lib/
│   └── api.ts                           # API service & types
├── components/
│   └── auth/
│       └── role-selection.tsx          # Role selection component
└── app/[lang]/
    ├── signup/
    │   └── page.tsx                    # Main signup page
    ├── sso-callback/
    │   └── page.tsx                    # OAuth callback handler
    └── onboarding/
        └── preferences/
            └── page.tsx                # User preferences setup
```

## 🛠 Components

### 1. API Service (`lib/api.ts`)

**Purpose**: Centralized API service with TypeScript types

**Key Features**:
- Type-safe API calls
- Authentication handling with Clerk tokens
- Error handling and response formatting
- Custom hook `useApiWithAuth()` for authenticated requests

**Main Types**:
```typescript
type UserRole = 'CLIENT' | 'PARTNER'
interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  reminderHours: number
  favoriteClasses: string[]
  preferredRadius: number
}
```

### 2. Role Selection (`components/auth/role-selection.tsx`)

**Purpose**: Beautiful UI for users to choose between CLIENT and PARTNER roles

**Features**:
- Animated cards with feature lists
- Visual feedback for selection
- "Most Popular" badge for CLIENT role
- Responsive design

### 3. Signup Page (`app/[lang]/signup/page.tsx`)

**Purpose**: Multi-step registration process

**Steps**:
1. **Role Selection**: Choose CLIENT or PARTNER
2. **Details**: Enter personal info + OAuth options
3. **Verification**: Email code verification (email/password only)
4. **Sync**: Backend synchronization

**Key Features**:
- Progress bar showing completion percentage
- Error handling with user-friendly messages
- OAuth integration (Google/Apple)
- Role persistence in localStorage during OAuth flow

### 4. SSO Callback (`app/[lang]/sso-callback/page.tsx`)

**Purpose**: Handle OAuth redirects and sync with backend

**Flow**:
1. Receives OAuth callback from Clerk
2. Syncs user data with backend API
3. Retrieves stored role from localStorage
4. Redirects to preferences or dashboard

### 5. Preferences Page (`app/[lang]/onboarding/preferences/page.tsx`)

**Purpose**: Collect user preferences for personalization

**Preferences Collected**:
- **Notifications**: Email/SMS preferences
- **Reminders**: When to be reminded about classes
- **Search Radius**: How far to search for classes
- **Favorite Classes**: Preferred class types with emoji icons

## 🔄 API Integration

### Authentication Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/sync` | POST | Sync Clerk user with backend |
| `/api/auth/me` | GET | Get current user data |
| `/api/users/preferences` | GET/PUT | Manage user preferences |

### Example API Usage

```typescript
// Sync with backend after Clerk authentication
const { syncWithClerk } = useApiWithAuth()
const result = await syncWithClerk()

// Update user preferences
const { updatePreferences } = useApiWithAuth()
const result = await updatePreferences({
  emailNotifications: true,
  smsNotifications: false,
  reminderHours: 24,
  favoriteClasses: ['yoga', 'pilates'],
  preferredRadius: 10
})
```

## 🎨 UI Design

### Design System
- **Colors**: Primary orange (#FF9422), secondary teal
- **Typography**: Custom font classes (font-heading)
- **Animations**: CSS-based transitions and loading states
- **Layout**: Responsive grid system with mobile-first approach

### CSS Classes Used
```css
.gradient-text          /* Orange gradient text */
.hover-lift            /* Lift effect on hover */
.animate-fade-in       /* Fade in animation */
.animate-slide-up      /* Slide up animation */
.animate-scale-in      /* Scale in animation */
```

## 🔧 Environment Variables

Add these to your `.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Clerk Configuration (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## 🚀 Usage Examples

### 1. Basic Registration Flow

```typescript
// User selects CLIENT role
setSelectedRole('CLIENT')

// User completes email registration
await signUp.create({
  firstName: 'John',
  lastName: 'Doe', 
  emailAddress: 'john@example.com',
  password: 'password123'
})

// Backend sync after verification
const syncResult = await syncWithClerk()

// Setup preferences
await updatePreferences({
  favoriteClasses: ['yoga', 'fitness'],
  preferredRadius: 15
})
```

### 2. OAuth Registration Flow

```typescript
// Store role before OAuth redirect
localStorage.setItem('pending_user_role', 'PARTNER')

// Redirect to Google OAuth
await signUp.authenticateWithRedirect({
  strategy: "oauth_google",
  redirectUrl: "/en/sso-callback",
  redirectUrlComplete: "/en/onboarding"
})

// After OAuth callback, sync and retrieve role
const role = localStorage.getItem('pending_user_role')
const syncResult = await syncWithClerk()
localStorage.removeItem('pending_user_role')
```

## 📱 Mobile Considerations

- **Responsive Design**: All components work on mobile devices
- **Touch-Friendly**: Large buttons and touch targets
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Fast Loading**: Optimized images and minimal dependencies

## 🔍 Error Handling

### Common Error Scenarios

1. **Email Already Exists**: Clear message to sign in instead
2. **Weak Password**: Specific requirements shown
3. **Invalid Verification Code**: Retry and resend options
4. **Network Errors**: Retry buttons and fallback messages
5. **API Sync Failures**: Clear error states with retry options

### Error Messages

```typescript
// User-friendly error mapping
const errorMap = {
  'form_identifier_exists': 'This email is already registered. Please sign in instead.',
  'form_password_pwned': 'This password is too weak. Please choose a stronger password.',
  'verification_failed': 'Incorrect verification code. Please try again.',
  'sync_failed': 'Failed to sync account. Please try again.'
}
```

## 🧪 Testing

### Test Scenarios

1. **Role Selection**: Test both CLIENT and PARTNER flows
2. **Email Registration**: Complete flow with verification
3. **OAuth Registration**: Google and Apple sign-in
4. **Error Handling**: Test all error scenarios
5. **Preferences**: Test all preference combinations
6. **Mobile Experience**: Test on various screen sizes

### Test Data

```typescript
// Test user for CLIENT role
const testClient = {
  firstName: 'Test',
  lastName: 'Client',
  email: 'client@test.com',
  role: 'CLIENT'
}

// Test user for PARTNER role
const testPartner = {
  firstName: 'Test', 
  lastName: 'Partner',
  email: 'partner@test.com',
  role: 'PARTNER'
}
```

## 🔮 Future Enhancements

1. **Social Login**: Add more OAuth providers
2. **Profile Pictures**: Upload during onboarding
3. **Location Detection**: Auto-detect user location
4. **Advanced Preferences**: More granular settings
5. **Onboarding Tutorial**: Interactive walkthrough
6. **A/B Testing**: Different onboarding flows

## 📞 Support

For questions about the authentication flow:

1. Check the API documentation in `api-docs.md`
2. Review error logs in browser console
3. Test with different user scenarios
4. Verify environment variables are set correctly

---

Built with ❤️ for TUDO Fitness 
