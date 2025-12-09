"use client";

import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { RecentWorkouts } from "@/components/dashboard/RecentWorkouts";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import { TrendingUp, Clock, Zap, Target } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUserStats } from "@/hooks/useWorkoutResults";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: stats, isLoading } = useUserStats(session?.user?.id || "");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Xin chào, {session?.user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Đây là tổng quan về tiến trình tập luyện của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng buổi tập"
          value={stats?.total_workouts?.toString() || "0"}
          change={`${stats?.workout_change_percent >= 0 ? "+" : ""}${
            stats?.workout_change_percent || 0
          }%`}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={stats?.workout_change_percent >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Thời gian tập"
          value={`${stats?.total_time_hours?.toFixed(1) || "0"}h`}
          change={`${stats?.time_change_percent >= 0 ? "+" : ""}${
            stats?.time_change_percent || 0
          }%`}
          icon={<Clock className="w-6 h-6" />}
          trend={stats?.time_change_percent >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Điểm trung bình"
          value={`${stats?.average_score?.toFixed(1) || "0"}/100`}
          change={`${stats?.score_change >= 0 ? "+" : ""}${
            stats?.score_change?.toFixed(1) || 0
          }`}
          icon={<Target className="w-6 h-6" />}
          trend={stats?.score_change >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Calo đốt cháy"
          value={Math.round(stats?.total_calories || 0).toLocaleString()}
          change={`${stats?.calories_change_percent >= 0 ? "+" : ""}${
            stats?.calories_change_percent || 0
          }%`}
          icon={<Zap className="w-6 h-6" />}
          trend={stats?.calories_change_percent >= 0 ? "up" : "down"}
        />
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 ">
          <ProgressChart userId={session?.user?.id || ""} />
        </div>
        <div className="w-[30%]">
          <ActivityCalendar userId={session?.user?.id || ""} />
        </div>
      </div>

      {/* Recent Workouts */}
      <RecentWorkouts userId={session?.user?.id || ""} />
    </div>
  );
}
