"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

function QuickAddJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  
  // Prefill from URL params
  const [formData, setFormData] = useState({
    company: searchParams.get("company") || "",
    title: searchParams.get("title") || "",
    location: searchParams.get("location") || "",
    jobLink: searchParams.get("jobLink") || "",
    description: searchParams.get("desc") || "",
    salaryMin: searchParams.get("salaryMin") || "",
    salaryMax: searchParams.get("salaryMax") || "",
    source: searchParams.get("source") || "",
    interest: "5",
    status: "TO_APPLY",
    notes: "",
  });

  const createJob = trpc.job.create.useMutation({
    onSuccess: () => {
      utils.job.getAll.invalidate();
      utils.job.getByStatus.invalidate();
      setOpen(false);
      setFormData({
        company: "",
        title: "",
        location: "",
        jobLink: "",
        description: "",
        salaryMin: "",
        salaryMax: "",
        source: "",
        interest: "5",
        status: "TO_APPLY",
        notes: "",
      });
      toast.success("Job added successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add job");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createJob.mutate({
      company: formData.company,
      title: formData.title,
      location: formData.location || undefined,
      jobLink: formData.jobLink || undefined,
      description: formData.description || undefined,
      salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
      source: formData.source || undefined,
      interest: parseInt(formData.interest),
      status: formData.status,
      notes: formData.notes || undefined,
    });
  };

  const descPreview = formData.description
    ? formData.description.slice(0, 100) + (formData.description.length > 100 ? "..." : "")
    : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Job</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a job application to track. Paste the full job description for easy reference.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company & Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company" className="text-foreground">Company *</Label>
              <Input
                id="company"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Google"
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="title" className="text-foreground">Job Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Senior Software Engineer"
                className="bg-background"
              />
            </div>
          </div>

          {/* Location & Job Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-foreground">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="jobLink" className="text-foreground">Job Posting URL</Label>
              <Input
                id="jobLink"
                type="url"
                value={formData.jobLink}
                onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                placeholder="https://..."
                className="bg-background"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <Label htmlFor="description" className="text-foreground">Job Description</Label>
            <Textarea
              id="description"
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Paste the full job description here. This will help you remember requirements and qualifications..."
              className="font-mono text-sm bg-background"
            />
            {descPreview && (
              <p className="text-xs text-muted-foreground mt-1">
                Preview: {descPreview}
              </p>
            )}
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salaryMin" className="text-foreground">Min Salary ($)</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                placeholder="100000"
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="salaryMax" className="text-foreground">Max Salary ($)</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                placeholder="150000"
                className="bg-background"
              />
            </div>
          </div>

          {/* Source, Interest, Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="source" className="text-foreground">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="LinkedIn"
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="interest" className="text-foreground">Interest (1-10)</Label>
              <Select
                value={formData.interest}
                onValueChange={(value) => setFormData({ ...formData, interest: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} {"⭐".repeat(Math.min(n, 5))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status" className="text-foreground">Initial Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BACKLOG">Backlog</SelectItem>
                  <SelectItem value="SAVED">Saved</SelectItem>
                  <SelectItem value="TO_APPLY">To Apply</SelectItem>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-foreground">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes, contacts, or reminders..."
              className="bg-background"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createJob.isPending}>
              {createJob.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function QuickAddJob() {
  return (
    <Suspense fallback={
      <Button className="gap-2" disabled>
        <Plus className="h-4 w-4" />
        Add Job
      </Button>
    }>
      <QuickAddJobForm />
    </Suspense>
  );
}