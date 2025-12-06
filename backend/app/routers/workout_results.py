from fastapi import APIRouter, HTTPException
from app.database import get_db
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/results", tags=["Workout Results"])


# Pydantic models
class RepResult(BaseModel):
    """Kết quả 1 lần thực hiện (1 rep)"""
    rep_number: int
    score: float
    checkpoint_name: str
    angles: dict
    feedback: str
    timestamp: str


class SaveWorkoutResult(BaseModel):
    """Lưu kết quả buổi tập"""
    user_id: str
    exercise_id: int
    category_id: int
    started_at: str
    ended_at: str
    total_reps: int
    rep_results: List[RepResult]


@router.post("")
async def save_workout_result(data: SaveWorkoutResult):
    """
    Lưu kết quả buổi tập vào database
    Tự động tính: average_score, max_score, min_score, duration, calories
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    collection = db.results
    
    # Tính toán các chỉ số
    scores = [r.score for r in data.rep_results]
    average_score = round(sum(scores) / len(scores), 2) if scores else 0
    max_score = round(max(scores), 2) if scores else 0
    min_score = round(min(scores), 2) if scores else 0
    
    # Tính duration (giây)
    start = datetime.fromisoformat(data.started_at.replace('Z', '+00:00'))
    end = datetime.fromisoformat(data.ended_at.replace('Z', '+00:00'))
    duration_seconds = int((end - start).total_seconds())
    
    # Tính calories (giả sử 5 cal/phút trung bình)
    calories_burned = round((duration_seconds / 60) * 5, 1)
    
    # Tạo document
    result_doc = {
        "user_id": data.user_id,
        "exercise_id": data.exercise_id,
        "category_id": data.category_id,
        "started_at": data.started_at,
        "ended_at": data.ended_at,
        "total_reps": data.total_reps,
        "average_score": average_score,
        "max_score": max_score,
        "min_score": min_score,
        "duration_seconds": duration_seconds,
        "calories_burned": calories_burned,
        "rep_results": [r.dict() for r in data.rep_results],
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    result = await collection.insert_one(result_doc)
    
    return {
        "success": True,
        "id": str(result.inserted_id),
        "average_score": average_score,
        "total_reps": data.total_reps,
        "duration_seconds": duration_seconds,
        "calories_burned": calories_burned
    }


@router.get("/user/{user_id}/stats")
async def get_user_stats(user_id: str):
    """
    Lấy thống kê dashboard cho user
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    collection = db.results
    
    # Lấy thời gian hiện tại UTC
    now = datetime.utcnow()
    
    # Tính thứ 2 tuần này (đầu tuần) - chuẩn hóa về 00:00:00 UTC
    week_start = (now - timedelta(days=now.weekday())).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    
    # Format theo định dạng ISO 8601 với .000Z
    week_start_str = week_start.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    
    # Debug: In ra để kiểm tra
    print(f"🔍 Querying stats for user: {user_id}")
    print(f"📅 Now (UTC): {now.isoformat()}")
    print(f"📅 Week start (Monday 00:00 UTC): {week_start_str}")
    
    # Query tuần này
    this_week = await collection.find({
        "user_id": user_id,
        "started_at": {"$gte": week_start_str}
    }).to_list(length=1000)
    
    print(f"✅ Found {len(this_week)} workouts this week")
    
    # Lấy dữ liệu tuần trước
    last_week_start = week_start - timedelta(days=7)
    last_week_start_str = last_week_start.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    
    last_week = await collection.find({
        "user_id": user_id,
        "started_at": {
            "$gte": last_week_start_str,
            "$lt": week_start_str
        }
    }).to_list(length=1000)
    
    print(f"✅ Found {len(last_week)} workouts last week")
    
    # Tính toán tuần này
    total_workouts = len(this_week)
    total_duration = sum(w.get("duration_seconds", 0) for w in this_week)
    total_time = total_duration / 3600  # Chuyển sang giờ
    avg_score = sum(w.get("average_score", 0) for w in this_week) / total_workouts if total_workouts > 0 else 0
    total_calories = sum(w.get("calories_burned", 0) for w in this_week)
    
    # Tính toán tuần trước
    last_total = len(last_week)
    last_duration = sum(w.get("duration_seconds", 0) for w in last_week)
    last_time = last_duration / 3600
    last_score = sum(w.get("average_score", 0) for w in last_week) / last_total if last_total > 0 else 0
    last_calories = sum(w.get("calories_burned", 0) for w in last_week)
    
    # Tính % thay đổi
    workout_change = round(((total_workouts - last_total) / last_total * 100) if last_total > 0 else 0, 1)
    time_change = round(((total_time - last_time) / last_time * 100) if last_time > 0 else 0, 1)
    score_change = round(avg_score - last_score, 1)
    calories_change = round(((total_calories - last_calories) / last_calories * 100) if last_calories > 0 else 0, 1)
    
    print(f"📊 Stats: workouts={total_workouts}, time={total_time:.1f}h, score={avg_score:.1f}, calo={total_calories:.0f}")
    
    return {
        "total_workouts": total_workouts,
        "workout_change_percent": workout_change,
        "total_time_hours": round(total_time, 1),
        "time_change_percent": time_change,
        "average_score": round(avg_score, 1),
        "score_change": score_change,
        "total_calories": round(total_calories, 0),
        "calories_change_percent": calories_change
    }


