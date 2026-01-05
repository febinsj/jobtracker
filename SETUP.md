# Quick Setup Guide

Get your Job Tracker app running in 5 minutes!

## Prerequisites

- Node.js 18+ or 20+ ([Download](https://nodejs.org))
- A PostgreSQL database (we recommend [Neon](https://neon.tech) - free tier available)
- A Clerk account ([Sign up](https://clerk.com) - free tier available)

## Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd job-tracker

# Install dependencies
npm install
```

## Step 2: Set Up Database (1 minute)

### Option A: Neon (Recommended - Easiest)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Click "Create Project"
3. Copy your connection string
4. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb`

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection pooling" string (for production) or direct connection
5. It looks like: `postgresql://postgres.xxx:pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

### Option C: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb jobtracker

# Your connection string:
# postgresql://localhost:5432/jobtracker
```

## Step 3: Set Up Clerk (1 minute)

1. Go to [clerk.com](https://clerk.com) and sign up
2. Click "Add application"
3. Choose "Next.js" as your framework
4. Copy your API keys from the dashboard

## Step 4: Configure Environment (30 seconds)

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="your-connection-string-here"

# Clerk (from your Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs (keep these as-is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Initialize Database (30 seconds)

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npm run db:push

# (Optional) Add sample data
npm run db:seed
```

## Step 6: Run the App! (10 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

## Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client errors

```bash
npx prisma generate
```

### Database connection fails

- Check your `DATABASE_URL` is correct
- Ensure your database is running
- For Neon/Supabase, check your IP is allowed (usually auto-allowed)

### Clerk authentication issues

- Verify your API keys are correct
- Check you're using the right environment (development vs production keys)
- Ensure redirect URLs match your setup

## Next Steps

1. **Sign up** at [http://localhost:3000/sign-up](http://localhost:3000/sign-up)
2. **Add your first job** using the "Add Job" button
3. **Paste a full job description** to see the expand feature
4. **Drag jobs** between columns on the Kanban board
5. **Explore** the different views (Table, Today, Analytics)

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema changes
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed sample data
```

## Deploy to Production

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Add environment variables:
   - `DATABASE_URL` (your production database)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
6. Click "Deploy"

### Update Clerk for Production

1. Go to your Clerk dashboard
2. Add your production URL to allowed origins
3. Update redirect URLs if needed

## Features to Try

### 1. Job Descriptions

- Click "Add Job"
- Paste a full job description in the large textarea
- See the auto-generated preview
- Click "Read more" on the card to expand

### 2. Kanban Board

- Drag jobs between status columns
- Watch status update automatically
- Click cards to see full details

### 3. Quick Add with URL

Try this URL to prefill the form:

```
http://localhost:3000/dashboard?company=Google&title=Software%20Engineer&desc=Looking%20for%20a%20talented%20engineer...
```

### 4. Search

- Search by company name
- Search by job title
- Search within job descriptions

### 5. Interest Rating

- Rate jobs 1-10 stars
- See visual star rating on cards
- Sort by interest level

## Need Help?

- 📖 Check the [README.md](README.md) for detailed documentation
- 🎯 See [FEATURES.md](FEATURES.md) for complete feature list
- 🐛 Open an issue on GitHub
- 💬 Check existing issues for solutions

## Pro Tips

1. **Use the seed data** to see the app in action immediately
2. **Paste real job descriptions** to test the expand feature
3. **Set up reminders** for follow-ups and deadlines
4. **Share your board** with mentors for feedback
5. **Export to CSV** (coming soon) for backup

---

Happy job hunting! 🚀
