# Universal Auth Callback Page

## Overview
This document describes the universal auth callback page that handles all types of authentication flows from Supabase, including email verification, signup, recovery, and magic links.

## Component

### Auth Callback Page
- **Location**: [app/auth/callback/page.tsx](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/auth/callback/page.tsx)
- **URL**: `/auth/callback`
- **Function**: Universal callback handler for all Supabase auth flows
- **Features**:
  - Client-side only implementation (no secrets)
  - Exchanges any code parameter sent by Supabase
  - Redirects all users to `/dashboard` after processing
  - Handles multiple auth flow types (email verification, signup, recovery, magic link)

## Supported Auth Flows

The universal callback page handles these Supabase auth flows:

1. **Email Verification**: When users verify their email address after signup
2. **Signup Confirmation**: When users complete the signup process via email
3. **Password Recovery**: When users reset their password via email
4. **Magic Links**: When users sign in using magic link emails

## Implementation Details

### Code Exchange
- Uses `useSearchParams` to extract the `code` parameter from the URL
- Uses `supabaseBrowser().auth.exchangeCodeForSession(code)` to exchange the code for a session
- Works with any valid Supabase auth code

### Redirect
- After processing the code (if present), redirects all users to `/dashboard`
- Uses `router.replace()` to prevent back navigation to the callback page

### Client-Side Only
- All operations are performed client-side using the Supabase browser client
- No secrets are exposed in the client code
- No server-side processing required

## Usage

The callback page is configured as the redirect URL for all Supabase auth operations:

1. **Password Reset**: Configured in the reset request page
2. **Email Verification**: Configured in Supabase Auth settings
3. **Magic Links**: Configured in Supabase Auth settings
4. **OAuth Providers**: Can be used as a general callback URL

## Configuration

To use this callback page with different auth flows:

### Password Reset
In the reset request page:
```javascript
const { error } = await s.auth.resetPasswordForEmail(email, {
  redirectTo: `${location.origin}/auth/callback`
});
```

### Email Verification
In Supabase Auth settings, set the redirect URL to:
```
https://your-domain.com/auth/callback
```

### Magic Links
In Supabase Auth settings, set the redirect URL to:
```
https://your-domain.com/auth/callback
```

## Error Handling

The implementation includes basic error handling:
- If no code is present, it simply redirects to the dashboard
- If the code is invalid or expired, Supabase will handle the error internally
- Users are always redirected to the dashboard regardless of code validity

## Testing

To test the universal callback page:

1. Trigger any auth flow that sends a code (password reset, email verification, etc.)
2. Click the link in the email which should contain a `code` parameter
3. Verify you are redirected to `/auth/callback`
4. Verify you are then redirected to `/dashboard`
5. Verify you are properly authenticated

## Security Considerations

- All operations are performed client-side using the Supabase browser client
- No secrets are exposed in the client code
- The code parameter is single-use and time-limited
- Users are always redirected to a safe location (/dashboard)