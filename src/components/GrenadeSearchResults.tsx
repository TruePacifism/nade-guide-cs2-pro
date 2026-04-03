import React from "react";
import { GrenadeThrow, ThrowTypes } from "@/types/map";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/useLanguage";

interface GrenadeSearchResultsProps {
  throws: GrenadeThrow[];
  onSelect: (grenadeThrow: GrenadeThrow) => void;
  title?: string;
}

const grenadeColorMap: Record<string, string> = {
  smoke: "bg-gray-500",
  flash: "bg-yellow-500",
  he: "bg-red-500",
  molotov: "bg-orange-500",
  decoy: "bg-green-500",
};

const difficultyColorMap: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

const GrenadeSearchResults: React.FC<GrenadeSearchResultsProps> = ({
  throws,
  onSelect,
  title,
}) => {
  const { t } = useLanguage();

  if (throws.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        {t("noResults")}
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      )}
      <div className="text-sm text-slate-400 mb-3">
        {t("throwsFoundCount")}: {throws.length}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {throws.map((grenadeThrow) => (
          <button
            key={grenadeThrow.id}
            onClick={() => onSelect(grenadeThrow)}
            className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-500 rounded-lg p-3 text-left transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-white font-medium text-sm truncate flex-1 mr-2 group-hover:text-orange-300 transition-colors">
                {grenadeThrow.name}
              </h4>
              <span className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 ${grenadeColorMap[grenadeThrow.grenade_type]}`} />
            </div>

            {grenadeThrow.description && (
              <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                {grenadeThrow.description}
              </p>
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs uppercase text-slate-300">
                {grenadeThrow.grenade_type}
              </span>
              <span className={`text-xs ${difficultyColorMap[grenadeThrow.difficulty]}`}>
                {t(`difficulty${grenadeThrow.difficulty.charAt(0).toUpperCase() + grenadeThrow.difficulty.slice(1)}` as any)}
              </span>
              <span className={`text-xs ${
                grenadeThrow.team === "ct" ? "text-blue-400" : grenadeThrow.team === "t" ? "text-yellow-400" : "text-purple-400"
              }`}>
                {grenadeThrow.team === "both" ? "CT/T" : grenadeThrow.team.toUpperCase()}
              </span>
              {grenadeThrow.throw_types.slice(0, 2).map((tt) => (
                <Badge key={tt} variant="outline" className="text-[10px] px-1 py-0 text-slate-400 border-slate-600">
                  {ThrowTypes[tt] || tt}
                </Badge>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GrenadeSearchResults;
