import { useQuery } from "@tanstack/react-query";

const API_URL = "http://127.0.0.1:8000/api";

type Category = {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  description: string;
};

type Checkpoint = {
  name: string;
  angles: Record<string, number>;
};

type Exercise = {
  id: number;
  category_id: number;
  name: string;
  duration: string;
  reps: string;
  difficulty: string;
  thumbnail: string;
  videoUrl: string;
  checkpoints?: Checkpoint[];
};

// Fetch all categories
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
}

// Fetch single category by ID
export function useCategory(id: number | string) {
  return useQuery<Category>({
    queryKey: ["categories", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/categories/${id}`);
      if (!res.ok) throw new Error("Failed to fetch category");
      return res.json();
    },
    enabled: !!id, // Only fetch if id exists
  });
}

// Fetch exercises (optionally filtered by category_id)
export function useExercises(categoryId?: number | string) {
  return useQuery<Exercise[]>({
    queryKey: ["exercises", categoryId],
    queryFn: async () => {
      const url = categoryId
        ? `${API_URL}/exercises?category_id=${categoryId}`
        : `${API_URL}/exercises`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch exercises");
      return res.json();
    },
  });
}

// Fetch single exercise by ID
export function useExercise(id: number | string) {
  return useQuery<Exercise>({
    queryKey: ["exercises", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/exercises/${id}`);
      if (!res.ok) throw new Error("Failed to fetch exercise");
      return res.json();
    },
    enabled: !!id,
  });
}
