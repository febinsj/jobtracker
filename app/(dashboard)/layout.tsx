"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Briefcase,
  LayoutDashboard,
  Share2,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Plus
} from "lucide-react";
import { Toaster } from "sonner";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuickAddJob } from "@/components/forms/QuickAddJob";
import { trpc } from "@/lib/trpc/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Fetch user profile from database for up-to-date name
  const { data: userProfile } = trpc.user.getProfile.useQuery(undefined, {
    enabled: !!session?.user,
  });
  
  // Get display name from profile (database) or fall back to session
  const displayName = userProfile?.firstName && userProfile?.lastName
    ? `${userProfile.firstName} ${userProfile.lastName}`
    : userProfile?.firstName || session?.user?.name || session?.user?.email;

  const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
    { href: "/dashboard/shares", label: "Share", icon: Share2 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      // Call the signOut API endpoint directly to ensure cookie is deleted
      const response = await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callbackUrl: "/sign-in" }),
      });

      if (response.ok) {
        // Manually clear any auth cookies on client side as backup
        document.cookie = "authjs.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "authjs.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "authjs.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "__Secure-authjs.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
        
        // Force a full page reload to sign-in page
        window.location.href = "/sign-in";
      } else {
        console.error("Sign out failed:", response.status);
        // Still try to redirect
        window.location.href = "/sign-in";
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // On error, still try to redirect to sign-in
      window.location.href = "/sign-in";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Simplified for mobile */}
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              <span className="text-lg md:text-xl font-bold text-foreground">Role Riser</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Add Job Button - visible on mobile */}
              <div className="md:hidden">
                <QuickAddJob />
              </div>
              
              <ThemeToggle />
              
              {/* Desktop user info */}
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="max-w-[150px] truncate">
                    {displayName}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card animate-in slide-in-from-top duration-200">
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {displayName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-3 px-3 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content - with padding for bottom nav on mobile */}
      <main className="pb-20 md:pb-0 min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span className={`text-xs mt-1 ${isActive ? "font-medium" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Toast Notifications - positioned above bottom nav on mobile */}
      <Toaster
        position="top-center"
        toastOptions={{
          className: "bg-card text-card-foreground border-border",
        }}
      />
    </div>
  );
}