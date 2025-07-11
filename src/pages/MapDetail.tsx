import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMaps } from "@/hooks/useMaps";
import { useUserFavorites, useToggleFavorite } from "@/hooks/useGrenadeThrows";
import { ThrowTypes, GrenadeThrow } from "../types/map";
import GrenadePoint from "../components/GrenadePoint";
import VideoModal from "../components/VideoModal";
import AddGrenadeForm from "../components/AddGrenadeForm";
import { ArrowLeft, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MapDetail = () => {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: maps, refetch } = useMaps();
  const { data: userFavorites } = useUserFavorites();
  const toggleFavorite = useToggleFavorite();

  const [selectedThrow, setSelectedThrow] = useState<GrenadeThrow | null>(null);
  const [hoveredThrow, setHoveredThrow] = useState<GrenadeThrow | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterFavorites, setFilterFavorites] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const map = maps?.find((m) => m.id === mapId);

  if (!map) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Карта не найдена</div>
      </div>
    );
  }

  const isNewThrow = (createdAt: string) => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return new Date(createdAt) > twoWeeksAgo;
  };

  const filteredThrows = (map.throws || []).filter((t) => {
    const typeMatch = filterType === "all" || t.grenade_type === filterType;
    const teamMatch =
      filterTeam === "all" || t.team === filterTeam || t.team === "both";
    const favoriteMatch =
      !filterFavorites || userFavorites?.some((fav) => fav.throw_id === t.id);
    return typeMatch && teamMatch && favoriteMatch;
  });

  const isThrowFavorite = (throwId: string) => {
    return userFavorites?.some((fav) => fav.throw_id === throwId) || false;
  };

  const handleToggleFavorite = (throwId: string) => {
    if (!user) return;
    const isFavorite = isThrowFavorite(throwId);
    toggleFavorite.mutate({ throwId, isFavorite });
  };

  const grenadeTypes = [
    { value: "all", label: "Все гранаты" },
    { value: "smoke", label: "SMOKE" },
    { value: "flash", label: "FLASH" },
    { value: "he", label: "HE" },
    { value: "molotov", label: "MOLOTOV" },
    { value: "decoy", label: "DECOY" },
  ];

  const teams = [
    { value: "all", label: "Все команды" },
    { value: "ct", label: "CT" },
    { value: "t", label: "T" },
  ];

  const handleAddSuccess = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Mobile-first Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 sm:space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Назад</span>
            </Button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
              {map.display_name}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Add Grenade Button */}
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center space-x-1 sm:space-x-2 order-last sm:order-first"
            >
              <Plus size={16} className="sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base">Добавить</span>
            </Button>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 w-full sm:w-auto">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-40 lg:w-48 bg-slate-800 text-white border-slate-600 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {grenadeTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-white hover:bg-slate-700 text-sm"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterTeam} onValueChange={setFilterTeam}>
                <SelectTrigger className="w-full sm:w-40 lg:w-48 bg-slate-800 text-white border-slate-600 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {teams.map((team) => (
                    <SelectItem
                      key={team.value}
                      value={team.value}
                      className="text-white hover:bg-slate-700 text-sm"
                    >
                      {team.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {user && (
                <Button
                  onClick={() => setFilterFavorites(!filterFavorites)}
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center space-x-1 sm:space-x-2 w-full sm:w-auto"
                >
                  <Star
                    size={14}
                    className={`transition-colors ${
                      filterFavorites ? "fill-current" : ""
                    }`}
                  />
                  <span className="text-sm">Избранное</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative bg-slate-800 rounded-lg sm:rounded-xl overflow-hidden border border-slate-700">
          <div className="aspect-video relative touch-pan-x touch-pan-y">
            <img
              src={map.image_url}
              alt={map.display_name}
              className="w-full h-full object-contain"
            />

            {/* Grenade Points */}
            {filteredThrows.map((grenadeThrow) => (
              <React.Fragment key={grenadeThrow.id}>
                <GrenadePoint
                  throw={grenadeThrow}
                  isThrowPoint={true}
                  onClick={() => setSelectedThrow(grenadeThrow)}
                  onHover={() => setHoveredThrow(grenadeThrow)}
                  onLeave={() => setHoveredThrow(null)}
                  isHovered={hoveredThrow?.id === grenadeThrow.id}
                />
                <GrenadePoint
                  throw={grenadeThrow}
                  isThrowPoint={false}
                  onClick={() => setSelectedThrow(grenadeThrow)}
                  onHover={() => setHoveredThrow(grenadeThrow)}
                  onLeave={() => setHoveredThrow(null)}
                  isHovered={hoveredThrow?.id === grenadeThrow.id}
                />

                {/* Connection Line */}
                {hoveredThrow?.id === grenadeThrow.id && (
                  <svg className="absolute inset-0 pointer-events-none w-full h-full">
                    <line
                      x1={`${grenadeThrow.throw_point_x}%`}
                      y1={`${grenadeThrow.throw_point_y}%`}
                      x2={`${grenadeThrow.landing_point_x}%`}
                      y2={`${grenadeThrow.landing_point_y}%`}
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Hover Preview */}
          {hoveredThrow && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-black/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 max-w-xs z-10 text-xs sm:text-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-bold">{hoveredThrow.name}</h3>
                {isNewThrow(hoveredThrow.created_at) && (
                  <Badge
                    variant="outline"
                    className="bg-green-500/20 text-green-300 border-green-500"
                  >
                    НОВОЕ
                  </Badge>
                )}
              </div>
              <p className="text-slate-300 text-sm mb-3">
                {hoveredThrow.description}
              </p>
              <div className="flex items-center space-x-2 mb-3">
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
              {/* Throw Types */}
              {hoveredThrow.throw_types &&
                hoveredThrow.throw_types.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {hoveredThrow.throw_types.map((throwType) => (
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
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {filteredThrows.length}
            </div>
            <div className="text-slate-400 text-sm sm:text-base">Раскидок найдено</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <div className="text-xl sm:text-2xl font-bold text-green-400">
              {filteredThrows.filter((t) => t.difficulty === "easy").length}
            </div>
            <div className="text-slate-400 text-sm sm:text-base">Легких</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">
              {filteredThrows.filter((t) => t.difficulty === "medium").length}
            </div>
            <div className="text-slate-400 text-sm sm:text-base">Средних</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <div className="text-xl sm:text-2xl font-bold text-red-400">
              {filteredThrows.filter((t) => t.difficulty === "hard").length}
            </div>
            <div className="text-slate-400 text-sm sm:text-base">Сложных</div>
          </div>
        </div>

        {/* Video Modal */}
        {selectedThrow && (
          <VideoModal
            throw={selectedThrow}
            isOpen={!!selectedThrow}
            onClose={() => setSelectedThrow(null)}
          />
        )}

        {/* Add Grenade Form */}
        <AddGrenadeForm
          map={map}
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddSuccess}
        />
      </div>
    </div>
  );
};

export default MapDetail;
