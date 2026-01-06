"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { handleSignOut } from "@/app/actions/auth";
import { useTransition } from "react";

interface SignOutButtonProps {
  variant?: "default" | "ghost" | "destructive" | "outline" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export function SignOutButton({ 
  variant = "ghost", 
  size = "sm", 
  className = "",
  showIcon = true,
  showText = true 
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await handleSignOut();
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isPending}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {showText && (isPending ? "Signing out..." : "Sign Out")}
    </Button>
  );
}