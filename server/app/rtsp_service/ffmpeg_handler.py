
import os
import subprocess  # to run FFmpeg asynchronously
from pathlib import Path  # easier folder/file handling

# Store the current FFmpeg process (only one stream at a time for simplicity)
ffmpeg_process = None

def start_ffmpeg_stream(rtsp_url: str):
  global ffmpeg_process
  
  # validating url
  if not rtsp_url.startswith("rtsp://"):
    return {
      "success": False,
      "error": "Invalid RTSP URL!"
    }
  
  # making sure output folder exists
  output_folder = Path("../../client/public/stream")
  output_folder.mkdir(parents=True , exist_ok=True)
  
  # clearing old files , preventing overload
  for f in output_folder.glob("*"):
    f.unlink()
  
  # construct ffmpeg command using the rtsp_url
  output_file= output_folder / "output.m3u8"
  ffmpeg_path = Path(__file__).parent.parent.parent / "ffmpeg" / "bin" / "ffmpeg.exe"
  command = [
    # "ffmpeg",
    str(ffmpeg_path),
    "-rtsp_transport", "tcp",
    "-i", rtsp_url,
    "-f", "hls",
    "-hls_time", "5",
    "-hls_list_size", "3",
    "-hls_flags", "delete_segments",
    str(output_file)
  ]
  
  # start ffmpeg asynchronously
  # start the process object somewhere accessible for stopping later
  try:
    ffmpeg_process = subprocess.Popen(    # subprocess.Popen is async and subprocess.run is sync
      command, 
      stdout=subprocess.PIPE, 
      stderr=subprocess.PIPE
      )
    
    # return success/failure
    return {"success": True, "message": "Stream started"}
  
  except Exception as e:
    return {"success": False, "error": str(e)}
  
  
  
def stop_ffmpeg_stream():
    global ffmpeg_process
    if ffmpeg_process:
        ffmpeg_process.terminate()
        ffmpeg_process = None
        return {"success": True, "message": "Stream stopped"}
    else:
        return {"success": False, "error": "No stream running"}