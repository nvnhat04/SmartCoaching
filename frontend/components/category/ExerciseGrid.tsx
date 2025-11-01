"use client";

const exercises = [
  {
    id: "squat",
    name: "Squat",
    category: "Lower Body",
    difficulty: "Medium",
    description: "Bài tập cho chân và mông",
    icon: "🏋️",
  },
  {
    id: "pushup",
    name: "Push-up",
    category: "Upper Body",
    difficulty: "Medium",
    description: "Bài tập cho ngực và vai",
    icon: "💪",
  },
  {
    id: "plank",
    name: "Plank",
    category: "Core",
    difficulty: "Easy",
    description: "Bài tập cho cơ bụng",
    icon: "🎯",
  },
  {
    id: "yoga",
    name: "Yoga",
    category: "Flexibility",
    difficulty: "Easy",
    description: "Các tư thế yoga cơ bản",
    icon: "🧘",
  },
  {
    id: "stretching",
    name: "Stretching",
    category: "Flexibility",
    difficulty: "Easy",
    description: "Bài tập giãn cơ",
    icon: "🤸",
  },
];

export function ExerciseGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exercises.map((exercise) => (
        <div
          key={exercise.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
        >
          <div className="text-4xl mb-4">{exercise.icon}</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {exercise.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{exercise.category}</p>
          <p className="text-gray-700 mb-4">{exercise.description}</p>
          <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
            {exercise.difficulty}
          </span>
        </div>
      ))}
    </div>
  );
}
