import os
from flask import Flask
from flask_cors import CORS
from db.mongoConnect import overlays_collection   # db connection happens when Flask app starts
from rtsp_service.ffmpeg_handler import start_ffmpeg_stream, stop_ffmpeg_stream
from api.stream import stream_bp
from api.overlays import overlays_bp
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv("VITE_CLIENT_URL"),
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})


app.register_blueprint(stream_bp, url_prefix='/api/stream')
app.register_blueprint(overlays_bp, url_prefix="/api/overlays")

@app.route('/')
def hello_world():
  return '<p>Hello from video streaming backend. up and running!!</p>'

# __name__ will be set to '__main__', indicating that this file is the main program being executed.
if __name__ == '__main__':
  app.run(debug=True)     # debug=True enables auto-reloading and helpful error pages