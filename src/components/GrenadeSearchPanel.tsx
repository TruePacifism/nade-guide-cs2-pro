import React, { useState } from "react";
import { Search, Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/i18n/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Star } from "lucide-react";

export interface SearchFilters {
  searchQuery: string;
  grenadeType: string;
  team: string;
  difficulty: string;
  throwType: string;
  sortBy: string;
  favoritesOnly: boolean;
}

interface GrenadeSearchPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  areaSearch: { x: number; y: number } | null;
  onResetAreaSearch: () => void;
}

const GrenadeSearchPanel: React.FC<GrenadeSearchPanelProps> = ({
  filters,
  onFiltersChange,
  areaSearch,
  onResetAreaSearch,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const grenadeTypes = [
    { value: "all", label: t("allGrenades") },
    { value: "smoke", label: "SMOKE" },
    { value: "flash", label: "FLASH" },
    { value: "he", label: "HE" },
    { value: "molotov", label: "MOLOTOV" },
    { value: "decoy", label: "DECOY" },
  ];

  const teams = [
    { value: "all", label: t("allTeams") },
    { value: "ct", label: "CT" },
    { value: "t", label: "T" },
  ];

  const difficulties = [
    { value: "all", label: t("allDifficulties") },
    { value: "easy", label: t("difficultyEasy") },
    { value: "medium", label: t("difficultyMedium") },
    { value: "hard", label: t("difficultyHard") },
  ];

  const throwTypes = [
    { value: "all", label: t("allThrowTypes") },
    { value: "standing", label: t("throwStanding") },
    { value: "jump_throw", label: t("throwJump") },
    { value: "running_left", label: t("throwRunLeft") },
    { value: "running_right", label: t("throwRunRight") },
    { value: "running_forward", label: t("throwRunForward") },
    { value: "crouching", label: t("throwCrouching") },
    { value: "walk_throw", label: t("throwWalk") },
  ];

  const sortOptions = [
    { value: "date", label: t("sortByDate") },
    { value: "popularity", label: t("sortByPopularity") },
  ];

  const hasActiveFilters =
    filters.grenadeType !== "all" ||
    filters.team !== "all" ||
    filters.difficulty !== "all" ||
    filters.throwType !== "all" ||
    filters.favoritesOnly ||
    filters.searchQuery.length > 0 ||
    areaSearch !== null;

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-700 p-3 sm:p-4 mb-4">
      {/* Main row: search + toggle */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="pl-9 bg-slate-900/60 border-slate-600 text-white placeholder:text-slate-500 text-sm"
          />
          {filters.searchQuery && (
            <button
              onClick={() => updateFilter("searchQuery", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Select value={filters.grenadeType} onValueChange={(v) => updateFilter("grenadeType", v)}>
            <SelectTrigger className="w-full sm:w-36 bg-slate-900/60 text-white border-slate-600 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {grenadeTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-700 text-sm">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.team} onValueChange={(v) => updateFilter("team", v)}>
            <SelectTrigger className="w-full sm:w-32 bg-slate-900/60 text-white border-slate-600 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {teams.map((team) => (
                <SelectItem key={team.value} value={team.value} className="text-white hover:bg-slate-700 text-sm">
                  {team.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 border-slate-600 text-sm"
          >
            <Filter size={14} />
            <span className="hidden sm:inline">{t("filters")}</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            )}
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>
        </div>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-700 flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
          <Select value={filters.difficulty} onValueChange={(v) => updateFilter("difficulty", v)}>
            <SelectTrigger className="w-full sm:w-40 bg-slate-900/60 text-white border-slate-600 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {difficulties.map((d) => (
                <SelectItem key={d.value} value={d.value} className="text-white hover:bg-slate-700 text-sm">
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.throwType} onValueChange={(v) => updateFilter("throwType", v)}>
            <SelectTrigger className="w-full sm:w-44 bg-slate-900/60 text-white border-slate-600 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {throwTypes.map((tt) => (
                <SelectItem key={tt.value} value={tt.value} className="text-white hover:bg-slate-700 text-sm">
                  {tt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(v) => updateFilter("sortBy", v)}>
            <SelectTrigger className="w-full sm:w-44 bg-slate-900/60 text-white border-slate-600 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {sortOptions.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-white hover:bg-slate-700 text-sm">
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {user && (
            <Button
              onClick={() => updateFilter("favoritesOnly", !filters.favoritesOnly)}
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 border-slate-600 text-sm ${
                filters.favoritesOnly ? "bg-orange-600/20 border-orange-500 text-orange-300" : ""
              }`}
            >
              <Star size={14} className={filters.favoritesOnly ? "fill-current" : ""} />
              {t("favorites")}
            </Button>
          )}

          {areaSearch && (
            <Button
              onClick={onResetAreaSearch}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border-orange-500 text-orange-300 text-sm"
            >
              <X size={14} />
              {t("resetAreaSearch")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GrenadeSearchPanel;
