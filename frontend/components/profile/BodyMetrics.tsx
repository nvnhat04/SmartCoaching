"use client";

export function BodyMetrics() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chỉ số cơ thể
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">BMI</p>
          <p className="text-2xl font-bold">22.5</p>
          <p className="text-xs text-green-600">Bình thường</p>
        </div>
      </div>
    </div>
  );
}
