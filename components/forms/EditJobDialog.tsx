"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditJobDialogProps {
  job: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditJobDialog({ job, open, onOpenChange }: EditJobDialogProps) {
  const utils = trpc.useUtils();
  const application = job?.applications?.[0] || job?.application;

  const [formData, setFormData] = useState({
    company: "",
    title: "",
    location: "",
    jobLink: "",
    description: "",
    salaryMin: "",
    salaryMax: "",
    source: "",
    interest: "5",
    notes: "",
  });

  const [statusData, setStatusData] = useState({
    status: "TO_APPLY",
    nextFollowupAt: "",
    deadline: "",
  });

  // Update form data when job changes
  useEffect(() => {
    if (job) {
      setFormData({
        company: job.company || "",
        title: job.title || "",
        location: job.location || "",
        jobLink: job.jobLink || "",
        description: job.description || "",
        salaryMin: job.salaryMin?.toString() || "",
        salaryMax: job.salaryMax?.toString() || "",
        source: job.source || "",
        interest: job.interest?.toString() || "5",
        notes: job.notes || "",
      });
      setStatusData({
        status: application?.status || "TO_APPLY",
        nextFollowupAt: application?.nextFollowupAt
          ? new Date(application.nextFollowupAt).toISOString().split("T")[0]
          : "",
        deadline: application?.deadline
          ? new Date(application.deadline).toISOString().split("T")[0]
          : "",
      });
    }
  }, [job, application]);

  const updateJob = trpc.job.update.useMutation({
    onSuccess: () => {
      utils.job.getAll.invalidate();
      utils.job.getByStatus.invalidate();
      utils.job.getToday.invalidate();
      utils.job.getAnalytics.invalidate();
      toast.success("Job updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update job");
    },
  });

  const updateStatus = trpc.application.updateStatus.useMutation({
    onSuccess: () => {
      utils.job.getAll.invalidate();
      utils.job.getByStatus.invalidate();
      utils.job.getToday.invalidate();
      utils.job.getAnalytics.invalidate();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update job details
    await updateJob.mutateAsync({
      id: job.id,
      company: formData.company,
      title: formData.title,
      location: formData.location || undefined,
      jobLink: formData.jobLink || undefined,
      description: formData.description || undefined,
      salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
      source: formData.source || undefined,
      interest: parseInt(formData.interest),
      notes: formData.notes || undefined,
    });

    // Update application status
    await updateStatus.mutateAsync({
      jobId: job.id,
      status: statusData.status as any,
      nextFollowupAt: statusData.nextFollowupAt
        ? new Date(statusData.nextFollowupAt)
        : undefined,
      deadline: statusData.deadline ? new Date(statusData.deadline) : undefined,
      dateApplied:
        statusData.status === "APPLIED" && application?.status !== "APPLIED"
          ? new Date()
          : undefined,
    });
  };

  const isPending = updateJob.isPending || updateStatus.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 md:p-6 pb-2 md:pb-4">
          <DialogTitle className="text-foreground text-base md:text-lg">Edit Job</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs md:text-sm">
            Update job details and status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 md:px-6 space-y-3 md:space-y-4">
          {/* Company & Title - Stack on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="edit-company" className="text-foreground text-xs md:text-sm">
                Company *
              </Label>
              <Input
                id="edit-company"
                required
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                placeholder="Google"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
            <div>
              <Label htmlFor="edit-title" className="text-foreground text-xs md:text-sm">
                Job Title *
              </Label>
              <Input
                id="edit-title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Senior Software Engineer"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
          </div>

          {/* Location & Job Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="edit-location" className="text-foreground text-xs md:text-sm">
                Location
              </Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="San Francisco, CA"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
            <div>
              <Label htmlFor="edit-jobLink" className="text-foreground text-xs md:text-sm">
                Job URL
              </Label>
              <Input
                id="edit-jobLink"
                type="url"
                value={formData.jobLink}
                onChange={(e) =>
                  setFormData({ ...formData, jobLink: e.target.value })
                }
                placeholder="https://..."
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
          </div>

          {/* Status, Interest, Source - 2 cols mobile, 3 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <Label htmlFor="edit-status" className="text-foreground text-xs md:text-sm">
                Status
              </Label>
              <Select
                value={statusData.status}
                onValueChange={(value) =>
                  setStatusData({ ...statusData, status: value })
                }
              >
                <SelectTrigger className="bg-background h-9 md:h-10 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                  <SelectItem value="SAVED">Saved</SelectItem>
                  <SelectItem value="TO_APPLY">To Apply</SelectItem>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="ASSESSMENT">Assessment</SelectItem>
                  <SelectItem value="INTERVIEW">Interview</SelectItem>
                  <SelectItem value="OFFER">Offer</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="WITHDRAWN">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-interest" className="text-foreground text-xs md:text-sm">
                Interest
              </Label>
              <Select
                value={formData.interest}
                onValueChange={(value) =>
                  setFormData({ ...formData, interest: value })
                }
              >
                <SelectTrigger className="bg-background h-9 md:h-10 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} {"⭐".repeat(Math.min(n, 3))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <Label htmlFor="edit-source" className="text-foreground text-xs md:text-sm">
                Source
              </Label>
              <Input
                id="edit-source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                placeholder="LinkedIn"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="edit-followup" className="text-foreground text-xs md:text-sm">
                Follow-up
              </Label>
              <Input
                id="edit-followup"
                type="date"
                value={statusData.nextFollowupAt}
                onChange={(e) =>
                  setStatusData({ ...statusData, nextFollowupAt: e.target.value })
                }
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
            <div>
              <Label htmlFor="edit-deadline" className="text-foreground text-xs md:text-sm">
                Deadline
              </Label>
              <Input
                id="edit-deadline"
                type="date"
                value={statusData.deadline}
                onChange={(e) =>
                  setStatusData({ ...statusData, deadline: e.target.value })
                }
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="edit-salaryMin" className="text-foreground text-xs md:text-sm">
                Min Salary ($)
              </Label>
              <Input
                id="edit-salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMin: e.target.value })
                }
                placeholder="100000"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
            <div>
              <Label htmlFor="edit-salaryMax" className="text-foreground text-xs md:text-sm">
                Max Salary ($)
              </Label>
              <Input
                id="edit-salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) =>
                  setFormData({ ...formData, salaryMax: e.target.value })
                }
                placeholder="150000"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <Label htmlFor="edit-description" className="text-foreground text-xs md:text-sm">
              Job Description
            </Label>
            <Textarea
              id="edit-description"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Paste the job description here..."
              className="font-mono text-xs md:text-sm bg-background"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="edit-notes" className="text-foreground text-xs md:text-sm">
              Notes
            </Label>
            <Textarea
              id="edit-notes"
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes..."
              className="bg-background text-sm md:text-base"
            />
          </div>

          </div>
          
          {/* Actions - Sticky footer */}
          <div className="flex justify-end gap-2 p-4 md:p-6 pt-3 md:pt-4 border-t border-border bg-background mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 md:h-10 text-sm md:text-base"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="h-9 md:h-10 text-sm md:text-base">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}