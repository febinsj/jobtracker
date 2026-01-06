"use server";

import { signOut } from "@/lib/auth";

/**
 * Server action for signing out
 * This is more reliable than client-side signOut on Netlify/serverless platforms
 */
export async function handleSignOut() {
  await signOut({ redirectTo: "/sign-in" });
}