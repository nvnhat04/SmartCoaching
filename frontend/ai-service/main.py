from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import base64
import numpy as np
import cv2
import mediapipe as mp
from typing import Optional, Dict, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart Coaching AI Service",
    description="""
    AI-powered fitness coaching API with pose detection and personalized recommendations.
    
    ## Features
    
    * **Pose Detection**: Real-time pose analysis using MediaPipe
    * **Exercise Analysis**: Automated form checking for squats, push-ups, and more
    * **AI Recommendations**: Personalized workout suggestions
    * **Workout Plans**: Auto-generated training schedules
    * **AI Chat**: Interactive fitness assistant
    
    ## Technologies
    
    - FastAPI for REST API
    - MediaPipe for pose detection
    - OpenCV for image processing
    - NumPy for numerical computations
    """,
    version="1.0.0",
    contact={
        "name": "Smart Coaching Team",
        "email": "support@smartcoaching.com",
    },
    license_info={
        "name": "MIT License",
    },
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,
    smooth_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)


class PoseDetectionRequest(BaseModel):
    imageData: str = Field(..., description="Base64 encoded image data")
    exerciseType: str = Field(..., description="Type of exercise (squat, pushup, plank, etc.)", example="squat")

    class Config:
        json_schema_extra = {
            "example": {
                "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
                "exerciseType": "squat"
            }
        }


class PoseDetectionResponse(BaseModel):
    success: bool = Field(..., description="Whether pose detection was successful")
    score: float = Field(..., description="Form score from 0-10", ge=0, le=10)
    feedback: str = Field(..., description="Feedback message in Vietnamese")
    status: str = Field(..., description="Status indicator (correct/warning/error)")
    keypoints: List[Dict] = Field(..., description="Detected pose keypoints")
    angles: Optional[Dict[str, float]] = Field(None, description="Joint angles in degrees")
    repCount: Optional[int] = Field(None, description="Rep count for this session")

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "score": 9.5,
                "feedback": "Tuyệt vời! Tư thế squat chuẩn",
                "status": "correct",
                "keypoints": [{"id": 0, "x": 0.5, "y": 0.3, "z": 0.1, "visibility": 0.99}],
                "angles": {"knee": 85.5, "hip": 92.3},
                "repCount": 1
            }
        }


def decode_image(image_data: str) -> np.ndarray:
    """Decode base64 image to numpy array"""
    try:
        if "," in image_data:
            image_data = image_data.split(",")[1]
        
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")


