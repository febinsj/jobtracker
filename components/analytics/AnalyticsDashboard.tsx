"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Briefcase,
  Send,
  Users,
  Trophy,
  XCircle,
  TrendingUp,
  BarChart3,
  PieChart,
} from "lucide-react";

export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = trpc.job.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 md:h-64">
        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 md:p-8 text-center">
          <BarChart3 className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold mb-2 text-foreground">
            No Data Yet
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Start adding jobs to see your analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    totalJobs,
    statusCounts,
    weeklyApplications,
    conversionRate,
    offerRate,
    rejectionRate,
  } = analytics;

  // Calculate status distribution for visual representation
  const statusData = [
    { status: "Backlog", count: statusCounts.BACKLOG || 0, color: "bg-slate-500" },
    { status: "Saved", count: statusCounts.SAVED || 0, color: "bg-blue-500" },
    { status: "To Apply", count: statusCounts.TO_APPLY || 0, color: "bg-cyan-500" },
    { status: "Applied", count: statusCounts.APPLIED || 0, color: "bg-indigo-500" },
    { status: "Assessment", count: statusCounts.ASSESSMENT || 0, color: "bg-purple-500" },
    { status: "Interview", count: statusCounts.INTERVIEW || 0, color: "bg-amber-500" },
    { status: "Offer", count: statusCounts.OFFER || 0, color: "bg-emerald-500" },
    { status: "Rejected", count: statusCounts.REJECTED || 0, color: "bg-red-500" },
    { status: "Withdrawn", count: statusCounts.WITHDRAWN || 0, color: "bg-gray-500" },
  ].filter((s) => s.count > 0);

  // Get recent weekly applications (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    last7Days.push({
      date: dateKey,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      count: weeklyApplications[dateKey] || 0,
    });
  }

  const maxApplications = Math.max(...last7Days.map((d) => d.count), 1);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    color = "text-primary",
  }: {
    title: string;
    value: string | number;
    icon: any;
    description?: string;
    color?: string;
  }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl md:text-3xl font-bold ${color}`}>{value}</p>
            {description && (
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{description}</p>
            )}
          </div>
          <div className={`p-2 md:p-3 rounded-full bg-muted ${color}`}>
            <Icon className="h-5 w-5 md:h-6 md:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          icon={Briefcase}
          description="Jobs tracked"
        />
        <StatCard
          title="Applied"
          value={statusCounts.APPLIED || 0}
          icon={Send}
          description="Applications sent"
          color="text-indigo-500"
        />
        <StatCard
          title="Interviews"
          value={statusCounts.INTERVIEW || 0}
          icon={Users}
          description="Interview stage"
          color="text-amber-500"
        />
        <StatCard
          title="Offers"
          value={statusCounts.OFFER || 0}
          icon={Trophy}
          description="Offers received"
          color="text-emerald-500"
        />
      </div>

      {/* Conversion Rates - Grid on all screens */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 relative mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${(conversionRate / 100) * 88} 88`}
                    strokeLinecap="round"
                    className="text-amber-500"
                  />
                </svg>
                <TrendingUp className="absolute inset-0 m-auto h-4 w-4 md:h-5 md:w-5 text-amber-500" />
              </div>
              <p className="text-lg md:text-2xl font-bold text-foreground">
                {conversionRate.toFixed(1)}%
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Interview
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 relative mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${(offerRate / 100) * 88} 88`}
                    strokeLinecap="round"
                    className="text-emerald-500"
                  />
                </svg>
                <Trophy className="absolute inset-0 m-auto h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
              </div>
              <p className="text-lg md:text-2xl font-bold text-foreground">
                {offerRate.toFixed(1)}%
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Offer
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 relative mb-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${(rejectionRate / 100) * 88} 88`}
                    strokeLinecap="round"
                    className="text-red-500"
                  />
                </svg>
                <XCircle className="absolute inset-0 m-auto h-4 w-4 md:h-5 md:w-5 text-red-500" />
              </div>
              <p className="text-lg md:text-2xl font-bold text-foreground">
                {rejectionRate.toFixed(1)}%
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Rejected
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {/* Weekly Applications Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-foreground flex items-center gap-2 text-sm md:text-base">
              <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="flex items-end justify-between h-32 md:h-40 gap-1 md:gap-2">
              {last7Days.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col items-center justify-end h-24 md:h-32">
                    <span className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">
                      {day.count}
                    </span>
                    <div
                      className="w-full bg-primary rounded-t transition-all duration-300"
                      style={{
                        height: `${(day.count / maxApplications) * 100}%`,
                        minHeight: day.count > 0 ? "6px" : "2px",
                      }}
                    />
                  </div>
                  <span className="text-[10px] md:text-xs text-muted-foreground mt-1 md:mt-2">
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-foreground flex items-center gap-2 text-sm md:text-base">
              <PieChart className="h-4 w-4 md:h-5 md:w-5" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            {statusData.length === 0 ? (
              <div className="flex items-center justify-center h-32 md:h-40 text-muted-foreground text-sm">
                No data to display
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 md:gap-3">
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${item.color}`} />
                    <span className="text-xs md:text-sm text-foreground flex-1 truncate">
                      {item.status}
                    </span>
                    <span className="text-xs md:text-sm font-medium text-foreground">
                      {item.count}
                    </span>
                    <div className="w-16 md:w-24 h-1.5 md:h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-300`}
                        style={{
                          width: `${(item.count / totalJobs) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] md:text-xs text-muted-foreground w-8 md:w-12 text-right">
                      {((item.count / totalJobs) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-card border-border">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-foreground text-sm md:text-base">Quick Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-center">
            <div className="p-3 md:p-4 bg-muted rounded-lg">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {statusCounts.TO_APPLY || 0}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">To Apply</p>
            </div>
            <div className="p-3 md:p-4 bg-muted rounded-lg">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {statusCounts.ASSESSMENT || 0}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Assessment</p>
            </div>
            <div className="p-3 md:p-4 bg-muted rounded-lg">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {(statusCounts.SAVED || 0) + (statusCounts.BACKLOG || 0)}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Saved</p>
            </div>
            <div className="p-3 md:p-4 bg-muted rounded-lg">
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {statusCounts.WITHDRAWN || 0}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Withdrawn</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}