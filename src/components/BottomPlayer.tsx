import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Download,
  ListMusic,
  Maximize2,
  Loader2,
  Radio,
  Disc3,
} from 'lucide-react';
import { Track, RepeatMode } from '../types';
import { DEFAULT_GOT_IMAGE } from '../assets/gotImages';

interface BottomPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isDownloading: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onLikeToggle: (track: Track) => void;
  onDownload: (track: Track) => void;
  onToggleQueue?: () => void;
  isQueueOpen?: boolean;
}

export const BottomPlayer: React.FC<BottomPlayerProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  isDownloading,
  onTogglePlay,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onLikeToggle,
  onDownload,
  onToggleQueue,
  isQueueOpen,
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Sync seek value when not dragging
  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = Math.floor(secs % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const progressPercent = duration > 0 ? (seekValue / duration) * 100 : 0;
  const effectiveVolume = isMuted ? 0 : volume;
  const volumePercent = effectiveVolume * 100;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekValue(Number(e.target.value));
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setIsSeeking(false);
    onSeek(seekValue);
  };

  return (
    <footer
      id="bottom-music-player-bar"
      className="fixed bottom-0 left-0 right-0 z-50 h-24 bg-[#181818] border-t border-[#282828] px-3 md:px-6 py-3 flex items-center justify-between shadow-2xl select-none"
    >
      {/* 1. Left Section: Track Info & Thumbnail */}
      <div className="flex items-center gap-3 w-1/4 min-w-[160px] max-w-[320px]">
        {currentTrack ? (
          <>
            <div className="relative group shrink-0 w-14 h-14 rounded overflow-hidden bg-[#282828] shadow-md">
              <img
                src={currentTrack.artworkUrl || DEFAULT_GOT_IMAGE}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_GOT_IMAGE;
                }}
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0 overflow-hidden pr-2">
              <span
                id="player-track-title"
                className="text-sm font-semibold text-white truncate hover:underline cursor-pointer leading-tight"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </span>
              <span
                id="player-track-artist"
                className="text-xs text-[#a7a7a7] hover:text-white truncate cursor-pointer hover:underline mt-0.5"
                title={currentTrack.artist}
              >
                {currentTrack.artist}
              </span>
              <span className="text-[10px] text-[#1DB954] font-medium tracking-wide">
                HQ Audio {currentTrack.source ? `• ${currentTrack.source.toUpperCase()}` : ''}
              </span>
            </div>

            {/* Like / Favorite Button */}
            <button
              id="player-like-btn"
              onClick={() => onLikeToggle(currentTrack)}
              className={`p-1.5 rounded-full transition-transform hover:scale-110 shrink-0 ${
                currentTrack.isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
              title={currentTrack.isLiked ? 'Remove from Your Library' : 'Save to Your Library'}
              aria-label="Toggle Like"
            >
              <Heart className={`w-5 h-5 ${currentTrack.isLiked ? 'fill-[#1DB954]' : ''}`} />
            </button>

            {/* Quick Download Button next to Like */}
            <button
              id="player-quick-download-btn"
              onClick={() => currentTrack && onDownload(currentTrack)}
              disabled={isDownloading}
              className={`p-1.5 rounded-full transition-transform hover:scale-110 shrink-0 text-[#1DB954] hover:bg-[#1DB954]/20 ${
                isDownloading ? 'animate-bounce' : ''
              }`}
              title="Download this track (320kbps MP3)"
              aria-label="Download track"
            >
              <Download className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-[#777777]">
            <div className="w-14 h-14 rounded bg-[#242424] flex items-center justify-center">
              <Disc3 className="w-6 h-6 text-[#444444]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#888888]">No track selected</span>
              <span className="text-xs text-[#555555]">Pick a song to play</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Center Section: Playback Controls & Interactive Seekbar */}
      <div className="flex flex-col items-center justify-center max-w-[680px] w-2/4 px-2">
        {/* Playback Buttons */}
        <div className="flex items-center gap-3 md:gap-5 mb-1.5">
          {/* Shuffle Toggle */}
          <button
            id="player-shuffle-btn"
            onClick={onToggleShuffle}
            className={`p-1 relative transition-colors ${
              isShuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />
            )}
          </button>

          {/* Skip Previous */}
          <button
            id="player-prev-btn"
            onClick={onPrevious}
            className="text-[#b3b3b3] hover:text-white transition-colors p-1"
            title="Previous (Cmd/Ctrl + Left)"
            aria-label="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            id="player-play-pause-btn"
            onClick={onTogglePlay}
            disabled={!currentTrack}
            className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg ${
              currentTrack
                ? 'bg-white hover:bg-[#f0f0f0] text-black cursor-pointer'
                : 'bg-[#444444] text-[#888888] cursor-not-allowed'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black text-black" />
            ) : (
              <Play className="w-5 h-5 fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Skip Next */}
          <button
            id="player-next-btn"
            onClick={onNext}
            className="text-[#b3b3b3] hover:text-white transition-colors p-1"
            title="Next (Cmd/Ctrl + Right)"
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Mode Toggle */}
          <button
            id="player-repeat-btn"
            onClick={onToggleRepeat}
            className={`p-1 relative transition-colors ${
              repeatMode !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
            aria-label="Repeat mode"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1DB954]" />
            )}
          </button>
        </div>

        {/* Interactive Progress / Seekbar with Timestamps */}
        <div className="w-full flex items-center gap-2 text-xs text-[#a7a7a7] font-mono">
          <span id="player-current-time" className="w-10 text-right tabular-nums">
            {formatTime(seekValue)}
          </span>

          <div className="relative flex-1 flex items-center h-4 slider-container group">
            {/* Background Track */}
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
              {/* Green Progress Fill */}
              <div
                className="h-full bg-white group-hover:bg-[#1DB954] transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Hidden / Transparent Native Range Input for full touch and scrub precision */}
            <input
              id="player-progress-bar"
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={seekValue}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              onTouchStart={handleSeekMouseDown}
              onTouchEnd={handleSeekMouseUp}
              disabled={!currentTrack}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Audio playback seekbar"
            />
          </div>

          <span id="player-total-duration" className="w-10 text-left tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right Section: Prominent Download Track Button & Volume Controls */}
      <div className="flex items-center justify-end gap-2 md:gap-4 w-1/4 min-w-[160px]">
        {/* PROMINENT 'DOWNLOAD TRACK' BUTTON */}
        <button
          id="player-download-track-btn"
          onClick={() => currentTrack && onDownload(currentTrack)}
          disabled={!currentTrack || isDownloading}
          className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-extrabold text-xs tracking-wide transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95 shrink-0 ${
            !currentTrack
              ? 'bg-[#282828] text-[#777777] cursor-not-allowed border border-[#383838]'
              : isDownloading
              ? 'bg-[#1DB954]/20 border border-[#1DB954] text-[#1DB954] cursor-wait ring-1 ring-[#1DB954]'
              : 'bg-[#1DB954] hover:bg-[#1ed760] text-black shadow-[#1DB954]/30 ring-1 ring-white/30'
          }`}
          title="Direct MP3 Download (Saves HQ 320kbps MP3 directly to your device)"
          aria-label="Download Track"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span className="font-bold">Saving...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span className="font-extrabold hidden xs:inline sm:inline">Download MP3</span>
              <span className="font-extrabold xs:hidden sm:hidden">MP3</span>
            </>
          )}
        </button>

        {/* Queue Drawer Toggle */}
        {onToggleQueue && (
          <button
            id="player-queue-btn"
            onClick={onToggleQueue}
            className={`p-2 rounded-full transition-colors ${
              isQueueOpen ? 'text-[#1DB954] bg-[#282828]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title="Playing Queue"
            aria-label="Toggle queue"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        )}

        {/* Volume Control */}
        <div className="hidden sm:flex items-center gap-2 w-28 group">
          <button
            id="player-mute-toggle-btn"
            onClick={onToggleMute}
            className="text-[#b3b3b3] hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Toggle mute"
          >
            {effectiveVolume === 0 ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : effectiveVolume < 0.5 ? (
              <Volume1 className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <div className="relative flex-1 flex items-center h-4 slider-container">
            {/* Background Track */}
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden">
              <div
                className="h-full bg-white group-hover:bg-[#1DB954] transition-colors"
                style={{ width: `${volumePercent}%` }}
              />
            </div>

            <input
              id="player-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={effectiveVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Volume slider"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
