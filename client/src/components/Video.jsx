import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { API_BASE_URL } from "../utils/api";

const VideoPlayer = ({ playlistUrl = "/stream/output.m3u8" }) => {
  const videoRef = useRef(null);
  const [overlays, setOverlays] = useState([]);

  // Initialize HLS playback
  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(playlistUrl);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play();
      });
      return () => hls.destroy();
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // For Safari
      videoRef.current.src = playlistUrl;
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current.play();
      });
    }
  }, [playlistUrl]);

  // Fetch overlays from backend
  useEffect(() => {
    const fetchOverlays = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/overlays`);
        const data = await res.json();
        if (data.success) setOverlays(data.overlays);
      } catch (err) {
        console.error("Error fetching overlays:", err);
      }
    };
    fetchOverlays();
  }, []);

  return (
    // <div style={{ position: "relative", width: "100%", maxWidth: "800px" }}>
    //   {/* Video */}
    //   <video
    //     ref={videoRef}
    //     width="100%"
    //     height="auto"
    //     controls
    //     style={{ display: "block" }}
    //   />

    //   {/* Overlays */}
    //   {overlays.map((o) =>
    //     o.type === "image" ? (
    //       <img
    //         key={o._id}
    //         src={o.content}
    //         alt="overlay"
    //         style={{
    //           position: "absolute",
    //           left: o.position?.x || 0,
    //           top: o.position?.y || 0,
    //           width: o.size?.width || "auto",
    //           height: o.size?.height || "auto",
    //           pointerEvents: "none",
    //         }}
    //       />
    //     ) : (
    //       <div
    //         key={o._id}
    //         style={{
    //           position: "absolute",
    //           left: o.position?.x || 0,
    //           top: o.position?.y || 0,
    //           fontSize: o.size?.height || 20,
    //           color: "white",
    //           fontWeight: "bold",
    //           pointerEvents: "none",
    //         }}
    //       >
    //         {o.content}
    //       </div>
    //     )
    //   )}
    // </div>

    <div className="video-container">
      <video
        ref={videoRef}
        width="100%"
        height="auto"
        controls
        className="video-player"
      />

      <div className="overlays-container">
        {overlays.map((o) =>
          o.type === "image" ? (
            <img
              key={o._id}
              src={o.content}
              alt="overlay"
              className="overlay-image"
              style={{
                left: o.position?.x || 0,
                top: o.position?.y || 0,
                width: o.size?.width || "auto",
                height: o.size?.height || "auto",
              }}
            />
          ) : (
            <div
              key={o._id}
              className="overlay-text"
              style={{
                left: o.position?.x || 0,
                top: o.position?.y || 0,
                fontSize: o.size?.height || 20,
              }}
            >
              {o.content}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
