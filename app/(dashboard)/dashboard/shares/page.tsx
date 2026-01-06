"use client";

import { useState } from "react";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate, formatDateTime } from "@/lib/utils";
import {
  Loader2,
  Share2,
  Plus,
  Copy,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function SharesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteShareId, setDeleteShareId] = useState<string | null>(null);
  const [expirationDays, setExpirationDays] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: shares, isLoading } = trpc.share.list.useQuery();

  const createShare = trpc.share.create.useMutation({
    onSuccess: (share) => {
      utils.share.list.invalidate();
      setCreateDialogOpen(false);
      setExpirationDays("");
      toast.success("Share link created!");
      copyToClipboard(share.token);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create share link");
    },
  });

  const deleteShare = trpc.share.delete.useMutation({
    onSuccess: () => {
      utils.share.list.invalidate();
      setDeleteShareId(null);
      toast.success("Share link deleted!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete share link");
    },
  });

  const handleCreate = () => {
    const expiresAt = expirationDays
      ? new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000)
      : undefined;
    createShare.mutate({ expiresAt });
  };

  const copyToClipboard = async (token: string) => {
    const shareUrl = `${window.location.origin}/shared/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(token);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const getShareUrl = (token: string) => {
    return `${typeof window !== "undefined" ? window.location.origin : ""}/shared/${token}`;
  };

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="px-3 py-4 md:px-4 md:py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-48 md:h-64">
          <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-4 md:px-4 md:py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Share2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-foreground truncate">Share Links</h1>
            <p className="text-xs md:text-base text-muted-foreground">
              Share your progress
            </p>
          </div>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1.5 md:gap-2 h-9 md:h-10 text-sm md:text-base px-3 md:px-4">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Link</span>
              <span className="sm:hidden">New</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">Create Share Link</DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                Share your job search progress with others.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3 md:py-4">
              <div>
                <Label htmlFor="expiration" className="text-xs md:text-sm">Expiration (optional)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="expiration"
                    type="number"
                    min="1"
                    placeholder="Days"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    className="bg-background h-9 md:h-10 text-sm md:text-base"
                  />
                  <span className="text-xs md:text-sm text-muted-foreground">days</span>
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  Leave empty for no expiration
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="h-9 md:h-10 text-sm md:text-base"
                >
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createShare.isPending} className="h-9 md:h-10 text-sm md:text-base">
                  {createShare.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {shares?.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-6 md:p-8 text-center">
            <LinkIcon className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2 text-foreground">
              No share links yet
            </h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Create a link to share your progress.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 h-9 md:h-10 text-sm md:text-base">
              <Plus className="h-4 w-4" />
              Create Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:gap-4">
          {shares?.map((share) => {
            const expired = isExpired(share.expiresAt);
            return (
              <Card
                key={share.id}
                className={`bg-card border-border ${
                  expired ? "opacity-60" : ""
                }`}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <LinkIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0" />
                        <code className="text-xs md:text-sm bg-muted px-1.5 md:px-2 py-0.5 md:py-1 rounded truncate max-w-[200px] md:max-w-[300px] block">
                          {getShareUrl(share.token)}
                        </code>
                        {expired && (
                          <span className="text-[10px] md:text-xs bg-destructive/10 text-destructive px-1.5 md:px-2 py-0.5 rounded">
                            Expired
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                          <span>{formatDate(share.createdAt)}</span>
                        </div>
                        {share.expiresAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            <span>
                              {expired ? "Expired" : "Expires"}: {formatDate(share.expiresAt)}
                            </span>
                          </div>
                        )}
                        {!share.expiresAt && (
                          <span className="text-[10px] md:text-xs bg-success/10 text-success px-1.5 md:px-2 py-0.5 rounded">
                            No expiry
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(share.token)}
                        disabled={expired}
                        className="gap-1.5 h-8 text-xs md:text-sm"
                      >
                        {copiedId === share.token ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            <span className="hidden sm:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={expired}
                        className="h-8 w-8 p-0"
                      >
                        <a
                          href={getShareUrl(share.token)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteShareId(share.id)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-4 md:mt-6 bg-muted/30 border-border">
        <CardHeader className="p-3 md:p-6 pb-2 md:pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-foreground">
            About Share Links
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0 text-xs md:text-sm text-muted-foreground space-y-1 md:space-y-2">
          <p>• Others can view your jobs in read-only mode</p>
          <p>• Set expiration or create permanent links</p>
          <p>• Delete anytime to revoke access</p>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteShareId}
        onOpenChange={(open) => !open && setDeleteShareId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Share Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this share link? Anyone with this
              link will no longer be able to view your jobs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteShareId && deleteShare.mutate({ id: deleteShareId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteShare.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}