import mongoose, { Schema, model, models } from "mongoose";

const WorkoutPlanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    duration: Number,
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    goal: String,
    exercises: [
      {
        day: Number,
        exerciseId: {
          type: Schema.Types.ObjectId,
          ref: "Exercise",
        },
        sets: Number,
        reps: Number,
        restTime: Number,
        notes: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

export const WorkoutPlan =
  models.WorkoutPlan || model("WorkoutPlan", WorkoutPlanSchema);