@router.get("/user/{user_id}/recent")
async def get_recent_workouts(user_id: str, limit: int = 10):
    """
    Lấy danh sách buổi tập gần đây
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    collection = db.results
    exercises_col = db.exercises
    
    workouts = await collection.find({
        "user_id": user_id
    }).sort("started_at", -1).limit(limit).to_list(length=limit)
    
    # Lấy thông tin exercise
    result = []
    for w in workouts:
        exercise = await exercises_col.find_one({"id": w["exercise_id"]}, {"_id": 0})
        result.append({
            "id": str(w["_id"]),
            "exercise_name": exercise.get("name") if exercise else "Unknown",
            "started_at": w["started_at"],
            "total_reps": w["total_reps"],
            "average_score": w["average_score"],
            "duration_seconds": w["duration_seconds"]
        })
    
    return result


@router.get("/user/{user_id}/progress")
async def get_progress_chart(user_id: str, days: int = 30):
    """
    Lấy dữ liệu biểu đồ tiến độ
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    collection = db.results
    
    # Chuẩn hóa về đầu ngày UTC
    start_date = (datetime.utcnow() - timedelta(days=days)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    start_date_str = start_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    
    print(f"📊 Querying progress for user: {user_id}, from {start_date_str}")
    
    workouts = await collection.find({
        "user_id": user_id,
        "started_at": {"$gte": start_date_str}
    }).to_list(length=1000)
    
    print(f"✅ Found {len(workouts)} workouts for progress chart")
    
    # Group by date
    by_date = {}
    for w in workouts:
        date = w["started_at"][:10]  # Lấy YYYY-MM-DD
        if date not in by_date:
            by_date[date] = []
        by_date[date].append(w["average_score"])
    
    print(f"📅 Dates found: {sorted(by_date.keys())}")
    
    result = []
    for date in sorted(by_date.keys()):
        scores = by_date[date]
        result.append({
            "date": date,
            "average_score": round(sum(scores) / len(scores), 1),
            "workout_count": len(scores)
        })
    
    return result


@router.get("/user/{user_id}/calendar")
async def get_calendar(user_id: str, days: int = 30):
    """
    Lấy dữ liệu calendar - tổng calories theo ngày
    """
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database connection failed")
    
    collection = db.results
    
    # Chuẩn hóa về đầu ngày UTC
    start_date = (datetime.utcnow() - timedelta(days=days)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    start_date_str = start_date.strftime("%Y-%m-%dT%H:%M:%S.000Z")
    
    print(f"📅 Querying calendar for user: {user_id}, from {start_date_str}")
    
    # Lấy tất cả workouts (không giới hạn)
    workouts = await collection.find({
        "user_id": user_id,
        "started_at": {"$gte": start_date_str}
    }).to_list(length=None)
    
    print(f"✅ Found {len(workouts)} workouts for calendar")
    
    # Group by date - tính tổng calories
    by_date = {}
    for w in workouts:
        date = w["started_at"][:10]  # Lấy YYYY-MM-DD
        if date not in by_date:
            by_date[date] = {"total_calories": 0, "total_score": 0, "workout_count": 0}
        by_date[date]["total_calories"] += w.get("calories_burned", 0)
        by_date[date]["total_score"] += w.get("average_score", 0)
        by_date[date]["workout_count"] += 1
    
    result = []
    for date, data in by_date.items():
        result.append({
            "date": date,
            "total_calories": round(data["total_calories"], 1),
            "average_score": round(data["total_score"] / data["workout_count"], 1),
            "workout_count": data["workout_count"]
        })
    
    return sorted(result, key=lambda x: x["date"])