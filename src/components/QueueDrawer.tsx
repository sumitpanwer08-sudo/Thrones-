import React from 'react';
import { X, Play, Pause, Trash2, ListMusic } from 'lucide-react';
import { Track } from '../types';
import { DEFAULT_GOT_IMAGE } from '../assets/gotImages';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (trackId: string) => void;
  onClearQueue: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  currentTrack,
  queue,
  isPlaying,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 bottom-24 right-0 z-30 w-80 sm:w-96 bg-[#121212]/95 backdrop-blur-xl border-l border-[#282828] p-4 flex flex-col shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <ListMusic className="w-5 h-5 text-[#1DB954]" />
          <span>Play Queue</span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="text-xs text-[#a7a7a7] hover:text-red-400 p-1 flex items-center gap-1 transition-colors"
              title="Clear queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#a7a7a7] hover:text-white transition-colors"
            aria-label="Close queue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        {/* Now Playing Section */}
        {currentTrack && (
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#a7a7a7] block mb-2">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2 bg-[#222222] border border-[#1DB954]/30 rounded-md">
              <img
                src={currentTrack.artworkUrl || DEFAULT_GOT_IMAGE}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded object-cover shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DEFAULT_GOT_IMAGE;
                }}
              />
              <div className="flex flex-col overflow-hidden min-w-0 flex-1">
                <span className="text-sm font-semibold text-[#1DB954] truncate">
                  {currentTrack.title}
                </span>
                <span className="text-xs text-[#a7a7a7] truncate">
                  {currentTrack.artist}
                </span>
              </div>
              <span className="text-xs text-[#1DB954] font-medium shrink-0 px-2 py-0.5 rounded bg-[#1DB954]/10">
                Playing
              </span>
            </div>
          </div>
        )}

        {/* Up Next Section */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#a7a7a7] block mb-2">
            Next In Queue ({queue.length})
          </span>

          {queue.length === 0 ? (
            <p className="text-xs text-[#777777] italic py-4 text-center">
              No tracks in queue. Play songs from Home or Search!
            </p>
          ) : (
            <div className="space-y-1">
              {queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  className="group flex items-center justify-between gap-2 p-2 hover:bg-[#1f1f1f] rounded-md transition-colors"
                >
                  <div
                    onClick={() => onPlayTrack(track)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-xs font-mono text-[#777777] w-4">{idx + 1}</span>
                    <img
                      src={track.artworkUrl || DEFAULT_GOT_IMAGE}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded object-cover shrink-0 bg-[#282828]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_GOT_IMAGE;
                      }}
                    />
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <span className="text-xs font-semibold text-white truncate group-hover:text-[#1DB954]">
                        {track.title}
                      </span>
                      <span className="text-[11px] text-[#a7a7a7] truncate">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveFromQueue(track.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#888888] hover:text-red-400 transition-opacity"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
