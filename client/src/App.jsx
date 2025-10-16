import { useState } from "react";
import VideoPlayer from "./components/Video"
import { API_BASE_URL } from "./utils/api";

function App() {
  const [rtspUrl, setRtspUrl] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState(null);
  const [message, setMessage] = useState("");

  const handleStart = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stream/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rtsp_url: rtspUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setPlaylistUrl(data.playlist); // this is /stream/output.m3u8
        setMessage("Stream started!");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Error connecting to backend");
      console.error(err);
    }
  };

  const handleStop = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/stream/stop`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setPlaylistUrl(null);
        setMessage("Stream stopped");
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Error connecting to backend");
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h3 className="main-title">Live Stream</h3>

        <div className="video-section">
          {playlistUrl ? (
            <VideoPlayer playlistUrl={playlistUrl} />
          ) : (
            <div className="placeholder-box">
              <h2>No active stream. Please enter a RTSP URL below to start a stream.</h2>
              
            </div>
          )}
        </div>

        <div className="controls-section">
          <h2 className="subtitle">Enter RTSP URL to start streaming</h2>
          <div className="input-group">
            <input
              type="text"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              placeholder="rtsp://example.com/stream"
              className="stream-input"
            />
            <button
              onClick={handleStart}
              className="control-button start"
            >
              Start Stream
            </button>
            <button
              onClick={handleStop}
              className="control-button stop"
            >
              Stop Stream
            </button>
          </div>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
    </div>
  )
}

export default App
