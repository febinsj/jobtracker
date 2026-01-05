"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { JobCard } from "./JobCard";
import { trpc } from "@/lib/trpc/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const STATUS_COLUMNS = [
  { id: "BACKLOG", title: "Backlog" },
  { id: "SAVED", title: "Saved" },
  { id: "TO_APPLY", title: "To Apply" },
  { id: "APPLIED", title: "Applied" },
  { id: "ASSESSMENT", title: "Assessment" },
  { id: "INTERVIEW", title: "Interview" },
  { id: "OFFER", title: "Offer" },
  { id: "REJECTED", title: "Rejected" },
  { id: "WITHDRAWN", title: "Withdrawn" },
];

export function KanbanBoard() {
  const utils = trpc.useUtils();
  const { data: jobsByStatus, isLoading } = trpc.job.getByStatus.useQuery();
  const updateStatus = trpc.application.updateStatus.useMutation({
    onSuccess: () => {
      utils.job.getByStatus.invalidate();
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card className="bg-card/50 border-border backdrop-blur-sm">
              <CardHeader className="pb-3 kanban-column-header">
                <CardTitle className="text-sm font-semibold flex items-center justify-between text-muted-foreground">
                  <span>{column.title}</span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-medium">
                    {jobsByStatus?.[column.id]?.length || 0}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="kanban-column">
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[500px] space-y-3 transition-colors rounded-lg ${
                        snapshot.isDraggingOver ? "bg-accent/50 p-2" : ""
                      }`}
                    >
                      {jobsByStatus?.[column.id]?.map((job: any, index: number) => (
                        <Draggable key={job.id} draggableId={job.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <JobCard job={job} isDragging={snapshot.isDragging} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {(!jobsByStatus?.[column.id] || jobsByStatus[column.id].length === 0) && (
                        <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-border rounded-lg">
                          No jobs in this column
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}