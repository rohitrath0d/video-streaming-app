// import React, { useState } from "react";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";

// const OverlayItem = ({ overlay, onMove }) => {
//   const [{ isDragging }, drag] = useDrag(() => ({
//     type: "OVERLAY",
//     item: { id: overlay._id },
//     collect: (monitor) => ({
//       isDragging: monitor.isDragging(),
//     }),
//   }));

//   const [{}, drop] = useDrop(() => ({
//     accept: "OVERLAY",
//     hover: (item, monitor) => {
//       const delta = monitor.getDifferenceFromInitialOffset();
//       if (!delta) return;
//       onMove(overlay._id, delta.x, delta.y);
//     },
//   }));

//   return overlay.type === "image" ? (
//     <img
//       ref={(node) => drag(drop(node))}
//       src={overlay.content}
//       alt="overlay"
//       style={{
//         position: "absolute",
//         left: overlay.position?.x,
//         top: overlay.position?.y,
//         width: overlay.size?.width || "auto",
//         height: overlay.size?.height || "auto",
//         opacity: isDragging ? 0.5 : 1,
//         cursor: "move",
//       }}
//     />
//   ) : (
//     <div
//       ref={(node) => drag(drop(node))}
//       style={{
//         position: "absolute",
//         left: overlay.position?.x,
//         top: overlay.position?.y,
//         fontSize: overlay.size?.height || 20,
//         color: "white",
//         fontWeight: "bold",
//         opacity: isDragging ? 0.5 : 1,
//         cursor: "move",
//       }}
//     >
//       {overlay.content}
//     </div>
//   );
// };

// const OverlayEditor = ({ overlays, setOverlays }) => {
//   const handleMove = (id, dx, dy) => {
//     setOverlays((prev) =>
//       prev.map((o) =>
//         o._id === id
//           ? {
//               ...o,
//               position: {
//                 x: (o.position?.x || 0) + dx,
//                 y: (o.position?.y || 0) + dy,
//               },
//             }
//           : o
//       )
//     );
//   };

//   return (
//     <DndProvider backend={HTML5Backend}>
//       {overlays.map((overlay) => (
//         <OverlayItem key={overlay._id} overlay={overlay} onMove={handleMove} />
//       ))}
//     </DndProvider>
//   );
// };

// export default OverlayEditor;
