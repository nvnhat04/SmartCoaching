"use client";

import { useRecentWorkouts } from "@/hooks/useWorkoutResults";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface RecentWorkoutsProps {
  userId: string;
}

export function RecentWorkouts({ userId }: RecentWorkoutsProps) {
  const { data: workouts, isLoading } = useRecentWorkouts(userId, 10);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Buổi tập gần đây
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Buổi tập gần đây
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            Chưa có buổi tập nào. Bắt đầu tập luyện ngay!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Buổi tập gần đây
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {workouts.map((workout: any) => (
          <div
            key={workout.id}
            className="p-6 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-6">
                <h4 className="font-semibold text-gray-900 truncate">
                  {workout.exercise_name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(workout.started_at), "dd MMM yyyy, HH:mm", {
                    locale: vi,
                  })}
                </p>
              </div>

              {/* Fixed width stats - không dùng gap để tránh giãn ra */}
              <div className="flex items-center shrink-0">
                <div className="w-20 text-center">
                  <p className="text-xs text-gray-500">Điểm TB</p>
                  <p className="text-lg font-bold text-gray-900">
                    {workout.average_score > 0
                      ? workout.average_score.toFixed(1)
                      : "N/A"}
                  </p>
                </div>
                <div className="w-16 text-center">
                  <p className="text-xs text-gray-500">Reps</p>
                  <p className="text-lg font-bold text-gray-900">
                    {workout.total_reps}
                  </p>
                </div>
                <div className="w-20 text-center">
                  <p className="text-xs text-gray-500">Thời gian</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.floor(workout.duration_seconds / 60)}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
