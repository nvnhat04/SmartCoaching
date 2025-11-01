"use client";

import { useState } from "react";
import { WebcamCapture } from "./WebcamCapture";
import { PoseAnalysis } from "./PoseAnalysis";
import { Button } from "@/components/ui/Button";

interface WorkoutSessionProps {
  exercise: string;
  onEnd: () => void;
}

export function WorkoutSession({ exercise, onEnd }: WorkoutSessionProps) {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{exercise}</h2>
            <Button
              variant={isActive ? "danger" : "primary"}
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? "Dừng" : "Bắt đầu"}
            </Button>
          </div>
          <WebcamCapture />
        </div>
      </div>

      <div className="space-y-6">
        <PoseAnalysis />
        <Button variant="secondary" onClick={onEnd} className="w-full">
          Kết thúc buổi tập
        </Button>
      </div>
    </div>
  );
}
