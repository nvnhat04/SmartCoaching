"use client";

import { AIChat } from "@/components/recommendation/AIChat";
import { ExerciseRecommendations } from "@/components/recommendation/ExerciseRecommendations";

export default function RecommendationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Tư vấn 
        </h1>
        <p className="text-gray-600 mt-1">
          Nhận lộ trình tập luyện được cá nhân hóa dựa trên thể trạng và mục tiêu của bạn
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIChat />
        </div>
        <div className="space-y-6">
          <ExerciseRecommendations />
        </div>
      </div>
    </div>
  );
}
