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
import { useSidebar } from "@/contexts/SidebarContext";

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
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header with Toggle */}
      <div className="p-6 flex items-center justify-between">
        {isCollapsed ? (
          <div className="w-full flex justify-center">
            <span className="text-3xl">🏋️</span>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-primary-600">
            🏋️ Smart Coaching
          </h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.includes(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg transition-colors group relative",
                isCollapsed ? "justify-center p-3" : "px-4 py-3",
                isActive
                  ? "bg-primary-50 text-primary-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              )}
              title={isCollapsed ? item.name : ""}
            >
              <Icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
              
              {/* Tooltip khi thu gọn */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {isCollapsed ? (
          <div className="text-center text-xs text-gray-500">©</div>
        ) : (
          <div className="text-xs text-gray-500 text-center">
            © 2025 Smart Coaching
          </div>
        )}
      </div>
    </div>
  );
}
