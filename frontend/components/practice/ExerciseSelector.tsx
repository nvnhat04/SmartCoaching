"use client";

interface ExerciseSelectorProps {
  onSelect: (exercise: string) => void;
}

export function ExerciseSelector({ onSelect }: ExerciseSelectorProps) {
  const exercises = ["Squat", "Push-up", "Plank", "Yoga"];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {exercises.map((exercise) => (
        <button
          key={exercise}
          onClick={() => onSelect(exercise)}
          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-2">💪</div>
          <p className="font-semibold">{exercise}</p>
        </button>
      ))}
    </div>
  );
}
