import React from "react";

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  isActive: boolean;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  from,
  to,
  isActive,
}) => {
  // Calculate line position and rotation
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  return (
    <div
      className={`absolute pointer-events-none z-[5] transition-all duration-300 ${
        isActive ? "opacity-100" : "opacity-50"
      }`}
      style={{
        left: `${from.x}%`,
        top: `${from.y}%`,
        width: `${distance}%`,
        height: "2px",
        backgroundColor: isActive ? "#f97316" : "#64748b",
        transformOrigin: "0 50%",
        transform: `rotate(${angle}deg)`,
        boxShadow: isActive ? "0 0 8px rgba(249, 115, 22, 0.6)" : "none",
      }}
    >
      {/* Arrow at the end */}
      <div
        className={`absolute right-0 top-1/2 transform -translate-y-1/2 transition-colors duration-300`}
        style={{
          width: 0,
          height: 0,
          borderLeft: `6px solid ${isActive ? "#f97316" : "#64748b"}`,
          borderTop: "3px solid transparent",
          borderBottom: "3px solid transparent",
        }}
      />
    </div>
  );
};

export default ConnectionLine;
