# Route Guards

## Overview

This document describes the route guard system implemented to protect authenticated and admin-only routes in the application.

## Guard Types

### Authentication Guard
Located in [app/(guards)/auth/guard.ts](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/%28guards%29/auth/guard.ts)

This guard ensures that a user is authenticated before accessing a route. If the user is not authenticated, they are redirected to the signin page.

### Admin Guard
Located in [app/(guards)/admin/guard.ts](file:///Users/cenkyakinlar/Documents/Dokumentit%20–%20CenkAir%20-%20MacBook%20Air/DREAMWEAVER/FOODAI/app/%28guards%29/admin/guard.ts)

This guard ensures that a user is both authenticated and has admin privileges. If the user is not authenticated, they are redirected to the signin page. If the user is authenticated but not an admin, they are redirected to the dashboard.

## Usage

### Protecting Authenticated Routes
To protect a route that requires authentication, import and call the `assertAuth()` function at the top of your page component:

```typescript
import { assertAuth } from '@/app/(guards)/auth/guard';

export default async function ProtectedPage() {
  await assertAuth();
  // Rest of your component logic
  return <div>Protected content</div>;
}
```

### Protecting Admin Routes
To protect a route that requires admin privileges, import and call the `assertAdmin()` function at the top of your page component:

```typescript
import { assertAdmin } from '@/app/(guards)/admin/guard';

export default async function AdminPage() {
  await assertAdmin();
  // Rest of your component logic
  return <div>Admin content</div>;
}
```

### Using with Layout Components
For layout components that should protect all nested routes, call the appropriate guard function in the layout:

```typescript
import { assertAdmin } from '@/app/(guards)/admin/guard';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await assertAdmin();
  return <div>{children}</div>;
}
```

## Implementation Details

### Lightweight Server Check
The guards use lightweight server-side checks:
1. They use the Supabase server client to check authentication status
2. For admin checks, they query the profiles table for the `is_admin` flag
3. Redirects are handled using Next.js's `redirect` function

### Error Handling
The guards handle various error scenarios:
1. Unauthenticated users are redirected to the signin page
2. Authenticated non-admin users are redirected to the dashboard
3. Database errors are treated as unauthorized access

## Performance Considerations

1. Guards only make the minimum necessary database queries
2. Server-side execution ensures no client-side redirects
3. Supabase session cookies are used for efficient authentication checks

## Security Considerations

1. Guards are implemented server-side to prevent client-side bypass
2. Admin checks verify both authentication and authorization
3. Redirects use safe, internal URLs only
4. No sensitive information is exposed in error messages

## Testing

The guards can be tested by:
1. Accessing protected routes while unauthenticated
2. Accessing admin routes as a non-admin user
3. Accessing protected routes as an authenticated user
4. Accessing admin routes as an admin user