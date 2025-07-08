import React from "react";
import { GrenadeThrow, ThrowTypes } from "../types/map";
import { Heart, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToggleFavorite, useUserFavorites } from "@/hooks/useGrenadeThrows";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface VideoModalProps {
  throw: GrenadeThrow;
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({
  throw: grenadeThrow,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  const { user } = useAuth();
  const { data: userFavorites } = useUserFavorites();
  const toggleFavorite = useToggleFavorite();

  const isThrowFavorite = (throwId: string) => {
    return userFavorites?.some((fav) => fav.throw_id === throwId) || false;
  };

  const handleToggleFavorite = (throwId: string) => {
    if (!user) return;
    const isFavorite = isThrowFavorite(throwId);
    toggleFavorite.mutate({ throwId, isFavorite });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-scroll">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {grenadeThrow.name}
            </h2>
            <p className="text-slate-300">{grenadeThrow.description}</p>
          </div>
          <div className="flex space-x-6 justify-between">
            {user && (
              <button
                onClick={() => {
                  handleToggleFavorite(grenadeThrow.id);
                  // Add a simple effect: animate the heart on toggle
                  const heart = document.getElementById(
                    `heart-${grenadeThrow.id}`
                  );
                  if (heart) {
                    heart.classList.remove("animate-ping");
                    // Force reflow to restart animation
                    void heart.offsetWidth;
                    heart.classList.add("animate-ping");
                  }
                }}
                className={`p-1 h-fit w-fit bg-transparent hover:bg-transparent group`}
              >
                <Heart
                  id={`heart-${grenadeThrow.id}`}
                  size={24}
                  className={`transition-colors ${
                    isThrowFavorite(grenadeThrow.id)
                      ? "fill-red-500 text-red-500 group-hover:fill-transparent group-hover:text-slate-400"
                      : "text-slate-400 group-hover:fill-red-500 group-hover:text-red-500"
                  }`}
                />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 transition-colors hover:text-orange-500"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Video */}
        {grenadeThrow.media_type === "video" ? (
          <div className="aspect-video bg-black p-6">
            <iframe
              src={grenadeThrow.video_url || ""}
              className="w-full h-full"
              allowFullScreen
              title={grenadeThrow.name}
            />
          </div>
        ) : (
          <div className="p-6">
            <ul>
              <li className="max-w-full mb-4">
                <img
                  src={grenadeThrow.setup_image_url}
                  alt="Куда встать"
                  className="mx-auto mb-1 max-h-[60vh]"
                />
                <p className="text-slate-300 text-center text-xl">
                  Куда встать
                </p>
              </li>
              <li className="max-w-full mb-4">
                <img
                  className="mx-auto mb-1 max-h-[60vh]"
                  src={grenadeThrow.aim_image_url}
                  alt="Куда прицелиться"
                />
                <p className="text-slate-300 text-center text-xl">
                  Куда прицелиться
                </p>
              </li>
              <li className="max-w-full mb-4">
                <img
                  className="mx-auto mb-1 max-h-[60vh]"
                  src={grenadeThrow.result_image_url}
                  alt="Результат"
                />
                <p className="text-slate-300 text-center text-xl">Результат</p>
              </li>
            </ul>
          </div>
        )}

        {/* Details */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span
                className={`w-4 h-4 rounded-full ${
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
              <span className="text-white font-medium">
                {grenadeThrow.grenade_type.toUpperCase()}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  grenadeThrow.team === "ct"
                    ? "bg-blue-500/20 text-blue-300"
                    : grenadeThrow.team === "t"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-purple-500/20 text-purple-300"
                }`}
              >
                {grenadeThrow.team === "both"
                  ? "CT & T"
                  : grenadeThrow.team.toUpperCase()}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  grenadeThrow.difficulty === "easy"
                    ? "bg-green-500/20 text-green-300"
                    : grenadeThrow.difficulty === "medium"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-red-500/20 text-red-300"
                }`}
              >
                {grenadeThrow.difficulty === "easy"
                  ? "Легко"
                  : grenadeThrow.difficulty === "medium"
                  ? "Средне"
                  : "Сложно"}
              </span>
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
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">
              Инструкция по выполнению:
            </h3>
            <ol className="text-slate-300 text-sm space-y-1">
              <li>1. Встаньте в указанную точку броска</li>
              <li>
                2. Наведите прицел согласно{" "}
                {grenadeThrow.media_type === "video" ? "видео" : "скриншотам"}
              </li>
              <li>3. Выполните бросок с правильной техникой</li>
              <li>4. Граната должна попасть в целевую точку</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
