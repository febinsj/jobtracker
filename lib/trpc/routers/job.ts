import { z } from "zod";
import { router, protectedProcedure } from "../server";
import { generateDescPreview } from "@/lib/utils";
import { TRPCError } from "@trpc/server";

export const jobRouter = router({
  // Get all jobs for current user
  getAll: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        userId: ctx.user.id,
      };

      if (input.search) {
        where.OR = [
          { company: { contains: input.search, mode: "insensitive" } },
          { title: { contains: input.search, mode: "insensitive" } },
          { description: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const jobs = await ctx.prisma.job.findMany({
        where,
        include: {
          applications: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Filter by status if provided (status is on Application)
      if (input.status) {
        return jobs.filter((job) =>
          job.applications.some((app) => app.status === input.status)
        );
      }

      return jobs;
    }),

  // Get single job by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.id },
        include: {
          applications: {
            include: {
              interviews: true,
              contacts: true,
            },
          },
        },
      });

      if (!job || job.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return job;
    }),

  // Create new job with description
  create: protectedProcedure
    .input(
      z.object({
        company: z.string().min(1),
        title: z.string().min(1),
        location: z.string().optional(),
        jobLink: z.string().url().optional().or(z.literal("")),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        source: z.string().optional(),
        interest: z.number().min(1).max(10).default(5),
        description: z.string().max(10000).optional(),
        notes: z.string().optional(),
        status: z.string().default("TO_APPLY"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { status, ...jobData } = input;
      
      // Auto-generate description preview
      const descPreview = generateDescPreview(input.description);

      const job = await ctx.prisma.job.create({
        data: {
          ...jobData,
          descPreview,
          userId: ctx.user.id,
          applications: {
            create: {
              status: status as any,
              dateSaved: new Date(),
            },
          },
        },
        include: {
          applications: true,
        },
      });

      return job;
    }),

  // Update job
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        company: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        location: z.string().optional(),
        jobLink: z.string().url().optional().or(z.literal("")),
        salaryMin: z.number().optional(),
        salaryMax: z.number().optional(),
        source: z.string().optional(),
        interest: z.number().min(1).max(10).optional(),
        description: z.string().max(10000).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check ownership
      const existing = await ctx.prisma.job.findUnique({
        where: { id },
      });

      if (!existing || existing.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Auto-generate description preview if description is updated
      const descPreview =
        data.description !== undefined
          ? generateDescPreview(data.description)
          : undefined;

      const job = await ctx.prisma.job.update({
        where: { id },
        data: {
          ...data,
          ...(descPreview !== undefined && { descPreview }),
        },
        include: {
          applications: true,
        },
      });

      return job;
    }),

  // Delete job
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.id },
      });

      if (!job || job.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.job.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Get jobs grouped by status (for Kanban)
  getByStatus: protectedProcedure.query(async ({ ctx }) => {
    const jobs = await ctx.prisma.job.findMany({
      where: { userId: ctx.user.id },
      include: {
        applications: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by application status
    const grouped: Record<string, any[]> = {
      BACKLOG: [],
      SAVED: [],
      TO_APPLY: [],
      APPLIED: [],
      ASSESSMENT: [],
      INTERVIEW: [],
      OFFER: [],
      REJECTED: [],
      WITHDRAWN: [],
    };

    jobs.forEach((job) => {
      const app = job.applications[0];
      if (app && grouped[app.status]) {
        grouped[app.status].push({ ...job, application: app });
      }
    });

    return grouped;
  }),

  // Get today's items (overdue + upcoming deadlines)
  getToday: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const jobs = await ctx.prisma.job.findMany({
      where: {
        userId: ctx.user.id,
        applications: {
          some: {
            OR: [
              {
                nextFollowupAt: {
                  lte: endOfDay,
                },
              },
              {
                deadline: {
                  lte: endOfDay,
                },
              },
            ],
          },
        },
      },
      include: {
        applications: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return jobs;
  }),

  // Get analytics data
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const jobs = await ctx.prisma.job.findMany({
      where: { userId: ctx.user.id },
      include: {
        applications: true,
      },
    });

    const statusCounts: Record<string, number> = {};
    const weeklyApplications: Record<string, number> = {};

    jobs.forEach((job) => {
      const app = job.applications[0];
      if (app) {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;

        if (app.dateApplied) {
          const weekKey = new Date(app.dateApplied).toISOString().split("T")[0];
          weeklyApplications[weekKey] = (weeklyApplications[weekKey] || 0) + 1;
        }
      }
    });

    const totalJobs = jobs.length;
    
    // Count jobs that have been applied (includes all statuses after APPLIED in the pipeline)
    // Jobs in APPLIED, ASSESSMENT, INTERVIEW, OFFER, REJECTED, WITHDRAWN have all been applied
    const appliedStatuses = ['APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'];
    const totalApplied = appliedStatuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
    
    // Jobs that reached interview stage (INTERVIEW, OFFER, REJECTED after interview, WITHDRAWN after interview)
    // For simplicity, count INTERVIEW + OFFER (as they definitely had interviews)
    const interviewedStatuses = ['INTERVIEW', 'OFFER'];
    const totalInterviewed = interviewedStatuses.reduce((sum, status) => sum + (statusCounts[status] || 0), 0);
    
    const offerCount = statusCounts.OFFER || 0;
    const rejectedCount = statusCounts.REJECTED || 0;

    return {
      totalJobs,
      statusCounts,
      weeklyApplications,
      // Interview rate: % of applied jobs that reached interview stage
      conversionRate: totalApplied > 0 ? (totalInterviewed / totalApplied) * 100 : 0,
      // Offer rate: % of applied jobs that received offers
      offerRate: totalApplied > 0 ? (offerCount / totalApplied) * 100 : 0,
      // Rejection rate: % of applied jobs that were rejected
      rejectionRate: totalApplied > 0 ? (rejectedCount / totalApplied) * 100 : 0,
    };
  }),
});