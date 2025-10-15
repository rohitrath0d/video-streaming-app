import os
from dotenv import load_dotenv
from pymongo import MongoClient, errors

load_dotenv()

# mongo_url = os.getenv("DATABASE_URL")
# mongo_client = MongoClient(mongo_url)
# db = mongo_client["video-streaming-application"]
# overlays_collection = db["overlays_collection"]


try:
    # load url from .env
    mongo_url = os.getenv("DATABASE_URL")
    if not mongo_url:
        raise ValueError("DATABASE_URL is not found in .env")

    # connecting to db
    # 5s timeout    --serverSelectionTimeoutMS=5000: Avoids hanging forever if the connection fails
    mongo_client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = mongo_client["video-streaming-application"]
    overlays_collection = db["overlays_collection"]

    # force connection testing
    mongo_client.admin.command("ping")   # Actively tests if MongoDB responds

    print("MongoDB connected successfully!")

except errors.ServerSelectionTimeoutError:   # Catches timeout or wrong URL
    print("Could not connect to MongoDB server. Check your URL or internet connection")

except Exception as e:
    print(f"Connection failed: {e}")
