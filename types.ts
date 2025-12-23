
export enum AppTab {
  CHAT = 'chat',
  MAPS = 'maps',
  IMAGES = 'images',
  VIDEO = 'video',
  VOICE = 'voice',
  GAME_TIPS = 'game_tips'
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  groundingUrls?: { uri: string; title: string }[];
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface GeneratedVideo {
  url: string;
  prompt: string;
  timestamp: number;
}