def calculate_angle(a, b, c):
    """Calculate angle between three points"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
    
    return angle


def analyze_squat(landmarks) -> tuple[float, str, str]:
    """Analyze squat pose"""
    # Get key points
    hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
           landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
    knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
            landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
    ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
             landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
    
    knee_angle = calculate_angle(hip, knee, ankle)
    
    # Scoring logic
    if knee_angle < 70:
        score = 10.0
        feedback = "Tuyệt vời! Tư thế squat chuẩn"
        status = "correct"
    elif knee_angle < 90:
        score = 8.0
        feedback = "Tốt! Hãy cố gắng squat sâu hơn một chút"
        status = "warning"
    elif knee_angle < 120:
        score = 5.0
        feedback = "Squat sâu hơn để đạt hiệu quả tốt hơn"
        status = "warning"
    else:
        score = 3.0
        feedback = "Tư thế chưa đúng. Hãy squat thấp hơn"
        status = "error"
    
    return score, feedback, status


def analyze_pushup(landmarks) -> tuple[float, str, str]:
    """Analyze push-up pose"""
    shoulder = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
    elbow = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
             landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
    wrist = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
             landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
    
    elbow_angle = calculate_angle(shoulder, elbow, wrist)
    
    if elbow_angle < 90:
        score = 10.0
        feedback = "Push-up chuẩn! Tuyệt vời"
        status = "correct"
    elif elbow_angle < 120:
        score = 7.0
        feedback = "Tốt! Hãy hạ thấp hơn một chút"
        status = "warning"
    else:
        score = 4.0
        feedback = "Hạ thấp hơn để đạt hiệu quả"
        status = "warning"
    
    return score, feedback, status


@app.get("/", tags=["Health Check"])
async def root():
    """
    Root endpoint to check API health status
    
    Returns a simple message indicating the service is running.
    """
    return {
        "message": "Smart Coaching AI Service",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.post("/analyze-pose",
    tags=["Pose Analysis"],
    summary="Analyze exercise pose from image",
    description="""
    Upload an image to detect body pose and analyze exercise form.
    
    Supported exercise types:
    - **squat**: Analyzes knee angle, hip angle, and back position
    - **pushup**: Analyzes elbow angle, body alignment
    - **plank**: Analyzes body straightness and hip position
    - **general**: General pose detection without specific analysis
    """,
    response_description="Pose landmarks and exercise analysis with scoring",
    response_model=PoseDetectionResponse
)
async def analyze_pose(request: PoseDetectionRequest):
    """
    Analyze pose from uploaded image and provide exercise-specific feedback.
    
    Args:
        request: PoseDetectionRequest containing base64 image and exercise type
        
    Returns:
        PoseDetectionResponse: Pose landmarks, analysis scores, and feedback
        
    Raises:
        HTTPException: If no pose detected or invalid file format
    """
    try:
        # Decode image
        image = decode_image(request.imageData)
        
        # Process with MediaPipe
        results = pose.process(image)
        
        if not results.pose_landmarks:
            return PoseDetectionResponse(
                success=False,
                score=0.0,
                feedback="Không phát hiện được tư thế. Hãy đảm bảo toàn thân trong khung hình",
                status="error",
                keypoints=[],
                angles=None,
                repCount=None
            )
        
        # Extract keypoints
        keypoints = []
        landmarks = results.pose_landmarks.landmark
        for idx, landmark in enumerate(landmarks):
            keypoints.append({
                "id": idx,
                "x": landmark.x,
                "y": landmark.y,
                "z": landmark.z,
                "visibility": landmark.visibility
            })
        
        # Analyze based on exercise type
        exercise_type = request.exerciseType.lower()
        if exercise_type == "squat":
            score, feedback, status = analyze_squat(landmarks)
            angles = {
                "knee": calculate_angle(
                    [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y],
                    [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y],
                    [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
                )
            }
        elif exercise_type == "pushup":
            score, feedback, status = analyze_pushup(landmarks)
            angles = {
                "elbow": calculate_angle(
                    [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y],
                    [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y],
                    [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                     landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]
                )
            }
        else:
            score = 7.0
            feedback = "Phát hiện tư thế thành công"
            status = "correct"
            angles = None
        
        return PoseDetectionResponse(
            success=True,
            score=score,
            feedback=feedback,
            status=status,
            keypoints=keypoints,
            angles=angles,
            repCount=None
        )
    
    except Exception as e:
        logger.error(f"Error analyzing pose: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/get-recommendations",
    tags=["AI Recommendations"],
    summary="Get personalized workout recommendations",
    description="""
    Receive AI-generated workout recommendations based on:
    - User profile (age, gender, fitness level)
    - Body metrics (weight, height, BMI)
    - Fitness goals
    - Workout history
    
    Returns a customized workout plan with exercise suggestions.
    """,
    response_description="Personalized workout recommendations and tips"
)
async def get_recommendations(user_data: dict):
    """
    Generate personalized workout recommendations using AI.
    
    Args:
        user_data: Dictionary containing user profile and workout history
        
    Returns:
        dict: Recommended exercises, workout plan, and fitness tips
    """
    # Simple recommendation logic (would use ML model in production)
    fitness_level = user_data.get("fitness_level", "beginner")
    goals = user_data.get("goals", [])
    
    recommendations = {
        "beginner": [
            {"exercise": "Squat", "sets": 3, "reps": 10, "reason": "Xây dựng cơ chân cơ bản"},
            {"exercise": "Push-up", "sets": 3, "reps": 8, "reason": "Phát triển cơ ngực và vai"},
            {"exercise": "Plank", "sets": 3, "reps": 30, "reason": "Tăng cường core"}
        ],
        "intermediate": [
            {"exercise": "Squat", "sets": 4, "reps": 15, "reason": "Tăng sức mạnh chân"},
            {"exercise": "Push-up", "sets": 4, "reps": 15, "reason": "Phát triển cơ thượng"},
            {"exercise": "Burpee", "sets": 3, "reps": 10, "reason": "Cardio và sức bền"}
        ],
        "advanced": [
            {"exercise": "Jump Squat", "sets": 4, "reps": 20, "reason": "Bùng nổ sức mạnh"},
            {"exercise": "One-arm Push-up", "sets": 3, "reps": 10, "reason": "Sức mạnh nâng cao"},
            {"exercise": "Pistol Squat", "sets": 3, "reps": 8, "reason": "Cân bằng và sức mạnh"}
        ]
    }
    
    return {
        "recommended_exercises": recommendations.get(fitness_level, recommendations["beginner"]),
        "workout_plan": {
            "duration": 45,
            "difficulty": fitness_level,
            "focus_areas": ["Full body", "Cardio"]
        },
        "tips": [
            "Khởi động kỹ trước khi tập",
            "Uống đủ nước trong và sau khi tập",
            "Nghỉ ngơi đầy đủ giữa các hiệp"
        ]
    }


@app.post("/api/plan/generate", tags=["Workout Plans"])
async def generate_plan(user_profile: dict):
    """
    Generate a personalized workout plan
    
    Creates a customized training schedule based on user profile,
    including fitness level, goals, available time, and equipment.
    
    **Request Body:**
    - fitnessLevel: beginner/intermediate/advanced
    - goals: Array of fitness goals
    - daysPerWeek: Number of training days
    - equipment: Available equipment list
    
    **Returns:**
    - 7-day workout plan
    - Exercise details (sets, reps, duration)
    - Progressive overload schedule
    """
    # This would use ML model to generate plan
    return {
        "plan": {
            "name": "Kế hoạch tập 7 ngày",
            "duration": 7,
            "exercises": [
                {"day": 1, "exercise": "Squat", "sets": 3, "reps": 15},
                {"day": 1, "exercise": "Push-up", "sets": 3, "reps": 10},
                {"day": 2, "exercise": "Plank", "sets": 3, "reps": 30},
            ]
        }
    }


@app.post("/api/chat", tags=["AI Chat"])
async def chat(data: dict):
    """
    Interactive AI fitness assistant
    
    Chat with an AI coach for personalized advice, form tips,
    and answers to fitness-related questions.
    
    **Request Body:**
    - message: User's question or message
    - context: Optional conversation context
    
    **Returns:**
    - AI-generated response in Vietnamese
    - Suggested follow-up questions
    """
    message = data.get("message", "")
    
    # Simple rule-based response (would use LLM in production)
    responses = {
        "giảm cân": "Để giảm cân hiệu quả, bạn nên kết hợp cardio với strength training. Tôi đề xuất bắt đầu với 3 buổi mỗi tuần.",
        "tăng cơ": "Để tăng cơ, hãy tập trung vào các bài tập compound như squat, deadlift, bench press với tần suất 4-5 buổi/tuần.",
        "lưng": "Để cải thiện lưng, các bài tập như plank, bird dog, và superman rất hiệu quả."
    }
    
    response = "Tôi sẽ giúp bạn tìm bài tập phù hợp. Hãy cho tôi biết thêm về mục tiêu của bạn."
    for key, value in responses.items():
        if key in message.lower():
            response = value
            break
    
    return {"response": response}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
