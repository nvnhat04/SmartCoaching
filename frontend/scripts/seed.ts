import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/mongodb";
import { User } from "../models/User";
import { Exercise } from "../models/Exercise";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Create Admin User
    const adminEmail = "admin@smartcoaching.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists");
    } else {
      const hashedPassword = await bcrypt.hash("admin123", 12);
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
      console.log("✅ Admin user created:");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: admin123`);
      console.log(`   ID: ${admin._id}`);
    }

    // Create Sample Users
    const sampleUsers = [
      {
        name: "Nguyễn Văn A",
        email: "user1@example.com",
        password: await bcrypt.hash("password123", 12),
        age: 25,
        gender: "male",
        weight: 75,
        height: 170,
        bmi: 25.9,
        goals: ["Lose weight", "Build muscle"],
        fitnessLevel: "beginner",
      },
      {
        name: "Trần Thị B",
        email: "user2@example.com",
        password: await bcrypt.hash("password123", 12),
        age: 28,
        gender: "female",
        weight: 55,
        height: 160,
        bmi: 21.5,
        goals: ["Increase endurance", "Stay healthy"],
        fitnessLevel: "intermediate",
      },
    ];

    for (const userData of sampleUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
        console.log(`✅ Sample user created: ${userData.email}`);
      } else {
        console.log(`⚠️  User already exists: ${userData.email}`);
      }
    }

    // Create Sample Exercises
    const exercises = [
      {
        name: "Squat",
        category: "squat",
        description: "Bài tập squat cơ bản giúp tăng cường sức mạnh chân và mông",
        difficulty: "medium",
        duration: 180,
        caloriesPerMinute: 8,
        instructions: [
          "Đứng thẳng, chân rộng bằng vai",
          "Hạ thấp người xuống như đang ngồi xuống ghế",
          "Giữ lưng thẳng và đầu gối không vượt quá mũi chân",
          "Đẩy người lên về vị trí ban đầu",
        ],
        targetMuscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
        equipment: ["None"],
      },
      {
        name: "Push-up",
        category: "pushup",
        description: "Bài tập chống đẩy giúp tăng cường sức mạnh thượng cơ thể",
        difficulty: "medium",
        duration: 120,
        caloriesPerMinute: 7,
        instructions: [
          "Úp mặt xuống sàn, tay rộng bằng vai",
          "Giữ cơ thể thẳng từ đầu đến chân",
          "Hạ thấp người xuống cho đến khi ngực gần chạm sàn",
          "Đẩy người lên về vị trí ban đầu",
        ],
        targetMuscles: ["Chest", "Shoulders", "Triceps", "Core"],
        equipment: ["None"],
      },
      {
        name: "Plank",
        category: "plank",
        description: "Bài tập plank giúp tăng cường sức mạnh cơ core",
        difficulty: "easy",
        duration: 60,
        caloriesPerMinute: 5,
        instructions: [
          "Nằm sấp, chống khuỷu tay xuống sàn",
          "Nâng người lên, giữ cơ thể thẳng",
          "Giữ vai thẳng hàng với khuỷu tay",
          "Giữ tư thế càng lâu càng tốt",
        ],
        targetMuscles: ["Core", "Shoulders", "Glutes"],
        equipment: ["None"],
      },
      {
        name: "Mountain Climbers",
        category: "other",
        description: "Bài tập cardio toàn thân giúp đốt cháy calo",
        difficulty: "hard",
        duration: 90,
        caloriesPerMinute: 10,
        instructions: [
          "Bắt đầu ở tư thế plank",
          "Kéo đầu gối phải về phía ngực",
          "Nhanh chóng chuyển chân, kéo đầu gối trái về phía ngực",
          "Tiếp tục xen kẽ nhanh chóng",
        ],
        targetMuscles: ["Core", "Shoulders", "Legs", "Cardio"],
        equipment: ["None"],
      },
      {
        name: "Yoga - Sun Salutation",
        category: "yoga",
        description: "Chuỗi động tác yoga cơ bản giúp giãn cơ và thư giãn",
        difficulty: "easy",
        duration: 300,
        caloriesPerMinute: 4,
        instructions: [
          "Bắt đầu ở tư thế núi",
          "Nâng tay lên trên đầu, cúi người về phía trước",
          "Bước chân ra sau vào tư thế plank",
          "Hạ thấp xuống, sau đó đẩy lên tư thế con rắn",
          "Đẩy người lên tư thế chó úp mặt",
          "Bước chân về phía trước và đứng lên",
        ],
        targetMuscles: ["Full Body", "Flexibility"],
        equipment: ["Yoga Mat"],
      },
      {
        name: "Stretching Routine",
        category: "stretching",
        description: "Bài tập giãn cơ toàn thân",
        difficulty: "easy",
        duration: 600,
        caloriesPerMinute: 3,
        instructions: [
          "Giãn cơ cổ: Nghiêng đầu sang 4 hướng",
          "Giãn vai: Xoay vai và kéo tay qua ngực",
          "Giãn lưng: Cúi người về phía trước",
          "Giãn chân: Kéo đầu gối lên ngực, tách chân",
        ],
        targetMuscles: ["Full Body", "Flexibility"],
        equipment: ["None"],
      },
    ];

    for (const exerciseData of exercises) {
      const existing = await Exercise.findOne({ name: exerciseData.name });
      if (!existing) {
        await Exercise.create(exerciseData);
        console.log(`✅ Exercise created: ${exerciseData.name}`);
      } else {
        console.log(`⚠️  Exercise already exists: ${exerciseData.name}`);
      }
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Summary:");
    console.log(`   Admin: admin@smartcoaching.com / admin123`);
    console.log(`   Sample users: 2 users created`);
    console.log(`   Exercises: ${exercises.length} exercises created`);
    console.log("\n✨ You can now login and start using the application!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
}

// Run seeder
seedDatabase();
