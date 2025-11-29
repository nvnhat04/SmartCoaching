"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { LogOut, Bell, Menu, X } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";

interface HeaderProps {
  user: any;
}

export function Header({ user }: HeaderProps) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
}
