"use client";

export function PoseAnalysis() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Phân tích tư thế</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Điểm số:</span>
          <span className="text-2xl font-bold text-green-600">8.5/10</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Số lần lặp:</span>
          <span className="text-2xl font-bold">12</span>
        </div>
      </div>
    </div>
  );
}
