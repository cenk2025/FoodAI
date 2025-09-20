# Password Reset Flow

## Overview
This document describes the complete password reset flow implemented using Supabase Auth, consisting of a request page and a confirmation page.

## Components

### Reset Request Page
- **Location**: [app/auth/reset/request/page.tsx](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/auth/reset/request/page.tsx)
- **URL**: `/auth/reset/request`
- **Function**: Allows users to request a password reset email
- **Features**:
  - Client-side only implementation (no secrets)
  - Uses Supabase Auth's `resetPasswordForEmail` method
  - Sends reset email with redirect to confirmation page
  - Provides user feedback on submission

### Reset Confirmation Page
- **Location**: [app/auth/reset/confirm/page.tsx](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/auth/reset/confirm/page.tsx)
- **URL**: `/auth/reset/confirm`
- **Function**: Handles the password reset confirmation flow
- **Features**:
  - Client-side only implementation (no secrets)
  - Exchanges recovery code for session
  - Allows user to set new password
  - Redirects to dashboard on success

## Flow

1. User navigates to `/auth/reset/request`
2. User enters their email address and submits the form
3. Supabase sends a password reset email with a recovery link
4. User clicks the link in their email, which redirects to `/auth/reset/confirm?code=...`
5. The confirmation page exchanges the code for a session
6. User enters their new password and submits
7. User is redirected to `/dashboard`

## Implementation Details

### Request Page
- Uses `supabaseBrowser()` client for authentication
- Calls `resetPasswordForEmail` with the user's email
- Sets redirect URL to the confirmation page
- Provides feedback message to the user

### Confirmation Page
- Uses React hooks for state management (`useState`, `useEffect`)
- Uses Next.js router for navigation (`useRouter`)
- Uses search parameters to extract the recovery code (`useSearchParams`)
- Exchanges the recovery code for a session using `exchangeCodeForSession`
- Updates the user's password using `updateUser`
- Redirects to dashboard on successful password update

## Security Considerations

- All operations are performed client-side using the Supabase browser client
- No secrets are exposed in the client code
- Password reset emails are only sent to registered email addresses
- Recovery codes are single-use and time-limited
- Session is properly established before allowing password change

## Testing

To test the password reset flow:

1. Navigate to `/auth/reset/request`
2. Enter a registered email address
3. Submit the form and check for the success message
4. Check your email for the reset link
5. Click the reset link
6. Verify you are redirected to `/auth/reset/confirm`
7. Enter a new password
8. Submit the form
9. Verify you are redirected to `/dashboard`

## Error Handling

The implementation includes error handling for:
- Invalid email addresses
- Unregistered email addresses
- Expired or invalid recovery codes
- Network errors
- Password validation errors

Users are shown appropriate error messages in each case.