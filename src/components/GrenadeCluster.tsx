import React, { useState } from 'react';
import { GrenadeThrow } from '../types/map';
import GrenadeHoverPreview from './GrenadeHoverPreview';

interface GrenadeClusterProps {
  throws: GrenadeThrow[];
  isThrowPoint: boolean;
  position: { x: number; y: number };
  onClick: (grenadeThrow: GrenadeThrow) => void;
  onHover?: (grenadeThrow: GrenadeThrow | null) => void;
}

const GrenadeCluster: React.FC<GrenadeClusterProps> = ({
  throws,
  isThrowPoint,
  position,
  onClick,
  onHover
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredThrow, setHoveredThrow] = useState<GrenadeThrow | null>(null);

  if (throws.length === 1) {
    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`
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
        }}
      >
        <GrenadePoint throw={throws[0]} isThrowPoint={isThrowPoint} isHovered={isHovered} />
        {hoveredThrow && (
          <GrenadeHoverPreview throw={hoveredThrow} position={position} />
        )}
      </div>
    );
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-10"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover?.(throws[0]);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredThrow(null);
        onHover?.(null);
      }}
    >
      {/* Cluster indicator */}
      <div className={`relative ${isHovered ? 'scale-125' : ''} transition-transform duration-200`}>
        <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="text-white text-xs font-bold">{throws.length}</span>
        </div>
        {!isThrowPoint && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-gray-400" />
        )}
      </div>

      {/* Dropdown list */}
      {isHovered && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-black/90 backdrop-blur-sm rounded-lg p-2 min-w-48 z-20">
          <div className="text-white text-xs mb-2 font-medium">
            {isThrowPoint ? 'Броски из этой точки:' : 'Броски в эту точку:'}
          </div>
          {throws.map((grenadeThrow, index) => (
            <div
              key={grenadeThrow.id}
              className="p-2 hover:bg-orange-500/20 rounded cursor-pointer transition-colors"
              onClick={() => onClick(grenadeThrow)}
              onMouseEnter={() => {
                setHoveredThrow(grenadeThrow);
                onHover?.(grenadeThrow);
              }}
              onMouseLeave={() => {
                setHoveredThrow(null);
                onHover?.(null);
              }}
            >
              <div className="flex items-center space-x-2">
                <GrenadeTypeIndicator type={grenadeThrow.grenade_type} />
                <span className="text-white text-sm font-medium truncate">
                  {grenadeThrow.name}
                </span>
              </div>
              <div className="text-slate-300 text-xs mt-1 truncate">
                {grenadeThrow.description}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hover preview for selected throw */}
      {hoveredThrow && (
        <GrenadeHoverPreview 
          throw={hoveredThrow} 
          position={{ 
            x: position.x + 20, // Offset to avoid overlap
            y: position.y 
          }} 
        />
      )}
    </div>
  );
};

// Helper component for grenade type indicator
const GrenadePoint: React.FC<{ throw: GrenadeThrow; isThrowPoint: boolean; isHovered: boolean }> = ({
  throw: grenadeThrow,
  isThrowPoint,
  isHovered
}) => {
  const grenadeColors = {
    smoke: 'bg-gray-500 border-gray-300',
    flash: 'bg-yellow-500 border-yellow-300',
    he: 'bg-red-500 border-red-300',
    molotov: 'bg-orange-500 border-orange-300',
    decoy: 'bg-green-500 border-green-300'
  };

  const teamColors = {
    ct: 'ring-blue-400',
    t: 'ring-yellow-400',
    both: 'ring-purple-400'
  };

  return (
    <div
      className={`w-4 h-4 rounded-full border-2 ${grenadeColors[grenadeThrow.grenade_type]} ${
        isThrowPoint ? 'ring-2 ring-white' : `ring-2 ${teamColors[grenadeThrow.team]}`
      } ${isHovered ? 'animate-pulse' : ''}`}
    >
      {!isThrowPoint && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-gray-400" />
      )}
    </div>
  );
};

const GrenadeTypeIndicator: React.FC<{ type: string }> = ({ type }) => {
  const colors = {
    smoke: 'bg-gray-500',
    flash: 'bg-yellow-500',
    he: 'bg-red-500',
    molotov: 'bg-orange-500',
    decoy: 'bg-green-500'
  };

  return <div className={`w-3 h-3 rounded-full ${colors[type as keyof typeof colors]}`} />;
};

export default GrenadeCluster;