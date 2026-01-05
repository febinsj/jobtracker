# Migration Guide: Clerk to Custom Authentication

This guide explains the changes made to replace Clerk authentication with a custom NextAuth.js implementation.

## Overview

The application has been migrated from Clerk to NextAuth.js with custom sign-in and sign-up pages. This provides full control over the authentication flow and user interface.

## Changes Made

### 1. Database Schema Updates

**File:** [`prisma/schema.prisma`](prisma/schema.prisma)

- Removed `clerkId` field from User model
- Added `password` field for password-based authentication
- Updated indexes to remove `clerkId` index

**Migration Required:** You need to run database migrations to update your schema.

```bash
npx prisma migrate dev --name remove_clerk_add_password
```

### 2. Dependencies

**Removed:**

- `@clerk/nextjs`

**Added:**

- `next-auth@^5.0.0-beta.25` - Authentication framework
- `bcryptjs` - Password hashing

### 3. Authentication Configuration

**New File:** [`lib/auth.ts`](lib/auth.ts:1)

- Configures NextAuth.js with credentials provider
- Handles user authentication with email/password
- Implements JWT session strategy

**New File:** [`app/api/auth/[...nextauth]/route.ts`](app/api/auth/[...nextauth]/route.ts:1)

- NextAuth.js API route handler

### 4. User Registration

**New File:** [`app/api/auth/register/route.ts`](app/api/auth/register/route.ts:1)

- API endpoint for user registration
- Validates input with Zod
- Hashes passwords with bcryptjs
- Creates new users in database

### 5. Sign-In Page

**Updated File:** [`app/sign-in/page.tsx`](app/sign-in/page.tsx:1)

- Custom sign-in form with email and password fields
- Client-side form validation
- Error handling and loading states
- Link to sign-up page

**Removed:** `app/sign-in/[[...sign-in]]/page.tsx` (Clerk catch-all route)

### 6. Sign-Up Page

**Updated File:** [`app/sign-up/page.tsx`](app/sign-up/page.tsx:1)

- Custom sign-up form with email, password, and name fields
- Password confirmation validation
- Calls registration API endpoint
- Redirects to sign-in after successful registration

**Removed:** `app/sign-up/[[...sign-up]]/page.tsx` (Clerk catch-all route)

### 7. Middleware

**Updated File:** [`middleware.ts`](middleware.ts:1)

- Replaced Clerk middleware with NextAuth.js middleware
- Protects routes based on authentication status
- Redirects unauthenticated users to sign-in
- Redirects authenticated users away from auth pages

### 8. Layout Updates

**Updated File:** [`app/layout.tsx`](app/layout.tsx:1)

- Removed `ClerkProvider`
- Added `SessionProvider` from next-auth/react

**Updated File:** [`app/(dashboard)/layout.tsx`](<app/(dashboard)/layout.tsx:1>)

- Removed `UserButton` from Clerk
- Added custom user menu with sign-out button
- Uses `useSession` hook to display user information

### 9. tRPC Context

**Updated File:** [`lib/trpc/server.ts`](lib/trpc/server.ts:1)

- Replaced Clerk's `auth()` with NextAuth's `auth()`
- Updated context to use NextAuth session
- Modified protected procedure to work with new auth system

### 10. Environment Variables

**Updated File:** [`.env.example`](.env.example:1)

**Removed:**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
```

**Added:**

```env
AUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## Setup Instructions

### 1. Update Environment Variables

Copy the new environment variables to your `.env` file:

```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env
AUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
```

### 2. Run Database Migration

```bash
npx prisma migrate dev --name remove_clerk_add_password
```

### 3. Install Dependencies

Dependencies should already be installed, but if needed:

```bash
npm install
```

### 4. Migrate Existing Users (If Applicable)

If you have existing users from Clerk, you'll need to:

1. Export user data from Clerk
2. Create a migration script to:
   - Hash passwords (users will need to reset passwords)
   - Map Clerk user IDs to new user records
   - Update foreign key references

### 5. Test the Application

```bash
npm run dev
```

Visit:

- Sign up: http://localhost:3000/sign-up
- Sign in: http://localhost:3000/sign-in
- Dashboard: http://localhost:3000/dashboard

## Key Differences

### Authentication Flow

**Clerk:**

- Managed authentication UI
- External user management
- Automatic session handling

**Custom NextAuth.js:**

- Full control over UI/UX
- Users stored in your database
- Custom session management
- Password-based authentication

### User Management

**Before (Clerk):**

- Users managed in Clerk dashboard
- `clerkId` used as reference
- Automatic user sync

**After (Custom):**

- Users managed in your database
- Direct user ID references
- Manual user creation via registration API

### Session Management

**Before (Clerk):**

```typescript
const { userId } = await auth();
```

**After (NextAuth):**

```typescript
const session = await auth();
const userId = session?.user?.id;
```

## Security Considerations

1. **Password Storage:** Passwords are hashed using bcryptjs with salt rounds
2. **Session Security:** JWT tokens are signed with AUTH_SECRET
3. **HTTPS Required:** In production, ensure NEXTAUTH_URL uses HTTPS
4. **Secret Management:** Keep AUTH_SECRET secure and never commit it

## Troubleshooting

### "Invalid email or password" on sign-in

- Ensure user exists in database
- Verify password was hashed correctly during registration

### Middleware redirect loops

- Check that public routes are properly defined in middleware
- Verify AUTH_SECRET is set in environment variables

### Session not persisting

- Ensure NEXTAUTH_URL matches your application URL
- Check that cookies are enabled in browser

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [NextAuth.js v5 Beta Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Prisma Authentication Guide](https://www.prisma.io/docs/guides/authentication)
