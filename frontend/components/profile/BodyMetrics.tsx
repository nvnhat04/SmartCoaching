"use client";

import { useSession } from "next-auth/react";
import { calculateBMI, getBMICategory } from "@/lib/utils";

export function BodyMetrics() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const height = user?.height || 175; // cm
  const weight = user?.weight || 75; // kg
  const bmi = user?.bmi || (height && weight ? calculateBMI(weight, height) : 0);
  const bmiCategory = bmi > 0 ? getBMICategory(bmi) : "Chưa có dữ liệu";

  const getBMIColor = (category: string) => {
    if (category === "Bình thường") return "text-green-600";
    if (category === "Thiếu cân") return "text-blue-600";
    if (category === "Thừa cân") return "text-yellow-600";
    if (category === "Béo phì") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Chỉ số cơ thể
      </h3>
      <div className="space-y-4">
        {/* Chiều cao */}
        <div>
          <p className="text-sm text-gray-600">Chiều cao</p>
          <p className="text-2xl font-bold">
            {height > 0 ? `${height} cm` : "Chưa cập nhật"}
          </p>
        </div>

        {/* Dấu gạch phân tách */}
        <div className="border-t border-gray-200"></div>

        {/* Cân nặng */}
        <div>
          <p className="text-sm text-gray-600">Cân nặng</p>
          <p className="text-2xl font-bold">
            {weight > 0 ? `${weight} kg` : "Chưa cập nhật"}
          </p>
        </div>

        {/* Dấu gạch phân tách */}
        <div className="border-t border-gray-200"></div>

        {/* BMI */}
        <div>
          <p className="text-sm text-gray-600">BMI</p>
          <p className="text-2xl font-bold">
            {bmi > 0 ? bmi.toFixed(1) : "—"}
          </p>
          <p className={`text-xs ${getBMIColor(bmiCategory)}`}>
            {bmiCategory}
          </p>
        </div>
      </div>
    </div>
  );
}
