"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { QuickAddJob } from "@/components/forms/QuickAddJob";
import { Loader2, LayoutGrid, Table, Calendar, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Tracker</h1>
          <p className="text-muted-foreground">Track and manage your job applications</p>
        </div>
        <QuickAddJob />
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="kanban" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="gap-2">
            <Table className="h-4 w-4" />
            <span className="hidden sm:inline">Table</span>
          </TabsTrigger>
          <TabsTrigger value="today" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Today</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <KanbanBoard />
          </Suspense>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Table className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Table View</h3>
              <p className="text-muted-foreground">
                View and manage your jobs in a sortable table format
              </p>
              <p className="text-sm text-muted-foreground/70 mt-4">Coming soon...</p>
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="today" className="mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Today's Tasks</h3>
              <p className="text-muted-foreground">
                View deadlines and follow-ups due today
              </p>
              <p className="text-sm text-muted-foreground/70 mt-4">Coming soon...</p>
            </div>
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Track your application success rates and trends
              </p>
              <p className="text-sm text-muted-foreground/70 mt-4">Coming soon...</p>
            </div>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}