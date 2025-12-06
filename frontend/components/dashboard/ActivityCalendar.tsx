"use client";

import { useCalendar } from "@/hooks/useWorkoutResults";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { vi } from "date-fns/locale";

interface ActivityCalendarProps {
  userId: string;
}

export function ActivityCalendar({ userId }: ActivityCalendarProps) {
  const { data: calendarData, isLoading } = useCalendar(userId, 30);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Tạo map để tra cứu nhanh calories theo ngày
  const caloriesMap = new Map<string, { calories: number; workouts: number }>();
  if (calendarData) {
    calendarData.forEach((item: any) => {
      caloriesMap.set(item.date, {
        calories: item.total_calories,
        workouts: item.workout_count,
      });
    });
  }
  console.log(calendarData);

  // Tính màu dựa trên số calories đốt cháy
  const getIntensityColor = (calories: number) => {
    if (calories === 0) return "bg-gray-100";
    if (calories < 30) return "bg-orange-200"; // < 30 cal
    if (calories < 60) return "bg-orange-400"; // 30-60 cal
    if (calories < 100) return "bg-orange-500"; // 60-100 cal
    return "bg-orange-600"; // 100+ cal
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Lịch hoạt động
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Lịch hoạt động - {format(today, "MMMM yyyy", { locale: vi })}
      </h3>
      <div className="space-y-2">
        {/* Grid calendar */}
        <div className="grid grid-cols-7 gap-1">
          {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 p-1"
            >
              {day}
            </div>
          ))}

          {/* Padding for first week */}
          {Array.from({
            length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1,
          }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days */}
          {daysInMonth.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayData = caloriesMap.get(dateStr);
            const calories = dayData?.calories || 0;
            const workoutCount = dayData?.workouts || 0;
            const isCurrentDay = isToday(day);

            return (
              <div
                key={dateStr}
                className={`
                  aspect-square flex items-center justify-center rounded text-xs
                  ${getIntensityColor(calories)}
                  ${isCurrentDay ? "ring-2 ring-orange-500" : ""}
                  ${!isSameMonth(day, today) ? "opacity-50" : ""}
                  transition-all hover:scale-110 cursor-pointer
                `}
                title={`${format(day, "dd/MM/yyyy")}: ${calories.toFixed(
                  1
                )} cal (${workoutCount} buổi)`}
              >
                <span className="font-semibold">{format(day, "d")}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-4">
          <span>Ít</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded" title="0 cal" />
            <div className="w-4 h-4 bg-orange-200 rounded" title="< 30 cal" />
            <div className="w-4 h-4 bg-orange-400 rounded" title="30-60 cal" />
            <div className="w-4 h-4 bg-orange-500 rounded" title="60-100 cal" />
            <div className="w-4 h-4 bg-orange-600 rounded" title="100+ cal" />
          </div>
          <span>Nhiều</span>
        </div>

        {/* Stats summary */}
        {calendarData && calendarData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              Tổng tháng này:{" "}
              <span className="font-semibold text-orange-600">
                {calendarData
                  .reduce(
                    (sum: number, item: any) => sum + item.total_calories,
                    0
                  )
                  .toFixed(1)}{" "}
                cal
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
