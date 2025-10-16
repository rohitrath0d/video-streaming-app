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
        const res = await fetch(`${API_BASE_URL}/overlays/`);
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
      const res = await fetch(`${API_BASE_URL}/overlays/`, {
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

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/overlays/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setOverlays(prev => prev.filter(o => o._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete overlay:", err);
    }
  };

  const handleSizeChange = async (id, width, height) => {
    try {
      const overlay = overlays.find(o => o._id === id);
      if (!overlay) return;

      const updatedSize = { width: Number(width), height: Number(height) };

      await fetch(`${API_BASE_URL}/overlays/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: updatedSize })
      });

      setOverlays(prev => prev.map(o =>
        o._id === id ? { ...o, size: updatedSize } : o
      ));
    } catch (err) {
      console.error("Failed to update overlay size:", err);
    }
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex w-full h-[60vh] p-4 gap-4">
        {/* LEFT: Video Section */}
        <div className="relative flex-[3] bg-black rounded-lg shadow-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
          />

          {/* Overlays Container */}
          <div className="absolute inset-0 pointer-events-none">
            {overlays.map((overlay) => (
              <DraggableOverlay
                key={overlay._id}
                overlay={overlay}
                onMove={handleMove}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Overlay Controls Panel */}
        <div className="flex-[2] bg-white rounded-lg p-4 text-black overflow-y-auto shadow-lg h-full">
          {/* Add New Overlay Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4">Add New Overlay</h4>

            <div className="space-y-4">
              {/* Text Overlay */}
              <div className="space-y-2">
                <label className="text-sm text-gray-500">Text Overlay</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter text..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddText}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Image Overlay */}
              <div className="space-y-2">
                <label className="text-sm text-gray-500">Image Overlay</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Image URL..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddImage}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Overlays */}
          <div className="border-t border-gray-300 pt-4">
            <h4 className="text-lg font-semibold mb-4">Existing Overlays</h4>
            <div className="space-y-3">
              {overlays.map((overlay) => (
                <div
                  key={overlay._id}
                  className="bg-gray-100 p-3 rounded-lg flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 truncate w-[80%]">
                      {overlay.type}: {overlay.content.substring(0, 20)}...
                    </span>
                    <button
                      onClick={() => handleDelete(overlay._id)}
                      className="px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  {overlay.type === "image" && (
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={overlay.size?.width || 50}
                        onChange={(e) =>
                          handleSizeChange(
                            overlay._id,
                            e.target.value,
                            overlay.size?.height
                          )
                        }
                        placeholder="Width"
                        className="w-20 px-2 py-1 rounded bg-white border border-gray-300 text-sm"
                      />
                      <span className="text-gray-500">×</span>
                      <input
                        type="number"
                        value={overlay.size?.height || 50}
                        onChange={(e) =>
                          handleSizeChange(
                            overlay._id,
                            overlay.size?.width,
                            e.target.value
                          )
                        }
                        placeholder="Height"
                        className="w-20 px-2 py-1 rounded bg-white border border-gray-300 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default VideoPlayer;
