# Smart Coaching AI Service

Python-based AI service for pose detection and analysis using MediaPipe.

## Setup

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `POST /api/pose/detect` - Detect and analyze pose from image
- `GET /api/recommendations/{user_id}` - Get personalized recommendations
- `POST /api/plan/generate` - Generate workout plan
- `POST /api/chat` - Chat with AI for recommendations

## Testing

Visit `http://localhost:8000/docs` for interactive API documentation.
