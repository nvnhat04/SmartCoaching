import { ExerciseGrid } from "@/components/category/ExerciseGrid";

export default function CategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Danh mục bài tập 🏋️
        </h1>
        <p className="text-gray-600 mt-1">
          Chọn bài tập phù hợp với mục tiêu của bạn
        </p>
      </div>

      <ExerciseGrid />
    </div>
  );
}
