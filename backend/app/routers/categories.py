from fastapi import APIRouter, HTTPException
from app.database import get_categories_collection, get_exercises_collection
from typing import List, Optional, Dict
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["Categories & Exercises"])


# Pydantic models
class Checkpoint(BaseModel):
    name: str
    angles: dict  # e.g., {"left_elbow": 6.35, "right_elbow": 5.03, ...}

class Exercise(BaseModel):
    id: int
    category_id: int
    name: str
    duration: str
    reps: str
    difficulty: str
    thumbnail: str
    videoUrl: str
    checkpoints: Optional[List[Checkpoint]] = []


class Category(BaseModel):
    id: int
    name: str
    category: str
    difficulty: str
    description: str


@router.get("/categories", response_model=List[Category])
async def get_categories():
    """Get all categories with their exercises."""
    categories_col = get_categories_collection()
    
    if categories_col is None:
        # Return mock data if DB not connected
        raise HTTPException(
            status_code=503,
            detail="Database not connected. Please configure MongoDB URI in backend/.env"
        )
    
    try:
        categories = await categories_col.find({}, {"_id": 0}).to_list(length=100)
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: int):
    """Get a specific category by ID."""
    categories_col = get_categories_collection()
    
    if categories_col is None:
        raise HTTPException(
            status_code=503,
            detail="Database not connected. Please configure MongoDB URI in backend/.env"
        )
    
    try:
        category = await categories_col.find_one({"id": category_id}, {"_id": 0})
        if not category:
            raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
        return category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/exercises", response_model=List[Exercise])
async def get_exercises(category_id: Optional[int] = None):
    """Get all exercises, optionally filtered by category."""
    exercises_col = get_exercises_collection()
    
    if exercises_col is None:
        raise HTTPException(
            status_code=503,
            detail="Database not connected. Please configure MongoDB URI in backend/.env"
        )
    
    try:
        query = {"category_id": category_id} if category_id else {}
        exercises = await exercises_col.find(query).to_list(length=1000)
        return exercises
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/exercises/{exercise_id}", response_model=Exercise)
async def get_exercise(exercise_id: int):
    """Get a specific exercise by ID."""
    exercises_col = get_exercises_collection()
    
    if exercises_col is None:
        raise HTTPException(
            status_code=503,
            detail="Database not connected. Please configure MongoDB URI in backend/.env"
        )
    
    try:
        exercise = await exercises_col.find_one({"id": exercise_id})
        if not exercise:
            raise HTTPException(status_code=404, detail=f"Exercise {exercise_id} not found")
        return exercise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
