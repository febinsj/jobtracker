"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { EditJobDialog } from "@/components/forms/EditJobDialog";
import {
  getStatusBadgeVariant,
  getInterestStars,
  formatDate,
} from "@/lib/utils";
import {
  Loader2,
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  ArrowUpDown,
  Building2,
  MapPin,
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type SortField = "company" | "title" | "status" | "interest" | "createdAt" | "dateApplied";
type SortOrder = "asc" | "desc";

export function JobsTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [deletingJob, setDeletingJob] = useState<any>(null);
  const pageSize = 10;

  const utils = trpc.useUtils();
  const { data: jobs, isLoading } = trpc.job.getAll.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const deleteJob = trpc.job.delete.useMutation({
    onSuccess: () => {
      utils.job.getAll.invalidate();
      utils.job.getByStatus.invalidate();
      utils.job.getToday.invalidate();
      utils.job.getAnalytics.invalidate();
      toast.success("Job deleted successfully!");
      setDeletingJob(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete job");
    },
  });

  // Sort jobs
  const sortedJobs = jobs
    ? [...jobs].sort((a, b) => {
        const appA = a.applications?.[0];
        const appB = b.applications?.[0];

        let comparison = 0;
        switch (sortField) {
          case "company":
            comparison = a.company.localeCompare(b.company);
            break;
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
          case "status":
            comparison = (appA?.status || "").localeCompare(appB?.status || "");
            break;
          case "interest":
            comparison = (a.interest || 0) - (b.interest || 0);
            break;
          case "createdAt":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case "dateApplied":
            const dateA = appA?.dateApplied
              ? new Date(appA.dateApplied).getTime()
              : 0;
            const dateB = appB?.dateApplied
              ? new Date(appB.dateApplied).getTime()
              : 0;
            comparison = dateA - dateB;
            break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
      })
    : [];

  // Paginate
  const totalPages = Math.ceil(sortedJobs.length / pageSize);
  const paginatedJobs = sortedJobs.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
      <ArrowUpDown
        className={`h-3 w-3 ${
          sortField === field ? "text-primary" : "text-muted-foreground/50"
        }`}
      />
    </button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 md:h-64">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-3 md:p-6 pb-3 md:pb-4">
        <div className="flex flex-col gap-3 md:gap-4">
          <CardTitle className="text-base md:text-lg text-foreground">All Jobs</CardTitle>
          <div className="flex flex-col gap-2 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 w-full text-sm md:text-base bg-background"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full text-sm md:text-base bg-background">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
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
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0">
        {paginatedJobs.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-muted-foreground">
            <Building2 className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 md:mb-4 opacity-50" />
            <p className="text-base md:text-lg font-medium">No jobs found</p>
            <p className="text-xs md:text-sm">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Add your first job to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2">
                      <SortButton field="company">Company</SortButton>
                    </th>
                    <th className="text-left py-3 px-2">
                      <SortButton field="title">Title</SortButton>
                    </th>
                    <th className="text-left py-3 px-2">Location</th>
                    <th className="text-left py-3 px-2">
                      <SortButton field="status">Status</SortButton>
                    </th>
                    <th className="text-left py-3 px-2">
                      <SortButton field="interest">Interest</SortButton>
                    </th>
                    <th className="text-left py-3 px-2">
                      <SortButton field="dateApplied">Applied</SortButton>
                    </th>
                    <th className="text-left py-3 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJobs.map((job) => {
                    const app = job.applications?.[0];
                    return (
                      <tr
                        key={job.id}
                        className="border-b border-border hover:bg-accent/50 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                              {job.company}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-foreground">
                          {job.title}
                        </td>
                        <td className="py-3 px-2">
                          {job.location ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm">{job.location}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant={getStatusBadgeVariant(app?.status || "SAVED")}>
                            {app?.status?.replace("_", " ") || "SAVED"}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-warning fill-warning" />
                            <span className="text-sm text-muted-foreground">
                              {job.interest}/10
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {app?.dateApplied ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span className="text-sm">
                                {formatDate(app.dateApplied)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            {job.jobLink && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="h-8 w-8 p-0"
                              >
                                <a
                                  href={job.jobLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingJob(job)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => setDeletingJob(job)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-2">
              {paginatedJobs.map((job) => {
                const app = job.applications?.[0];
                return (
                  <Card key={job.id} className="bg-card/50 border-border">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="font-semibold text-foreground text-sm truncate">
                              {job.company}
                            </span>
                          </div>
                          <p className="text-xs text-foreground line-clamp-1">{job.title}</p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(app?.status || "SAVED")} className="text-[10px] flex-shrink-0">
                          {app?.status?.replace("_", " ") || "SAVED"}
                        </Badge>
                      </div>
                      {job.location && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1.5">
                          <MapPin className="h-2.5 w-2.5" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 text-warning fill-warning" />
                            <span>{job.interest}/10</span>
                          </div>
                          {app?.dateApplied && (
                            <div className="flex items-center gap-0.5">
                              <Calendar className="h-2.5 w-2.5" />
                              <span>{formatDate(app.dateApplied)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          {job.jobLink && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-7 w-7 p-0"
                            >
                              <a
                                href={job.jobLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setEditingJob(job)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeletingJob(job)}
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

            {/* Pagination - Mobile optimized */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border">
                <p className="text-xs md:text-sm text-muted-foreground order-2 md:order-1">
                  {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedJobs.length)} of {sortedJobs.length}
                </p>
                <div className="flex items-center gap-2 order-1 md:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs md:text-sm text-muted-foreground min-w-[80px] text-center">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Edit Dialog */}
      {editingJob && (
        <EditJobDialog
          job={editingJob}
          open={!!editingJob}
          onOpenChange={(open) => !open && setEditingJob(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingJob}
        onOpenChange={(open) => !open && setDeletingJob(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the job at {deletingJob?.company} -{" "}
              {deletingJob?.title}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingJob && deleteJob.mutate({ id: deletingJob.id })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteJob.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}