import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../server";
import { TRPCError } from "@trpc/server";

export const shareRouter = router({
  // Create share link
  create: protectedProcedure
    .input(
      z.object({
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const share = await ctx.prisma.share.create({
        data: {
          ownerId: ctx.user.id,
          expiresAt: input.expiresAt,
        },
      });

      return share;
    }),

  // Get share by token (public)
  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const share = await ctx.prisma.share.findUnique({
        where: { token: input.token },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!share) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Check expiration
      if (share.expiresAt && share.expiresAt < new Date()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Share link expired" });
      }

      return share;
    }),

  // Get jobs for shared view (public)
  getSharedJobs: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const share = await ctx.prisma.share.findUnique({
        where: { token: input.token },
      });

      if (!share) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (share.expiresAt && share.expiresAt < new Date()) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Share link expired" });
      }

      const jobs = await ctx.prisma.job.findMany({
        where: { userId: share.ownerId },
        include: {
          applications: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return jobs;
    }),

  // List user's shares
  list: protectedProcedure.query(async ({ ctx }) => {
    const shares = await ctx.prisma.share.findMany({
      where: { ownerId: ctx.user.id },
      orderBy: { createdAt: "desc" },
    });

    return shares;
  }),

  // Delete share
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const share = await ctx.prisma.share.findUnique({
        where: { id: input.id },
      });

      if (!share || share.ownerId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await ctx.prisma.share.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});