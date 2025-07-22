import React, { useState } from "react";
import { GrenadeThrow } from "../types/map";
import GrenadeHoverPreview from "./GrenadeHoverPreview";
import ConnectionLine from "./ConnectionLine";

interface GrenadeClusterProps {
  throws: GrenadeThrow[];
  isThrowPoint: boolean;
  position: { x: number; y: number };
  onClick: (grenadeThrow: GrenadeThrow) => void;
  onHover?: (grenadeThrow: GrenadeThrow | null) => void;
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
  const [hoveredThrow, setHoveredThrow] = useState<GrenadeThrow | null>(null);

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
            setHoveredThrow(throws[0]);
            onHover?.(throws[0]);
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
        {hoveredThrow && (
          <GrenadeHoverPreview throw={hoveredThrow} position={position} />
        )}
      </>
    );
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(throws[0]);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredThrow(null);
        onHover?.(null);
        onLeave?.();
      }}
    >
      {/* Cluster indicator */}
      <div
        className={`relative ${
          isHovered ? "scale-125" : ""
        } transition-transform duration-200`}
      >
        <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-white text-xs font-bold">{throws.length}</span>
        </div>
        {!isThrowPoint && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-gray-400" />
        )}
      </div>

      {/* Dropdown list */}
      {isHovered && (
        <div className="fixed top-4 left-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 min-w-80 max-w-md z-50">
          <div className="text-white text-sm mb-3 font-medium">
            {isThrowPoint ? "Броски из этой точки:" : "Броски в эту точку:"}
          </div>

          {/* Show preview for hovered throw */}
          {hoveredThrow && (
            <div className="mb-4 p-3 bg-white/10 rounded-lg border border-orange-500/30">
              <h3 className="text-white font-bold mb-2">{hoveredThrow.name}</h3>

              {/* Video Preview */}
              {hoveredThrow.media_type === "video" &&
                hoveredThrow.video_url && (
                  <div className="aspect-video mb-3 rounded overflow-hidden w-full">
                    <iframe
                      src={hoveredThrow.video_url}
                      className="w-full h-full"
                      title={hoveredThrow.name}
                      style={{ pointerEvents: "none" }}
                      allow="autoplay; muted"
                    />
                  </div>
                )}

              {/* Thumbnail for image throws */}
              {hoveredThrow.media_type === "screenshots" &&
                hoveredThrow.thumbnail_url && (
                  <div className="aspect-video mb-3 rounded overflow-hidden w-full">
                    <img
                      src={hoveredThrow.thumbnail_url}
                      alt={hoveredThrow.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

              <p className="text-slate-300 text-sm mb-3">
                {hoveredThrow.description}
              </p>

              <div className="flex items-center space-x-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    hoveredThrow.grenade_type === "smoke"
                      ? "bg-gray-500"
                      : hoveredThrow.grenade_type === "flash"
                      ? "bg-yellow-500"
                      : hoveredThrow.grenade_type === "he"
                      ? "bg-red-500"
                      : hoveredThrow.grenade_type === "molotov"
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                />
                <span className="text-sm text-slate-300">
                  {hoveredThrow.grenade_type.toUpperCase()}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    hoveredThrow.difficulty === "easy"
                      ? "bg-green-500/20 text-green-300"
                      : hoveredThrow.difficulty === "medium"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {hoveredThrow.difficulty}
                </span>
              </div>
            </div>
          )}

          {/* List of grenades */}
          <div className="space-y-2">
            {throws.map((grenadeThrow) => (
              <div
                key={grenadeThrow.id}
                className={`p-3 rounded cursor-pointer transition-all duration-200 border ${
                  hoveredThrow?.id === grenadeThrow.id
                    ? "bg-orange-500/20 border-orange-500/50"
                    : "hover:bg-orange-500/10 border-transparent hover:border-orange-500/30"
                }`}
                onClick={() => onClick(grenadeThrow)}
                onMouseEnter={() => {
                  setHoveredThrow(grenadeThrow);
                  onHover?.(grenadeThrow);
                }}
                onMouseLeave={() => {
                  if (hoveredThrow?.id === grenadeThrow.id) {
                    setHoveredThrow(null);
                    onHover?.(null);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <GrenadeTypeIndicator type={grenadeThrow.grenade_type} />
                  <span className="text-white text-sm font-medium">
                    {grenadeThrow.name}
                  </span>
                </div>
                <div className="text-slate-400 text-xs mt-1 line-clamp-2">
                  {grenadeThrow.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
