#!/usr/bin/env node

/**
 * Quick Seed Script
 * Creates only admin user for quick setup
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-coaching";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  age: Number,
  gender: String,
  weight: Number,
  height: Number,
  bmi: Number,
  goals: [String],
  fitnessLevel: String,
}, { timestamps: true });

async function quickSeed() {
  try {
    console.log("🌱 Quick Seed: Creating admin user...");
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const adminEmail = "admin@smartcoaching.com";
    const adminPassword = "admin123";

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log("⚠️  Admin already exists!");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: admin123`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: hashedPassword,
        age: 30,
        gender: "male",
        weight: 70,
        height: 175,
        bmi: 22.9,
        goals: ["Maintain fitness", "Build strength"],
        fitnessLevel: "advanced",
      });

      console.log("✅ Admin user created successfully!");
      console.log("\n📧 Login Credentials:");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
      console.log(`   User ID: ${admin._id}`);
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

quickSeed();
