import mongoose, { Schema, model, models } from "mongoose";

const WorkoutSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: Date,
    duration: Number,
    reps: {
      type: Number,
      default: 0,
    },
    averageScore: Number,
    maxScore: Number,
    minScore: Number,
    caloriesBurned: Number,
    videoRecordingUrl: String,
    poseData: [
      {
        timestamp: Number,
        score: Number,
        feedback: String,
        status: {
          type: String,
          enum: ["correct", "warning", "error"],
        },
        keypoints: Schema.Types.Mixed,
        angles: Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const WorkoutSession =
  models.WorkoutSession || model("WorkoutSession", WorkoutSessionSchema);
