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
      const res = await fetch(`${API_BASE_URL}/api/stream/stop`, { method: "POST" });
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
    <>
      <div style={{ padding: "20px" }}>
        <h1>Live Stream</h1>
        <input
          type="text"
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
          placeholder="Enter RTSP URL"
          style={{ width: "400px", marginRight: "10px" }}
        />
        <button onClick={handleStart}>Start Stream</button>
        <button onClick={handleStop} style={{ marginLeft: "10px" }}>Stop Stream</button>
        <p>{message}</p>

        {playlistUrl && <VideoPlayer playlistUrl={playlistUrl} />}
      </div>
    </>
  )
}

export default App
