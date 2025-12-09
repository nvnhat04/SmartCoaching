import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const API_URL = "http://localhost:8000/api/results";

export interface RepResult {
  rep_number: number;
  score: number;
  feedback: string;
  timestamp: string;
}

export interface SaveWorkoutData {
  user_id: string;
  exercise_id: number;
  category_id: number;
  started_at: string;
  ended_at: string;
  total_reps: number;
  rep_results: RepResult[];
}

// Hook: Lưu kết quả buổi tập
export function useSaveWorkoutResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveWorkoutData) => {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save workout result");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate các query liên quan đến stats, recent workouts, etc.
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      queryClient.invalidateQueries({ queryKey: ["recentWorkouts"] });
      queryClient.invalidateQueries({ queryKey: ["progressChart"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });
}

// Hook: Lấy thống kê user
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ["userStats", userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/user/${userId}/stats`);
      if (!res.ok) throw new Error("Failed to fetch user stats");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 60000,
  });
}

// Hook: Lấy buổi tập gần đây
export function useRecentWorkouts(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: ["recentWorkouts", userId, limit],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/user/${userId}/recent?limit=${limit}`
      );
      if (!res.ok) throw new Error("Failed to fetch recent workouts");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 60000,
  });
}

// Hook: Lấy dữ liệu biểu đồ
export function useProgressChart(userId: string, days: number = 30) {
  return useQuery({
    queryKey: ["progressChart", userId, days],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/user/${userId}/progress?days=${days}`
      );
      if (!res.ok) throw new Error("Failed to fetch progress data");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 60000,
  });
}

// Hook: Lấy dữ liệu calendar
export function useCalendar(userId: string, days: number = 30) {
  return useQuery({
    queryKey: ["calendar", userId, days],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/user/${userId}/calendar?days=${days}`
      );
      if (!res.ok) throw new Error("Failed to fetch calendar data");
      return res.json();
    },
    enabled: !!userId,
    staleTime: 60000,
  });
}
