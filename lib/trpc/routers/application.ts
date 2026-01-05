import { z } from "zod";
import { router, protectedProcedure } from "../server";
import { TRPCError } from "@trpc/server";

export const applicationRouter = router({
  // Update application status
  updateStatus: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        status: z.enum([
          "BACKLOG",
          "SAVED",
          "TO_APPLY",
          "APPLIED",
          "ASSESSMENT",
          "INTERVIEW",
          "OFFER",
          "REJECTED",
          "WITHDRAWN",
        ]),
        dateApplied: z.date().optional(),
        deadline: z.date().optional(),
        nextFollowupAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check job ownership
      const job = await ctx.prisma.job.findUnique({
        where: { id: input.jobId },
        include: { applications: true },
      });

      if (!job || job.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const application = job.applications[0];
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updated = await ctx.prisma.application.update({
        where: { id: application.id },
        data: {
          status: input.status,
          dateApplied: input.dateApplied,
          deadline: input.deadline,
          nextFollowupAt: input.nextFollowupAt,
        },
      });

      return updated;
    }),

  // Add interview
  addInterview: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        type: z.string(),
        scheduledAt: z.date(),
        duration: z.number().optional(),
        location: z.string().optional(),
        interviewer: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { jobId, ...interviewData } = input;

      const job = await ctx.prisma.job.findUnique({
        where: { id: jobId },
        include: { applications: true },
      });

      if (!job || job.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const application = job.applications[0];
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const interview = await ctx.prisma.interview.create({
        data: {
          ...interviewData,
          applicationId: application.id,
        },
      });

      return interview;
    }),

  // Add contact
  addContact: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        name: z.string(),
        role: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        linkedin: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { jobId, ...contactData } = input;

      const job = await ctx.prisma.job.findUnique({
        where: { id: jobId },
        include: { applications: true },
      });

      if (!job || job.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const application = job.applications[0];
      if (!application) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const contact = await ctx.prisma.contact.create({
        data: {
          ...contactData,
          applicationId: application.id,
        },
      });

      return contact;
    }),
});