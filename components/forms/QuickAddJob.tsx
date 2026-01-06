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
        <Button className="gap-1.5 md:gap-2 h-9 md:h-10 text-sm md:text-base px-3 md:px-4">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Job</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 md:p-6 pb-2 md:pb-4">
          <DialogTitle className="text-foreground text-base md:text-lg lg:text-xl">Add New Job</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs md:text-sm">
            Add a job to track. Paste the description for reference.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 md:px-6 space-y-4 md:space-y-5 lg:space-y-6">
          {/* Company & Title - Stack on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="company" className="text-foreground text-xs md:text-sm">Company *</Label>
              <Input
                id="company"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Google"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
            <div>
              <Label htmlFor="title" className="text-foreground text-xs md:text-sm">Job Title *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Senior Software Engineer"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
          </div>

          {/* Location & Job Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="location" className="text-foreground text-xs md:text-sm">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
            <div>
              <Label htmlFor="jobLink" className="text-foreground text-xs md:text-sm">Job URL</Label>
              <Input
                id="jobLink"
                type="url"
                value={formData.jobLink}
                onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                placeholder="https://..."
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <Label htmlFor="description" className="text-foreground text-xs md:text-sm lg:text-base">Job Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Paste the job description here..."
              className="font-mono text-xs md:text-sm bg-background min-h-[120px] lg:min-h-[150px]"
            />
            {descPreview && (
              <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                Preview: {descPreview}
              </p>
            )}
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <Label htmlFor="salaryMin" className="text-foreground text-xs md:text-sm">Min Salary ($)</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salaryMin}
                onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                placeholder="100000"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
            <div>
              <Label htmlFor="salaryMax" className="text-foreground text-xs md:text-sm">Max Salary ($)</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salaryMax}
                onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                placeholder="150000"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
          </div>

          {/* Source, Interest, Status - 2 cols on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <Label htmlFor="source" className="text-foreground text-xs md:text-sm">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="LinkedIn"
                className="bg-background text-sm md:text-base h-9 md:h-10"
              />
            </div>
            <div>
              <Label htmlFor="interest" className="text-foreground text-xs md:text-sm">Interest</Label>
              <Select
                value={formData.interest}
                onValueChange={(value) => setFormData({ ...formData, interest: value })}
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
              <Label htmlFor="status" className="text-foreground text-xs md:text-sm">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-background h-9 md:h-10 text-sm md:text-base">
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
            <Label htmlFor="notes" className="text-foreground text-xs md:text-sm lg:text-base">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="bg-background text-sm md:text-base min-h-[80px] lg:min-h-[100px]"
            />
          </div>
          </div>

          {/* Actions - Sticky footer */}
          <div className="flex justify-end gap-2 p-4 md:p-6 pt-3 md:pt-4 border-t border-border bg-background mt-auto">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-9 md:h-10 lg:h-11 text-sm md:text-base">
              Cancel
            </Button>
            <Button type="submit" disabled={createJob.isPending} className="h-9 md:h-10 lg:h-11 text-sm md:text-base">
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
      <Button className="gap-1.5 md:gap-2 h-9 md:h-10" disabled>
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Add Job</span>
        <span className="sm:hidden">Add</span>
      </Button>
    }>
      <QuickAddJobForm />
    </Suspense>
  );
}