"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  User,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Danh mục",
    href: "/category",
    icon: BookOpen,
  },
  {
    name: "Tư vấn AI",
    href: "/recommendation",
    icon: MessageSquare,
  },
  {
    name: "Hồ sơ",
    href: "/profile",
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">
          🏋️ Smart Coaching
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.includes(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2025 Smart Coaching
        </div>
      </div>
    </div>
  );
}
