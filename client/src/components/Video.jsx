// import React, { useEffect, useRef, useState } from "react";
// import Hls from "hls.js";
// import { API_BASE_URL } from "../utils/api";

// const VideoPlayer = ({ playlistUrl = "public/stream/output.m3u8" }) => {
//   const videoRef = useRef(null);
//   const [overlays, setOverlays] = useState([]);

//   // Initialize HLS playback
//   useEffect(() => {
//     if (Hls.isSupported()) {
//       const hls = new Hls();
//       hls.loadSource(playlistUrl);
//       hls.attachMedia(videoRef.current);
//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         videoRef.current.play();
//       });
//       return () => hls.destroy();
//     } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
//       // For Safari
//       videoRef.current.src = playlistUrl;
//       videoRef.current.addEventListener("loadedmetadata", () => {
//         videoRef.current.play();
//       });
//     }
//   }, [playlistUrl]);

//   // Fetch overlays from backend
//   useEffect(() => {
//     const fetchOverlays = async () => {
//       try {
//         const res = await fetch(`${API_BASE_URL}/overlays`);
//         const data = await res.json();
//         if (data.success) setOverlays(data.overlays);
//       } catch (err) {
//         console.error("Error fetching overlays:", err);
//       }
//     };
//     fetchOverlays();
//   }, []);

//   return (
//     <div style={{ position: "relative", width: "100%", maxWidth: "800px" }}>
//       {/* Video */}
//       <video
//         ref={videoRef}
//         width="100%"
//         height="auto"
//         controls
//         style={{ display: "block" }}
//       />

//       {/* Overlays */}
//       {overlays.map((overlay) =>
//         overlay.type === "image" ? (
//           <img
//             key={overlay._id}
//             src={overlay.content}
//             alt="overlay"
//             style={{
//               position: "absolute",
//               left: overlay.position?.x || 0,
//               top: overlay.position?.y || 0,
//               width: overlay.size?.width || "auto",
//               height: overlay.size?.height || "auto",
//               pointerEvents: "none",
//             }}
//           />
//         ) : (
//           <div
//             key={overlay._id}
//             style={{
//               position: "absolute",
//               left: overlay.position?.x || 0,
//               top: overlay.position?.y || 0,
//               fontSize: overlay.size?.height || 20,
//               color: "white",
//               fontWeight: "bold",
//               pointerEvents: "none",
//             }}
//           >
//             {overlay.content}
//           </div>
//         )
//       )}
//     </div>
//   );
// };

// export default VideoPlayer;


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

const DraggableVideoPlayer = ({ playlistUrl = "public/stream/output.m3u8" }) => {
  const videoRef = useRef(null);
  const [overlays, setOverlays] = useState([]);

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

  const handleMove = (id, dx, dy) => {
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

        {/* Overlay container */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
          {overlays.map((overlay) => (
            <DraggableOverlay key={overlay._id} overlay={overlay} onMove={handleMove} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default DraggableVideoPlayer;
