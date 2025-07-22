import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMaps } from "@/hooks/useMaps";
import { useUserFavorites, useToggleFavorite } from "@/hooks/useGrenadeThrows";
import { ThrowTypes, GrenadeThrow } from "../types/map";
import GrenadeCluster from "../components/GrenadeCluster";
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
  const [hoveredThrow, setHoveredThrow] = useState<GrenadeThrow[] | null>(null);
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

  // Group nearby throws (within 3% distance)
  const groupNearbyThrows = (throws: GrenadeThrow[], isThrowPoint: boolean) => {
    const groups: {
      throws: GrenadeThrow[];
      position: { x: number; y: number };
    }[] = [];
    const processed = new Set<string>();

    throws.forEach((currentThrow) => {
      if (processed.has(currentThrow.id)) return;

      const currentPos = isThrowPoint
        ? { x: currentThrow.throw_point_x, y: currentThrow.throw_point_y }
        : { x: currentThrow.landing_point_x, y: currentThrow.landing_point_y };

      const nearbyThrows = throws.filter((otherThrow) => {
        if (processed.has(otherThrow.id)) return false;

        const otherPos = isThrowPoint
          ? { x: otherThrow.throw_point_x, y: otherThrow.throw_point_y }
          : { x: otherThrow.landing_point_x, y: otherThrow.landing_point_y };

        const distance = Math.sqrt(
          Math.pow(currentPos.x - otherPos.x, 2) +
            Math.pow(currentPos.y - otherPos.y, 2)
        );

        return distance <= 3; // 3% distance threshold
      });

      nearbyThrows.forEach((t) => processed.add(t.id));

      groups.push({
        throws: nearbyThrows,
        position: currentPos,
      });
    });

    return groups;
  };

  const throwPointGroups = groupNearbyThrows(filteredThrows, true);
  const landingPointGroups = groupNearbyThrows(filteredThrows, false);

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
              className="flex items-center space-x-1 sm:space-x-2 text-slate-300 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Назад</span>
            </Button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
              {map.display_name}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Add Grenade Button - Only for authenticated users */}
            {user && (
              <Button
                onClick={() => setShowAddForm(true)}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center space-x-1 sm:space-x-2 order-last sm:order-first"
              >
                <Plus size={16} className="sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">Добавить</span>
              </Button>
            )}

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

            {/* Throw Point Clusters */}
            {throwPointGroups.map((group, index) => (
              <GrenadeCluster
                key={`throw-${index}`}
                throws={group.throws}
                isThrowPoint={true}
                position={group.position}
                onClick={setSelectedThrow}
                onLeave={() => setHoveredThrow(null)}
                onHover={() =>
                  setHoveredThrow((oldHovered) => [
                    ...(oldHovered || []),
                    ...group.throws,
                  ])
                }
              />
            ))}

            {/* Landing Point Clusters */}
            {landingPointGroups.map((group, index) => (
              <GrenadeCluster
                key={`landing-${index}`}
                throws={group.throws}
                isThrowPoint={false}
                position={group.position}
                onClick={setSelectedThrow}
                onLeave={() => setHoveredThrow(null)}
                onHover={() =>
                  setHoveredThrow((oldHovered) => [
                    ...(oldHovered || []),
                    ...group.throws,
                  ])
                }
              />
            ))}

            {/* Connection Lines for hovered throws */}
            {hoveredThrow &&
              hoveredThrow.map((throwItem) => (
                <svg
                  key={`line-${throwItem.id}`}
                  className="absolute inset-0 pointer-events-none w-full h-full"
                >
                  <line
                    x1={`${throwItem.throw_point_x}%`}
                    y1={`${throwItem.throw_point_y}%`}
                    x2={`${throwItem.landing_point_x}%`}
                    y2={`${throwItem.landing_point_y}%`}
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>
              ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {filteredThrows.length}
            </div>
            <div className="text-slate-400 text-sm sm:text-base">
              Раскидок найдено
            </div>
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

        {/* Add Grenade Form - Only for authenticated users */}
        {user && (
          <AddGrenadeForm
            map={map}
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSuccess={handleAddSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default MapDetail;
