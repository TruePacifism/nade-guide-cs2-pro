import React from 'react';
import { GrenadeThrow, ThrowTypes } from '../types/map';
import { Badge } from './ui/badge';

interface GrenadeHoverPreviewProps {
  throw: GrenadeThrow;
  position: { x: number; y: number };
}

const GrenadeHoverPreview: React.FC<GrenadeHoverPreviewProps> = ({
  throw: grenadeThrow,
  position
}) => {
  const isNewThrow = (createdAt: string) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return new Date(createdAt) > twoWeeksAgo;
  };

  return (
    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 max-w-sm w-80 z-10 text-xs sm:text-sm">
      {/* Video Preview */}
      {grenadeThrow.media_type === "video" && grenadeThrow.video_url && (
        <div className="aspect-video mb-3 rounded overflow-hidden w-full">
          <iframe
            src={grenadeThrow.video_url}
            className="w-full h-full"
            title={grenadeThrow.name}
            style={{ pointerEvents: 'none' }}
            allow="autoplay; muted"
          />
        </div>
      )}

      {/* Thumbnail for image throws */}
      {grenadeThrow.media_type === "screenshots" && grenadeThrow.thumbnail_url && (
        <div className="aspect-video mb-3 rounded overflow-hidden w-full">
          <img
            src={grenadeThrow.thumbnail_url}
            alt={grenadeThrow.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold">{grenadeThrow.name}</h3>
        {isNewThrow(grenadeThrow.created_at) && (
          <Badge
            variant="outline"
            className="bg-green-500/20 text-green-300 border-green-500"
          >
            НОВОЕ
          </Badge>
        )}
      </div>
      
      <p className="text-slate-300 text-sm mb-3">
        {grenadeThrow.description}
      </p>
      
      <div className="flex items-center space-x-2 mb-3">
        <span
          className={`w-3 h-3 rounded-full ${
            grenadeThrow.grenade_type === "smoke"
              ? "bg-gray-500"
              : grenadeThrow.grenade_type === "flash"
              ? "bg-yellow-500"
              : grenadeThrow.grenade_type === "he"
              ? "bg-red-500"
              : grenadeThrow.grenade_type === "molotov"
              ? "bg-orange-500"
              : "bg-green-500"
          }`}
        />
        <span className="text-sm text-slate-300">
          {grenadeThrow.grenade_type.toUpperCase()}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            grenadeThrow.difficulty === "easy"
              ? "bg-green-500/20 text-green-300"
              : grenadeThrow.difficulty === "medium"
              ? "bg-yellow-500/20 text-yellow-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {grenadeThrow.difficulty}
        </span>
      </div>
      
      {/* Throw Types */}
      {grenadeThrow.throw_types && grenadeThrow.throw_types.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {grenadeThrow.throw_types.map((throwType) => (
            <Badge
              key={throwType}
              variant="outline"
              className="text-xs text-slate-300 border-slate-600"
            >
              {ThrowTypes[throwType] || throwType}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrenadeHoverPreview;