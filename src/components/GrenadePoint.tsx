
import React from 'react';
import { GrenadeThrow } from '../types/map';

interface GrenadePointProps {
  throw: GrenadeThrow;
  isThrowPoint: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
  isHovered: boolean;
}

const GrenadePoint: React.FC<GrenadePointProps> = ({
  throw: grenadeThrow,
  isThrowPoint,
  onClick,
  onHover,
  onLeave,
  isHovered
}) => {
  const position = isThrowPoint 
    ? { x: grenadeThrow.throw_point_x, y: grenadeThrow.throw_point_y }
    : { x: grenadeThrow.landing_point_x, y: grenadeThrow.landing_point_y };
  
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
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
        isHovered ? 'scale-125 z-20' : 'z-10'
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 ${grenadeColors[grenadeThrow.grenade_type]} ${
          isThrowPoint ? 'ring-2 ring-white' : `ring-2 ${teamColors[grenadeThrow.team]}`
        } ${isHovered ? 'animate-pulse' : ''}`}
      >
        {!isThrowPoint && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-gray-400" />
        )}
      </div>
      
      {isHovered && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {isThrowPoint ? 'Место броска' : 'Место падения'}
        </div>
      )}
    </div>
  );
};

export default GrenadePoint;
