import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Sidebar,
} from './components/Sidebar';
import {
  Navbar,
} from './components/Navbar';
import {
  TrackCard,
} from './components/TrackCard';
import {
  TrackRow,
} from './components/TrackRow';
import {
  BottomPlayer,
} from './components/BottomPlayer';
import {
  QueueDrawer,
} from './components/QueueDrawer';
import {
  Toast,
} from './components/Toast';
import {
  Track,
  Playlist,
  NavTab,
  RepeatMode,
  ToastMessage,
} from './types';
import {
  CURATED_TRACKS,
  CURATED_PLAYLISTS,
  fetchTrendingTracks,
  searchMusic,
  downloadTrackAudio,
} from './services/musicService';
import {
  DEFAULT_GOT_IMAGE,
  gotDirewolf,
  gotIronThrone,
  gotFireIce,
  gotIceFire,
  gotWolfBanner,
} from './assets/gotImages';
import {
  Play,
  Pause,
  Shuffle,
  Heart,
  Download,
  Clock,
  Music,
  Compass,
  Sparkles,
  Flame,
  Radio,
  Library,
  Layers,
  ArrowRight,
} from 'lucide-react';

const LOCAL_STORAGE_LIKES_KEY = 'thrones_music_liked_ids';
const LOCAL_STORAGE_VOL_KEY = 'thrones_music_volume';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [historyStack, setHistoryStack] = useState<string[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Music Catalog State
  const [trendingTracks, setTrendingTracks] = useState<Track[]>(CURATED_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(CURATED_PLAYLISTS);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LIKES_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Audio Player State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const savedVol = localStorage.getItem(LOCAL_STORAGE_VOL_KEY);
      return savedVol !== null ? Number(savedVol) : 0.8;
    } catch {
      return 0.8;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // HTML5 Audio Reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to trigger toast
  const addToast = useCallback((title: string, description?: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize HTML5 Audio Element & Event Listeners
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    const onError = (e: Event) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
      addToast(
        'Audio Stream Error',
        'Could not load audio stream. Moving to next track...',
        'warning'
      );
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, [addToast]);

  // Load Initial Trending Tracks from Audius API
  useEffect(() => {
    let isMounted = true;
    fetchTrendingTracks(24).then((tracks) => {
      if (isMounted && tracks.length > 0) {
        setTrendingTracks(tracks);
        // Default first track to queue if none loaded
        setQueue(tracks.slice(1, 15));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Trigger search on query change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isCurrent = true;
    setIsSearching(true);
    if (activeTab !== 'search') {
      setActiveTab('search');
    }

    searchMusic(debouncedQuery)
      .then((results) => {
        if (isCurrent) {
          setSearchResults(results);
          setIsSearching(false);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          console.error('Search failed:', err);
          setIsSearching(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery, activeTab]);

  // Persist Liked Tracks in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_LIKES_KEY,
        JSON.stringify(Array.from(likedTrackIds))
      );
    } catch (e) {
      console.warn('Failed to save liked tracks to localStorage:', e);
    }
  }, [likedTrackIds]);

  // Persist Volume
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_VOL_KEY, String(volume));
    } catch (e) {
      console.warn('Failed to save volume to localStorage:', e);
    }
  }, [volume]);

  // Track isLiked mapper
  const withLikedStatus = useCallback(
    (track: Track): Track => {
      return {
        ...track,
        isLiked: likedTrackIds.has(track.id),
      };
    },
    [likedTrackIds]
  );

  // All known tracks combined for quick lookup
  const allTracks = useMemo(() => {
    const map = new Map<string, Track>();
    CURATED_TRACKS.forEach((t) => map.set(t.id, t));
    trendingTracks.forEach((t) => map.set(t.id, t));
    searchResults.forEach((t) => map.set(t.id, t));
    return map;
  }, [trendingTracks, searchResults]);

  // Liked Tracks list
  const likedTracks = useMemo(() => {
    const list: Track[] = [];
    likedTrackIds.forEach((id) => {
      const found = allTracks.get(id);
      if (found) {
        list.push(withLikedStatus(found));
      }
    });
    return list;
  }, [likedTrackIds, allTracks, withLikedStatus]);

  // Liked status toggle handler
  const handleLikeToggle = useCallback(
    (track: Track) => {
      setLikedTrackIds((prev) => {
        const next = new Set(prev);
        if (next.has(track.id)) {
          next.delete(track.id);
          addToast('Removed from Your Library', track.title, 'info');
        } else {
          next.add(track.id);
          addToast('Saved to Your Library', track.title, 'success');
        }
        return next;
      });
    },
    [addToast]
  );

  // Play a specific track
  const handlePlayTrack = useCallback(
    (track: Track, newQueue?: Track[]) => {
      const audio = audioRef.current;
      if (!audio) return;

      const trackWithStatus = withLikedStatus(track);
      setCurrentTrack(trackWithStatus);
      setDuration(track.duration || 0);
      setCurrentTime(0);

      // Load new source
      audio.src = track.streamUrl;
      audio.load();

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Auto-play blocked or stream load error:', err);
          setIsPlaying(false);
        });

      if (newQueue && newQueue.length > 0) {
        // Exclude the current track from upcoming queue
        const upcoming = newQueue.filter((t) => t.id !== track.id);
        setQueue(upcoming);
      }
    },
    [withLikedStatus]
  );

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack && trendingTracks.length > 0) {
      handlePlayTrack(trendingTracks[0], trendingTracks);
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.warn('Play error:', err));
    }
  }, [currentTrack, isPlaying, trendingTracks, handlePlayTrack]);

  // Next Track Logic
  const handleNext = useCallback(() => {
    if (queue.length > 0) {
      let nextTrack: Track;
      let remainingQueue: Track[];

      if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * queue.length);
        nextTrack = queue[randomIndex];
        remainingQueue = queue.filter((_, i) => i !== randomIndex);
      } else {
        nextTrack = queue[0];
        remainingQueue = queue.slice(1);
      }

      handlePlayTrack(nextTrack);
      setQueue(remainingQueue);
    } else if (trendingTracks.length > 0) {
      // Fallback loop through trending tracks
      const currentIndex = trendingTracks.findIndex((t) => t.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % trendingTracks.length;
      handlePlayTrack(trendingTracks[nextIndex], trendingTracks);
    }
  }, [queue, isShuffle, handlePlayTrack, trendingTracks, currentTrack]);

  // Previous Track Logic
  const handlePrevious = useCallback(() => {
    const audio = audioRef.current;
    // If audio is played > 3 seconds, restart current track
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (trendingTracks.length > 0) {
      const currentIndex = trendingTracks.findIndex((t) => t.id === currentTrack?.id);
      const prevIndex = (currentIndex - 1 + trendingTracks.length) % trendingTracks.length;
      handlePlayTrack(trendingTracks[prevIndex], trendingTracks);
    }
  }, [currentTrack, trendingTracks, handlePlayTrack]);

  // Automatic transition when track ends (Seamless next song)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch((err) => console.warn('Repeat play error:', err));
      } else {
        handleNext();
      }
    };

    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeatMode, handleNext]);

  // Seekbar scrubbing
  const handleSeek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && !isNaN(time)) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Volume change
  const handleVolumeChange = useCallback((newVol: number) => {
    const audio = audioRef.current;
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audio) {
      audio.volume = newVol;
      audio.muted = newVol === 0;
    }
  }, []);

  // Mute toggle
  const handleToggleMute = useCallback(() => {
    const audio = audioRef.current;
    setIsMuted((prev) => {
      const nextMute = !prev;
      if (audio) {
        audio.muted = nextMute;
      }
      return nextMute;
    });
  }, []);

  // Repeat toggle: off -> all -> one
  const handleToggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  // Shuffle toggle
  const handleToggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  // Direct MP3 Download function
  const handleDownloadTrack = useCallback(
    async (track: Track) => {
      if (downloadingTrackId) return;

      setDownloadingTrackId(track.id);
      addToast(
        'Downloading Track...',
        `Fetching MP3 stream for "${track.title}"`,
        'info'
      );

      try {
        await downloadTrackAudio(track, (pct) => {
          // Progress feedback could be logged or visually reported
        });
        addToast(
          'Download Complete!',
          `"${track.title} - ${track.artist}.mp3" saved to your downloads.`,
          'success'
        );
      } catch (err) {
        console.error('Download error:', err);
        addToast(
          'Download Started',
          `Direct download initiated for "${track.title}"`,
          'info'
        );
      } finally {
        setDownloadingTrackId(null);
      }
    },
    [downloadingTrackId, addToast]
  );

  // Keyboard Shortcuts (Space for Play/Pause, Arrow keys, M for mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement;

      if (isInput) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handlePrevious();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, handleNext, handlePrevious, handleToggleMute]);

  // Category selection handler
  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    if (category === 'All' || category === 'Music') {
      setSearchQuery('');
    } else {
      setSearchQuery(category);
      if (activeTab !== 'search') {
        setActiveTab('search');
        setHistoryStack((prev) => [...prev.slice(0, historyIndex + 1), 'search']);
        setHistoryIndex((prev) => prev + 1);
      }
    }
  }, [activeTab, historyIndex]);

  // Tab navigation & history management
  const navigateToTab = useCallback((tab: NavTab) => {
    setActiveTab(tab);
    setSelectedPlaylist(null);
    setHistoryStack((prev) => [...prev.slice(0, historyIndex + 1), tab]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleSelectPlaylist = useCallback((playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setActiveTab('playlist');
    setHistoryStack((prev) => [...prev.slice(0, historyIndex + 1), `playlist-${playlist.id}`]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleNavigateBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      const target = historyStack[historyIndex - 1];
      if (target.startsWith('playlist-')) {
        const id = target.replace('playlist-', '');
        const pl = playlists.find((p) => p.id === id);
        if (pl) {
          setSelectedPlaylist(pl);
          setActiveTab('playlist');
        }
      } else {
        setSelectedPlaylist(null);
        setActiveTab(target as NavTab);
      }
    }
  }, [historyIndex, historyStack, playlists]);

  const handleNavigateForward = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      const target = historyStack[historyIndex + 1];
      if (target.startsWith('playlist-')) {
        const id = target.replace('playlist-', '');
        const pl = playlists.find((p) => p.id === id);
        if (pl) {
          setSelectedPlaylist(pl);
          setActiveTab('playlist');
        }
      } else {
        setSelectedPlaylist(null);
        setActiveTab(target as NavTab);
      }
    }
  }, [historyIndex, historyStack, playlists]);

  // Greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filtered tracks for category chips
  const displayTrending = useMemo(() => {
    if (selectedCategory === 'All' || selectedCategory === 'Music' || selectedCategory === 'Trending') {
      return trendingTracks;
    }
    return trendingTracks.filter(
      (t) =>
        t.genre?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        t.title.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [trendingTracks, selectedCategory]);

  return (
    <div className="flex h-screen w-full bg-[#000000] text-white overflow-hidden select-none font-sans">
      {/* 1. Thrones Sidebar (Left) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={navigateToTab}
        playlists={playlists}
        selectedPlaylistId={selectedPlaylist?.id || null}
        onSelectPlaylist={handleSelectPlaylist}
        likedTracksCount={likedTrackIds.size}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#121212] md:my-2 md:mr-2 md:rounded-lg relative">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearching={isSearching}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateBack={handleNavigateBack}
          onNavigateForward={handleNavigateForward}
          canNavigateBack={historyIndex > 0}
          canNavigateForward={historyIndex < historyStack.length - 1}
        />

        {/* Scrollable Main Views */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 pt-4">
          {/* VIEW 1: HOME TAB */}
          {activeTab === 'home' && !selectedPlaylist && (
            <div className="space-y-8 animate-fadeIn">
              {/* Greeting & Quick Play Bento Grid (6 cards) */}
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4 flex items-center gap-2">
                  <span>{greeting}</span>
                  <Sparkles className="w-5 h-5 text-[#1DB954]" />
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trendingTracks.slice(0, 6).map((track) => {
                    const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                    return (
                      <div
                        key={`quick-${track.id}`}
                        onClick={() => handlePlayTrack(track, trendingTracks)}
                        className="group flex items-center bg-[#282828]/60 hover:bg-[#383838] rounded-md overflow-hidden cursor-pointer transition-all duration-200 pr-4 shadow-sm"
                      >
                        <img
                          src={track.artworkUrl || DEFAULT_GOT_IMAGE}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover shrink-0 shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_GOT_IMAGE;
                          }}
                        />
                        <div className="flex-1 px-3 min-w-0">
                          <span className="font-bold text-sm text-white truncate block">
                            {track.title}
                          </span>
                          <span className="text-xs text-[#a7a7a7] truncate block">
                            {track.artist}
                          </span>
                        </div>

                        {/* Action Buttons (Download + Play) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadTrack(track);
                            }}
                            disabled={downloadingTrackId === track.id}
                            className="p-1.5 rounded-full bg-[#1e1e1e] hover:bg-[#1DB954] text-white/80 hover:text-black border border-white/10 transition-all shadow-xs"
                            title="Download MP3"
                          >
                            <Download className={`w-3.5 h-3.5 ${downloadingTrackId === track.id ? 'animate-bounce text-[#1DB954]' : ''}`} />
                          </button>

                          {/* Hover Play Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentTrack?.id === track.id) handleTogglePlay();
                              else handlePlayTrack(track, trendingTracks);
                            }}
                            className={`w-9 h-9 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-lg transform transition-all duration-200 hover:scale-105 ${
                              isThisPlaying
                                ? 'opacity-100 scale-100'
                                : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
                            }`}
                          >
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 fill-black" />
                            ) : (
                              <Play className="w-4 h-4 fill-black ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Trending Songs Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-[#1DB954]" />
                      <span>Trending Songs Right Now</span>
                    </h2>
                    <p className="text-xs text-[#a7a7a7] mt-0.5">
                      Streamed live from JioSaavn, Bollywood charts, Punjabi hits, and Audius.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (trendingTracks.length > 0) {
                        handlePlayTrack(trendingTracks[0], trendingTracks);
                      }
                    }}
                    className="text-xs font-semibold text-[#b3b3b3] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>Play All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {displayTrending.slice(0, 12).map((track) => (
                    <TrackCard
                      key={track.id}
                      track={withLikedStatus(track)}
                      isPlaying={isPlaying}
                      isCurrentTrack={currentTrack?.id === track.id}
                      onPlay={(t) => handlePlayTrack(t, trendingTracks)}
                      onTogglePlay={handleTogglePlay}
                      onLikeToggle={handleLikeToggle}
                      onDownload={handleDownloadTrack}
                      isDownloading={downloadingTrackId === track.id}
                    />
                  ))}
                </div>
              </div>

              {/* Section 3: Featured Playlists */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#1DB954]" />
                  <span>Featured Playlists</span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => handleSelectPlaylist(pl)}
                      className="group p-3.5 rounded-md bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-lg"
                    >
                      <div className="relative aspect-square w-full mb-3 rounded overflow-hidden shadow-md">
                        <img
                          src={pl.coverUrl || gotIronThrone}
                          alt={pl.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = gotIronThrone;
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (pl.tracks.length > 0) {
                              handlePlayTrack(pl.tracks[0], pl.tracks);
                            }
                          }}
                          className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                          aria-label="Play playlist"
                        >
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white truncate">{pl.title}</h3>
                        <p className="text-xs text-[#a7a7a7] line-clamp-2 mt-1 leading-snug">
                          {pl.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Ranked Top Tracks Table View */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Music className="w-5 h-5 text-[#1DB954]" />
                    <span>Popular Hits Chart</span>
                  </h2>
                  <span className="text-xs text-[#888888]">Ranked by weekly streams</span>
                </div>

                <div className="bg-[#181818]/60 rounded-lg p-2 border border-[#282828]/40">
                  <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#a7a7a7] border-b border-[#282828]">
                    <div className="col-span-1">#</div>
                    <div className="col-span-6 md:col-span-5">Title</div>
                    <div className="hidden md:block md:col-span-3">Album / Genre</div>
                    <div className="col-span-3 md:col-span-2 text-right pr-3">Actions</div>
                    <div className="col-span-2 md:col-span-1 text-right flex items-center justify-end">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="divide-y divide-[#282828]/20 mt-1">
                    {trendingTracks.slice(0, 10).map((track, idx) => (
                      <TrackRow
                        key={`chart-${track.id}`}
                        track={withLikedStatus(track)}
                        index={idx}
                        isPlaying={isPlaying}
                        isCurrentTrack={currentTrack?.id === track.id}
                        onPlay={(t) => handlePlayTrack(t, trendingTracks)}
                        onTogglePlay={handleTogglePlay}
                        onLikeToggle={handleLikeToggle}
                        onDownload={handleDownloadTrack}
                        isDownloading={downloadingTrackId === track.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: SEARCH TAB */}
          {activeTab === 'search' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Search Music</h1>
                <p className="text-xs text-[#a7a7a7]">
                  Instant search across millions of songs via JioSaavn, Bollywood, Punjabi, and Global catalogs.
                </p>
              </div>

              {/* Active Search Results */}
              {debouncedQuery.trim() ? (
                <div>
                  {isSearching ? (
                    <div className="py-20 flex flex-col items-center justify-center text-[#a7a7a7] gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-[#1DB954] border-t-transparent animate-spin" />
                      <p className="text-sm">Searching songs, artists, and audio streams...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-20 text-center text-[#a7a7a7] space-y-2">
                      <p className="text-lg font-bold text-white">No results found for "{debouncedQuery}"</p>
                      <p className="text-xs">Please check spelling or search by genre (e.g. "lofi", "rock", "chill", "house")</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Top Result + Top Songs */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Top Result Card */}
                        <div className="lg:col-span-5">
                          <h2 className="text-lg font-bold text-white mb-3">Top Result</h2>
                          {searchResults[0] && (
                            <div
                              onClick={() => handlePlayTrack(searchResults[0], searchResults)}
                              className="group p-5 rounded-lg bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all duration-300 relative shadow-xl"
                            >
                              <img
                                src={searchResults[0].artworkUrl}
                                alt={searchResults[0].title}
                                className="w-24 h-24 rounded-md object-cover mb-4 shadow-lg"
                              />
                              <h3 className="text-2xl font-bold text-white mb-1 leading-snug">
                                {searchResults[0].title}
                              </h3>
                              <p className="text-sm text-[#a7a7a7] mb-3">
                                {searchResults[0].artist} • <span className="text-[#1DB954]">{searchResults[0].genre || 'Track'}</span>
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs bg-black/40 text-white px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                                  Song
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadTrack(searchResults[0]);
                                  }}
                                  className="text-xs text-[#a7a7a7] hover:text-[#1DB954] flex items-center gap-1 transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download MP3</span>
                                </button>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (currentTrack?.id === searchResults[0].id) handleTogglePlay();
                                  else handlePlayTrack(searchResults[0], searchResults);
                                }}
                                className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                              >
                                {currentTrack?.id === searchResults[0].id && isPlaying ? (
                                  <Pause className="w-5 h-5 fill-black" />
                                ) : (
                                  <Play className="w-5 h-5 fill-black ml-0.5" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Top 4 Matching Tracks List */}
                        <div className="lg:col-span-7">
                          <h2 className="text-lg font-bold text-white mb-3">Songs</h2>
                          <div className="space-y-1">
                            {searchResults.slice(0, 5).map((track, idx) => (
                              <TrackRow
                                key={`search-top-${track.id}`}
                                track={withLikedStatus(track)}
                                index={idx}
                                isPlaying={isPlaying}
                                isCurrentTrack={currentTrack?.id === track.id}
                                onPlay={(t) => handlePlayTrack(t, searchResults)}
                                onTogglePlay={handleTogglePlay}
                                onLikeToggle={handleLikeToggle}
                                onDownload={handleDownloadTrack}
                                isDownloading={downloadingTrackId === track.id}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* All Search Results Grid */}
                      <div>
                        <h2 className="text-lg font-bold text-white mb-3">More Matches</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {searchResults.slice(5).map((track) => (
                            <TrackCard
                              key={track.id}
                              track={withLikedStatus(track)}
                              isPlaying={isPlaying}
                              isCurrentTrack={currentTrack?.id === track.id}
                              onPlay={(t) => handlePlayTrack(t, searchResults)}
                              onTogglePlay={handleTogglePlay}
                              onLikeToggle={handleLikeToggle}
                              onDownload={handleDownloadTrack}
                              isDownloading={downloadingTrackId === track.id}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Browse Genre Cards */
                <div>
                  <h2 className="text-lg font-bold text-white mb-4">Browse All Genres</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[
                      { name: 'House Stark (Direwolf)', query: 'game of thrones stark', color: 'from-[#1e3a5f] to-[#0d1b2a]' },
                      { name: 'Iron Throne & Fire', query: 'game of thrones', color: 'from-[#800e13] to-[#38040e]' },
                      { name: 'Song of Ice and Fire', query: 'ice and fire', color: 'from-[#0077b6] to-[#03045e]' },
                      { name: 'Bollywood Hits', query: 'bollywood', color: 'from-[#e13300] to-[#ff5500]' },
                      { name: 'Punjabi Hits', query: 'punjabi', color: 'from-[#bc5900] to-[#e66800]' },
                      { name: 'Arijit Singh', query: 'arijit singh', color: 'from-[#450af5] to-[#8e8ee5]' },
                      { name: 'Trending Hindi', query: 'trending hindi', color: 'from-[#006450] to-[#14833b]' },
                      { name: 'Romantic Songs', query: 'romantic hindi', color: 'from-[#e91429] to-[#b32346]' },
                      { name: 'Lo-Fi Beats', query: 'lofi', color: 'from-[#8c1932] to-[#b32346]' },
                      { name: 'Electronic & House', query: 'electronic', color: 'from-[#1e3264] to-[#283ea3]' },
                    ].map((genre) => (
                      <div
                        key={genre.name}
                        onClick={() => setSearchQuery(genre.query)}
                        className={`aspect-video rounded-lg p-4 bg-gradient-to-br ${genre.color} relative overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-transform`}
                      >
                        <span className="text-base md:text-lg font-bold text-white block leading-tight">
                          {genre.name}
                        </span>
                        <Music className="w-12 h-12 text-white/20 absolute -bottom-2 -right-2 rotate-12" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: YOUR LIBRARY TAB */}
          {activeTab === 'library' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white">Your Library</h1>
                  <p className="text-xs text-[#a7a7a7] mt-0.5">
                    Your liked songs, saved playlists, and downloaded tracks in one place.
                  </p>
                </div>
              </div>

              {/* Quick Hero Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Liked Songs Hero Card */}
                <div
                  onClick={() => navigateToTab('liked')}
                  className="p-6 rounded-lg bg-gradient-to-br from-[#450af5] to-[#8e8ee5] cursor-pointer hover:shadow-2xl transition-all relative overflow-hidden group"
                >
                  <div className="space-y-2">
                    <Heart className="w-8 h-8 text-white fill-white" />
                    <h2 className="text-2xl font-black text-white">Liked Songs</h2>
                    <p className="text-xs text-white/80">
                      {likedTracks.length} saved {likedTracks.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (likedTracks.length > 0) {
                        handlePlayTrack(likedTracks[0], likedTracks);
                      }
                    }}
                    className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#1DB954] text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </button>
                </div>

                {/* Direct MP3 Downloads card */}
                <div
                  onClick={() => {
                    addToast(
                      'Direct MP3 Downloads',
                      'Click any Download button on songs or the bottom player bar to export MP3 files!',
                      'info'
                    );
                  }}
                  className="p-6 rounded-lg bg-gradient-to-br from-[#125325] to-[#1DB954] cursor-pointer hover:shadow-2xl transition-all relative overflow-hidden group"
                >
                  <div className="space-y-2">
                    <Download className="w-8 h-8 text-white" />
                    <h2 className="text-2xl font-black text-white">Offline MP3s</h2>
                    <p className="text-xs text-white/90">
                      Zero redirects, clean browser Blob downloads.
                    </p>
                  </div>
                </div>

                {/* Audius Open Source Streaming */}
                <div className="p-6 rounded-lg bg-gradient-to-br from-[#2b2b2b] to-[#1a1a1a] border border-[#383838] relative overflow-hidden">
                  <div className="space-y-2">
                    <Radio className="w-8 h-8 text-[#1DB954]" />
                    <h2 className="text-2xl font-black text-white">Public API</h2>
                    <p className="text-xs text-[#a7a7a7]">
                      Stream unlimited unrestricted tracks without API keys.
                    </p>
                  </div>
                </div>
              </div>

              {/* Playlists in Library */}
              <div>
                <h2 className="text-lg font-bold text-white mb-3">Your Playlists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => handleSelectPlaylist(pl)}
                      className="group p-3.5 rounded-md bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="relative aspect-square w-full mb-3 rounded overflow-hidden">
                        <img
                          src={pl.coverUrl || gotFireIce}
                          alt={pl.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = gotFireIce;
                          }}
                        />
                      </div>
                      <h3 className="font-bold text-sm text-white truncate">{pl.title}</h3>
                      <p className="text-xs text-[#a7a7a7] mt-1">{pl.tracks.length} tracks</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: LIKED SONGS VIEW */}
          {activeTab === 'liked' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Liked Songs Hero Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 rounded-lg bg-gradient-to-b from-[#2a1738] to-[#121212] border border-[#3e1f57]/40 shadow-2xl">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded shadow-2xl relative overflow-hidden shrink-0 border border-white/10 group">
                  <img
                    src={gotDirewolf}
                    alt="Game of Thrones Direwolf"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/15">
                      <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                      <span>Favorites</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                    Playlist
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    Liked Songs
                  </h1>
                  <p className="text-xs sm:text-sm text-[#d4d4d4] flex items-center gap-2">
                    <span className="font-semibold text-white">Music Lover</span>
                    <span>•</span>
                    <span>{likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}</span>
                  </p>
                </div>
              </div>

              {/* Controls Header (Big Play Button) */}
              <div className="flex items-center gap-4 py-2">
                <button
                  id="liked-play-all-btn"
                  onClick={() => {
                    if (likedTracks.length > 0) {
                      handlePlayTrack(likedTracks[0], likedTracks);
                    } else {
                      addToast('No Liked Songs', 'Heart any song from Home or Search to add it here!', 'info');
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                  aria-label="Play all liked songs"
                >
                  <Play className="w-6 h-6 fill-black ml-1" />
                </button>
              </div>

              {/* Liked Songs Table */}
              {likedTracks.length === 0 ? (
                <div className="py-20 text-center text-[#a7a7a7] space-y-3">
                  <Heart className="w-12 h-12 text-[#333333] mx-auto" />
                  <p className="text-lg font-bold text-white">Songs you like will appear here</p>
                  <p className="text-xs">Save songs by tapping the heart icon anywhere in the player.</p>
                  <button
                    onClick={() => navigateToTab('home')}
                    className="px-6 py-2 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition-transform"
                  >
                    Find songs
                  </button>
                </div>
              ) : (
                <div className="bg-[#181818]/60 rounded-lg p-2 border border-[#282828]/40">
                  <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#a7a7a7] border-b border-[#282828]">
                    <div className="col-span-1">#</div>
                    <div className="col-span-6 md:col-span-5">Title</div>
                    <div className="hidden md:block md:col-span-3">Album / Genre</div>
                    <div className="col-span-3 md:col-span-2 text-right pr-3">Actions</div>
                    <div className="col-span-2 md:col-span-1 text-right flex items-center justify-end">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="divide-y divide-[#282828]/20 mt-1">
                    {likedTracks.map((track, idx) => (
                      <TrackRow
                        key={`liked-${track.id}`}
                        track={track}
                        index={idx}
                        isPlaying={isPlaying}
                        isCurrentTrack={currentTrack?.id === track.id}
                        onPlay={(t) => handlePlayTrack(t, likedTracks)}
                        onTogglePlay={handleTogglePlay}
                        onLikeToggle={handleLikeToggle}
                        onDownload={handleDownloadTrack}
                        isDownloading={downloadingTrackId === track.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: SELECTED PLAYLIST DETAIL VIEW */}
          {activeTab === 'playlist' && selectedPlaylist && (
            <div className="space-y-6 animate-fadeIn">
              {/* Playlist Hero Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 p-6 rounded-lg bg-gradient-to-b from-[#381d2a] to-[#121212] border border-[#4a2638]/40 shadow-2xl">
                <img
                  src={selectedPlaylist.coverUrl || gotIronThrone}
                  alt={selectedPlaylist.title}
                  referrerPolicy="no-referrer"
                  className="w-40 h-40 sm:w-48 sm:h-48 rounded shadow-2xl object-cover shrink-0 border border-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = gotIronThrone;
                  }}
                />
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                    Playlist
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                    {selectedPlaylist.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#b3b3b3]">{selectedPlaylist.description}</p>
                  <p className="text-xs text-[#d4d4d4] flex items-center gap-2 mt-1">
                    <span className="font-semibold text-white">Thrones Curated</span>
                    <span>•</span>
                    <span>{selectedPlaylist.tracks.length} tracks</span>
                  </p>
                </div>
              </div>

              {/* Playlist Action Bar */}
              <div className="flex items-center gap-4 py-2">
                <button
                  id="playlist-play-all-btn"
                  onClick={() => {
                    if (selectedPlaylist.tracks.length > 0) {
                      handlePlayTrack(selectedPlaylist.tracks[0], selectedPlaylist.tracks);
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                  aria-label="Play playlist"
                >
                  <Play className="w-6 h-6 fill-black ml-1" />
                </button>
              </div>

              {/* Track list Table */}
              <div className="bg-[#181818]/60 rounded-lg p-2 border border-[#282828]/40">
                <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#a7a7a7] border-b border-[#282828]">
                  <div className="col-span-1">#</div>
                  <div className="col-span-6 md:col-span-5">Title</div>
                  <div className="hidden md:block md:col-span-3">Album / Genre</div>
                  <div className="col-span-3 md:col-span-2 text-right pr-3">Actions</div>
                  <div className="col-span-2 md:col-span-1 text-right flex items-center justify-end">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="divide-y divide-[#282828]/20 mt-1">
                  {selectedPlaylist.tracks.map((track, idx) => (
                    <TrackRow
                      key={`pl-track-${track.id}`}
                      track={withLikedStatus(track)}
                      index={idx}
                      isPlaying={isPlaying}
                      isCurrentTrack={currentTrack?.id === track.id}
                      onPlay={(t) => handlePlayTrack(t, selectedPlaylist.tracks)}
                      onTogglePlay={handleTogglePlay}
                      onLikeToggle={handleLikeToggle}
                      onDownload={handleDownloadTrack}
                      isDownloading={downloadingTrackId === track.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. Sticky Bottom Music Player Control Bar */}
      <BottomPlayer
        currentTrack={currentTrack ? withLikedStatus(currentTrack) : null}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        isDownloading={downloadingTrackId !== null}
        onTogglePlay={handleTogglePlay}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onLikeToggle={handleLikeToggle}
        onDownload={handleDownloadTrack}
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
        isQueueOpen={isQueueOpen}
      />

      {/* 4. Queue Slide-over Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentTrack={currentTrack}
        queue={queue}
        isPlaying={isPlaying}
        onPlayTrack={(t) => handlePlayTrack(t)}
        onRemoveFromQueue={(id) => setQueue((prev) => prev.filter((t) => t.id !== id))}
        onClearQueue={() => setQueue([])}
      />

      {/* 5. Thrones Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
