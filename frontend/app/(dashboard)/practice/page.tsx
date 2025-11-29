"use client";

import { useState } from "react";
import { WebcamCapture } from "@/components/practice/WebcamCapture";
import { PoseAnalysis } from "@/components/practice/PoseAnalysis";
import { ExerciseSelector } from "@/components/practice/ExerciseSelector";
import { WorkoutSession } from "@/components/practice/WorkoutSession";

export default function PracticePage() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Tập luyện 
        </h1>
        <p className="text-gray-600 mt-1">
          AI sẽ phân tích tư thế và đưa ra phản hồi real-time
        </p>
      </div>

      {!sessionStarted ? (
        <ExerciseSelector
          onSelect={(exercise) => {
            setSelectedExercise(exercise);
            setSessionStarted(true);
          }}
        />
      ) : (
        <WorkoutSession
          exercise={selectedExercise!}
          onEnd={() => {
            setSessionStarted(false);
            setSelectedExercise(null);
          }}
        />
      )}
    </div>
  );
}
