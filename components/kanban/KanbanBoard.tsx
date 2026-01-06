"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { JobCard } from "./JobCard";
import { trpc } from "@/lib/trpc/client";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLUMNS = [
  { id: "BACKLOG", title: "Backlog", color: "bg-slate-500", emoji: "📋" },
  { id: "SAVED", title: "Saved", color: "bg-blue-500", emoji: "💾" },
  { id: "TO_APPLY", title: "To Apply", color: "bg-cyan-500", emoji: "📝" },
  { id: "APPLIED", title: "Applied", color: "bg-indigo-500", emoji: "📤" },
  { id: "ASSESSMENT", title: "Assessment", color: "bg-purple-500", emoji: "📊" },
  { id: "INTERVIEW", title: "Interview", color: "bg-amber-500", emoji: "🎤" },
  { id: "OFFER", title: "Offer", color: "bg-emerald-500", emoji: "🎉" },
  { id: "REJECTED", title: "Rejected", color: "bg-red-500", emoji: "❌" },
  { id: "WITHDRAWN", title: "Withdrawn", color: "bg-gray-500", emoji: "🚫" },
];

export function KanbanBoard() {
  const utils = trpc.useUtils();
  const { data: jobsByStatus, isLoading } = trpc.job.getByStatus.useQuery();
  const updateStatus = trpc.application.updateStatus.useMutation({
    onSuccess: () => {
      utils.job.getByStatus.invalidate();
      utils.job.getAll.invalidate();
      utils.job.getToday.invalidate();
      utils.job.getAnalytics.invalidate();
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the job that was moved
    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;
    const jobId = draggableId;

    // Update status via tRPC
    updateStatus.mutate({
      jobId,
      status: destStatus as any,
      dateApplied: destStatus === "APPLIED" ? new Date() : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 md:h-64">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate total jobs
  const totalJobs = STATUS_COLUMNS.reduce(
    (acc, col) => acc + (jobsByStatus?.[col.id]?.length || 0),
    0
  );

  // Filter columns that have jobs or are important stages
  const activeColumns = STATUS_COLUMNS.filter(
    (col) => (jobsByStatus?.[col.id]?.length || 0) > 0 ||
    ["TO_APPLY", "APPLIED", "INTERVIEW", "OFFER"].includes(col.id)
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Summary Bar - Scrollable on mobile */}
      <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
        <div className="flex gap-2 p-3 md:p-4 bg-card rounded-lg border border-border min-w-max md:min-w-0 md:flex-wrap">
          {STATUS_COLUMNS.map((column) => {
            const count = jobsByStatus?.[column.id]?.length || 0;
            if (count === 0) return null; // Hide empty statuses on mobile summary
            return (
              <div
                key={column.id}
                className={cn(
                  "flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm transition-all bg-muted"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", column.color)} />
                <span className="text-muted-foreground hidden sm:inline">{column.title}</span>
                <span className="font-semibold text-foreground">{count}</span>
              </div>
            );
          })}
          {totalJobs === 0 && (
            <span className="text-sm text-muted-foreground">No jobs yet</span>
          )}
        </div>
      </div>

      {totalJobs === 0 ? (
        <div className="text-center py-12 md:py-16 bg-card rounded-lg border border-border">
          <div className="text-4xl md:text-6xl mb-3 md:mb-4">📋</div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">No jobs yet</h3>
          <p className="text-sm md:text-base text-muted-foreground px-4">
            Tap the + button to start tracking your job applications!
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          {/* Mobile-friendly Horizontal Scroll / Desktop Grid */}
          <div className="flex flex-nowrap md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x">
            {activeColumns.map((column) => {
              const count = jobsByStatus?.[column.id]?.length || 0;
              return (
                <div key={column.id} className="flex flex-col min-w-[85vw] sm:min-w-[300px] md:min-w-0 snap-center">
                  <div className="bg-card border border-border rounded-lg md:rounded-xl overflow-hidden flex flex-col">
                    {/* Column Header - Compact on mobile */}
                    <div className={cn(
                      "p-2.5 md:p-3 border-b border-border",
                      count > 0 ? "bg-muted/50" : "bg-muted/20"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 md:gap-2">
                          <div className={cn("w-2.5 h-2.5 md:w-3 md:h-3 rounded-full", column.color)} />
                          <span className="font-semibold text-foreground text-xs md:text-sm">
                            {column.emoji} {column.title}
                          </span>
                        </div>
                        <span className={cn(
                          "text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium",
                          count > 0
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {count}
                        </span>
                      </div>
                    </div>

                    {/* Column Content */}
                    <div className="p-1.5 md:p-2 flex-1">
                      <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                              "min-h-[120px] md:min-h-[200px] space-y-2 rounded-lg transition-all duration-200 p-1",
                              snapshot.isDraggingOver && "bg-accent/50 ring-2 ring-primary/20"
                            )}
                          >
                            {jobsByStatus?.[column.id]?.map((job: any, index: number) => (
                              <Draggable key={job.id} draggableId={job.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={cn(
                                      "transition-transform touch-manipulation",
                                      snapshot.isDragging && "rotate-2 scale-105"
                                    )}
                                  >
                                    <JobCard job={job} isDragging={snapshot.isDragging} />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {count === 0 && !snapshot.isDraggingOver && (
                              <div className="flex flex-col items-center justify-center text-center text-muted-foreground text-xs py-6 md:py-8 border-2 border-dashed border-border rounded-lg bg-muted/10">
                                <span className="text-lg md:text-xl mb-1">{column.emoji}</span>
                                <span>Drop here</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show hidden columns - Compact on mobile */}
          {STATUS_COLUMNS.filter(col => !activeColumns.includes(col)).length > 0 && (
            <div className="mt-3 md:mt-4 p-3 md:p-4 bg-muted/30 rounded-lg border border-dashed border-border">
              <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">Other stages:</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 md:gap-2">
                {STATUS_COLUMNS.filter(col => !activeColumns.includes(col)).map((column) => (
                  <Droppable key={column.id} droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex items-center gap-1 md:gap-2 p-2 md:p-3 rounded-lg border border-border bg-card/50 transition-all",
                          snapshot.isDraggingOver && "bg-accent ring-2 ring-primary/20"
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", column.color)} />
                        <span className="text-xs text-muted-foreground truncate">
                          {column.emoji}
                        </span>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          )}
        </DragDropContext>
      )}
    </div>
  );
}