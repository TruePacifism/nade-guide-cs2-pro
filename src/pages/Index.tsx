
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMaps } from '@/hooks/useMaps';
import MapSelector from '../components/MapSelector';
import MapView from '../components/MapView';
import Settings from './Settings';
import Auth from '../components/Auth';
import { Map } from '../types/map';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings as SettingsIcon } from 'lucide-react';

const Index = () => {
  const { user, profile, signOut, loading } = useAuth();
  const { data: maps, isLoading: mapsLoading } = useMaps();
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (showSettings) {
    return <Settings onBack={() => setShowSettings(false)} />;
  }

  if (mapsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка карт...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <User size={20} />
              <span>Привет, {profile?.username || user.email}!</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(true)}
              className="text-slate-300 hover:text-slate-900 hover:bg-slate-300 transition-colors"
            >
              <SettingsIcon size={16} className="mr-2" />
              Настройки
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-slate-300 hover:text-slate-900 hover:bg-slate-300 transition-colors"
            >
              <LogOut size={16} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        {!selectedMap ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                CS2 Grenade Throws
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Изучите лучшие раскидки гранат для Counter-Strike 2. Выберите карту и откройте для себя профессиональные тактики.
              </p>
            </div>
            <MapSelector maps={maps || []} onMapSelect={setSelectedMap} />
          </>
        ) : (
          <MapView map={selectedMap} onBack={() => setSelectedMap(null)} />
        )}
      </div>
    </div>
  );
};

export default Index;
