
import { Map } from '../types/map';

export const maps: Map[] = [
  {
    id: 'dust2',
    name: 'dust2',
    displayName: 'Dust II',
    imageUrl: '/placeholder.svg',
    thumbnailUrl: '/placeholder.svg',
    throws: [
      {
        id: 'dust2-smoke-1',
        type: 'smoke',
        name: 'Xbox Smoke',
        description: 'Smoke для блокировки Xbox позиции',
        throwPoint: { x: 20, y: 30 },
        landingPoint: { x: 60, y: 40 },
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: '/placeholder.svg',
        difficulty: 'easy',
        team: 'ct'
      },
      {
        id: 'dust2-flash-1',
        type: 'flash',
        name: 'Long Flash',
        description: 'Флешка для захода на лонг',
        throwPoint: { x: 15, y: 25 },
        landingPoint: { x: 80, y: 20 },
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: '/placeholder.svg',
        difficulty: 'medium',
        team: 't'
      },
      {
        id: 'dust2-he-1',
        type: 'he',
        name: 'Site HE',
        description: 'HE граната для зачистки сайта',
        throwPoint: { x: 40, y: 70 },
        landingPoint: { x: 70, y: 80 },
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: '/placeholder.svg',
        difficulty: 'hard',
        team: 't'
      }
    ]
  },
  {
    id: 'mirage',
    name: 'mirage',
    displayName: 'Mirage',
    imageUrl: '/placeholder.svg',
    thumbnailUrl: '/placeholder.svg',
    throws: [
      {
        id: 'mirage-smoke-1',
        type: 'smoke',
        name: 'Connector Smoke',
        description: 'Smoke для блокировки коннектора',
        throwPoint: { x: 30, y: 40 },
        landingPoint: { x: 50, y: 50 },
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: '/placeholder.svg',
        difficulty: 'medium',
        team: 'ct'
      },
      {
        id: 'mirage-molotov-1',
        type: 'molotov',
        name: 'Default Molly',
        description: 'Молотов для дефолт позиции',
        throwPoint: { x: 60, y: 30 },
        landingPoint: { x: 80, y: 60 },
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: '/placeholder.svg',
        difficulty: 'easy',
        team: 't'
      }
    ]
  },
  {
    id: 'inferno',
    name: 'inferno',
    displayName: 'Inferno',
    imageUrl: '/placeholder.svg',
    thumbnailUrl: '/placeholder.svg',
    throws: [
      {
        id: 'inferno-smoke-1',
        type: 'smoke',
        name: 'Balcony Smoke',
        description: 'Smoke для блокировки балкона',
        throwPoint: { x: 25, y: 35 },
        landingPoint: { x: 45, y: 25 },
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnailUrl: '/placeholder.svg',
        difficulty: 'hard',
        team: 't'
      }
    ]
  }
];
