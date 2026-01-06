"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  User,
  Lock,
  Bell,
  Palette,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pencil,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
  });
  const [originalProfileData, setOriginalProfileData] = useState({
    firstName: "",
    lastName: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user profile from database
  const { data: userProfile, isLoading: profileLoading } = trpc.user.getProfile.useQuery();

  // Mutations
  const utils = trpc.useUtils();
  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: async (data) => {
      // Update the original profile data to reflect the saved state
      setOriginalProfileData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
      });
      // Invalidate the profile query to refresh data
      await utils.user.getProfile.invalidate();
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const changePassword = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const exportData = trpc.user.exportData.useQuery(undefined, {
    enabled: false, // Only fetch when triggered
  });

  const deleteAccount = trpc.user.deleteAccount.useMutation({
    onSuccess: async () => {
      toast.success("Account deleted successfully");
      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete account");
      setIsDeleting(false);
    },
  });

  // Preload profile data from database
  useEffect(() => {
    if (userProfile) {
      const data = {
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
      };
      setProfileData(data);
      setOriginalProfileData(data);
    }
  }, [userProfile]);

  // Check if profile has changed
  const hasProfileChanged =
    profileData.firstName !== originalProfileData.firstName ||
    profileData.lastName !== originalProfileData.lastName;

  // Check if password form has valid changes
  const hasPasswordChanged =
    passwordData.currentPassword.length > 0 &&
    passwordData.newPassword.length >= 8 &&
    passwordData.newPassword === passwordData.confirmPassword;

  // Show loading state while session or profile is loading
  if (status === "loading" || profileLoading) {
    return (
      <div className="px-3 py-4 md:px-4 md:py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-48 md:h-64">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      firstName: profileData.firstName || undefined,
      lastName: profileData.lastName || undefined,
    });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    changePassword.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  // Helper function to escape CSV values
  const escapeCSV = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    // If the value contains comma, newline, or double quote, wrap in quotes and escape existing quotes
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Helper function to format date for CSV
  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    toast.info("Preparing your data export...");
    
    try {
      const result = await exportData.refetch();
      if (result.data) {
        // Define CSV headers
        const headers = [
          "Company",
          "Position",
          "Location",
          "Status",
          "Salary Min",
          "Salary Max",
          "Job URL",
          "Description",
          "Notes",
          "Applied Date",
          "Created At",
          "Updated At",
        ];

        // Build CSV rows from jobs data
        const rows: string[][] = [];
        
        if (result.data.jobs && Array.isArray(result.data.jobs)) {
          for (const job of result.data.jobs) {
            // Get the first application's status and applied date if available
            const application = job.applications?.[0];
            const status = application?.status || "";
            const appliedDate = application?.dateApplied;
            
            // Add job row
            rows.push([
              escapeCSV(job.company),
              escapeCSV(job.title),
              escapeCSV(job.location),
              escapeCSV(status),
              escapeCSV(job.salaryMin),
              escapeCSV(job.salaryMax),
              escapeCSV(job.jobLink),
              escapeCSV(job.description),
              escapeCSV(job.notes),
              formatDate(appliedDate),
              formatDate(job.createdAt),
              formatDate(job.updatedAt),
            ]);
          }
        }

        // Create CSV content
        const csvContent = [
          headers.join(","),
          ...rows.map(row => row.join(",")),
        ].join("\n");

        // Add BOM for Excel compatibility with UTF-8
        const BOM = "\uFEFF";
        const csvBlob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(csvBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `job-tracker-export-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Data exported successfully!");
      }
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }
    setIsDeleting(true);
    deleteAccount.mutate({ password: deletePassword });
  };

  return (
    <div className="px-3 py-4 md:px-4 md:py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
        <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Settings className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-xs md:text-base text-muted-foreground">
            Manage your account
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Profile Settings */}
        <Card className="bg-card border-border">
          <CardHeader className="p-3 md:p-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <CardTitle className="text-sm md:text-base">Profile</CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm">
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <form onSubmit={handleProfileUpdate} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-xs md:text-sm">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                    placeholder="John"
                    className="bg-background h-9 md:h-10 text-sm md:text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs md:text-sm">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                    placeholder="Doe"
                    className="bg-background h-9 md:h-10 text-sm md:text-base"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="bg-muted h-9 md:h-10 text-sm md:text-base"
                />
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
              <Button
                type="submit"
                disabled={updateProfile.isPending || !hasProfileChanged}
                className="h-9 md:h-10 text-sm md:text-base"
              >
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="bg-card border-border">
          <CardHeader className="p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <div>
                  <CardTitle className="text-sm md:text-base">Password</CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    {showPasswordForm ? "Update your password" : "Change your account password"}
                  </CardDescription>
                </div>
              </div>
              {!showPasswordForm && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 md:h-9 text-xs md:text-sm"
                  onClick={() => setShowPasswordForm(true)}
                >
                  <Pencil className="h-3.5 w-3.5 md:hidden" />
                  <span className="hidden md:inline">Change</span>
                </Button>
              )}
            </div>
          </CardHeader>
          {showPasswordForm && (
            <CardContent className="p-3 md:p-6 pt-0">
              <form onSubmit={handlePasswordChange} className="space-y-3 md:space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-xs md:text-sm">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="bg-background pr-10 h-9 md:h-10 text-sm md:text-base"
                      placeholder="Current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <Label htmlFor="newPassword" className="text-xs md:text-sm">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="bg-background pr-10 h-9 md:h-10 text-sm md:text-base"
                        placeholder="Min. 8 chars"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-xs md:text-sm">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="bg-background pr-10 h-9 md:h-10 text-sm md:text-base"
                        placeholder="Confirm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {passwordData.newPassword && passwordData.newPassword.length < 8 && (
                  <p className="text-[10px] md:text-xs text-amber-500">
                    Min. 8 characters required
                  </p>
                )}
                {passwordData.confirmPassword &&
                 passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-[10px] md:text-xs text-destructive">
                    Passwords don't match
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={changePassword.isPending || !hasPasswordChanged}
                    className="h-9 md:h-10 text-sm md:text-base"
                  >
                    {changePassword.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 md:h-10 text-sm md:text-base"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-card border-border">
          <CardHeader className="p-3 md:p-6">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <CardTitle className="text-sm md:text-base">Appearance</CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm">
              Customize the app
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm md:text-base">Theme</p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Light or dark mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="bg-card border-border">
          <CardHeader className="p-3 md:p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <CardTitle className="text-sm md:text-base">Notifications</CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm">
              Notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm md:text-base">Email Reminders</p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    Follow-up & deadline alerts
                  </p>
                </div>
                <span className="text-[10px] md:text-xs bg-muted text-muted-foreground px-1.5 md:px-2 py-0.5 md:py-1 rounded flex-shrink-0">
                  Soon
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm md:text-base">Weekly Summary</p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    Weekly job search report
                  </p>
                </div>
                <span className="text-[10px] md:text-xs bg-muted text-muted-foreground px-1.5 md:px-2 py-0.5 md:py-1 rounded flex-shrink-0">
                  Soon
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="bg-card border-border">
          <CardHeader className="p-3 md:p-6">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <CardTitle className="text-sm md:text-base">Data</CardTitle>
            </div>
            <CardDescription className="text-xs md:text-sm">
              Export or delete data
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 space-y-3 md:space-y-4">
            <div className="flex items-center justify-between gap-2 p-3 md:p-4 bg-muted/30 rounded-lg">
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm md:text-base">Export Data</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  Download as CSV (Excel compatible)
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData} disabled={isExporting} className="h-8 md:h-9 text-xs md:text-sm flex-shrink-0">
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                )}
                Export
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2 p-3 md:p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <div className="min-w-0">
                <p className="font-medium text-destructive text-sm md:text-base">Delete Account</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  Permanently delete all
                </p>
              </div>
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="h-8 md:h-9 text-xs md:text-sm flex-shrink-0">
                    <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                      This action cannot be undone. This will permanently delete your account and remove all your data including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All saved jobs and applications</li>
                        <li>Interview schedules and contacts</li>
                        <li>Shared links and settings</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-2">
                    <Label htmlFor="deletePassword" className="text-sm">
                      Enter your password to confirm
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        id="deletePassword"
                        type={showDeletePassword ? "text" : "password"}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Your password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showDeletePassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => {
                        setDeletePassword("");
                        setShowDeletePassword(false);
                      }}
                    >
                      Cancel
                    </AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || !deletePassword}
                    >
                      {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete Account
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
              <span>Role Riser v1.0.0</span>
              <span>Made with ❤️</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}