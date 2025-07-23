import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  useGrenadeThrows,
  useUserCustomGrenades,
  useUserFavorites,
} from "@/hooks/useGrenadeThrows";

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { user, profile } = useAuth();
  const { data: favouriteGrenades } = useUserFavorites();
  const { data: customGrenades } = useUserCustomGrenades();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Назад</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Настройки</h1>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Профиль */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Профиль</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="bg-slate-700 rounded-lg px-4 py-2 text-slate-300">
                  {user?.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Имя пользователя
                </label>
                <div className="bg-slate-700 rounded-lg px-4 py-2 text-slate-300">
                  {profile?.username || "Не указано"}
                </div>
              </div>
            </div>
          </div>

          {/* Статистика */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Статистика</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {customGrenades && customGrenades.length}
                </div>
                <div className="text-slate-400">Созданных раскидок</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {favouriteGrenades && favouriteGrenades.length}
                </div>
                <div className="text-slate-400">Избранных</div>
              </div>
            </div>
          </div>

          {/* Уведомления */}
          {/* <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Уведомления</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-slate-300">Новые раскидки</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-slate-300">Обновления карт</span>
              </label>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Settings;
