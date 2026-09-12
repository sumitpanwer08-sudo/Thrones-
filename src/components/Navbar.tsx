import React from 'react';
import { ChevronLeft, ChevronRight, Search, X, Loader2, Menu, Music, Sparkles } from 'lucide-react';
import { NavTab } from '../types';
import { gotIronThrone } from '../assets/gotImages';

interface NavbarProps {
  activeTab: NavTab;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenMobileSidebar: () => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
}

const CATEGORIES = ['All', 'Bollywood', 'Punjabi', 'Trending', 'Lo-Fi', 'Pop', 'Electronic', 'Synthwave', 'Ambient'];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  isSearching,
  selectedCategory,
  onSelectCategory,
  onOpenMobileSidebar,
  onNavigateBack,
  onNavigateForward,
  canNavigateBack,
  canNavigateForward,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-md px-4 md:px-8 py-4 flex flex-col gap-3 border-b border-[#282828]/50">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="mobile-menu-toggle"
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-full bg-[#1e1e1e] text-[#b3b3b3] hover:text-white transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Name */}
          <div className="flex items-center gap-1.5 md:hidden">
            <img
              src={gotIronThrone}
              alt="Thrones"
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded object-cover border border-amber-500/40"
            />
            <span className="font-serif font-extrabold text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
              THRONES
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              id="nav-back-btn"
              onClick={onNavigateBack}
              disabled={!canNavigateBack}
              className={`w-8 h-8 rounded-full bg-black/70 flex items-center justify-center transition-colors ${
                canNavigateBack
                  ? 'text-white hover:bg-black cursor-pointer'
                  : 'text-[#535353] cursor-not-allowed opacity-50'
              }`}
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="nav-forward-btn"
              onClick={onNavigateForward}
              disabled={!canNavigateForward}
              className={`w-8 h-8 rounded-full bg-black/70 flex items-center justify-center transition-colors ${
                canNavigateForward
                  ? 'text-white hover:bg-black cursor-pointer'
                  : 'text-[#535353] cursor-not-allowed opacity-50'
              }`}
              aria-label="Go forward"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center: Live Search Input Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative flex items-center group">
            <div className="absolute left-3 text-[#b3b3b3] group-focus-within:text-white transition-colors pointer-events-none">
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-[#1DB954] animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>

            <input
              id="global-music-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search JioSaavn, Bollywood, Punjabi, artists, songs..."
              className="w-full pl-9 pr-8 py-2 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2e2e2e] text-white text-xs md:text-sm rounded-full border border-transparent focus:border-[#ffffff]/30 focus:outline-none transition-all placeholder:text-[#888888]"
            />

            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 p-1 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#383838] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: User Profile & Status Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#1f1f1f] border border-[#2f2f2f] rounded-full text-xs font-semibold text-[#1DB954]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>JioSaavn Integrated • 320kbps</span>
          </div>

          <div
            id="user-profile-pill"
            className="flex items-center gap-2 p-1 md:pr-3 bg-[#0a0a0a] hover:bg-[#1a1a1a] rounded-full border border-[#262626] cursor-pointer transition-colors"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Profile Avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#1DB954] ring-2 ring-black" />
            </div>
            <span className="hidden md:inline text-xs font-semibold text-white">Music Lover</span>
          </div>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              id={`filter-pill-${cat.toLowerCase()}`}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-white text-black shadow-md'
                  : 'bg-[#242424] text-[#e0e0e0] hover:bg-[#303030] hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </header>
  );
};
