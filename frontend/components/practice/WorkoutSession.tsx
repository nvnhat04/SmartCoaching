"use client";

import { useState } from "react";
import { WebcamCapture } from "./WebcamCapture";
import { PoseAnalysis } from "./PoseAnalysis";
import { Button } from "@/components/ui/Button";

interface WorkoutSessionProps {
  exercise: string;
  active: boolean;
  checkpoints?: Array<{
    name: string;
    angles: Record<string, number>;
  }>;
  onEnd: () => void;
}

export function WorkoutSession({ exercise, active, checkpoints, onEnd }: WorkoutSessionProps) {
  return (
    <div className="w-full">
      <WebcamCapture active={active} checkpoints={checkpoints} />
    </div>
  );
}
