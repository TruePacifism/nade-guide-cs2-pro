
export interface GrenadeThrow {
  id: string;
  type: 'smoke' | 'flash' | 'he' | 'molotov' | 'decoy';
  name: string;
  description: string;
  throwPoint: {
    x: number;
    y: number;
  };
  landingPoint: {
    x: number;
    y: number;
  };
  videoUrl: string;
  thumbnailUrl: string;
  difficulty: 'easy' | 'medium' | 'hard';
  team: 'ct' | 't' | 'both';
}

export interface Map {
  id: string;
  name: string;
  displayName: string;
  imageUrl: string;
  thumbnailUrl: string;
  throws: GrenadeThrow[];
}
