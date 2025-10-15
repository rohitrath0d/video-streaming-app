from flask import Flask
from db.mongoConnect import overlays_collection   # db connection happens when Flask app starts
from rtsp_service.ffmpeg_handler import start_ffmpeg_stream, stop_ffmpeg_stream
from api.stream import stream_bp

app = Flask(__name__)

app.register_blueprint(stream_bp, url_prefix='/api/stream')
app.register_blueprint(overlays_bp, url_prefix="/api/overlays")

@app.route('/')
def hello_world():
  return '<p>Hello from video streaming backend. up and running!!</p>'

# __name__ will be set to '__main__', indicating that this file is the main program being executed.
if __name__ == '__main__':
  app.run(debug=True)     # debug=True enables auto-reloading and helpful error pages