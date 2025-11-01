import mongoose, { Schema, model, models } from "mongoose";

const ExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["squat", "pushup", "plank", "yoga", "stretching", "other"],
      required: true,
    },
    description: String,
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    duration: Number,
    caloriesPerMinute: Number,
    videoUrl: String,
    thumbnailUrl: String,
    instructions: [String],
    targetMuscles: [String],
    equipment: [String],
  },
  {
    timestamps: true,
  }
);

export const Exercise = models.Exercise || model("Exercise", ExerciseSchema);
