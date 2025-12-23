
export enum AppView {
  CHAT = 'chat',
  IMAGE_STUDIO = 'image_studio',
  VIDEO_STUDIO = 'video_studio',
  LIVE_VOICE = 'live_voice',
  ANALYSIS = 'analysis',
  MAPS_SEARCH = 'maps_search'
}

export interface Player {
  id: string;
  name: string;
  ability: string;
  avatar: string;
  level: number;
  voice: 'Kore' | 'Puck' | 'Zephyr';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image' | 'video';
  metadata?: any;
}
