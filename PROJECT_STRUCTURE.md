# Project Structure

Complete overview of the Job Tracker application architecture.

## Directory Tree

```
job-tracker/
├── app/                          # Next.js 15 App Router
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── dashboard/           # Main dashboard
│   │   │   └── page.tsx        # Dashboard with tabs (Kanban/Table/Today/Analytics)
│   │   └── layout.tsx          # Dashboard layout with navigation
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts    # tRPC API handler
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx        # Clerk sign-in page
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx        # Clerk sign-up page
│   ├── globals.css             # Global styles + Tailwind
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Landing page
│
├── components/
│   ├── forms/
│   │   └── QuickAddJob.tsx     # Job creation form with JD textarea
│   ├── kanban/
│   │   ├── JobCard.tsx         # Expandable job card component
│   │   └── KanbanBoard.tsx     # Drag-and-drop Kanban board
│   └── ui/                     # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
│
├── lib/
│   ├── trpc/
│   │   ├── routers/
│   │   │   ├── _app.ts         # Root router
│   │   │   ├── application.ts  # Application endpoints
│   │   │   ├── job.ts          # Job endpoints (with JD handling)
│   │   │   └── share.ts        # Share endpoints
│   │   ├── client.ts           # tRPC React client
│   │   ├── Provider.tsx        # tRPC + React Query provider
│   │   └── server.ts           # tRPC server setup
│   ├── prisma.ts               # Prisma client singleton
│   └── utils.ts                # Utility functions (cn, formatters, etc.)
│
├── prisma/
│   ├── schema.prisma           # Database schema with JD fields
│   └── seed.ts                 # Sample data with full job descriptions
│
├── public/
│   └── manifest.json           # PWA manifest
│
├── .env.example                # Environment variables template
├── .eslintrc.json             # ESLint configuration
├── .gitignore                 # Git ignore rules
├── FEATURES.md                # Feature implementation summary
├── middleware.ts              # Clerk authentication middleware
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── PROJECT_STRUCTURE.md       # This file
├── README.md                  # Main documentation
├── SETUP.md                   # Quick setup guide
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Key Files Explained

### Application Entry Points

#### `app/layout.tsx`

- Root layout for entire application
- Wraps app with ClerkProvider and TRPCProvider
- Loads global styles and fonts
- Sets up metadata for SEO and PWA

#### `app/page.tsx`

- Landing page with hero section
- Feature showcase
- Call-to-action buttons
- Links to sign-up/sign-in

#### `app/(dashboard)/layout.tsx`

- Protected dashboard layout
- Top navigation with user menu
- Tab navigation between views
- Toast notification container

#### `app/(dashboard)/dashboard/page.tsx`

- Main dashboard with 4 tabs:
  - Kanban: Drag-and-drop board
  - Table: List view (placeholder)
  - Today: Deadlines view (placeholder)
  - Analytics: Metrics view (placeholder)

### Core Components

#### `components/kanban/JobCard.tsx`

**Purpose**: Display job information with expandable description

**Features**:

- Compact card view with preview
- Click to expand full description in modal
- Shows company, title, location, status
- Interest rating with stars
- Next follow-up date
- Salary range
- Job posting link

**Props**:

```typescript
interface JobCardProps {
  job: any; // Job object with description
  onEdit?: () => void; // Edit callback
  onDelete?: () => void; // Delete callback
  isDragging?: boolean; // Drag state
}
```

#### `components/kanban/KanbanBoard.tsx`

**Purpose**: Drag-and-drop Kanban board

**Features**:

- 9 status columns
- Drag-and-drop between columns
- Real-time status updates
- Optimistic UI updates
- Empty state handling

**Dependencies**:

- `@hello-pangea/dnd` for drag-and-drop
- tRPC for data fetching and mutations

#### `components/forms/QuickAddJob.tsx`

**Purpose**: Modal form for adding new jobs

**Features**:

- Large textarea (8 rows) for job descriptions
- Live preview of description truncation
- URL parameter prefill support
- All job fields with validation
- Toast notifications on success/error

**Form Fields**:

- Company\* (required)
- Title\* (required)
- Location
- Job Link (URL)
- Description (up to 10,000 chars)
- Salary Range (min/max)
- Source
- Interest (1-10)
- Initial Status
- Notes

### API Layer (tRPC)

#### `lib/trpc/routers/job.ts`

**Job Description Handling**:

```typescript
// Auto-generate preview on create
create: protectedProcedure
  .input(
    z.object({
      description: z.string().max(10000).optional(),
      // ... other fields
    })
  )
  .mutation(async ({ ctx, input }) => {
    const descPreview = generateDescPreview(input.description);
    // Create job with preview
  });

// Auto-update preview on update
update: protectedProcedure
  .input(
    z.object({
      description: z.string().max(10000).optional(),
      // ... other fields
    })
  )
  .mutation(async ({ ctx, input }) => {
    const descPreview =
      input.description !== undefined
        ? generateDescPreview(input.description)
        : undefined;
    // Update job with new preview
  });
