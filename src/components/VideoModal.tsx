
import React from 'react';
import { GrenadeThrow } from '../types/map';
import { X } from 'lucide-react';

interface VideoModalProps {
  throw: GrenadeThrow;
  isOpen: boolean;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ throw: grenadeThrow, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{grenadeThrow.name}</h2>
            <p className="text-slate-300">{grenadeThrow.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Video */}
        <div className="aspect-video bg-black">
          <iframe
            src={grenadeThrow.videoUrl}
            className="w-full h-full"
            allowFullScreen
            title={grenadeThrow.name}
          />
        </div>

        {/* Details */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <span className={`w-4 h-4 rounded-full ${
                grenadeThrow.type === 'smoke' ? 'bg-gray-500' :
                grenadeThrow.type === 'flash' ? 'bg-yellow-500' :
                grenadeThrow.type === 'he' ? 'bg-red-500' :
                grenadeThrow.type === 'molotov' ? 'bg-orange-500' :
                'bg-green-500'
              }`} />
              <span className="text-white font-medium">{grenadeThrow.type.toUpperCase()}</span>
              
              <span className={`px-3 py-1 rounded-full text-sm ${
                grenadeThrow.team === 'ct' ? 'bg-blue-500/20 text-blue-300' :
                grenadeThrow.team === 't' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-purple-500/20 text-purple-300'
              }`}>
                {grenadeThrow.team === 'both' ? 'CT & T' : grenadeThrow.team.toUpperCase()}
              </span>
              
              <span className={`px-3 py-1 rounded-full text-sm ${
                grenadeThrow.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                grenadeThrow.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {grenadeThrow.difficulty === 'easy' ? 'Легко' :
                 grenadeThrow.difficulty === 'medium' ? 'Средне' : 'Сложно'}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Инструкция по выполнению:</h3>
            <ol className="text-slate-300 text-sm space-y-1">
              <li>1. Встаньте в указанную точку броска</li>
              <li>2. Наведите прицел согласно видео</li>
              <li>3. Выполните бросок с правильной силой</li>
              <li>4. Граната должна попасть в целевую точку</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
