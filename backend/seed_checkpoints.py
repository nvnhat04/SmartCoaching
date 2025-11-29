"""
Script để seed checkpoints vào MongoDB cho các bài tập.
Chạy: python seed_checkpoints.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Sample checkpoints data - điều chỉnh theo bài tập thực tế của bạn
EXERCISE_CHECKPOINTS = {
    # Exercise ID 1: Nhịp 1-8 (ví dụ)
    1: [
        {
            "name": "dong_tac_1",
            "angles": {
                "left_elbow": 6.35,
                "right_elbow": 5.03,
                "left_shoulder": 160.76,
                "right_shoulder": 178.18,
                "left_hip": 175.96,
                "right_hip": 176.41,
                "left_knee": 179.37,
                "right_knee": 179.32
            }
        },
        {
            "name": "dong_tac_2",
            "angles": {
                "left_elbow": 88.09,
                "right_elbow": 94.93,
                "left_knee": 106.27,
                "right_knee": 111.86,
                "left_hip": 138.46,
                "right_hip": 142.79,
                "left_shoulder": 17.35,
                "right_shoulder": 17.14
            }
        },
        {
            "name": "dong_tac_3",
            "angles": {
                "left_elbow": 174.68,
                "right_elbow": 169.42,
                "left_knee": 124.61,
                "right_knee": 40.42,
                "left_hip": 139.35,
                "right_hip": 89.31,
                "left_shoulder": 160.33,
                "right_shoulder": 162.25
            }
        }
    ],
    # Exercise ID 2: Nhịp 9-16 (ví dụ tương tự)
    2: [
    {
        "name": "nhip_1",
        "angles": {
            "left_elbow": 175,
            "right_elbow": 175,
            "left_shoulder": 155,
            "right_shoulder": 155,
            "left_hip": 95,
            "right_hip": 175,
            "left_knee": 85,
            "right_knee": 178
        }
    },
    {
        "name": "nhip_2",
        "angles": {
            "left_elbow": 178,
            "right_elbow": 178,
            "left_shoulder": 15,
            "right_shoulder": 15,
            "left_hip": 178,
            "right_hip": 178,
            "left_knee": 178,
            "right_knee": 178
        }
    },
    {
        "name": "nhip_3",
        "angles": {
            "left_elbow": 175,
            "right_elbow": 175,
            "left_shoulder": 155,
            "right_shoulder": 155,
            "left_hip": 175,
            "right_hip": 95,
            "left_knee": 178,
            "right_knee": 85
        }
    },
    {
        "name": "nhip_4",
        "angles": {
            "left_elbow": 178,
            "right_elbow": 178,
            "left_shoulder": 15,
            "right_shoulder": 15,
            "left_hip": 178,
            "right_hip": 178,
            "left_knee": 178,
            "right_knee": 178
        }
    },
    {
        "name": "nhip_5",
        "angles": {
            "left_elbow": 25,
            "right_elbow": 25,
            "left_shoulder": 85,
            "right_shoulder": 85,
            "left_hip": 178,
            "right_hip": 178,
            "left_knee": 178,
            "right_knee": 178
        }
    },
    {
        "name": "nhip_6",
        "angles": {
            "left_elbow": 175,
            "right_elbow": 175,
            "left_shoulder": 95,
            "right_shoulder": 95,
            "left_hip": 178,
            "right_hip": 178,
            "left_knee": 178,
            "right_knee": 178
        }
    },
    {
        "name": "nhip_7",
        "angles": {
            "left_elbow": 25,
            "right_elbow": 25,
            "left_shoulder": 85,
            "right_shoulder": 85,
            "left_hip": 178,
            "right_hip": 178,
            "left_knee": 178,
            "right_knee": 178
        }
    },
    {
        "name": "nhip_8",
        "angles": {
            "left_elbow": 178,
            "right_elbow": 178,
            "left_shoulder": 15,
            "right_shoulder": 15,
            "left_hip": 178,
            "right_hip": 178,
            "left_knee": 178,
            "right_knee": 178
        }
    }
],
    # Thêm các exercise khác tương tự...
    3: [
        {
            "name": "dong_tac_1",
            "angles": {
                "left_elbow": 7.0,
                "right_elbow": 6.0,
                "left_shoulder": 162.0,
                "right_shoulder": 175.0,
                "left_hip": 176.0,
                "right_hip": 174.0,
                "left_knee": 179.0,
                "right_knee": 177.0
            }
        }
    ],
    4: [
        {
            "name": "dong_tac_1",
            "angles": {
                "left_elbow": 8.0,
                "right_elbow": 7.0,
                "left_shoulder": 163.0,
                "right_shoulder": 176.0,
                "left_hip": 177.0,
                "right_hip": 175.0,
                "left_knee": 180.0,
                "right_knee": 178.0
            }
        }
    ]
}


async def seed_checkpoints():
    """Seed checkpoints vào collection exercises"""
    mongodb_uri = os.getenv("MONGODB_URI")
    
    if not mongodb_uri:
        print("❌ MONGODB_URI not found in .env file")
        return
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongodb_uri)
        db_name = mongodb_uri.split("/")[-1].split("?")[0] or "smart-coaching"
        db = client[db_name]
        
        # Test connection
        await client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {db_name}")
        
        exercises_col = db.exercises
        
        # Update each exercise with checkpoints
        updated_count = 0
        for exercise_id, checkpoints in EXERCISE_CHECKPOINTS.items():
            result = await exercises_col.update_one(
                {"id": exercise_id},
                {"$set": {"checkpoints": checkpoints}}
            )
            
            if result.modified_count > 0:
                updated_count += 1
                print(f"✅ Updated exercise {exercise_id} with {len(checkpoints)} checkpoints")
            else:
                print(f"⚠️  Exercise {exercise_id} not found or no changes made")
        
        print(f"\n🎉 Seed completed! Updated {updated_count} exercises")
        
        # Close connection
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    print("🌱 Seeding checkpoints to MongoDB...\n")
    asyncio.run(seed_checkpoints())
