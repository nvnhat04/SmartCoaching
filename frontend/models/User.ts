import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    image: String,
    age: Number,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    weight: Number,
    height: Number,
    bmi: Number,
    goals: [String],
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
  },
  {
    timestamps: true,
  }
);

export const User = models.User || model("User", UserSchema);
