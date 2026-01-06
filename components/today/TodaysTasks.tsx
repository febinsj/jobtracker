"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getStatusBadgeVariant,
  formatDate,
  isOverdue,
} from "@/lib/utils";
import {
  Loader2,
  Building2,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { EditJobDialog } from "@/components/forms/EditJobDialog";

export function TodaysTasks() {
  const { data: jobs, isLoading } = trpc.job.getToday.useQuery();
  const [editingJob, setEditingJob] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 md:h-64">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Separate overdue and upcoming tasks
  const now = new Date();
  const overdueTasks: any[] = [];
  const todayTasks: any[] = [];
  const upcomingTasks: any[] = [];

  jobs?.forEach((job) => {
    const app = job.applications?.[0];
    if (!app) return;

    const followupDate = app.nextFollowupAt ? new Date(app.nextFollowupAt) : null;
    const deadlineDate = app.deadline ? new Date(app.deadline) : null;

    // Check follow-up
    if (followupDate) {
      if (followupDate < now) {
        overdueTasks.push({ ...job, taskType: "followup", taskDate: followupDate });
      } else if (followupDate.toDateString() === now.toDateString()) {
        todayTasks.push({ ...job, taskType: "followup", taskDate: followupDate });
      } else {
        upcomingTasks.push({ ...job, taskType: "followup", taskDate: followupDate });
      }
    }

    // Check deadline
    if (deadlineDate) {
      if (deadlineDate < now) {
        overdueTasks.push({ ...job, taskType: "deadline", taskDate: deadlineDate });
      } else if (deadlineDate.toDateString() === now.toDateString()) {
        todayTasks.push({ ...job, taskType: "deadline", taskDate: deadlineDate });
      } else {
        upcomingTasks.push({ ...job, taskType: "deadline", taskDate: deadlineDate });
      }
    }
  });

  // Sort by date
  const sortByDate = (a: any, b: any) =>
    new Date(a.taskDate).getTime() - new Date(b.taskDate).getTime();
  overdueTasks.sort(sortByDate);
  todayTasks.sort(sortByDate);
  upcomingTasks.sort(sortByDate);

  const hasNoTasks =
    overdueTasks.length === 0 &&
    todayTasks.length === 0 &&
    upcomingTasks.length === 0;

  const TaskCard = ({ job, isOverdue: overdue }: { job: any; isOverdue?: boolean }) => {
    const app = job.applications?.[0];
    return (
      <Card
        className={`bg-card/50 border-border cursor-pointer hover:bg-accent/50 transition-colors touch-manipulation ${
          overdue ? "border-l-4 border-l-destructive" : ""
        }`}
        onClick={() => setEditingJob(job)}
      >
        <CardContent className="p-3 md:p-4">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1 flex-wrap">
                <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-foreground text-sm md:text-base truncate">
                  {job.company}
                </span>
                <Badge variant={getStatusBadgeVariant(app?.status || "SAVED")} className="text-[10px] md:text-xs">
                  {app?.status?.replace("_", " ") || "SAVED"}
                </Badge>
              </div>
              <p className="text-xs md:text-sm text-foreground mb-1 md:mb-2 line-clamp-1">{job.title}</p>
              {job.location && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm mb-1 md:mb-2">
                  <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  <span className="truncate">{job.location}</span>
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div
                className={`flex items-center gap-0.5 md:gap-1 text-xs md:text-sm ${
                  overdue ? "text-destructive" : "text-muted-foreground"
                }`}
              >
                {job.taskType === "followup" ? (
                  <Bell className="h-3 w-3 md:h-4 md:w-4" />
                ) : (
                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                )}
                <span className="capitalize hidden sm:inline">{job.taskType}</span>
              </div>
              <p
                className={`text-xs md:text-sm font-medium ${
                  overdue ? "text-destructive" : "text-foreground"
                }`}
              >
                {formatDate(job.taskDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 md:mt-3 pt-2 md:pt-3 border-t border-border">
            <div className="flex items-center gap-1 md:gap-2">
              {job.jobLink && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={job.jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </a>
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
              onClick={(e) => {
                e.stopPropagation();
                setEditingJob(job);
              }}
            >
              <span className="hidden sm:inline">Update Status</span>
              <span className="sm:hidden">Update</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {hasNoTasks ? (
        <Card className="bg-card border-border">
          <CardContent className="p-6 md:p-8 text-center">
            <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 mx-auto text-success mb-3 md:mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2 text-foreground">
              All caught up!
            </h3>
            <p className="text-sm md:text-base text-muted-foreground">
              No follow-ups or deadlines due.
            </p>
            <p className="text-xs md:text-sm text-muted-foreground/70 mt-2">
              Add follow-up dates to see them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                <h3 className="text-base md:text-lg font-semibold text-destructive">
                  Overdue ({overdueTasks.length})
                </h3>
              </div>
              <div className="space-y-2 md:space-y-3">
                {overdueTasks.map((job, index) => (
                  <TaskCard key={`${job.id}-${job.taskType}-${index}`} job={job} isOverdue />
                ))}
              </div>
            </div>
          )}

          {/* Today's Tasks */}
          {todayTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  Due Today ({todayTasks.length})
                </h3>
              </div>
              <div className="space-y-2 md:space-y-3">
                {todayTasks.map((job, index) => (
                  <TaskCard key={`${job.id}-${job.taskType}-${index}`} job={job} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  Upcoming ({upcomingTasks.length})
                </h3>
              </div>
              <div className="space-y-2 md:space-y-3">
                {upcomingTasks.map((job, index) => (
                  <TaskCard key={`${job.id}-${job.taskType}-${index}`} job={job} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {editingJob && (
        <EditJobDialog
          job={editingJob}
          open={!!editingJob}
          onOpenChange={(open) => !open && setEditingJob(null)}
        />
      )}
    </div>
  );
}