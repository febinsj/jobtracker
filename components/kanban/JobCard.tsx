"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { getStatusBadgeVariant, getInterestStars, formatDate } from "@/lib/utils";
import { Building2, MapPin, ExternalLink, ChevronDown, Calendar, Star, Pencil, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { EditJobDialog } from "@/components/forms/EditJobDialog";
import { toast } from "sonner";

interface JobCardProps {
  job: any;
  isDragging?: boolean;
}

export function JobCard({ job, isDragging }: JobCardProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const application = job.applications?.[0] || job.application;
  const utils = trpc.useUtils();

  const deleteJob = trpc.job.delete.useMutation({
    onSuccess: () => {
      utils.job.getAll.invalidate();
      utils.job.getByStatus.invalidate();
      utils.job.getToday.invalidate();
      utils.job.getAnalytics.invalidate();
      toast.success("Job deleted successfully!");
      setShowDeleteDialog(false);
      setShowDescription(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete job");
    },
  });

  const handleDelete = () => {
    deleteJob.mutate({ id: job.id });
  };

  return (
    <>
      <div
        className={`bg-card rounded-lg border border-border p-2.5 md:p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 touch-manipulation ${
          isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
        }`}
        onClick={() => setShowDescription(true)}
      >
        {/* Header: Company & Interest */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <Building2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary flex-shrink-0" />
            <span className="font-semibold text-foreground text-xs md:text-sm truncate">
              {job.company}
            </span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="h-2.5 w-2.5 md:h-3 md:w-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground">{job.interest}</span>
          </div>
        </div>

        {/* Title */}
        <p className="text-xs md:text-sm text-foreground/90 font-medium mb-1.5 md:mb-2 line-clamp-2 md:line-clamp-1">
          {job.title}
        </p>

        {/* Meta Info Row */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-0.5 md:gap-1">
              <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" />
              <span className="truncate max-w-[80px] md:max-w-[100px]">{job.location}</span>
            </div>
          )}
          {(job.salaryMin || job.salaryMax) && (
            <div className="flex items-center gap-0.5 md:gap-1">
              <span className="text-[10px] md:text-xs">💰</span>
              <span>
                ${job.salaryMin ? (job.salaryMin / 1000).toFixed(0) + "k" : "?"} - $
                {job.salaryMax ? (job.salaryMax / 1000).toFixed(0) + "k" : "?"}
              </span>
            </div>
          )}
        </div>

        {/* Follow-up Alert */}
        {application?.nextFollowupAt && (
          <div className="flex items-center gap-1 text-[10px] md:text-xs mt-1.5 md:mt-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">
            <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3" />
            <span className="truncate">Follow-up: {formatDate(application.nextFollowupAt)}</span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            {job.jobLink && (
              <a
                href={job.jobLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded hover:bg-muted transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="View job posting"
              >
                <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground hover:text-primary" />
              </a>
            )}
          </div>
          <button
            className="text-[10px] md:text-xs text-primary hover:underline flex items-center gap-0.5 md:gap-1"
            onClick={(e) => {
              e.stopPropagation();
              setShowDescription(true);
            }}
          >
            Details <ChevronDown className="h-2.5 w-2.5 md:h-3 md:w-3" />
          </button>
        </div>
      </div>

      {/* Full Description Modal - Full screen on mobile */}
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] md:max-h-[80vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-base md:text-lg">
              <Building2 className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
              <span className="truncate">{job.company} - {job.title}</span>
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {job.location && (
                  <span className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                    {job.location}
                  </span>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4">
            {/* Job Details - Single column on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
              <div className="text-foreground flex items-center gap-2">
                <span className="font-semibold">Status:</span>{" "}
                <Badge variant={getStatusBadgeVariant(application?.status || "SAVED")}>
                  {application?.status.replace("_", " ") || "SAVED"}
                </Badge>
              </div>
              <div className="text-foreground">
                <span className="font-semibold">Interest:</span>{" "}
                <span className="text-warning">{getInterestStars(job.interest)}</span> ({job.interest}/10)
              </div>
              {job.salaryMin && (
                <div className="text-foreground">
                  <span className="font-semibold">Salary:</span> $
                  {job.salaryMin.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
                </div>
              )}
              {job.source && (
                <div className="text-foreground">
                  <span className="font-semibold">Source:</span> {job.source}
                </div>
              )}
              {application?.dateApplied && (
                <div className="text-foreground">
                  <span className="font-semibold">Applied:</span>{" "}
                  {formatDate(application.dateApplied)}
                </div>
              )}
              {application?.nextFollowupAt && (
                <div className="text-foreground">
                  <span className="font-semibold">Next Follow-up:</span>{" "}
                  {formatDate(application.nextFollowupAt)}
                </div>
              )}
            </div>

            {/* Full Description */}
            {job.description && (
              <div>
                <h3 className="font-semibold mb-1.5 md:mb-2 text-foreground text-sm md:text-base">Job Description</h3>
                <div className="bg-muted p-3 md:p-4 rounded-lg whitespace-pre-wrap text-xs md:text-sm text-foreground border border-border max-h-[200px] md:max-h-none overflow-y-auto">
                  {job.description}
                </div>
              </div>
            )}

            {/* Notes */}
            {job.notes && (
              <div>
                <h3 className="font-semibold mb-1.5 md:mb-2 text-foreground text-sm md:text-base">Notes</h3>
                <div className="bg-accent p-3 md:p-4 rounded-lg text-xs md:text-sm text-accent-foreground border border-border">
                  {job.notes}
                </div>
              </div>
            )}

            {/* Actions - Stack on mobile */}
            <div className="flex flex-col md:flex-row gap-2 pt-3 md:pt-4 border-t border-border">
              {job.jobLink && (
                <Button asChild variant="outline" size="sm" className="w-full md:w-auto">
                  <a href={job.jobLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Posting
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full md:w-auto"
                onClick={() => {
                  setShowDescription(false);
                  setShowEditDialog(true);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full md:w-auto"
                onClick={() => {
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <EditJobDialog
        job={job}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the job at {job.company} - {job.title}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteJob.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}