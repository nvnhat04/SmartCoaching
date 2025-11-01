"use client";

export function ExerciseRecommendations() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Đề xuất cho bạn
      </h3>
      <div className="space-y-3">
        <div className="p-3 border border-primary-200 rounded-lg bg-primary-50">
          <p className="font-medium text-primary-900">💪 Thêm Plank</p>
          <p className="text-sm text-primary-700">Tăng sức mạnh core</p>
        </div>
        <div className="p-3 border border-gray-200 rounded-lg">
          <p className="font-medium">🏃 Thêm Cardio</p>
          <p className="text-sm text-gray-600">Cải thiện sức bền</p>
        </div>
      </div>
    </div>
  );
}
