
import React, { useState } from 'react';
import { Map, GrenadeThrow } from '../types/map';
import GrenadePoint from './GrenadePoint';
import VideoModal from './VideoModal';
import { ArrowLeft } from 'lucide-react';

interface MapViewProps {
  map: Map;
  onBack: () => void;
}

const MapView: React.FC<MapViewProps> = ({ map, onBack }) => {
  const [selectedThrow, setSelectedThrow] = useState<GrenadeThrow | null>(null);
  const [hoveredThrow, setHoveredThrow] = useState<GrenadeThrow | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');

  const filteredThrows = (map.throws || []).filter(t => {
    const typeMatch = filterType === 'all' || t.grenade_type === filterType;
    const teamMatch = filterTeam === 'all' || t.team === filterTeam || t.team === 'both';
    return typeMatch && teamMatch;
  });

  const grenadeTypes = ['all', 'smoke', 'flash', 'he', 'molotov', 'decoy'];
  const teams = ['all', 'ct', 't'];

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Назад к картам</span>
          </button>
          <h1 className="text-3xl font-bold text-white">{map.display_name}</h1>
        </div>
        
        {/* Filters */}
        <div className="flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2"
          >
            {grenadeTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'Все гранаты' : type.toUpperCase()}
              </option>
            ))}
          </select>
          
          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2"
          >
            {teams.map(team => (
              <option key={team} value={team}>
                {team === 'all' ? 'Все команды' : team.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
        <div className="aspect-video relative">
          <img
            src={map.image_url}
            alt={map.display_name}
            className="w-full h-full object-cover"
          />
          
          {/* Grenade Points */}
          {filteredThrows.map((grenadeThrow) => (
            <React.Fragment key={grenadeThrow.id}>
              <GrenadePoint
                throw={grenadeThrow}
                isThrowPoint={true}
                onClick={() => setSelectedThrow(grenadeThrow)}
                onHover={() => setHoveredThrow(grenadeThrow)}
                onLeave={() => setHoveredThrow(null)}
                isHovered={hoveredThrow?.id === grenadeThrow.id}
              />
              <GrenadePoint
                throw={grenadeThrow}
                isThrowPoint={false}
                onClick={() => setSelectedThrow(grenadeThrow)}
                onHover={() => setHoveredThrow(grenadeThrow)}
                onLeave={() => setHoveredThrow(null)}
                isHovered={hoveredThrow?.id === grenadeThrow.id}
              />
              
              {/* Connection Line */}
              {hoveredThrow?.id === grenadeThrow.id && (
                <svg className="absolute inset-0 pointer-events-none">
                  <line
                    x1={`${grenadeThrow.throw_point_x}%`}
                    y1={`${grenadeThrow.throw_point_y}%`}
                    x2={`${grenadeThrow.landing_point_x}%`}
                    y2={`${grenadeThrow.landing_point_y}%`}
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Hover Preview */}
        {hoveredThrow && (
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 max-w-xs">
            <h3 className="text-white font-bold mb-2">{hoveredThrow.name}</h3>
            <p className="text-slate-300 text-sm mb-3">{hoveredThrow.description}</p>
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${
                hoveredThrow.grenade_type === 'smoke' ? 'bg-gray-500' :
                hoveredThrow.grenade_type === 'flash' ? 'bg-yellow-500' :
                hoveredThrow.grenade_type === 'he' ? 'bg-red-500' :
                hoveredThrow.grenade_type === 'molotov' ? 'bg-orange-500' :
                'bg-green-500'
              }`} />
              <span className="text-sm text-slate-300">{hoveredThrow.grenade_type.toUpperCase()}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                hoveredThrow.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                hoveredThrow.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {hoveredThrow.difficulty}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{filteredThrows.length}</div>
          <div className="text-slate-400">Раскидок найдено</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-green-400">
            {filteredThrows.filter(t => t.difficulty === 'easy').length}
          </div>
          <div className="text-slate-400">Легких</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-yellow-400">
            {filteredThrows.filter(t => t.difficulty === 'medium').length}
          </div>
          <div className="text-slate-400">Средних</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-red-400">
            {filteredThrows.filter(t => t.difficulty === 'hard').length}
          </div>
          <div className="text-slate-400">Сложных</div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedThrow && (
        <VideoModal
          throw={selectedThrow}
          isOpen={!!selectedThrow}
          onClose={() => setSelectedThrow(null)}
        />
      )}
    </div>
  );
};

export default MapView;
