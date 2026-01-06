import { z } from "zod";
import { router, protectedProcedure } from "../server";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const userRouter = router({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return user;
  }),

  // Update profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      });

      return user;
    }),

  // Change password
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user with password
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Verify current password
      const isValid = await bcrypt.compare(input.currentPassword, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 12);

      // Update password
      await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: { password: hashedPassword },
      });

      return { success: true };
    }),

  // Export user data (jobs only, no sensitive info)
  exportData: protectedProcedure.query(async ({ ctx }) => {
    const jobs = await ctx.prisma.job.findMany({
      where: { userId: ctx.user.id },
      select: {
        company: true,
        title: true,
        location: true,
        jobLink: true,
        salaryMin: true,
        salaryMax: true,
        source: true,
        interest: true,
        description: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        applications: {
          select: {
            status: true,
            stage: true,
            dateApplied: true,
            dateSaved: true,
            deadline: true,
            outcome: true,
            outcomeNotes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      jobs,
    };
  }),

  // Delete account
  deleteAccount: protectedProcedure
    .input(
      z.object({
        password: z.string().min(1, "Password is required to delete account"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user with password
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Verify password
      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password is incorrect",
        });
      }

      // Delete user (cascades to jobs, applications, etc.)
      await ctx.prisma.user.delete({
        where: { id: ctx.user.id },
      });

      return { success: true };
    }),
});