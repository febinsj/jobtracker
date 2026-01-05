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
import { getStatusBadgeVariant, getInterestStars, formatDate } from "@/lib/utils";
import { Building2, MapPin, ExternalLink, ChevronDown, Calendar, Star } from "lucide-react";

interface JobCardProps {
  job: any;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

export function JobCard({ job, onEdit, onDelete, isDragging }: JobCardProps) {
  const [showDescription, setShowDescription] = useState(false);
  const application = job.applications?.[0] || job.application;

  return (
    <>
      <Card
        className={`kanban-card ${isDragging ? "opacity-50 rotate-2 scale-105" : ""}`}
        onClick={() => setShowDescription(true)}
      >
        {/* Company & Title */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">{job.company}</h3>
            </div>
            <p className="text-sm text-foreground/90 font-medium">{job.title}</p>
          </div>
        </div>

        {/* Location */}
        {job.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span>{job.location}</span>
          </div>
        )}

        {/* Status Badge */}
        {application && (
          <div className="mb-2">
            <Badge variant={getStatusBadgeVariant(application.status)}>
              {application.status.replace("_", " ")}
            </Badge>
          </div>
        )}

        {/* Interest Stars */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 text-warning fill-warning" />
          <span className="text-xs text-muted-foreground">
            {getInterestStars(job.interest)} ({job.interest}/10)
          </span>
        </div>

        {/* Next Follow-up */}
        {application?.nextFollowupAt && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3" />
            <span>Next: {formatDate(application.nextFollowupAt)}</span>
          </div>
        )}

        {/* Description Preview */}
        {job.descPreview && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="kanban-card-description line-clamp-2">{job.descPreview}</p>
            <button className="kanban-card-read-more mt-1 flex items-center gap-1">
              Read more <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Job Link */}
        {job.jobLink && (
          <div className="mt-2">
            <a
              href={job.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="kanban-card-read-more flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              View posting
            </a>
          </div>
        )}

        {/* Salary Range */}
        {(job.salaryMin || job.salaryMax) && (
          <div className="mt-2 text-xs text-muted-foreground">
            💰 ${job.salaryMin?.toLocaleString() || "?"} - $
            {job.salaryMax?.toLocaleString() || "?"}
          </div>
        )}
      </Card>

      {/* Full Description Modal */}
      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Building2 className="h-5 w-5 text-primary" />
              {job.company} - {job.title}
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                {job.location && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </span>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Job Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-foreground">
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
                <h3 className="font-semibold mb-2 text-foreground">Job Description</h3>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm text-foreground border border-border">
                  {job.description}
                </div>
              </div>
            )}

            {/* Notes */}
            {job.notes && (
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Notes</h3>
                <div className="bg-accent p-4 rounded-lg text-sm text-accent-foreground border border-border">
                  {job.notes}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-border">
              {job.jobLink && (
                <Button asChild variant="outline" size="sm">
                  <a href={job.jobLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Posting
                  </a>
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDescription(false);
                    onEdit();
                  }}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setShowDescription(false);
                    onDelete();
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}