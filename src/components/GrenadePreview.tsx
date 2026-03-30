import React from "react";
import { GrenadeThrow, ThrowTypes } from "../types/map";
import CustomVideoPlayer from "./CustomVideoPlayer";
import { Badge } from "./ui/badge";
import { useLanguage } from "@/i18n/useLanguage";

interface GrenadePreviewProps {
  throw: GrenadeThrow;
}

const GrenadePreview: React.FC<GrenadePreviewProps> = ({
  throw: grenadeThrow,
}) => {
  const { t } = useLanguage();

  const isNewThrow = (createdAt: string) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return new Date(createdAt) > twoWeeksAgo;
  };

  return (
    <div className="fixed top-2 left-2 sm:top-4 sm:left-4 bg-black/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 max-w-sm w-80 z-50 text-xs sm:text-sm">
      {grenadeThrow.media_type === "video" && grenadeThrow.video_url && (
        <div className="mb-3 w-full">
          <CustomVideoPlayer
            src={grenadeThrow.video_url}
            title={grenadeThrow.name}
            thumbnailUrl={grenadeThrow.thumbnail_url}
            autoPlay
            showControls={false}
            showProgress={false}
            wrapperClassName="w-full"
            className="rounded-2xl"
          />
        </div>
      )}

      {grenadeThrow.media_type === "screenshots" && grenadeThrow.thumbnail_url && (
        <div className="aspect-video mb-3 rounded overflow-hidden w-full">
          <img src={grenadeThrow.thumbnail_url} alt={grenadeThrow.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold">{grenadeThrow.name}</h3>
        {isNewThrow(grenadeThrow.created_at) && (
          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500">
            {t("new")}
          </Badge>
        )}
      </div>

      <p className="text-slate-300 text-sm mb-3">{grenadeThrow.description}</p>

      <div className="flex items-center space-x-2 mb-3">
        <span className={`w-3 h-3 rounded-full ${
          grenadeThrow.grenade_type === "smoke" ? "bg-gray-500"
          : grenadeThrow.grenade_type === "flash" ? "bg-yellow-500"
          : grenadeThrow.grenade_type === "he" ? "bg-red-500"
          : grenadeThrow.grenade_type === "molotov" ? "bg-orange-500"
          : "bg-green-500"
        }`} />
        <span className="text-sm text-slate-300">{grenadeThrow.grenade_type.toUpperCase()}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          grenadeThrow.difficulty === "easy" ? "bg-green-500/20 text-green-300"
          : grenadeThrow.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-300"
          : "bg-red-500/20 text-red-300"
        }`}>
          {grenadeThrow.difficulty}
        </span>
      </div>

      {grenadeThrow.throw_types && grenadeThrow.throw_types.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {grenadeThrow.throw_types.map((throwType) => (
            <Badge key={throwType} variant="outline" className="text-xs text-slate-300 border-slate-600">
              {ThrowTypes[throwType] || throwType}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrenadePreview;
