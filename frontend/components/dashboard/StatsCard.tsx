"use client";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}

export function StatsCard({ title, value, change, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className={`text-sm mt-2 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {change} so với tuần trước
          </p>
        </div>
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
