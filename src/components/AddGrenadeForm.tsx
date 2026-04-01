import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Map,
  GrenadeType,
  DifficultyLevel,
  TeamType,
  ThrowType,
} from "@/types/map";
import { X, XIcon, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GrenadePoint from "./GrenadePoint";
import FileUploadField from "./FileUploadField";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/useLanguage";

interface AddGrenadeFormProps {
  map: Map;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type GrenadeFormData = {
  name: string;
  description: string;
  grenade_type: GrenadeType;
  difficulty: DifficultyLevel;
  team: TeamType;
  video_url: string | null;
  throw_point_x: number;
  throw_point_y: number;
  landing_point_x: number;
  landing_point_y: number;
  media_type: "video" | "screenshots";
  throw_types: ThrowType[];
  position_timestamp: number | null;
  aim_timestamp: number | null;
};

const AddGrenadeForm: React.FC<AddGrenadeFormProps> = ({
  map,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [isSelectingCoordinates, setIsSelectingCoordinates] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const videoLinkInputRef = useRef<HTMLInputElement>(null);
  const [coordinateMode, setCoordinateMode] = useState<
    "throw" | "landing" | null
  >(null);
  const [timestampPreviews, setTimestampPreviews] = useState({
    position: null as string | null,
    aim: null as string | null,
  });
  const [videoMeta, setVideoMeta] = useState({
    duration: 0,
    currentTime: 0,
  });
  const [activeTimestampType, setActiveTimestampType] = useState<
    "position" | "aim" | null
  >(null);
  const pendingTimestampType = useRef<"position" | "aim" | null>(null);
  const [formData, setFormData] = useState<GrenadeFormData>({
    name: "",
    description: "",
    grenade_type: "smoke" as GrenadeType,
    difficulty: "medium" as DifficultyLevel,
    team: "both" as TeamType,
    video_url: null,
    throw_point_x: 0,
    throw_point_y: 0,
    landing_point_x: 0,
    landing_point_y: 0,
    media_type: "video" as "video" | "screenshots",
    throw_types: [] as ThrowType[],
    position_timestamp: null as number | null,
    aim_timestamp: null as number | null,
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    video: null as File | null,
    setup_image: null as File | null,
    aim_image: null as File | null,
    result_image: null as File | null,
  });
  const MAX_VIDEO_SIZE_MB = 200;
  const MAX_IMAGE_SIZE_MB = 10;
  const BYTES_IN_MB = 1024 * 1024;
  const screenshotCount =
    Number(!!uploadedFiles.setup_image) +
    Number(!!uploadedFiles.aim_image) +
    Number(!!uploadedFiles.result_image);
  const hasAllScreenshots = screenshotCount === 3;
  const hasAnyScreenshot = screenshotCount > 0;
  const screenshotsValid = hasAllScreenshots || hasAnyScreenshot;

  const throwTypeOptions: { value: ThrowType; label: string }[] = [
    { value: "standing", label: t("throwStanding") },
    { value: "jump_throw", label: t("throwJump") },
    { value: "running_left", label: t("throwRunLeft") },
    { value: "running_right", label: t("throwRunRight") },
    { value: "running_forward", label: t("throwRunForward") },
    { value: "crouching", label: t("throwCrouching") },
    { value: "walk_throw", label: t("throwWalk") },
  ];

  const handleMapClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!isSelectingCoordinates || !coordinateMode) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (coordinateMode === "throw") {
      setFormData({ ...formData, throw_point_x: x, throw_point_y: y });
    } else {
      setFormData({ ...formData, landing_point_x: x, landing_point_y: y });
    }

    setIsSelectingCoordinates(false);
    setCoordinateMode(null);
  };

  const startCoordinateSelection = (mode: "throw" | "landing") => {
    setCoordinateMode(mode);
    setIsSelectingCoordinates(true);
  };

  const toggleThrowType = (throwType: ThrowType) => {
    const newTypes = formData.throw_types.includes(throwType)
      ? formData.throw_types.filter((t) => t !== throwType)
      : [...formData.throw_types, throwType];
    setFormData({ ...formData, throw_types: newTypes });
  };

  useEffect(() => {
    setTimestampPreviews({ position: null, aim: null });
    setVideoMeta({ duration: 0, currentTime: 0 });
    setActiveTimestampType(null);
    setFormData((prev) => ({
      ...prev,
      position_timestamp: null,
      aim_timestamp: null,
    }));
  }, [uploadedFiles.video]);

  const captureTimestampPreview = (type: "position" | "aim") => {
    const video = videoPreviewRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setTimestampPreviews((prev) => ({ ...prev, [type]: dataUrl }));
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const markTimestamp = (type: "position" | "aim") => {
    const video = videoPreviewRef.current;
    if (!video) return;
    const time = Math.round(video.currentTime * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      ...(type === "position"
        ? { position_timestamp: time }
        : { aim_timestamp: time }),
    }));
    captureTimestampPreview(type);
  };

  const setTimestampFromTime = (type: "position" | "aim", time: number) => {
    const rounded = Math.round(time * 100) / 100;
    setFormData((prev) => ({
      ...prev,
      ...(type === "position"
        ? { position_timestamp: rounded }
        : { aim_timestamp: rounded }),
    }));
  };

  useEffect(() => {
    const video = videoPreviewRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoMeta({
        duration: video.duration || 0,
        currentTime: video.currentTime || 0,
      });
    };
    const handleTimeUpdate = () => {
      setVideoMeta((prev) => ({
        ...prev,
        currentTime: video.currentTime || 0,
      }));
    };
    const handleSeeked = () => {
      const pending = pendingTimestampType.current;
      if (pending) {
        captureTimestampPreview(pending);
        pendingTimestampType.current = null;
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleSeeked);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleSeeked);
    };
  }, [uploadedFiles.video]);

  const handleFileUpload = async (
    file: File,
    path: string,
    kind: "video" | "image",
  ): Promise<string> => {
    if (!validateFile(file, kind)) {
      throw new Error("Invalid file");
    }
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("grenade-media")
      .upload(filePath, file, { contentType: file.type });

    if (uploadError) throw uploadError;

    return filePath;
  };

  const validateFile = (file: File, kind: "video" | "image") => {
    if (kind === "video" && !file.type.startsWith("video/")) {
      toast.error(t("errorInvalidVideoType"));
      return false;
    }
    if (kind === "image" && !file.type.startsWith("image/")) {
      toast.error(t("errorInvalidImageType"));
      return false;
    }
    const maxBytes =
      kind === "video"
        ? MAX_VIDEO_SIZE_MB * BYTES_IN_MB
        : MAX_IMAGE_SIZE_MB * BYTES_IN_MB;
    if (file.size > maxBytes) {
      toast.error(
        kind === "video" ? t("errorVideoTooLarge") : t("errorImageTooLarge"),
      );
      return false;
    }
    return true;
  };

  const setFileWithValidation = (
    file: File | null,
    kind: "video" | "image",
    key: keyof typeof uploadedFiles,
  ) => {
    if (!file) {
      setUploadedFiles((prev) => ({ ...prev, [key]: null }));
      return;
    }
    if (!validateFile(file, kind)) return;
    setUploadedFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (
      (formData.throw_point_x === 0 && formData.throw_point_y === 0) ||
      (formData.landing_point_x === 0 && formData.landing_point_y === 0)
    ) {
      toast.error(t("errorSetPoints"));
      return;
    }

    // Проверяем обязательные медиа
    if (
      formData.media_type === "video" &&
      !formData.video_url &&
      !uploadedFiles.video
    ) {
      toast.error(t("errorVideoRequired"));
      return;
    }
    if (formData.media_type === "screenshots" && !screenshotsValid) {
      toast.error(t("errorImageRequired"));
      return;
    }

    setLoading(true);
    try {
      if (uploadedFiles.video && !validateFile(uploadedFiles.video, "video")) {
        return;
      }
      if (
        uploadedFiles.setup_image &&
        !validateFile(uploadedFiles.setup_image, "image")
      ) {
        return;
      }
      if (
        uploadedFiles.aim_image &&
        !validateFile(uploadedFiles.aim_image, "image")
      ) {
        return;
      }
      if (
        uploadedFiles.result_image &&
        !validateFile(uploadedFiles.result_image, "image")
      ) {
        return;
      }

      let video_url = formData.video_url;
      let setup_image_url = null;
      let aim_image_url = null;
      let result_image_url = null;

      // Upload files if they exist
      if (uploadedFiles.video) {
        video_url = await handleFileUpload(
          uploadedFiles.video,
          "videos",
          "video",
        );
      }
      if (uploadedFiles.setup_image) {
        setup_image_url = await handleFileUpload(
          uploadedFiles.setup_image,
          "images",
          "image",
        );
      }
      if (uploadedFiles.aim_image) {
        aim_image_url = await handleFileUpload(
          uploadedFiles.aim_image,
          "images",
          "image",
        );
      }
      if (uploadedFiles.result_image) {
        result_image_url = await handleFileUpload(
          uploadedFiles.result_image,
          "images",
          "image",
        );
      }

      const { error } = await supabase.from("grenade_throws").insert({
        ...formData,
        map_id: map.id,
        user_id: user.id,
        video_url,
        setup_image_url,
        aim_image_url,
        result_image_url,
        position_timestamp: formData.position_timestamp,
        aim_timestamp: formData.aim_timestamp,
        is_public: false,
        is_verified: false,
      });

      if (error) throw error;

      onSuccess();
      onClose();
      setFormData({
        name: "",
        description: "",
        grenade_type: "smoke",
        difficulty: "medium",
        team: "both",
        video_url: null,
        throw_point_x: 0,
        throw_point_y: 0,
        landing_point_x: 0,
        landing_point_y: 0,
        media_type: "video",
        throw_types: [],
        position_timestamp: null,
        aim_timestamp: null,
      });
      setUploadedFiles({
        video: null,
        setup_image: null,
        aim_image: null,
        result_image: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`${t("errorCreating")} ${errorMessage || "Unknown error"}`);
      console.error(t("errorCreating"), error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-slate-800 rounded-lg sm:rounded-xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
            {t("addThrow")}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col">
          {/* Map Preview */}
          <div className="w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
              {isSelectingCoordinates
                ? coordinateMode === "throw"
                  ? t("clickMapForThrow")
                  : t("clickMapForLanding")
                : t("preview")}
            </h3>
            <div className="relative bg-slate-700 rounded-lg overflow-hidden">
              <img
                src={map.image_url}
                alt={map.display_name}
                className={`w-full aspect-video object-contain ${
                  isSelectingCoordinates ? "cursor-crosshair" : ""
                }`}
                onClick={handleMapClick}
              />

              {/* Throw Point */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 border-2 border-white rounded-full z-10"
                style={{
                  visibility: `${
                    formData.throw_point_x === 0 && formData.throw_point_y === 0
                      ? "hidden"
                      : "visible"
                  }`,
                  left: `${formData.throw_point_x}%`,
                  top: `${formData.throw_point_y}%`,
                }}
              ></div>

              {/* Landing Point */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full z-10"
                style={{
                  visibility: `${
                    formData.landing_point_x === 0 &&
                    formData.landing_point_y === 0
                      ? "hidden"
                      : "visible"
                  }`,

                  left: `${formData.landing_point_x}%`,
                  top: `${formData.landing_point_y}%`,
                }}
              >
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full border border-gray-400" />
              </div>

              {/* Connection Line */}
              <svg className="absolute inset-0 pointer-events-none h-full w-full">
                <line
                  style={{
                    visibility: `${
                      (formData.throw_point_x === 0 &&
                        formData.throw_point_y === 0) ||
                      (formData.landing_point_x === 0 &&
                        formData.landing_point_y === 0)
                        ? "hidden"
                        : "visible"
                    }`,
                  }}
                  x1={`${formData.throw_point_x}%`}
                  y1={`${formData.throw_point_y}%`}
                  x2={`${formData.landing_point_x}%`}
                  y2={`${formData.landing_point_y}%`}
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2 mt-3 sm:mt-4">
              <Button
                type="button"
                onClick={() => startCoordinateSelection("throw")}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm"
                disabled={isSelectingCoordinates}
              >
                {t("throwPoint")}
              </Button>
              <Button
                type="button"
                onClick={() => startCoordinateSelection("landing")}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm"
                disabled={isSelectingCoordinates}
              >
                {t("landingPoint")}
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="w-full p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("throwName")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent h-24"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t("grenadeType")}
                  </label>
                  <select
                    value={formData.grenade_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        grenade_type: e.target.value as GrenadeType,
                      })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="smoke">Smoke</option>
                    <option value="flash">Flash</option>
                    <option value="he">HE</option>
                    <option value="molotov">Molotov</option>
                    <option value="decoy">Decoy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t("difficulty")}
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target.value as DifficultyLevel,
                      })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="easy">{t("difficultyEasy")}</option>
                    <option value="medium">{t("difficultyMedium")}</option>
                    <option value="hard">{t("difficultyHard")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t("team")}
                  </label>
                  <select
                    value={formData.team}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        team: e.target.value as TeamType,
                      })
                    }
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="both">{t("teamBoth")}</option>
                    <option value="ct">CT</option>
                    <option value="t">T</option>
                  </select>
                </div>
              </div>

              {/* Throw Types */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("throwTypes")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {throwTypeOptions.map((option) => (
                    <Badge
                      key={option.value}
                      variant={
                        formData.throw_types.includes(option.value)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-colors ${
                        formData.throw_types.includes(option.value)
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white border-slate-600"
                      }`}
                      onClick={() => toggleThrowType(option.value)}
                    >
                      {option.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Media Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("mediaType")}
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="video"
                      checked={formData.media_type === "video"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          media_type: e.target.value as "video" | "screenshots",
                        })
                      }
                      className="text-orange-500"
                    />
                    <span className="text-slate-300">{t("video")}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="screenshots"
                      checked={formData.media_type === "screenshots"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          media_type: e.target.value as "video" | "screenshots",
                        })
                      }
                      className="text-orange-500"
                    />
                    <span className="text-slate-300">{t("screenshots")}</span>
                  </label>
                </div>
              </div>

              {/* Media Upload */}
              {formData.media_type === "video" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {t("videoLink")}
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.video_url ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            video_url: e.target.value || null,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://www.youtube.com/watch?v=..."
                        ref={videoLinkInputRef}
                      />
                      <XIcon
                        className={`absolute top-1/2 -translate-y-1/2 right-4  text-white cursor-pointer ${
                          !formData.video_url && "invisible"
                        }`}
                        onClick={() => {
                          setFormData((old) => ({ ...old, video_url: null }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center text-slate-400">{t("or")}</div>
                  <FileUploadField
                    label={t("uploadVideo")}
                    accept="video/*"
                    file={uploadedFiles.video}
                    onFileChange={(file) =>
                      setFileWithValidation(file, "video", "video")
                    }
                    placeholder={t("videoFormats")}
                    hint={t("dragVideo")}
                    videoRef={videoPreviewRef}
                    showVideoProgress
                    videoMarkers={[
                      formData.position_timestamp !== null
                        ? {
                            time: formData.position_timestamp,
                            label: t("markPosition"),
                            colorClassName: "bg-orange-400",
                          }
                        : null,
                      formData.aim_timestamp !== null
                        ? {
                            time: formData.aim_timestamp,
                            label: t("markAim"),
                            colorClassName: "bg-blue-400",
                          }
                        : null,
                    ].filter(Boolean) as {
                      time: number;
                      label?: string;
                      colorClassName?: string;
                    }[]}
                    onVideoSeek={(time) => {
                      setVideoMeta((prev) => ({
                        ...prev,
                        currentTime: time,
                      }));
                      if (activeTimestampType) {
                        setTimestampFromTime(activeTimestampType, time);
                        pendingTimestampType.current = activeTimestampType;
                      }
                    }}
                    onVideoMarkerClick={(marker) => {
                      if (videoPreviewRef.current) {
                        videoPreviewRef.current.currentTime = marker.time;
                      }
                    }}
                  />

                  {/* Video preview for timestamp marking */}
                  {uploadedFiles.video && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>{formatTime(videoMeta.currentTime)}</span>
                        <span className="text-slate-500">
                          {formatTime(videoMeta.duration)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1">
                          <Button
                            type="button"
                            size="sm"
                            className={`w-full bg-orange-500 hover:bg-orange-600 text-white text-xs ${
                              activeTimestampType === "position"
                                ? "ring-2 ring-orange-200"
                                : ""
                            }`}
                            onClick={() => {
                              setActiveTimestampType("position");
                              markTimestamp("position");
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 mr-1"
                              viewBox="0 0 100 100"
                              fill="currentColor"
                            >
                              <path d="M49.855 0A10.5 10.5 0 0 0 39.5 10.5 10.5 10.5 0 0 0 50 21a10.5 10.5 0 0 0 10.5-10.5A10.5 10.5 0 0 0 50 0zm-.057 23.592c-7.834.002-15.596 3.368-14.78 10.096l2 14.625c.351 2.573 2.09 6.687 4.687 6.687h.185l2.127 24.531c.092 1.105.892 2 2 2h8c1.108 0 1.908-.895 2-2l2.127-24.53h.186c2.597 0 4.335-4.115 4.687-6.688l2-14.625c.524-6.734-7.384-10.097-15.219-10.096z" />
                            </svg>
                            {t("markPosition")}
                          </Button>
                        </div>
                        <div className="flex-1">
                          <Button
                            type="button"
                            size="sm"
                            className={`w-full bg-blue-500 hover:bg-blue-600 text-white text-xs ${
                              activeTimestampType === "aim"
                                ? "ring-2 ring-blue-200"
                                : ""
                            }`}
                            onClick={() => {
                              setActiveTimestampType("aim");
                              markTimestamp("aim");
                            }}
                          >
                            <Crosshair size={16} className="mr-1" />
                            {t("markAim")}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-700/60 border border-slate-600 rounded-lg overflow-hidden">
                          <div className="px-2 py-1 text-[11px] text-slate-300 border-b border-slate-600 flex items-center justify-between">
                            <span>{t("markPosition")}</span>
                            <span className="text-slate-400">
                              {formData.position_timestamp !== null
                                ? `${formData.position_timestamp}s`
                                : "--"}
                            </span>
                          </div>
                          <div className="aspect-video bg-slate-800/60 flex items-center justify-center">
                            {timestampPreviews.position ? (
                              <img
                                src={timestampPreviews.position}
                                alt={t("markPosition")}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-slate-500">
                                {t("timestampHint")}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="bg-slate-700/60 border border-slate-600 rounded-lg overflow-hidden">
                          <div className="px-2 py-1 text-[11px] text-slate-300 border-b border-slate-600 flex items-center justify-between">
                            <span>{t("markAim")}</span>
                            <span className="text-slate-400">
                              {formData.aim_timestamp !== null
                                ? `${formData.aim_timestamp}s`
                                : "--"}
                            </span>
                          </div>
                          <div className="aspect-video bg-slate-800/60 flex items-center justify-center">
                            {timestampPreviews.aim ? (
                              <img
                                src={timestampPreviews.aim}
                                alt={t("markAim")}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-slate-500">
                                {t("timestampHint")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        {t("timestampHint")}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <FileUploadField
                    label={t("setupScreenshot")}
                    accept="image/*"
                    file={uploadedFiles.setup_image}
                    onFileChange={(file) =>
                      setFileWithValidation(file, "image", "setup_image")
                    }
                    hint={t("dragSetup")}
                  />
                  <FileUploadField
                    label={t("aimScreenshot")}
                    accept="image/*"
                    file={uploadedFiles.aim_image}
                    onFileChange={(file) =>
                      setFileWithValidation(file, "image", "aim_image")
                    }
                    hint={t("dragAim")}
                  />
                  <FileUploadField
                    label={t("resultScreenshot")}
                    accept="image/*"
                    file={uploadedFiles.result_image}
                    onFileChange={(file) =>
                      setFileWithValidation(file, "image", "result_image")
                    }
                    hint={t("dragResult")}
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 sm:space-x-4 pt-4 border-t border-slate-700">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-300 hover:text-white hover:bg-slate-700 order-last sm:order-first"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.name ||
                    formData.throw_types.length === 0 ||
                    (formData.media_type === "video" &&
                      !formData.video_url &&
                      !uploadedFiles.video) ||
                    (formData.media_type === "screenshots" &&
                      !screenshotsValid)
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 order-first sm:order-last"
                >
                  {loading ? t("creating") : t("createThrow")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGrenadeForm;
