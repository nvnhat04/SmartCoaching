"""
MongoDB database connection and configuration.

This module handles the connection to MongoDB using Motor (async driver).
Usage:
    from app.database import db, connect_db, close_db
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB client instance
client: Optional[AsyncIOMotorClient] = None

# Database instance
db = None

def get_database():
    """Get the database instance."""
    return db

async def connect_db():
    """
    Create database connection.
    Called on application startup.
    """
    global client, db
    
    mongodb_uri = os.getenv("MONGODB_URI")
    
    if not mongodb_uri:
        raise ValueError("MONGODB_URI not found in environment variables. Please set it in .env file.")
    
    try:
        # Create Motor client
        client = AsyncIOMotorClient(mongodb_uri)
        
        # Get database name from URI or use default
        db_name = mongodb_uri.split("/")[-1].split("?")[0] or "smart-coaching"
        db = client[db_name]
        
        # Test connection
        await client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {db_name}")
        
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise

async def close_db():
    """
    Close database connection.
    Called on application shutdown.
    """
    global client
    
    if client:
        client.close()
        print("🔌 MongoDB connection closed")

# Collections (add your collections here)
def get_categories_collection():
    """Get categories collection."""
    return db.categories if db is not None else None

def get_exercises_collection():
    """Get exercises collection."""
    return db.exercises if db is not None else None

def get_checkpoints_collection():
    """Get exercise checkpoints collection."""
    return db.exercise_checkpoints if db is not None else None
