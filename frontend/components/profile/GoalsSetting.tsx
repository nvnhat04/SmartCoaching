"use client";

export function GoalsSetting() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Mục tiêu
      </h3>
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded" />
          <span>Giảm cân</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded" />
          <span>Tăng cơ</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="rounded" />
          <span>Tăng sức bền</span>
        </label>
      </div>
    </div>
  );
}
