import React, { useRef, useState } from "react";
import { GrenadeThrow, ThrowTypes } from "../types/map";
import { Crosshair, Heart, Trash2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToggleFavorite, useUserFavorites, useDeleteGrenadeThrow } from "@/hooks/useGrenadeThrows";
import CustomVideoPlayer from "./CustomVideoPlayer";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useLanguage } from "@/i18n/useLanguage";

interface GrenadeFullInfoProps {
  throw: GrenadeThrow;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

const GrenadeFullInfo: React.FC<GrenadeFullInfoProps> = ({
  throw: grenadeThrow,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const { user } = useAuth();
  const { data: userFavorites } = useUserFavorites();
  const toggleFavorite = useToggleFavorite();
  const deleteThrow = useDeleteGrenadeThrow();
  const videoRef = useRef<HTMLVideoElement>(null);
  const heartRef = useRef<SVGSVGElement>(null);
  const { t } = useLanguage();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const isNewThrow = (createdAt: string) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return new Date(createdAt) > twoWeeksAgo;
  };

  const isThrowFavorite = (throwId: string) => {
    return userFavorites?.some((fav) => fav.throw_id === throwId) || false;
  };

  const handleToggleFavorite = (throwId: string) => {
    if (!user) return;
    const isFavorite = isThrowFavorite(throwId);
    toggleFavorite.mutate({ throwId, isFavorite });
  };

  const videoMarkers = [
    grenadeThrow.position_timestamp !== null
      ? {
          time: grenadeThrow.position_timestamp,
          label: t("markPosition"),
          colorClassName: "bg-orange-400",
        }
      : null,
    grenadeThrow.aim_timestamp !== null
      ? {
          time: grenadeThrow.aim_timestamp,
          label: t("markAim"),
          colorClassName: "bg-blue-400",
        }
      : null,
  ].filter(Boolean) as {
    time: number;
    label?: string;
    colorClassName?: string;
  }[];

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="bg-slate-900/95 border border-slate-700 ring-1 ring-slate-700/50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-scroll shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{grenadeThrow.name}</h2>
              {isNewThrow(grenadeThrow.created_at) && (
                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500">
                  {t("new")}
                </Badge>
              )}
            </div>
            <p className="text-slate-300">{grenadeThrow.description}</p>
          </div>
          <div className="flex space-x-6 justify-between">
            {user && (
              <button
                onClick={() => {
                  handleToggleFavorite(grenadeThrow.id);
                  const heart = heartRef.current;
                  if (heart) {
                    heart.classList.remove("animate-ping");
                    void heart.offsetWidth;
                    heart.classList.add("animate-ping");
                  }
                }}
                className="p-1 h-fit w-fit bg-transparent hover:bg-transparent group"
              >
                <Heart
                  ref={heartRef}
                  size={24}
                  className={`transition-colors ${
                    isThrowFavorite(grenadeThrow.id)
                      ? "fill-red-500 text-red-500 group-hover:fill-transparent group-hover:text-slate-400"
                      : "text-slate-400 group-hover:fill-red-500 group-hover:text-red-500"
                  }`}
                />
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 transition-colors hover:text-orange-500">
              <X size={28} />
            </button>
          </div>
        </div>

        {grenadeThrow.media_type === "video" && grenadeThrow.video_url ? (
          <div className="p-6">
            <CustomVideoPlayer
              src={grenadeThrow.video_url}
              title={grenadeThrow.name}
              thumbnailUrl={grenadeThrow.thumbnail_url}
              wrapperClassName="p-2"
              className="rounded-[1.75rem]"
              videoRef={videoRef}
              isPreview
              markers={videoMarkers}
              onMarkerClick={(marker) => {
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = marker.time;
                }
              }}
            />
          </div>
        ) : (
          <div className="p-6">
            <ul>
              <li className="max-w-full mb-4">
                <img src={grenadeThrow.setup_image_url} alt={t("whereToStand")} className="mx-auto mb-1 max-h-[60vh]" />
                <p className="text-slate-300 text-center text-xl">{t("whereToStand")}</p>
              </li>
              <li className="max-w-full mb-4">
                <img className="mx-auto mb-1 max-h-[60vh]" src={grenadeThrow.aim_image_url} alt={t("whereToAim")} />
                <p className="text-slate-300 text-center text-xl">{t("whereToAim")}</p>
              </li>
              <li className="max-w-full mb-4">
                <img className="mx-auto mb-1 max-h-[60vh]" src={grenadeThrow.result_image_url} alt={t("result")} />
                <p className="text-slate-300 text-center text-xl">{t("result")}</p>
              </li>
            </ul>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className={`w-4 h-4 rounded-full ${
                grenadeThrow.grenade_type === "smoke" ? "bg-gray-500"
                : grenadeThrow.grenade_type === "flash" ? "bg-yellow-500"
                : grenadeThrow.grenade_type === "he" ? "bg-red-500"
                : grenadeThrow.grenade_type === "molotov" ? "bg-orange-500"
                : "bg-green-500"
              }`} />
              <span className="text-white font-medium">{grenadeThrow.grenade_type.toUpperCase()}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                grenadeThrow.team === "ct" ? "bg-blue-500/20 text-blue-300"
                : grenadeThrow.team === "t" ? "bg-yellow-500/20 text-yellow-300"
                : "bg-purple-500/20 text-purple-300"
              }`}>
                {grenadeThrow.team === "both" ? "CT & T" : grenadeThrow.team.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                grenadeThrow.difficulty === "easy" ? "bg-green-500/20 text-green-300"
                : grenadeThrow.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-300"
                : "bg-red-500/20 text-red-300"
              }`}>
                {t(`difficulty${grenadeThrow.difficulty.charAt(0).toUpperCase() + grenadeThrow.difficulty.slice(1)}` as any)}
              </span>
              {grenadeThrow.throw_types.map((throwType) => (
                <Badge key={throwType} variant="outline" className="text-xs text-slate-300 border-slate-600">
                  {ThrowTypes[throwType] || throwType}
                </Badge>
              ))}

              {grenadeThrow.video_url && videoRef.current && grenadeThrow.position_timestamp && (
                <div
                  title={t("goToPosition")}
                  className="cursor-pointer static h-6 w-6 bg-orange-300 rounded-full flex items-center justify-center"
                  onClick={() => {
                    videoRef.current!.pause();
                    videoRef.current!.currentTime = grenadeThrow.position_timestamp!;
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-[75%] block" viewBox="0 0 100 100" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet">
                    <path d="M68.913 48.908l-.048.126c.015-.038.027-.077.042-.115l.006-.011z" fill="#000000" />
                    <path d="M63.848 73.354l-1.383 1.71c1.87.226 3.68.491 5.375.812l-5.479 1.623l7.313 1.945l5.451-1.719c3.348 1.123 7.984 2.496 9.52 4.057h-10.93l1.086 3.176h11.342c-.034 1.79-3.234 3.244-6.29 4.422l-7.751-1.676l-7.303 2.617l7.8 1.78c-4.554 1.24-12.2 1.994-18.53 2.341l-.266-3.64h-7.606l-.267 3.64c-6.33-.347-13.975-1.1-18.53-2.34l7.801-1.781l-7.303-2.617l-7.752 1.676c-3.012-.915-6.255-2.632-6.289-4.422H25.2l1.086-3.176h-10.93c1.536-1.561 6.172-2.934 9.52-4.057l5.451 1.719l7.313-1.945l-5.479-1.623a82.552 82.552 0 0 1 5.336-.807l-1.363-1.713c-14.785 1.537-27.073 4.81-30.295 9.979C.7 91.573 19.658 99.86 49.37 99.989c.442.022.878.006 1.29 0c29.695-.136 48.636-8.42 43.501-16.654c-3.224-5.171-15.52-8.445-30.314-9.981z" fill="#000000" />
                    <path d="M49.855 0A10.5 10.5 0 0 0 39.5 10.5A10.5 10.5 0 0 0 50 21a10.5 10.5 0 0 0 10.5-10.5A10.5 10.5 0 0 0 50 0a10.5 10.5 0 0 0-.145 0zm-.057 23.592c-7.834.002-15.596 3.368-14.78 10.096l2 14.625c.351 2.573 2.09 6.687 4.687 6.687h.185l2.127 24.531c.092 1.105.892 2 2 2h8c1.108 0 1.908-.895 2-2l2.127-24.53h.186c2.597 0 4.335-4.115 4.687-6.688l2-14.625c.524-6.734-7.384-10.097-15.219-10.096z" fill="#000000" />
                    <path d="M-159.25 61.817l-.048.126c.016-.038.027-.076.043-.115c0-.004.004-.007.006-.01z" fill="#000000" />
                  </svg>
                </div>
              )}
              {grenadeThrow.video_url && videoRef.current && grenadeThrow.aim_timestamp && (
                <div
                  title={t("goToAim")}
                  className="cursor-pointer static h-6 w-6 bg-orange-300 rounded-full flex items-center justify-center"
                  onClick={() => {
                    videoRef.current!.pause();
                    videoRef.current!.currentTime = grenadeThrow.aim_timestamp!;
                  }}
                >
                  <Crosshair className="w-[75%] block" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">{t("instructions")}</h3>
            <ol className="text-slate-300 text-sm space-y-1">
              <li>{t("step1")}</li>
              <li>{grenadeThrow.media_type === "video" ? t("step2video") : t("step2screenshots")}</li>
              <li>{t("step3")}</li>
              <li>{t("step4")}</li>
            </ol>
          </div>

          {user && grenadeThrow.user_id === user.id && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  {t("deleteThrow")}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-slate-300 text-sm">{t("deleteConfirm")}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteThrow.isPending}
                    onClick={() => {
                      deleteThrow.mutate(grenadeThrow.id, {
                        onSuccess: () => {
                          onClose();
                          onDeleted?.();
                        },
                      });
                    }}
                  >
                    {t("deleteYes")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-slate-400"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrenadeFullInfo;
