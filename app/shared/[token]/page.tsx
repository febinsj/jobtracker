"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getStatusBadgeVariant,
  formatDate,
} from "@/lib/utils";
import {
  Loader2,
  Building2,
  MapPin,
  Calendar,
  Star,
  ExternalLink,
  Briefcase,
  AlertTriangle,
  User,
} from "lucide-react";

interface SharedPageProps {
  params: Promise<{ token: string }>;
}

export default function SharedPage({ params }: SharedPageProps) {
  const { token } = use(params);
  
  const { data: share, isLoading: shareLoading, error: shareError } = trpc.share.getByToken.useQuery({ token });
  const { data: jobs, isLoading: jobsLoading } = trpc.share.getSharedJobs.useQuery(
    { token },
    { enabled: !!share }
  );

  if (shareLoading || jobsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared jobs...</p>
        </div>
      </div>
    );
  }

  if (shareError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Link Not Found or Expired
            </h2>
            <p className="text-muted-foreground">
              This share link may have been deleted or has expired. Please ask
              the owner for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group jobs by status
  const jobsByStatus: Record<string, any[]> = {};
  jobs?.forEach((job: any) => {
    const status = job.applications?.[0]?.status || "SAVED";
    if (!jobsByStatus[status]) {
      jobsByStatus[status] = [];
    }
    jobsByStatus[status].push(job);
  });

  const statusOrder = [
    "TO_APPLY",
    "APPLIED",
    "ASSESSMENT",
    "INTERVIEW",
    "OFFER",
    "SAVED",
    "BACKLOG",
    "REJECTED",
    "WITHDRAWN",
  ];

  const ownerName = share?.owner
    ? `${share.owner.firstName || ""} ${share.owner.lastName || ""}`.trim() ||
      "Someone"
    : "Someone";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="h-10 w-10 md:h-14 md:w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl font-bold text-foreground truncate">
                Shared Role Riser
              </h1>
              <div className="flex items-center gap-2 text-xs md:text-base text-muted-foreground">
                <User className="h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate">Shared by {ownerName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] md:text-xs font-normal">
              {jobs?.length || 0} jobs tracked
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {!jobs || jobs.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Jobs Yet
              </h3>
              <p className="text-muted-foreground">
                This user hasn't added any jobs to their tracker yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Summary */}
            <div className="flex flex-wrap gap-2">
              {statusOrder.map((status) => {
                const count = jobsByStatus[status]?.length || 0;
                if (count === 0) return null;
                return (
                  <Badge
                    key={status}
                    variant={getStatusBadgeVariant(status)}
                    className="text-sm"
                  >
                    {status.replace("_", " ")}: {count}
                  </Badge>
                );
              })}
            </div>

            {/* Jobs by Status */}
            {statusOrder.map((status) => {
              const statusJobs = jobsByStatus[status];
              if (!statusJobs || statusJobs.length === 0) return null;

              return (
                <div key={status}>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(status)}>
                      {status.replace("_", " ")}
                    </Badge>
                    <span className="text-muted-foreground text-sm font-normal">
                      ({statusJobs.length} jobs)
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {statusJobs.map((job: any) => {
                      const app = job.applications?.[0];
                      return (
                        <Card
                          key={job.id}
                          className="bg-card border-border hover:shadow-md transition-shadow"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                                <span className="font-semibold text-foreground truncate">
                                  {job.company}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs text-muted-foreground">
                                  {job.interest}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-foreground/90 font-medium mb-2">
                              {job.title}
                            </p>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              {job.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{job.location}</span>
                                </div>
                              )}
                              {app?.dateApplied && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Applied: {formatDate(app.dateApplied)}</span>
                                </div>
                              )}
                              {(job.salaryMin || job.salaryMax) && (
                                <div className="flex items-center gap-1">
                                  <span>💰</span>
                                  <span>
                                    ${job.salaryMin ? (job.salaryMin / 1000).toFixed(0) + "k" : "?"} - $
                                    {job.salaryMax ? (job.salaryMax / 1000).toFixed(0) + "k" : "?"}
                                  </span>
                                </div>
                              )}
                            </div>
                            {job.jobLink && (
                              <a
                                href={job.jobLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline mt-3"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Job Posting
                              </a>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>This is a read-only view of someone's job search progress.</p>
          <p className="mt-1">
            Want to track your own job search?{" "}
            <a href="/sign-up" className="text-primary hover:underline">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}