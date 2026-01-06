"use client";

import { Suspense } from "react";
import { JobsTable } from "@/components/table/JobsTable";
import { QuickAddJob } from "@/components/forms/QuickAddJob";
import { Loader2, Briefcase } from "lucide-react";

export default function AllJobsPage() {
  return (
    <div className="px-3 py-4 md:px-4 md:py-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-foreground truncate">All Jobs</h1>
            <p className="text-xs md:text-base text-muted-foreground">Manage your applications</p>
          </div>
        </div>
        <div className="hidden md:block">
          <QuickAddJob />
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <JobsTable />
      </Suspense>
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