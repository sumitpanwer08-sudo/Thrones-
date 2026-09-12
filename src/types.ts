export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  artworkUrl: string;
  streamUrl: string;
  genre?: string;
  source?: 'audius' | 'jamendo' | 'itunes' | 'curated' | 'jiosaavn';
  encryptedMediaUrl?: string;
  isLiked?: boolean;
  playCount?: number;
  releaseYear?: string | number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  genre?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';

export type NavTab = 'home' | 'search' | 'library' | 'liked' | 'playlist';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}
