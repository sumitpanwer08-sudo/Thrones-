import React from 'react';
import { Home, Search, Library, Heart, Disc3, Music2, Radio, Sparkles, FolderDown } from 'lucide-react';
import { NavTab, Playlist } from '../types';
import { DEFAULT_GOT_IMAGE, gotDirewolf, gotIronThrone } from '../assets/gotImages';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  likedTracksCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  playlists,
  selectedPlaylistId,
  onSelectPlaylist,
  likedTracksCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-24 left-0 z-40 w-64 bg-[#000000] p-3 flex flex-col gap-2 transition-transform duration-300 md:static md:translate-x-0 md:h-full shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Box */}
        <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-5">
          {/* Thrones Brand Logo */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-lg overflow-hidden relative border border-amber-500/50 shadow-md shadow-amber-500/20 bg-black flex items-center justify-center shrink-0">
              <img
                src={gotIronThrone}
                alt="Thrones"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-serif">
                  THRONES
                </span>
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded uppercase tracking-wider">
                  HQ
                </span>
              </div>
              <span className="text-[10px] text-[#888888] font-medium tracking-wide">
                Music & Downloader
              </span>
            </div>
          </div>

          {/* Primary Nav Links */}
          <nav className="flex flex-col gap-1">
            <button
              id="nav-home-btn"
              onClick={() => {
                onTabChange('home');
                onCloseMobile();
              }}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 ${
                activeTab === 'home' && !selectedPlaylistId
                  ? 'text-white bg-[#282828]'
                  : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Home className={`w-6 h-6 ${activeTab === 'home' && !selectedPlaylistId ? 'text-[#1DB954]' : ''}`} />
              <span>Home</span>
            </button>

            <button
              id="nav-search-btn"
              onClick={() => {
                onTabChange('search');
                onCloseMobile();
              }}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 ${
                activeTab === 'search'
                  ? 'text-white bg-[#282828]'
                  : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Search className={`w-6 h-6 ${activeTab === 'search' ? 'text-[#1DB954]' : ''}`} />
              <span>Search</span>
            </button>

            <button
              id="nav-library-btn"
              onClick={() => {
                onTabChange('library');
                onCloseMobile();
              }}
              className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 ${
                activeTab === 'library'
                  ? 'text-white bg-[#282828]'
                  : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Library className={`w-6 h-6 ${activeTab === 'library' ? 'text-[#1DB954]' : ''}`} />
              <span>Your Library</span>
            </button>
          </nav>
        </div>

        {/* Library & Playlists Section */}
        <div className="bg-[#121212] rounded-lg p-3 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-2 py-2 mb-2 text-[#b3b3b3]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1DB954]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#a7a7a7]">Playlists & Favorites</span>
            </div>
            <span className="text-xs text-[#6a6a6a]">{playlists.length + 1} lists</span>
          </div>

          {/* Quick Liked Songs Card */}
          <button
            id="nav-liked-songs-btn"
            onClick={() => {
              onTabChange('liked');
              onCloseMobile();
            }}
            className={`flex items-center gap-3 p-2 rounded-md transition-all group ${
              activeTab === 'liked' ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="w-10 h-10 rounded overflow-hidden relative flex items-center justify-center shrink-0 shadow-md border border-white/10">
              <img
                src={gotDirewolf}
                alt="Liked Songs"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
            <div className="flex flex-col text-left overflow-hidden">
              <span className={`text-sm font-semibold truncate ${activeTab === 'liked' ? 'text-[#1DB954]' : 'text-white'}`}>
                Liked Songs
              </span>
              <span className="text-xs text-[#b3b3b3]">
                {likedTracksCount} {likedTracksCount === 1 ? 'song' : 'songs'}
              </span>
            </div>
          </button>

          {/* Playlist Scroll Area */}
          <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-1">
            {playlists.map((playlist) => {
              const isSelected = selectedPlaylistId === playlist.id;
              return (
                <button
                  key={playlist.id}
                  id={`playlist-item-${playlist.id}`}
                  onClick={() => {
                    onSelectPlaylist(playlist);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 p-2 rounded-md transition-all text-left group ${
                    isSelected ? 'bg-[#242424]' : 'hover:bg-[#1a1a1a]'
                  }`}
                >
                  <img
                    src={playlist.coverUrl || DEFAULT_GOT_IMAGE}
                    alt={playlist.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded object-cover shrink-0 border border-white/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_GOT_IMAGE;
                    }}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span
                      className={`text-sm font-medium truncate ${
                        isSelected ? 'text-[#1DB954] font-semibold' : 'text-[#e5e5e5] group-hover:text-white'
                      }`}
                    >
                      {playlist.title}
                    </span>
                    <span className="text-xs text-[#a7a7a7] truncate">
                      Playlist • {playlist.tracks.length} tracks
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Direct MP3 Downloader Banner at Bottom of Sidebar */}
          <div className="mt-3 p-3 bg-gradient-to-b from-[#1f1f1f] to-[#171717] rounded-lg border border-[#2a2a2a] shrink-0">
            <div className="flex items-center gap-2 mb-1 text-[#1DB954]">
              <FolderDown className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Direct MP3 Download</span>
            </div>
            <p className="text-[11px] text-[#a7a7a7] leading-relaxed">
              One-click Blob MP3 export without new tabs or redirects.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
