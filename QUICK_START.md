# Quick Start - Get Running in 3 Minutes

You're seeing the error because you need to set up your database connection. Here's how:

## Step 1: Create .env File (30 seconds)

Create a file named `.env` in the root directory (same level as package.json):

```bash
# Copy the example file
cp .env.example .env
```

Or create it manually with this content:

```env
# Database - REPLACE THIS with your actual database URL
DATABASE_URL="postgresql://user:password@localhost:5432/jobtracker"

# Clerk - Get these from clerk.com after signing up
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 2: Get a FREE PostgreSQL Database (2 minutes)

### Option A: Neon (Easiest - Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Click "Sign Up" (free, no credit card)
3. Click "Create Project"
4. Copy the connection string that looks like:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
   ```
5. Paste it in your `.env` file as `DATABASE_URL`

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Create new project
4. Go to Settings → Database
5. Copy "Connection pooling" string
6. Paste in `.env` as `DATABASE_URL`

### Option C: Local PostgreSQL (If you have it installed)

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb jobtracker

# Your DATABASE_URL:
DATABASE_URL="postgresql://localhost:5432/jobtracker"
```

## Step 3: Set Up Clerk Auth (1 minute)

1. Go to [clerk.com](https://clerk.com)
2. Sign up (free)
3. Click "Add application"
4. Copy your keys from the dashboard
5. Paste them in `.env`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

## Step 4: Initialize Database (30 seconds)

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npm run db:push

# (Optional) Add sample data
npm run db:seed
```

## Step 5: Run the App! (10 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

- ✅ Make sure `.env` file exists in root directory
- ✅ Check file is named exactly `.env` (not `.env.txt`)
- ✅ Restart your terminal after creating `.env`

### "Can't connect to database"

- ✅ Check your DATABASE_URL is correct
- ✅ For Neon/Supabase, make sure you copied the full connection string
- ✅ For local PostgreSQL, make sure it's running: `brew services list`

### "Clerk authentication error"

- ✅ Make sure you copied both keys (publishable and secret)
- ✅ Check there are no extra spaces in the keys
- ✅ Verify keys are from the correct environment (development)

## What Each Service Provides

- **Neon/Supabase**: Free PostgreSQL database in the cloud
- **Clerk**: User authentication (sign up, sign in, user management)
- **Your App**: The Job Tracker application

## Example .env File (Fill in your values)

```env
# Get from Neon or Supabase
DATABASE_URL="postgresql://alex:AbC123@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb"

# Get from Clerk dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_Y2xlcmsuZXhhbXBsZS5jb20k"
CLERK_SECRET_KEY="sk_test_1234567890abcdefghijklmnopqrstuvwxyz"

# Keep these as-is
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Next Steps After Setup

1. **Sign up** at http://localhost:3000/sign-up
2. **Add your first job** with the "Add Job" button
3. **Paste a job description** to see the expand feature
4. **Drag jobs** between columns
5. **Explore** different views (Table, Today, Analytics)

---

**Need help?** Check the full [README.md](README.md) or [SETUP.md](SETUP.md) for detailed instructions.
