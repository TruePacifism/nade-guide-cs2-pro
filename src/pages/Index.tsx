
import React, { useState } from 'react';
import MapSelector from '../components/MapSelector';
import MapView from '../components/MapView';
import { Map } from '../types/map';

const Index = () => {
  const [selectedMap, setSelectedMap] = useState<Map | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
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
            <MapSelector onMapSelect={setSelectedMap} />
          </>
        ) : (
          <MapView map={selectedMap} onBack={() => setSelectedMap(null)} />
        )}
      </div>
    </div>
  );
};

export default Index;
