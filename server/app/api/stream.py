from flask import Blueprint, request, jsonify
from rtsp_service.ffmpeg_handler import start_ffmpeg_stream, stop_ffmpeg_stream


stream_bp = Blueprint('stream', __name__)

@stream_bp.route('/start_stream', methods=['POST'])
def start_stream():
  data = request.json()
  rtsp_url = data.get('rtsp_url')
  if not rtsp_url:
    return jsonify({"success": False, "error": "RTSP URL is required"}), 400
  
  result = start_ffmpeg_stream(rtsp_url)
  if result["success"]:
    # return jsonify(result), 200
    return jsonify({"success": True, "message": "Stream started", "playlist": "/stream/output.m3u8"})

  else:
    # return jsonify(result), 500
    return jsonify({"success": False, "error": result.get("error", "Unknown error")}), 500


@stream_bp.route('/stop_stream', methods=['POST'])
def stop_stream():
  result = stop_ffmpeg_stream()
  if result["success"]:
    # return jsonify(result), 200
    return jsonify({"success": True, "message": "Stream stopped"})
  else:
    # return jsonify(result), 500
    return jsonify({"success": False, "error": result.get("error", "No stream running")}), 400
