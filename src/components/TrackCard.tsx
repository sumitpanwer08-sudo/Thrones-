import React from 'react';
import { Play, Pause, Heart, Download, Music2 } from 'lucide-react';
import { Track } from '../types';
import { DEFAULT_GOT_IMAGE } from '../assets/gotImages';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: Track) => void;
  onTogglePlay: () => void;
  onLikeToggle: (track: Track) => void;
  onDownload: (track: Track) => void;
  isDownloading?: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onTogglePlay,
  onLikeToggle,
  onDownload,
  isDownloading,
}) => {
  const isThisPlaying = isCurrentTrack && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      onTogglePlay();
    } else {
      onPlay(track);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload(track);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeToggle(track);
  };

  return (
    <div
      id={`track-card-${track.id}`}
      onClick={() => onPlay(track)}
      className={`group relative p-3.5 rounded-md bg-[#181818] hover:bg-[#282828] transition-all duration-300 cursor-pointer flex flex-col justify-between border border-transparent hover:border-[#383838]/40 shadow-lg ${
        isCurrentTrack ? 'ring-1 ring-[#1DB954]/50 bg-[#222222]' : ''
      }`}
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-square w-full mb-3 rounded-md overflow-hidden bg-[#242424] shadow-md">
        <img
          src={track.artworkUrl || DEFAULT_GOT_IMAGE}
          alt={track.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback artwork on broken image to Game of Thrones Direwolf
            (e.target as HTMLImageElement).src = DEFAULT_GOT_IMAGE;
          }}
        />

        {/* Overlay Badges */}
        {track.genre && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/70 backdrop-blur-xs text-white/90 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {track.genre}
          </span>
        )}

        {/* Animated Equalizer when actively playing */}
        {isThisPlaying && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex items-end gap-1 h-6">
              <span className="w-1 bg-[#1DB954] rounded-full animate-eq-1" />
              <span className="w-1 bg-[#1DB954] rounded-full animate-eq-2" />
              <span className="w-1 bg-[#1DB954] rounded-full animate-eq-3" />
              <span className="w-1 bg-[#1DB954] rounded-full animate-eq-4" />
            </div>
          </div>
        )}

        {/* Floating Green Play Button */}
        <button
          id={`card-play-btn-${track.id}`}
          onClick={handlePlayClick}
          className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl shadow-black/60 transform transition-all duration-300 hover:scale-105 active:scale-95 ${
            isThisPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
          aria-label={isThisPlaying ? 'Pause' : 'Play'}
        >
          {isThisPlaying ? (
            <Pause className="w-5 h-5 fill-black text-black" />
          ) : (
            <Play className="w-5 h-5 fill-black text-black ml-0.5" />
          )}
        </button>

        {/* Quick Actions overlay on hover (top-right) */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleLikeClick}
            className={`p-1.5 rounded-full bg-black/70 backdrop-blur-xs transition-colors ${
              track.isLiked
                ? 'text-[#1DB954] hover:text-[#1ed760]'
                : 'text-white/80 hover:text-white hover:bg-black'
            }`}
            title={track.isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
          >
            <Heart className={`w-4 h-4 ${track.isLiked ? 'fill-[#1DB954]' : ''}`} />
          </button>

          <button
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="p-1.5 rounded-full bg-black/70 backdrop-blur-xs text-white/80 hover:text-[#1DB954] hover:bg-black transition-colors"
            title="Direct MP3 Download"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce text-[#1DB954]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metadata & Prominent Download Button */}
      <div className="min-w-0 flex flex-col gap-2 mt-1">
        <div>
          <h3
            className={`font-bold text-sm truncate leading-snug ${
              isCurrentTrack ? 'text-[#1DB954]' : 'text-white group-hover:text-white'
            }`}
            title={track.title}
          >
            {track.title}
          </h3>
          <p className="text-xs text-[#a7a7a7] group-hover:text-[#b3b3b3] truncate mt-0.5">
            {track.artist}
          </p>
        </div>

        {/* PROMINENT DIRECT DOWNLOAD BUTTON */}
        <button
          onClick={handleDownloadClick}
          disabled={isDownloading}
          id={`card-download-btn-${track.id}`}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-xs font-bold tracking-wide transition-all shadow-sm ${
            isDownloading
              ? 'bg-[#1DB954]/20 border border-[#1DB954] text-[#1DB954] cursor-wait'
              : 'bg-[#1DB954]/15 hover:bg-[#1DB954] text-[#1DB954] hover:text-black border border-[#1DB954]/40 hover:border-[#1DB954] hover:shadow-md hover:shadow-[#1DB954]/20 active:scale-95'
          }`}
          title="Download 320kbps MP3 directly"
        >
          <Download className={`w-3.5 h-3.5 shrink-0 ${isDownloading ? 'animate-bounce text-[#1DB954]' : ''}`} />
          <span>{isDownloading ? 'Saving MP3...' : 'Download MP3'}</span>
        </button>
      </div>
    </div>
  );
};
