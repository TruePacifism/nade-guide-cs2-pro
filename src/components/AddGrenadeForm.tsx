
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Map, GrenadeType, DifficultyLevel, TeamType } from '@/types/map';
import { X } from 'lucide-react';

interface AddGrenadeFormProps {
  map: Map;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddGrenadeForm: React.FC<AddGrenadeFormProps> = ({ map, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grenade_type: 'smoke' as GrenadeType,
    difficulty: 'medium' as DifficultyLevel,
    team: 'both' as TeamType,
    video_url: '',
    throw_point_x: 50,
    throw_point_y: 50,
    landing_point_x: 50,
    landing_point_y: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('grenade_throws')
        .insert({
          ...formData,
          map_id: map.id,
          user_id: user.id,
          throw_types: ['standing'],
          media_type: 'video',
          is_public: false,
          is_verified: false
        });

      if (error) throw error;

      onSuccess();
      onClose();
      setFormData({
        name: '',
        description: '',
        grenade_type: 'smoke',
        difficulty: 'medium',
        team: 'both',
        video_url: '',
        throw_point_x: 50,
        throw_point_y: 50,
        landing_point_x: 50,
        landing_point_y: 50
      });
    } catch (error) {
      console.error('Ошибка при создании раскидки:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Добавить раскидку</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Название раскидки
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent h-24"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Тип гранаты
              </label>
              <select
                value={formData.grenade_type}
                onChange={(e) => setFormData({ ...formData, grenade_type: e.target.value as GrenadeType })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="smoke">Smoke</option>
                <option value="flash">Flash</option>
                <option value="he">HE</option>
                <option value="molotov">Molotov</option>
                <option value="decoy">Decoy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Сложность
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="easy">Легко</option>
                <option value="medium">Средне</option>
                <option value="hard">Сложно</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Команда
              </label>
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value as TeamType })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="both">Обе</option>
                <option value="ct">CT</option>
                <option value="t">T</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ссылка на видео (YouTube)
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Точка броска</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">X координата (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.throw_point_x}
                    onChange={(e) => setFormData({ ...formData, throw_point_x: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Y координата (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.throw_point_y}
                    onChange={(e) => setFormData({ ...formData, throw_point_y: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-3">Точка падения</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">X координата (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.landing_point_x}
                    onChange={(e) => setFormData({ ...formData, landing_point_x: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Y координата (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.landing_point_y}
                    onChange={(e) => setFormData({ ...formData, landing_point_y: parseFloat(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-slate-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name}
              className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать раскидку'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGrenadeForm;
