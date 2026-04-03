import React, { useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMaps } from "@/hooks/useMaps";
import { useUserFavorites, useToggleFavorite } from "@/hooks/useGrenadeThrows";
import { GrenadeThrow } from "../types/map";
import GrenadeCluster from "../components/GrenadeCluster";
import GrenadeFullInfo from "../components/GrenadeFullInfo";
import AddGrenadeForm from "../components/AddGrenadeForm";
import GrenadeSearchPanel, { SearchFilters } from "../components/GrenadeSearchPanel";
import GrenadeSearchResults from "../components/GrenadeSearchResults";
import { ArrowLeft, Plus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/useLanguage";
import LanguageToggle from "@/components/LanguageToggle";

const AREA_SEARCH_RADIUS = 5; // percent

const MapDetail = () => {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { user } = useAuth();
  const { data: maps, isLoading, refetch } = useMaps();
  const { data: userFavorites } = useUserFavorites();
  const toggleFavorite = useToggleFavorite();

  const [selectedThrow, setSelectedThrow] = useState<GrenadeThrow | null>(null);
  const [hoveredThrow, setHoveredThrow] = useState<GrenadeThrow[] | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: "",
    grenadeType: "all",
    team: "all",
    difficulty: "all",
    throwType: "all",
    sortBy: "date",
    favoritesOnly: false,
  });

  const [areaSearch, setAreaSearch] = useState<{ x: number; y: number } | null>(null);

  const map = maps?.find((m) => m.name === mapId);

  // Count favorites per throw for popularity sorting
  const favoriteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    userFavorites?.forEach((fav) => {
      counts[fav.throw_id] = (counts[fav.throw_id] || 0) + 1;
    });
    return counts;
  }, [userFavorites]);

  const filteredThrows = useMemo(() => {
    if (!map?.throws) return [];

    let result = map.throws.filter((throwItem) => {
      const typeMatch = filters.grenadeType === "all" || throwItem.grenade_type === filters.grenadeType;
      const teamMatch = filters.team === "all" || throwItem.team === filters.team || throwItem.team === "both";
      const diffMatch = filters.difficulty === "all" || throwItem.difficulty === filters.difficulty;
      const throwTypeMatch = filters.throwType === "all" || throwItem.throw_types.includes(filters.throwType as any);
      const favMatch = !filters.favoritesOnly || userFavorites?.some((fav) => fav.throw_id === throwItem.id);

      const searchMatch =
        !filters.searchQuery ||
        throwItem.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (throwItem.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ?? false);

      const areaMatch =
        !areaSearch ||
        Math.sqrt(
          Math.pow(throwItem.landing_point_x - areaSearch.x, 2) +
          Math.pow(throwItem.landing_point_y - areaSearch.y, 2)
        ) <= AREA_SEARCH_RADIUS;

      return typeMatch && teamMatch && diffMatch && throwTypeMatch && favMatch && searchMatch && areaMatch;
    });

    // Sort
    if (filters.sortBy === "popularity") {
      result.sort((a, b) => (favoriteCounts[b.id] || 0) - (favoriteCounts[a.id] || 0));
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [map?.throws, filters, areaSearch, userFavorites, favoriteCounts]);

  // Popular throws: top 6 by favorites count
  const popularThrows = useMemo(() => {
    if (!map?.throws) return [];
    return [...map.throws]
      .filter((t) => (favoriteCounts[t.id] || 0) > 0)
      .sort((a, b) => (favoriteCounts[b.id] || 0) - (favoriteCounts[a.id] || 0))
      .slice(0, 6);
  }, [map?.throws, favoriteCounts]);

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setAreaSearch({ x, y });
    },
    []
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">{t("loading")}</div>
      </div>
    );
  }

  if (!map) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{t("mapNotFound")}</div>
      </div>
    );
  }

  const groupNearbyThrows = (throws: GrenadeThrow[], isThrowPoint: boolean) => {
    const groups: { throws: GrenadeThrow[]; position: { x: number; y: number } }[] = [];
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
          Math.pow(currentPos.x - otherPos.x, 2) + Math.pow(currentPos.y - otherPos.y, 2)
        );
        return distance <= 2;
      });

      nearbyThrows.forEach((t) => processed.add(t.id));
      groups.push({ throws: nearbyThrows, position: currentPos });
    });

    return groups;
  };

  const throwPointGroups = groupNearbyThrows(filteredThrows, true);
  const landingPointGroups = groupNearbyThrows(filteredThrows, false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 sm:space-x-2 text-slate-300 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{t("back")}</span>
            </Button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
              {map.display_name}
            </h1>
          </div>
          <LanguageToggle />
        </div>

        {/* Search Panel */}
        <GrenadeSearchPanel
          filters={filters}
          onFiltersChange={setFilters}
          areaSearch={areaSearch}
          onResetAreaSearch={() => setAreaSearch(null)}
        />

        {/* Map */}
        <div className="relative bg-slate-800 rounded-lg sm:rounded-xl overflow-hidden border border-slate-700">
          <div
            className="aspect-video relative touch-pan-x touch-pan-y cursor-crosshair"
            onClick={handleMapClick}
          >
            <img src={map.image_url} alt={map.display_name} className="w-full h-full object-contain" />

            {/* Area search indicator */}
            {areaSearch && (
              <div
                className="absolute rounded-full border-2 border-orange-400/60 bg-orange-400/10 pointer-events-none animate-pulse"
                style={{
                  left: `${areaSearch.x}%`,
                  top: `${areaSearch.y}%`,
                  width: `${AREA_SEARCH_RADIUS * 2}%`,
                  height: `${AREA_SEARCH_RADIUS * 2}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}

            {throwPointGroups.map((group, index) => (
              <GrenadeCluster
                key={`throw-${index}`}
                throws={group.throws}
                isThrowPoint={true}
                position={group.position}
                onClick={setSelectedThrow}
                onLeave={() => setHoveredThrow(null)}
                onHover={(value) => setHoveredThrow(value)}
              />
            ))}

            {landingPointGroups.map((group, index) => (
              <GrenadeCluster
                key={`landing-${index}`}
                throws={group.throws}
                isThrowPoint={false}
                position={group.position}
                onClick={setSelectedThrow}
                onLeave={() => setHoveredThrow(null)}
                onHover={(value) => setHoveredThrow(value)}
              />
            ))}

            {hoveredThrow &&
              hoveredThrow.map((throwItem) => (
                <svg key={`line-${throwItem.id}`} className="absolute inset-0 pointer-events-none w-full h-full">
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
          <div className="px-3 py-2 text-xs text-slate-500 text-center">
            {t("areaSearchHint")}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <div className="text-xl sm:text-2xl font-bold text-white">{filteredThrows.length}</div>
            <div className="text-slate-400 text-sm sm:text-base">{t("throwsFound")}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <div className="text-xl sm:text-2xl font-bold text-green-400">
              {filteredThrows.filter((t) => t.difficulty === "easy").length}
            </div>
            <div className="text-slate-400 text-sm sm:text-base">{t("easy")}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <div className="text-xl sm:text-2xl font-bold text-yellow-400">
              {filteredThrows.filter((t) => t.difficulty === "medium").length}
            </div>
            <div className="text-slate-400 text-sm sm:text-base">{t("medium")}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700">
            <div className="text-xl sm:text-2xl font-bold text-red-400">
              {filteredThrows.filter((t) => t.difficulty === "hard").length}
            </div>
            <div className="text-slate-400 text-sm sm:text-base">{t("hard")}</div>
          </div>
        </div>

        {/* Search Results */}
        <div className="mt-6">
          <GrenadeSearchResults
            throws={filteredThrows}
            onSelect={setSelectedThrow}
          />
        </div>

        {/* Popular Throws */}
        {popularThrows.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={20} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">{t("popularThrows")}</h3>
            </div>
            <GrenadeSearchResults
              throws={popularThrows}
              onSelect={setSelectedThrow}
            />
          </div>
        )}

        {selectedThrow && (
          <GrenadeFullInfo
            throw={selectedThrow}
            isOpen={!!selectedThrow}
            onClose={() => setSelectedThrow(null)}
            onDeleted={() => refetch()}
            allThrows={map.throws || []}
          />
        )}

        {user && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="fixed bottom-6 right-6 z-50 bg-orange-600 hover:bg-orange-700 rounded-full w-14 h-14 p-0 shadow-lg"
          >
            <Plus size={24} />
          </Button>
        )}

        {user && (
          <AddGrenadeForm
            map={map}
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
            onSuccess={() => refetch()}
          />
        )}
      </div>
    </div>
  );
};

export default MapDetail;
