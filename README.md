# Job Tracker - Multi-User SaaS Application

A comprehensive job application tracking system built with Next.js 15, featuring Kanban boards, analytics, and collaboration tools. Track your job search with expandable job descriptions, reminders, and shareable boards.

## Features

- 🎯 **Kanban Board** - Drag-and-drop job applications with expandable job descriptions
- 📊 **Analytics Dashboard** - Track application success rates and conversion metrics
- 📅 **Smart Reminders** - Never miss deadlines or follow-ups
- 🔗 **Share Boards** - Collaborate with mentors via read-only share links
- 📱 **PWA Support** - Install as a mobile app with offline capabilities
- 🔍 **Full-Text Search** - Search across companies, titles, and job descriptions
- 📝 **Job Descriptions** - Paste full JD text with auto-generated previews
- 📈 **Table View** - Sortable, filterable list view with CSV export

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: Clerk
- **API**: tRPC v11
- **UI**: shadcn/ui + Tailwind CSS
- **State**: TanStack Query
- **Icons**: Lucide React
- **Drag & Drop**: @hello-pangea/dnd

## Prerequisites

- Node.js 18+ or 20+ ([Download](https://nodejs.org))
- PostgreSQL database (Neon or Supabase recommended)
- Clerk account for authentication

## Quick Start

### 1. Clone and Install

\`\`\`bash
git clone <your-repo-url>
cd job-tracker
npm install
\`\`\`

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

\`\`\`env

# Database (Neon/Supabase PostgreSQL)

DATABASE_URL="postgresql://user:password@host:5432/jobtracker?schema=public"

# Clerk Authentication

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# App URL

NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Set Up Database

\`\`\`bash

# Generate Prisma Client

npx prisma generate

# Push schema to database

npm run db:push

# Or run migrations (for production)

npm run db:migrate

# (Optional) Seed with sample data

npm run db:seed
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Option 1: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env` as `DATABASE_URL`

### Option 2: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection pooling" for production)
5. Add to `.env` as `DATABASE_URL`

### Option 3: Local PostgreSQL

\`\`\`bash

# Install PostgreSQL

brew install postgresql # macOS

# or use Docker

docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Create database

createdb jobtracker

# Update .env

DATABASE_URL="postgresql://user:password@localhost:5432/jobtracker?schema=public"
\`\`\`

## Clerk Setup

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Go to API Keys
4. Copy the publishable and secret keys
5. Add to `.env`:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables from `.env`
5. Deploy!

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:

- `DATABASE_URL` - Your production PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., https://yourapp.vercel.app)

## Project Structure

\`\`\`
job-tracker/
├── app/ # Next.js 15 App Router
│ ├── (dashboard)/ # Protected dashboard routes
│ │ ├── dashboard/ # Main dashboard with tabs
│ │ ├── jobs/ # Job detail pages
│ │ └── layout.tsx # Dashboard layout with nav
│ ├── api/trpc/ # tRPC API routes
│ ├── sign-in/ # Clerk sign-in page
│ ├── sign-up/ # Clerk sign-up page
│ ├── share/ # Public share pages
│ ├── layout.tsx # Root layout
│ └── page.tsx # Landing page
├── components/
│ ├── ui/ # shadcn/ui components
│ ├── kanban/ # Kanban board components
│ ├── forms/ # Form components
│ └── dashboard/ # Dashboard-specific components
├── lib/
│ ├── trpc/ # tRPC setup and routers
│ ├── prisma.ts # Prisma client
│ └── utils.ts # Utility functions
├── prisma/
│ ├── schema.prisma # Database schema
│ └── seed.ts # Seed data
└── public/ # Static assets
\`\`\`

## Key Features Explained

### Job Descriptions

- **Full Text Storage**: Paste entire job descriptions (up to 10,000 characters)
- **Auto Preview**: First 100 characters automatically extracted
- **Expandable Cards**: Click "Read more" to view full description in modal
- **Search**: Full-text search across all job descriptions

### Kanban Board

- **Drag & Drop**: Move jobs between status columns
- **Status Columns**: Backlog, Saved, To Apply, Applied, Assessment, Interview, Offer, Rejected, Withdrawn
- **Card Preview**: Company, Title, Status badge, Interest stars, Description preview
- **Quick Actions**: Edit, Delete, View details from card menu

### Analytics

- **Conversion Rates**: Track application → interview → offer rates
- **Weekly Trends**: Applications per week chart
- **Status Distribution**: Pie chart of job statuses
- **Success Metrics**: Overall statistics and insights

### Sharing

- **Generate Link**: Create shareable read-only board link
- **Expiration**: Optional expiration date for shares
- **Public Access**: No login required for viewers
- **Privacy**: Only shared data is visible

## API Routes

### tRPC Endpoints

- `job.getAll` - Get all user's jobs
- `job.getById` - Get single job with details
- `job.create` - Create new job with description
- `job.update` - Update job (auto-updates preview)
- `job.delete` - Delete job
- `job.getByStatus` - Get jobs grouped by status (Kanban)
- `job.getToday` - Get today's deadlines and follow-ups
- `job.getAnalytics` - Get analytics data
- `application.updateStatus` - Update application status
- `application.addInterview` - Add interview
- `application.addContact` - Add contact
- `share.create` - Create share link
- `share.getByToken` - Get share by token (public)
- `share.getSharedJobs` - Get jobs for shared view (public)

## Scripts

\`\`\`bash
npm run dev # Start development server with Turbopack
npm run build # Build for production
npm run start # Start production server
npm run lint # Run ESLint
npm run db:push # Push schema changes to database
npm run db:migrate # Run migrations
npm run db:studio # Open Prisma Studio
npm run db:seed # Seed database with sample data
\`\`\`

## Troubleshooting

### Prisma Client Not Found

\`\`\`bash
npx prisma generate
\`\`\`

### Database Connection Issues

- Check `DATABASE_URL` format
- Ensure database is running
- Verify network access (for cloud databases)

### Clerk Authentication Issues

- Verify API keys are correct
- Check redirect URLs match your setup
- Ensure middleware is configured

### Build Errors

\`\`\`bash

# Clear Next.js cache

rm -rf .next

# Reinstall dependencies

rm -rf node_modules package-lock.json
npm install
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:

- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation

## Roadmap

- [ ] Email notifications for deadlines
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Resume/cover letter attachment storage
- [ ] Interview prep notes and questions
- [ ] Salary negotiation tracker
- [ ] Job board integrations (LinkedIn, Indeed)
- [ ] Mobile app (React Native)
- [ ] AI-powered job description analysis
- [ ] Chrome extension for quick saves

---

Built with ❤️ using Next.js 15, tRPC, and Prisma
