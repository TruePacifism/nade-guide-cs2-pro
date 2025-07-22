import React, { useState } from "react";
import { GrenadeThrow } from "../types/map";
import GrenadeHoverPreview from "./GrenadeHoverPreview";
import ConnectionLine from "./ConnectionLine";
import { on } from "events";

interface GrenadeClusterProps {
  throws: GrenadeThrow[];
  isThrowPoint: boolean;
  position: { x: number; y: number };
  onClick: (grenadeThrow: GrenadeThrow) => void;
  onHover?: (grenadeThrow: GrenadeThrow[] | null) => void;
  onLeave?: () => void;
}

const GrenadeCluster: React.FC<GrenadeClusterProps> = ({
  throws,
  isThrowPoint,
  position,
  onClick,
  onHover,
  onLeave,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredThrow, setHoveredThrow] = useState<GrenadeThrow[] | null>(null);

  if (throws.length === 1) {
    return (
      <>
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
          onClick={() => onClick(throws[0])}
          onMouseEnter={() => {
            setIsHovered(true);
            setHoveredThrow(throws);
            onHover?.(throws);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setHoveredThrow(null);
            onHover?.(null);
            onLeave?.();
          }}
        >
          <GrenadePoint
            throw={throws[0]}
            isThrowPoint={isThrowPoint}
            isHovered={isHovered}
          />
        </div>
        {hoveredThrow && <GrenadeHoverPreview throw={hoveredThrow[0]} />}
      </>
    );
  }

  return (
    <>
      <div
        className="absolute transform -translate-x-1/2 max-w-6 max-h-6 -translate-y-1/2 z-10"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          setHoveredThrow(throws);
          onHover?.(throws);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onLeave?.();
        }}
      >
        {/* Horizontal cluster bar */}
        <div
          className={`bg-transparent h-20 relative -translate-y-3 -top-8 w-fit -translate-x-[calc(50%-12px)] ${
            isHovered ? "visible" : "invisible"
          }`}
        >
          <div className={`relative`}>
            <div className="bg-black/90 backdrop-blur-sm rounded-lg p-2 shadow-lg max-w-48 overflow-x-auto">
              <div className="flex space-x-2 min-w-max">
                {throws.map((grenadeThrow) => (
                  <div
                    key={grenadeThrow.id}
                    className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform duration-200"
                    onClick={() => onClick(grenadeThrow)}
                    onMouseEnter={() => {
                      setHoveredThrow([grenadeThrow]);
                      onHover?.([grenadeThrow]);
                    }}
                    onMouseLeave={() => {
                      setHoveredThrow(null);
                      onHover?.(null);
                      onLeave?.();
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Small triangle pointing down */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
          </div>
        </div>

        {/* Main cluster point */}
        <div
          className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center absolute left-0 top-0"
          onMouseEnter={() => {
            onHover?.(throws);
          }}
          onMouseLeave={() => {
            onLeave?.();
          }}
        >
          <span className="text-white text-xs font-bold">{throws.length}</span>
        </div>
        {!isThrowPoint && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-gray-400" />
        )}
      </div>
      {hoveredThrow && hoveredThrow.length === 1 && (
        <GrenadeHoverPreview throw={hoveredThrow[0]} />
      )}
    </>
  );
};

// Helper component for grenade type indicator
const GrenadePoint: React.FC<{
  throw: GrenadeThrow;
  isThrowPoint: boolean;
  isHovered: boolean;
}> = ({ throw: grenadeThrow, isThrowPoint, isHovered }) => {
  const grenadeColors = {
    smoke: "bg-gray-500 border-gray-300",
    flash: "bg-yellow-500 border-yellow-300",
    he: "bg-red-500 border-red-300",
    molotov: "bg-orange-500 border-orange-300",
    decoy: "bg-green-500 border-green-300",
  };

  const teamColors = {
    ct: "ring-blue-400",
    t: "ring-yellow-400",
    both: "ring-purple-400",
  };

  return (
    <div
      className={`w-4 h-4 rounded-full border-2 ${
        grenadeColors[grenadeThrow.grenade_type]
      } ${
        isThrowPoint
          ? "ring-2 ring-white"
          : `ring-2 ${teamColors[grenadeThrow.team]}`
      } ${isHovered ? "animate-pulse" : ""}`}
    >
      {!isThrowPoint && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-gray-400" />
      )}
    </div>
  );
};

const GrenadeTypeIndicator: React.FC<{ type: string }> = ({ type }) => {
  const colors = {
    smoke: "bg-gray-500",
    flash: "bg-yellow-500",
    he: "bg-red-500",
    molotov: "bg-orange-500",
    decoy: "bg-green-500",
  };

  return (
    <div
      className={`w-3 h-3 rounded-full ${colors[type as keyof typeof colors]}`}
    />
  );
};

export default GrenadeCluster;
