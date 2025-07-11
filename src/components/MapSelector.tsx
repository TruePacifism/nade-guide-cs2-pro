
import React from 'react';
import { Map } from '../types/map';

interface MapSelectorProps {
  maps: Map[];
  onMapSelect: (map: Map) => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({ maps, onMapSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
      {maps.map((map) => (
        <div
          key={map.id}
          onClick={() => onMapSelect(map)}
          className="bg-slate-800 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-700 hover:border-orange-500 active:scale-95"
        >
          <div className="aspect-video bg-slate-700 relative overflow-hidden">
            <img
              src={map.thumbnail_url}
              alt={map.display_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1">{map.display_name}</h3>
              <p className="text-orange-400 text-xs sm:text-sm">
                {map.throws?.length || 0} раскидок доступно
              </p>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {['smoke', 'flash', 'he', 'molotov', 'decoy'].map((type) => {
                  const count = map.throws?.filter(t => t.grenade_type === type).length || 0;
                  if (count === 0) return null;
                  
                  const colors = {
                    smoke: 'bg-gray-500',
                    flash: 'bg-yellow-500',
                    he: 'bg-red-500',
                    molotov: 'bg-orange-500',
                    decoy: 'bg-green-500'
                  };
                  
                  return (
                    <span
                      key={type}
                      className={`${colors[type as keyof typeof colors]} text-white text-xs px-2 py-1 rounded-full font-medium`}
                    >
                      {count}
                    </span>
                  );
                })}
              </div>
              <button className="text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm sm:text-base">
                Открыть →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MapSelector;
