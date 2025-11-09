"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/useApi";

export function ExerciseGrid() {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Đang tải danh mục...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-2">⚠️ Lỗi: {(error as Error).message}</p>
        <p className="text-sm text-gray-600">
          Vui lòng kiểm tra backend đang chạy tại http://127.0.0.1:8000
        </p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700">
          Chưa có danh mục nào. Vui lòng thêm dữ liệu vào MongoDB.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/category/${category.id}`}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer block"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {category.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{category.category}</p>
          <p className="text-gray-700 mb-4">{category.description}</p>
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
            {category.difficulty}
          </span>
        </Link>
      ))}
    </div>
  );
}
