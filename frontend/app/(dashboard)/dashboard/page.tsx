import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { RecentWorkouts } from "@/components/dashboard/RecentWorkouts";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import { TrendingUp, Clock, Zap, Target } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Xin chào, {session?.user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Đây là tổng quan về tiến trình tập luyện của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng buổi tập"
          value="24"
          change="+12%"
          icon={<TrendingUp className="w-6 h-6" />}
          trend="up"
        />
        <StatsCard
          title="Thời gian tập"
          value="18.5h"
          change="+8%"
          icon={<Clock className="w-6 h-6" />}
          trend="up"
        />
        <StatsCard
          title="Điểm trung bình"
          value="8.7/10"
          change="+0.5"
          icon={<Target className="w-6 h-6" />}
          trend="up"
        />
        <StatsCard
          title="Calo đốt cháy"
          value="3,420"
          change="+15%"
          icon={<Zap className="w-6 h-6" />}
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressChart />
        </div>
        <div>
          <ActivityCalendar />
        </div>
      </div>

      {/* Recent Workouts */}
      <RecentWorkouts />
    </div>
  );
}
