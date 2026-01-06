"use client";

import { Suspense, useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { JobsTable } from "@/components/table/JobsTable";
import { TodaysTasks } from "@/components/today/TodaysTasks";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { QuickAddJob } from "@/components/forms/QuickAddJob";
import { Loader2, LayoutGrid, Table, Calendar, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="px-3 py-4 md:px-4 md:py-8 max-w-7xl mx-auto">
      {/* Header - Mobile optimized */}
      <div className="flex justify-between items-start gap-3 mb-4 md:mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-3xl font-bold text-foreground truncate">
            Role Riser
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your applications
          </p>
        </div>
        {/* Add Job button - hidden on mobile (shown in header) */}
        <div className="hidden md:block">
          <QuickAddJob />
        </div>
      </div>

      {!mounted ? (
        <LoadingSpinner />
      ) : (
      <Tabs defaultValue="table" className="w-full">
        {/* Tab Navigation - Mobile optimized with full width */}
        <TabsList className="w-full grid grid-cols-4 h-12 md:h-10 md:w-auto md:max-w-md">
          <TabsTrigger value="table" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 text-xs md:text-sm py-2">
            <Table className="h-4 w-4 md:h-4 md:w-4" />
            <span>List</span>
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 text-xs md:text-sm py-2">
            <LayoutGrid className="h-4 w-4 md:h-4 md:w-4" />
            <span>Board</span>
          </TabsTrigger>
          <TabsTrigger value="today" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 text-xs md:text-sm py-2">
            <Calendar className="h-4 w-4 md:h-4 md:w-4" />
            <span>Today</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex flex-col md:flex-row items-center gap-0.5 md:gap-2 text-xs md:text-sm py-2">
            <BarChart3 className="h-4 w-4 md:h-4 md:w-4" />
            <span>Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4 md:mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <JobsTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="kanban" className="mt-4 md:mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <KanbanBoard />
          </Suspense>
        </TabsContent>

        <TabsContent value="today" className="mt-4 md:mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <TodaysTasks />
          </Suspense>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 md:mt-6">
          <Suspense fallback={<LoadingSpinner />}>
            <AnalyticsDashboard />
          </Suspense>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-48 md:h-64">
      <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
    </div>
  );
}