```

**Key Endpoints**:

- `getAll`: Search across descriptions
- `getByStatus`: Group by status for Kanban
- `getToday`: Filter by deadlines
- `getAnalytics`: Calculate metrics

#### `lib/trpc/routers/application.ts`

**Application Management**:

- `updateStatus`: Change application status
- `addInterview`: Schedule interviews
- `addContact`: Add hiring contacts

#### `lib/trpc/routers/share.ts`

**Collaboration Features**:

- `create`: Generate share link
- `getByToken`: Public access to share
- `getSharedJobs`: Get jobs for shared view
- `list`: User's active shares
- `delete`: Revoke share access

### Database Schema

#### `prisma/schema.prisma`

**Job Model** (with JD support):

```prisma
model Job {
  id          String   @id @default(cuid())
  userId      String
  company     String
  title       String
  description String?  @db.Text      // Full JD (up to 10k chars)
  descPreview String?                // Auto-generated preview
  // ... other fields
}
```

**Key Features**:

- Full-text search on descriptions
- Cascading deletes
- Indexed fields for performance
- Timestamps for tracking

### Utilities

#### `lib/utils.ts`

**Key Functions**:

```typescript
// Generate description preview
generateDescPreview(description: string): string | null

// Format dates
formatDate(date: Date): string
formatDateTime(date: Date): string

// Get status colors
getStatusColor(status: string): string

// Get interest stars
getInterestStars(interest: number): string

// Check if overdue
isOverdue(date: Date): boolean

// Tailwind class merger
cn(...inputs: ClassValue[]): string
```

### Configuration Files

#### `next.config.ts`

- TypeScript configuration
- Server actions settings
- Build optimizations

#### `tailwind.config.ts`

- Custom color scheme
- shadcn/ui integration
- Animation plugin
- Responsive breakpoints

#### `tsconfig.json`

- Strict mode enabled
- Path aliases (@/\*)
- Modern ES features
- Next.js plugin

#### `middleware.ts`

- Clerk authentication
- Route protection
- Public route matching

## Data Flow

### 1. User Creates Job

```
User fills form → QuickAddJob component
  ↓
Calls trpc.job.create.mutate()
  ↓
tRPC router (job.ts)
  ↓
Generates descPreview from description
  ↓
Prisma creates Job + Application
  ↓
React Query invalidates cache
  ↓
UI updates with new job
```

### 2. User Views Job Description

```
User clicks job card → JobCard component
  ↓
Shows descPreview in card
  ↓
User clicks "Read more"
  ↓
Opens Dialog with full description
  ↓
Scrollable modal with formatted text
```

### 3. User Drags Job

```
User drags card → KanbanBoard
  ↓
@hello-pangea/dnd handles drag
  ↓
onDragEnd callback fires
  ↓
Calls trpc.application.updateStatus.mutate()
  ↓
Optimistic UI update (instant)
  ↓
Server updates database
  ↓
React Query syncs state
```

## State Management

### React Query (TanStack Query)

- Caching layer for tRPC
- Automatic refetching
- Optimistic updates
- Background sync

### tRPC

- Type-safe API calls
- Automatic TypeScript inference
- Zod validation
- Error handling

### Clerk

- User session state
- Authentication status
- User profile data

## Styling Architecture

### Tailwind CSS

- Utility-first approach
- Custom design tokens
- Responsive utilities
- Dark mode support (configured)

### shadcn/ui

- Accessible components
- Radix UI primitives
- Customizable with Tailwind
- Consistent design system

### Custom CSS

- Kanban column styles
- Card animations
- Scrollbar styling
- Global resets

## Performance Optimizations

1. **React Query Caching**: 5-second stale time
2. **Optimistic Updates**: Instant UI feedback
3. **Code Splitting**: Automatic with App Router
4. **Lazy Loading**: Suspense boundaries
5. **Database Indexing**: On userId, status, dates
6. **Image Optimization**: Next.js automatic

## Security Measures

1. **Authentication**: Clerk middleware on all routes
2. **Authorization**: userId checks in all queries
3. **Input Validation**: Zod schemas on all inputs
4. **SQL Injection**: Prevented by Prisma
5. **XSS Protection**: React automatic escaping
6. **CSRF**: Clerk built-in protection

## Development Workflow

1. **Local Development**: `npm run dev`
2. **Database Changes**: Edit schema → `npm run db:push`
3. **Type Generation**: Automatic with Prisma
4. **Testing**: Manual testing (no tests yet)
5. **Linting**: `npm run lint`
6. **Building**: `npm run build`

## Deployment Architecture

```
Vercel (Frontend + API)
  ↓
Next.js App
  ↓
tRPC API Routes
  ↓
Neon/Supabase (PostgreSQL)

Clerk (Authentication)
  ↓
User Management
```

## Environment Variables

**Required**:

- `DATABASE_URL`: PostgreSQL connection
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key

**Optional**:

- `NEXT_PUBLIC_APP_URL`: App URL (defaults to localhost)
- Stripe keys (for future billing)

## Future Enhancements

See [FEATURES.md](FEATURES.md) for detailed roadmap.

---

**Last Updated**: 2026-01-05
