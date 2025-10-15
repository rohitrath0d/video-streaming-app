import os
from dotenv import load_dotenv
from pymongo import MongoClient, errors

load_dotenv()

mongo_url = os.getenv("DATABASE_URL")
mongo_client = MongoClient(mongo_url)
db = client["video-streaming-application"]
overlays_collection = db["overlays_collection"]


