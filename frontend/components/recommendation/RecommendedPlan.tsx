"use client";

export function RecommendedPlan() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Kế hoạch đề xuất
      </h3>
      <p className="text-gray-600 mb-4">Kế hoạch 7 ngày cho người mới</p>
      <div className="space-y-2">
        <div className="p-3 bg-gray-50 rounded">
          <p className="font-medium">Ngày 1: Squat</p>
          <p className="text-sm text-gray-600">3 sets × 15 reps</p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="font-medium">Ngày 2: Push-up</p>
          <p className="text-sm text-gray-600">3 sets × 10 reps</p>
        </div>
      </div>
    </div>
  );
}
