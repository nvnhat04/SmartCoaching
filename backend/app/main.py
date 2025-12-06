from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import categories, workout_results
from app.database import connect_db, close_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup: Connect to MongoDB
    try:
        await connect_db()
    except Exception as e:
        print(f"⚠️  Warning: Could not connect to MongoDB: {e}")
        print("📝 Application will run with in-memory data only")
    
    yield
    
    # Shutdown: Close MongoDB connection
    await close_db()

app = FastAPI(
    title="Smart Coaching API",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories.router)
app.include_router(workout_results.router)

@app.get("/")
def root():
    return {"message": "🏋️ Smart Coaching API is running!"}
