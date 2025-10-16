import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { API_BASE_URL } from "../utils/api";

const DraggableOverlay = ({ overlay, onMove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "OVERLAY",
    item: { id: overlay._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "OVERLAY",
    hover: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (!delta) return;
      onMove(overlay._id, delta.x, delta.y);
    },
  }));

  const styleCommon = {
    position: "absolute",
    left: overlay.position?.x,
    top: overlay.position?.y,
    opacity: isDragging ? 0.5 : 1,
    cursor: "move",
    pointerEvents: "auto",
  };

  return overlay.type === "image" ? (
    <img
      ref={(node) => drag(drop(node))}
      src={overlay.content}
      alt="overlay"
      style={{
        ...styleCommon,
        width: overlay.size?.width || 50,
        height: overlay.size?.height || 50,
      }}
    />
  ) : (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        ...styleCommon,
        fontSize: overlay.size?.height || 20,
        color: "white",
        fontWeight: "bold",
      }}
    >
      {overlay.content}
    </div>
  );
};

const VideoPlayer = ({ playlistUrl = "public/stream/output.m3u8" }) => {
  const videoRef = useRef(null);
  const [overlays, setOverlays] = useState([]);
  const [newText, setNewText] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");


  // Initialize HLS
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
      videoRef.current.src = playlistUrl;
      videoRef.current.addEventListener("loadedmetadata", () => {
        videoRef.current.play();
      });
    }
  }, [playlistUrl]);

  // Fetch overlays
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

  const handleMove = async (id, dx, dy) => {
    setOverlays((prev) =>
      prev.map((o) =>
        o._id === id
          ? {
            ...o,
            position: {
              x: (o.position?.x || 0) + dx,
              y: (o.position?.y || 0) + dy,
            },
          }
          : o
      )
    );

    // Update backend with new position
    try {
      const overlay = overlays.find((o) => o._id === id);
      if (!overlay) return;

      await fetch(`${API_BASE_URL}/overlays/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: {
            x: (overlay.position?.x || 0) + dx,
            y: (overlay.position?.y || 0) + dy,
          },
        }),
      });
    } catch (err) {
      console.error("Failed to update overlay position:", err);
    }
  };

  const addOverlay = async (type, content) => {
    const overlay = {
      type,
      content,
      position: { x: 50, y: 50 },
      size: type === "image" ? { width: 50, height: 50 } : { height: 20 },
    };

    try {
      const res = await fetch(`${API_BASE_URL}/overlays`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(overlay),
      });
      const data = await res.json();
      if (data.success) {
        setOverlays((prev) => [...prev, data.overlay]);
      }
    } catch (err) {
      console.error("Failed to add overlay:", err);
    }
  };

  const handleAddText = () => {
    if (!newText) return;
    addOverlay("text", newText);
    setNewText("");
  };

  const handleAddImage = () => {
    if (!newImageUrl) return;
    addOverlay("image", newImageUrl);
    setNewImageUrl("");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ position: "relative", width: "100%", maxWidth: "800px" }}>
        <video
          ref={videoRef}
          width="100%"
          height="auto"
          controls
          style={{ display: "block" }}
        />

        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          {overlays.map((overlay) => (
            <DraggableOverlay key={overlay._id} overlay={overlay} onMove={handleMove} />
          ))}
        </div>

        {/* Add overlay UI */}
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 1000, background: "rgba(0,0,0,0.5)", padding: "8px", borderRadius: "8px" }}>
          <div style={{ marginBottom: "5px" }}>
            <input
              type="text"
              placeholder="Text overlay"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              style={{ marginRight: 5 }}
            />
            <button onClick={handleAddText}>Add Text</button>
          </div>
          <div>
            <input
              type="text"
              placeholder="Image URL"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              style={{ marginRight: 5 }}
            />
            <button onClick={handleAddImage}>Add Image</button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default VideoPlayer;
