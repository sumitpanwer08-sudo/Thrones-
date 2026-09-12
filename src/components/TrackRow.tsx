import React from 'react';
import { Play, Pause, Heart, Download, Music2, Clock3 } from 'lucide-react';
import { Track } from '../types';
import { DEFAULT_GOT_IMAGE } from '../assets/gotImages';

interface TrackRowProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: Track) => void;
  onTogglePlay: () => void;
  onLikeToggle: (track: Track) => void;
  onDownload: (track: Track) => void;
  isDownloading?: boolean;
}

export const TrackRow: React.FC<TrackRowProps> = ({
  track,
  index,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onTogglePlay,
  onLikeToggle,
  onDownload,
  isDownloading,
}) => {
  const isThisPlaying = isCurrentTrack && isPlaying;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = Math.floor(secs % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleRowClick = () => {
    if (isCurrentTrack) {
      onTogglePlay();
    } else {
      onPlay(track);
    }
  };

  return (
    <div
      id={`track-row-${track.id}`}
      onClick={handleRowClick}
      className={`group grid grid-cols-12 items-center px-4 py-2.5 rounded-md hover:bg-[#282828]/70 cursor-pointer text-xs md:text-sm text-[#b3b3b3] hover:text-white transition-colors border-b border-[#282828]/20 ${
        isCurrentTrack ? 'bg-[#222222] text-[#1DB954]' : ''
      }`}
    >
      {/* Index or Play Button */}
      <div className="col-span-1 flex items-center justify-start">
        {isThisPlaying ? (
          <div className="flex items-end gap-0.5 h-4 w-4">
            <span className="w-0.5 bg-[#1DB954] rounded-full animate-eq-1" />
            <span className="w-0.5 bg-[#1DB954] rounded-full animate-eq-2" />
            <span className="w-0.5 bg-[#1DB954] rounded-full animate-eq-3" />
          </div>
        ) : (
          <>
            <span className="group-hover:hidden text-xs font-semibold text-[#888888] w-4 text-center">
              {index + 1}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isCurrentTrack) onTogglePlay();
                else onPlay(track);
              }}
              className="hidden group-hover:block text-white hover:text-[#1DB954] transition-colors"
              aria-label="Play track"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </>
        )}
      </div>

      {/* Title & Artist & Thumbnail */}
      <div className="col-span-6 md:col-span-5 flex items-center gap-3 pr-2 min-w-0">
        <img
          src={track.artworkUrl || DEFAULT_GOT_IMAGE}
          alt={track.title}
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded object-cover shrink-0 bg-[#282828]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_GOT_IMAGE;
          }}
        />
        <div className="flex flex-col min-w-0 overflow-hidden">
          <span
            className={`font-semibold truncate ${
              isCurrentTrack ? 'text-[#1DB954]' : 'text-white group-hover:text-white'
            }`}
          >
            {track.title}
          </span>
          <span className="text-xs text-[#a7a7a7] truncate group-hover:text-[#c0c0c0]">
            {track.artist}
          </span>
        </div>
      </div>

      {/* Album / Genre */}
      <div className="hidden md:block md:col-span-3 text-xs text-[#a7a7a7] truncate">
        {track.album || track.genre || 'Single'}
      </div>

      {/* Actions (Like + Download) */}
      <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-1.5 sm:gap-2 pr-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLikeToggle(track);
          }}
          className={`p-1.5 rounded-full hover:scale-110 transition-transform ${
            track.isLiked
              ? 'text-[#1DB954] opacity-100'
              : 'text-[#888888] hover:text-white opacity-60 group-hover:opacity-100'
          }`}
          title={track.isLiked ? 'Remove from Liked' : 'Add to Liked'}
        >
          <Heart className={`w-4 h-4 ${track.isLiked ? 'fill-[#1DB954]' : ''}`} />
        </button>

        {/* PROMINENT DIRECT DOWNLOAD BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(track);
          }}
          disabled={isDownloading}
          id={`row-download-btn-${track.id}`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-xs shrink-0 ${
            isDownloading
              ? 'bg-[#1DB954]/25 text-[#1DB954] border border-[#1DB954] cursor-wait'
              : 'bg-[#1DB954]/15 hover:bg-[#1DB954] text-[#1DB954] hover:text-black border border-[#1DB954]/40 hover:border-[#1DB954] active:scale-95'
          }`}
          title="Direct MP3 Download (High Quality)"
        >
          <Download className={`w-3.5 h-3.5 shrink-0 ${isDownloading ? 'animate-bounce text-[#1DB954]' : ''}`} />
          <span className="text-[11px] font-bold hidden sm:inline">
            {isDownloading ? 'Saving...' : 'Download'}
          </span>
        </button>
      </div>

      {/* Duration */}
      <div className="col-span-2 md:col-span-1 text-right text-xs text-[#a7a7a7] font-mono">
        {formatTime(track.duration)}
      </div>
    </div>
  );
};
