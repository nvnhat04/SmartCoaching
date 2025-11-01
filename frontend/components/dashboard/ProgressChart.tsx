"use client";

export function ProgressChart() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Biểu đồ tiến bộ
      </h3>
      <div className="h-64 flex items-center justify-center text-gray-400">
        {/* Chart will be integrated here with Chart.js or Recharts */}
        <p>Biểu đồ tiến bộ theo thời gian</p>
      </div>
    </div>
  );
}
