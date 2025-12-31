"""Database connection and configuration"""
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Upload directories
UPLOAD_DIR = ROOT_DIR / 'uploads' / 'documents'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

GALLERY_UPLOAD_DIR = ROOT_DIR / 'uploads' / 'gallery'
GALLERY_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

RECEIPT_DIR = UPLOAD_DIR.parent / 'receipts'
RECEIPT_DIR.mkdir(parents=True, exist_ok=True)


async def close_db_connection():
    """Close MongoDB connection"""
    client.close()
