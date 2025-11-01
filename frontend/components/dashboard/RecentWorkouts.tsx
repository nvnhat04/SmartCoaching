"use client";

export function RecentWorkouts() {
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
