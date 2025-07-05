
import React from 'react';
import { maps } from '../data/maps';
import { Map } from '../types/map';

interface MapSelectorProps {
  onMapSelect: (map: Map) => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({ onMapSelect }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {maps.map((map) => (
        <div
          key={map.id}
          onClick={() => onMapSelect(map)}
          className="bg-slate-800 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-slate-700 hover:border-orange-500"
        >
          <div className="aspect-video bg-slate-700 relative overflow-hidden">
            <img
              src={map.thumbnailUrl}
              alt={map.displayName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-2xl font-bold text-white mb-1">{map.displayName}</h3>
              <p className="text-orange-400 text-sm">
                {map.throws.length} раскидок доступно
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {['smoke', 'flash', 'he', 'molotov', 'decoy'].map((type) => {
                  const count = map.throws.filter(t => t.type === type).length;
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
                      className={`${colors[type as keyof typeof colors]} text-white text-xs px-2 py-1 rounded-full`}
                    >
                      {count}
                    </span>
                  );
                })}
              </div>
              <button className="text-blue-400 hover:text-blue-300 font-medium">
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
