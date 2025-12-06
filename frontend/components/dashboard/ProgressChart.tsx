"use client";

import { useProgressChart } from "@/hooks/useWorkoutResults";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ProgressChartProps {
  userId: string;
}

export function ProgressChart({ userId }: ProgressChartProps) {
  const { data: progressData, isLoading } = useProgressChart(userId, 14);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Biểu đồ tiến bộ (14 ngày gần nhất)
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!progressData || progressData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Biểu đồ tiến bộ (14 ngày gần nhất)
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>Chưa có dữ liệu</p>
        </div>
      </div>
    );
  }

  // Fixed scale: 0-100
  const maxScore = 100;
  const minScore = 0;
  const scoreRange = maxScore - minScore;

  return (
    <div className="bg-white flex flex-col rounded-lg shadow p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Biểu đồ tiến bộ (14 ngày gần nhất)
      </h3>
      <div className="h-64 flex items-end gap-10 px-2 flex-grow justify-between overflow-x-auto">
        {progressData.map((item: any, index: number) => {
          // Normalize score to 0-100% for height
          const normalizedScore =
            item.average_score > 0
              ? ((item.average_score - minScore) / scoreRange) * 100
              : 0;
          const height = Math.max(normalizedScore, 5);

          return (
            <div
              key={index}
              className="w-12 flex flex-col items-center gap-2 h-full shrink-0"
            >
              <div className="w-full flex flex-col items-center justify-end h-full">
                <span className="text-xs font-semibold text-gray-900 mb-1">
                  {item.average_score > 0 ? item.average_score.toFixed(1) : "-"}
                </span>
                <div
                  className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-pointer min-h-[10px]"
                  style={{
                    height: item.average_score > 0 ? `${height}%` : "5%",
                    opacity: item.average_score > 0 ? 1 : 0.3,
                  }}
                  title={`${format(new Date(item.date), "dd/MM/yyyy", {
                    locale: vi,
                  })}\nĐiểm TB: ${item.average_score.toFixed(1)}\nSố buổi: ${
                    item.workout_count || 0
                  }`}
                />
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap">
                {format(new Date(item.date), "dd/MM", { locale: vi })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        Điểm trung bình theo ngày
      </div>
    </div>
  );
}
