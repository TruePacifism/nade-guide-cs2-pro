import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMaps } from "@/hooks/useMaps";
import MapSelector from "../components/MapSelector";
import Settings from "./Settings";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useLanguage } from "@/i18n/useLanguage";
import LanguageToggle from "@/components/LanguageToggle";

const Index = () => {
  const { user, profile, signOut, loading } = useAuth();
  const { data: maps, isLoading: mapsLoading } = useMaps();
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{t("loading")}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex justify-end items-center gap-2 mb-4">
            <Link to="/about">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-slate-900 hover:bg-slate-300">
                <Info size={14} className="mr-1" />
                <span className="text-xs sm:text-sm">{t("aboutTitle")}</span>
              </Button>
            </Link>
            <LanguageToggle />
          </div>
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
              {t("appTitle")}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              {t("appDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button className="bg-orange-600 hover:bg-orange-700 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
                  {t("signInUp")}
                </Button>
              </Link>
            </div>
          </div>
          {mapsLoading ? (
            <div className="text-center text-white text-xl">
              {t("loadingMaps")}
            </div>
          ) : (
            <MapSelector maps={maps || []} onMapSelect={(map) => navigate(`/map/${map.name}`)} />
          )}
        </div>
      </div>
    );
  }

  if (showSettings) {
    return <Settings onBack={() => setShowSettings(false)} />;
  }

  if (mapsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">{t("loadingMaps")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <User size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base truncate">
                {t("hello")}, {profile?.username || user.email?.split("@")[0]}!
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <LanguageToggle className="hidden sm:inline-flex" />
            <Link to="/about">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-slate-900 hover:bg-slate-300">
                <Info size={14} className="mr-1" />
                <span className="text-xs sm:text-sm">{t("aboutTitle")}</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-slate-300 hover:text-slate-900 hover:bg-slate-300 transition-colors flex-1 sm:flex-none"
            >
              <SettingsIcon size={14} className="mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">{t("settings")}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-300 hover:text-slate-900 hover:bg-slate-300 transition-colors flex-1 sm:flex-none"
            >
              <LogOut size={14} className="mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">{t("signOut")}</span>
            </Button>
            <LanguageToggle className="inline-flex sm:hidden" />
          </div>
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
            {t("appTitle")}
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto px-4">
            {t("appDescription")}
          </p>
        </div>
        <MapSelector maps={maps || []} onMapSelect={(map) => navigate(`/map/${map.name}`)} />
      </div>
    </div>
  );
};

export default Index;
