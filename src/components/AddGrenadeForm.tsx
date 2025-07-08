import React, { useState } from "react";
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
import { X, Upload, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GrenadePoint from "./GrenadePoint";
import { toast } from "sonner";

interface AddGrenadeFormProps {
  map: Map;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddGrenadeForm: React.FC<AddGrenadeFormProps> = ({
  map,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSelectingCoordinates, setIsSelectingCoordinates] = useState(false);
  const [coordinateMode, setCoordinateMode] = useState<
    "throw" | "landing" | null
  >(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    grenade_type: "smoke" as GrenadeType,
    difficulty: "medium" as DifficultyLevel,
    team: "both" as TeamType,
    video_url: "",
    throw_point_x: 0,
    throw_point_y: 0,
    landing_point_x: 0,
    landing_point_y: 0,
    media_type: "video" as "video" | "screenshots",
    throw_types: [] as ThrowType[],
  });
  const [uploadedFiles, setUploadedFiles] = useState({
    video: null as File | null,
    setup_image: null as File | null,
    aim_image: null as File | null,
    result_image: null as File | null,
  });

  const throwTypeOptions: { value: ThrowType; label: string }[] = [
    { value: "standing", label: "С места" },
    { value: "jump_throw", label: "Jump Throw" },
    { value: "running_left", label: "В движении влево" },
    { value: "running_right", label: "В движении вправо" },
    { value: "running_forward", label: "В движении вперед" },
    { value: "crouching", label: "В присяде" },
    { value: "walk_throw", label: "Шагом" },
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

  const handleFileUpload = async (
    file: File,
    path: string
  ): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("grenade-media")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("grenade-media")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (
      (formData.throw_point_x === 0 && formData.throw_point_y === 0) ||
      (formData.landing_point_x === 0 && formData.landing_point_y === 0)
    ) {
      toast.error("Пожалуйста, укажите точки броска и попадания на карте");
      return;
    }

    // Проверяем обязательные медиа
    if (
      formData.media_type === "video" &&
      !formData.video_url &&
      !uploadedFiles.video
    ) {
      toast.error("Видео обязательно при создании раскидки");
      return;
    }
    if (
      formData.media_type === "screenshots" &&
      !uploadedFiles.setup_image &&
      !uploadedFiles.aim_image &&
      !uploadedFiles.result_image
    ) {
      toast.error("Хотя бы одно изображение обязательно при создании раскидки");
      return;
    }

    setLoading(true);
    try {
      let video_url = formData.video_url;
      let setup_image_url = null;
      let aim_image_url = null;
      let result_image_url = null;

      // Upload files if they exist
      if (uploadedFiles.video) {
        video_url = await handleFileUpload(uploadedFiles.video, "videos");
      }
      if (uploadedFiles.setup_image) {
        setup_image_url = await handleFileUpload(
          uploadedFiles.setup_image,
          "images"
        );
      }
      if (uploadedFiles.aim_image) {
        aim_image_url = await handleFileUpload(
          uploadedFiles.aim_image,
          "images"
        );
      }
      if (uploadedFiles.result_image) {
        result_image_url = await handleFileUpload(
          uploadedFiles.result_image,
          "images"
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
        video_url: "",
        throw_point_x: 0,
        throw_point_y: 0,
        landing_point_x: 0,
        landing_point_y: 0,
        media_type: "video",
        throw_types: [],
      });
      setUploadedFiles({
        video: null,
        setup_image: null,
        aim_image: null,
        result_image: null,
      });
    } catch (error) {
      console.error("Ошибка при создании раскидки:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Добавить раскидку</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex">
          {/* Map Preview */}
          <div className="w-1/2 p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              {isSelectingCoordinates
                ? `Кликните на карту для ${
                    coordinateMode === "throw"
                      ? "точки броска"
                      : "точки падения"
                  }`
                : "Предварительный просмотр"}
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
                        formData.throw_point_y) ||
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

            <div className="flex space-x-2 mt-4">
              <Button
                type="button"
                onClick={() => startCoordinateSelection("throw")}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isSelectingCoordinates}
              >
                Выбрать точку броска
              </Button>
              <Button
                type="button"
                onClick={() => startCoordinateSelection("landing")}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isSelectingCoordinates}
              >
                Выбрать точку падения
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="w-1/2 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Название раскидки *
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
                  Описание
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Тип гранаты *
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
                    Сложность *
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
                    <option value="easy">Легко</option>
                    <option value="medium">Средне</option>
                    <option value="hard">Сложно</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Команда *
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
                    <option value="both">Обе</option>
                    <option value="ct">CT</option>
                    <option value="t">T</option>
                  </select>
                </div>
              </div>

              {/* Throw Types */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Типы броска *
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
                  Тип медиа *
                </label>
                <div className="flex space-x-4">
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
                    <span className="text-slate-300">Видео</span>
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
                    <span className="text-slate-300">Скриншоты</span>
                  </label>
                </div>
              </div>

              {/* Media Upload */}
              {formData.media_type === "video" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ссылка на видео (YouTube) *
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.video_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            video_url: e.target.value,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="https://www.youtube.com/watch?v=..."
                        ref={(input) => {
                          // Store ref for clearing value
                          (window as any).videoLinkInput = input;
                        }}
                      />
                      <XIcon
                        className="absolute top-1/2 -translate-y-1/2 right-4 text-white cursor-pointer"
                        onClick={() => {
                          setFormData((old) => {
                            return { ...old, video_url: undefined };
                          });
                          const input = (window as any)
                            .videoLinkInput as HTMLInputElement | null;
                          if (input) input.value = "";
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center text-slate-400">или</div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Загрузить видео файл *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setUploadedFiles({
                            ...uploadedFiles,
                            video: e.target.files?.[0] || null,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        ref={(input) => {
                          // Store ref for clearing value
                          (window as any).videoInput = input;
                        }}
                      />
                      <XIcon
                        className="absolute top-1/2 -translate-y-1/2 right-4 text-white cursor-pointer"
                        onClick={() => {
                          setUploadedFiles((old) => {
                            return { ...old, video: null };
                          });
                          // Clear the file input value
                          const input = (window as any)
                            .videoInput as HTMLInputElement | null;
                          if (input) input.value = "";
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Скриншот места броска *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setUploadedFiles({
                            ...uploadedFiles,
                            setup_image: e.target.files?.[0] || null,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        ref={(input) => {
                          // Store ref for clearing value
                          (window as any).setupImageInput = input;
                        }}
                      />
                      <XIcon
                        className="absolute top-1/2 -translate-y-1/2 right-4 text-white cursor-pointer"
                        onClick={() => {
                          setUploadedFiles((old) => {
                            return { ...old, setup_image: null };
                          });
                          // Clear the file input value
                          const input = (window as any)
                            .setupImageInput as HTMLInputElement | null;
                          if (input) input.value = "";
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Скриншот точки прицела *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setUploadedFiles({
                            ...uploadedFiles,
                            aim_image: e.target.files?.[0] || null,
                          })
                        }
                        ref={(input) => {
                          // Store ref for clearing value
                          (window as any).aimImageInput = input;
                        }}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <XIcon
                        className="absolute top-1/2 -translate-y-1/2 right-4 text-white cursor-pointer"
                        onClick={() => {
                          setUploadedFiles((old) => {
                            return { ...old, aim_image: null };
                          });
                          // Clear the file input value
                          const input = (window as any)
                            .aimImageInput as HTMLInputElement | null;
                          if (input) input.value = "";
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Скриншот результата *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        value={undefined}
                        onChange={(e) =>
                          setUploadedFiles({
                            ...uploadedFiles,
                            result_image: e.target.files?.[0] || null,
                          })
                        }
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        ref={(input) => {
                          // Store ref for clearing value
                          (window as any).resultImageInput = input;
                        }}
                      />
                      <XIcon
                        className="absolute top-1/2 -translate-y-1/2 right-4 text-white cursor-pointer"
                        onClick={() => {
                          setUploadedFiles((old) => {
                            return { ...old, result_image: null };
                          });
                          // Clear the file input value
                          const input = (window as any)
                            .resultImageInput as HTMLInputElement | null;
                          if (input) input.value = "";
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4 border-t border-slate-700">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  Отмена
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
                      (!uploadedFiles.aim_image ||
                        !uploadedFiles.setup_image ||
                        !uploadedFiles.result_image))
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                >
                  {loading ? "Создание..." : "Создать раскидку"}
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
