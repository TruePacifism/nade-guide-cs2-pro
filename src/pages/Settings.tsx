import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  useUserCustomGrenades,
  useUserFavorites,
} from "@/hooks/useGrenadeThrows";
import { useLanguage } from "@/i18n/useLanguage";
import LanguageToggle from "@/components/LanguageToggle";

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { user, profile } = useAuth();
  const { data: favouriteGrenades } = useUserFavorites();
  const { data: customGrenades } = useUserCustomGrenades();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>{t("back")}</span>
            </button>
            <h1 className="text-3xl font-bold text-white">{t("settings")}</h1>
          </div>
          <LanguageToggle className="self-start sm:self-auto" />
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">{t("profile")}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t("email")}</label>
                <div className="bg-slate-700 rounded-lg px-4 py-2 text-slate-300">{user?.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t("username")}</label>
                <div className="bg-slate-700 rounded-lg px-4 py-2 text-slate-300">
                  {profile?.username || t("usernameNotSet")}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">{t("statistics")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {customGrenades && customGrenades.length}
                </div>
                <div className="text-slate-400">{t("createdThrows")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {favouriteGrenades && favouriteGrenades.length}
                </div>
                <div className="text-slate-400">{t("favorited")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
