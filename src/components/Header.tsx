// src/components/Header.tsx
import React, { useState } from "react";
import {
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  Tag,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Video,
  Plus,
  Sparkles,
  Leaf,
  Menu,
  X,
  MessageSquare
} from "lucide-react";
import { User, CartItem } from "../types";

interface HeaderProps {
  currentUser: User | null;
  cart: CartItem[];
  wishlistIds: string[];
  activeFilter: "all" | "rent" | "buy" | "ai_verified";
  onSelectFilter: (filter: "all" | "rent" | "buy" | "ai_verified") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenChat: () => void;
  unreadChatCount?: number;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenHowItWorks: () => void;
  onOpenSDG: () => void;
  onOpenAIModal: () => void;
  onOpenAboutUs: () => void;
  onOpenListGear: () => void;
  onOpenReels: () => void;
  onOpenProfile: () => void;
  onGoHome: () => void;
}

export const ReGearLogo = () => (
  <div className="flex items-center space-x-2.5 cursor-pointer select-none group">
    {/* Circular loop / circular economy mark */}
    <div className="w-9 h-9 rounded-full bg-[#f27d26] flex items-center justify-center shadow-md shadow-[#f27d26]/20 group-hover:scale-105 transition-transform">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 10 10c0 4-2.5 7.5-6.2 9" />
        <path d="M12 22A10 10 0 0 1 2 12c0-4 2.5-7.5 6.2-9" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    </div>
    <div className="flex flex-col text-left">
      <span className="text-xl font-black tracking-tight text-[#1c1917] leading-none flex items-center">
        Re<span className="text-[#f27d26]">Gear</span>
      </span>
      <span className="text-[10px] font-semibold text-[#8c827a] tracking-tight mt-0.5">
        Play More, Waste Less.
      </span>
    </div>
  </div>
);

export default function Header({
  currentUser,
  cart,
  wishlistIds,
  activeFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  onOpenCart,
  onOpenWishlist,
  onOpenChat,
  unreadChatCount = 0,
  onOpenLogin,
  onLogout,
  onOpenHowItWorks,
  onOpenSDG,
  onOpenAIModal,
  onOpenAboutUs,
  onOpenListGear,
  onOpenReels,
  onOpenProfile,
  onGoHome,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#f0ece5]">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div onClick={onGoHome}>
          <ReGearLogo />
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-[13px] font-bold text-[#44403c]">
          <button
            onClick={() => onSelectFilter("rent")}
            className={`transition-colors hover:text-[#f27d26] ${
              activeFilter === "rent" ? "text-[#f27d26] font-extrabold" : ""
            }`}
          >
            Rent
          </button>
          <button
            onClick={() => onSelectFilter("buy")}
            className={`transition-colors hover:text-[#f27d26] ${
              activeFilter === "buy" ? "text-[#f27d26] font-extrabold" : ""
            }`}
          >
            Buy Pre-loved
          </button>
          <button
            onClick={onOpenAIModal}
            className="transition-colors hover:text-[#f27d26] flex items-center space-x-1"
          >
            <span>AI Verified</span>
            <Sparkles className="w-3.5 h-3.5 text-[#f27d26]" />
          </button>
          <button
            onClick={onOpenHowItWorks}
            className="transition-colors hover:text-[#f27d26]"
          >
            How It Works
          </button>
          <button
            onClick={onOpenSDG}
            className="transition-colors hover:text-[#f27d26] flex items-center space-x-1"
          >
            <span>SDG Impact</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
          </button>
          <button
            onClick={onOpenAboutUs}
            className="transition-colors hover:text-[#f27d26]"
          >
            About Us
          </button>
          <button
            onClick={onOpenReels}
            className="px-2.5 py-1 rounded-full bg-orange-100/80 text-[#f27d26] hover:bg-orange-200/80 transition-colors flex items-center space-x-1 text-xs"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Reels</span>
          </button>
        </nav>

        {/* Right Actions: Wishlist, Cart, Chat, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Messages / Chat Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center space-x-1.5 text-xs font-bold text-[#44403c] hover:text-[#f27d26] transition-colors p-2 rounded-xl hover:bg-stone-100/70 relative"
            title="Messages & Chat"
          >
            <div className="relative">
              <MessageSquare className="w-4 h-4" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#f27d26] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadChatCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Messages</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-[#44403c] hover:text-[#f27d26] transition-colors p-2 rounded-xl hover:bg-stone-100/70"
            title="View Wishlist"
          >
            <div className="relative">
              <Heart className="w-4 h-4" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#f27d26] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </div>
            <span>Wishlist</span>
          </button>

          {/* Cart Icon with badge */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-[#1c1917] hover:text-[#f27d26] hover:bg-stone-100/70 rounded-xl transition-all"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartTotalItems > 0 && (
              <span className="absolute top-1 right-1 bg-[#f27d26] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartTotalItems}
              </span>
            )}
          </button>

          {/* User Profile / Auth */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-full bg-white border border-stone-200 hover:border-stone-300 shadow-sm transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-[#f27d26] text-white text-xs font-black flex items-center justify-center overflow-hidden">
                  {currentUser.profileImage && currentUser.profileImage.startsWith("http") ? (
                    <img src={currentUser.profileImage} alt={currentUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{currentUser.username.substring(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-[#1c1917] hidden sm:inline max-w-[90px] truncate">
                  {currentUser.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-stone-100">
                    <p className="text-xs font-black text-[#1c1917]">{currentUser.username}</p>
                    <p className="text-[10px] text-stone-400 truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center space-x-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenChat();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center space-x-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                    <span>Messages & Inquiries</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenListGear();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#f27d26] hover:bg-orange-50/50 flex items-center space-x-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#f27d26]" />
                    <span>List New Gear</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenReels();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center space-x-2"
                  >
                    <Video className="w-3.5 h-3.5 text-stone-400" />
                    <span>Tone Reels Feed</span>
                  </button>
                  <div className="border-t border-stone-100 my-1"></div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-4 py-2 bg-[#f27d26] hover:bg-[#e06a16] text-white text-xs font-extrabold rounded-full shadow-sm shadow-[#f27d26]/20 transition-all flex items-center space-x-1.5"
            >
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-xl"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-2">
          <button
            onClick={() => {
              onSelectFilter("rent");
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-stone-800 rounded-lg hover:bg-stone-50"
          >
            Rent Instruments
          </button>
          <button
            onClick={() => {
              onSelectFilter("buy");
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-stone-800 rounded-lg hover:bg-stone-50"
          >
            Buy Pre-loved
          </button>
          <button
            onClick={() => {
              onOpenAIModal();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-stone-800 rounded-lg hover:bg-stone-50"
          >
            AI Verified Quality
          </button>
          <button
            onClick={() => {
              onOpenHowItWorks();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-stone-800 rounded-lg hover:bg-stone-50"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              onOpenSDG();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-stone-800 rounded-lg hover:bg-stone-50"
          >
            SDG Impact (Circular Economy)
          </button>
          <button
            onClick={() => {
              onOpenChat();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-[#1c1917] rounded-lg hover:bg-stone-50 flex items-center justify-between"
          >
            <span className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#f27d26]" />
              <span>Messages & Inquiries</span>
            </span>
            {unreadChatCount > 0 && (
              <span className="bg-[#f27d26] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {unreadChatCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              onOpenReels();
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-bold text-[#f27d26] rounded-lg hover:bg-orange-50"
          >
            🎥 Watch Tone Reels
          </button>
        </div>
      )}

      {/* Search & Quick Filter Bar Matching Mockup */}
      <div className="max-w-4xl mx-auto px-4 pb-4 pt-1">
        <div className="bg-white rounded-full p-1.5 pl-5 pr-2 border border-[#ede8e1] shadow-sm flex items-center justify-between gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="flex-1 flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search instruments, brands, or gear..."
              className="w-full text-xs sm:text-sm text-[#1c1917] placeholder-[#a8a29e] bg-transparent focus:outline-none font-medium"
            />
          </div>

          {/* Search Button (Orange Circle) */}
          <button
            onClick={() => {}}
            className="w-8 h-8 rounded-full bg-[#f27d26] hover:bg-[#e06a16] text-white flex items-center justify-center shrink-0 shadow-sm transition-all"
            title="Search"
          >
            <Search className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Quick Filter Badges / Pills from Screenshot */}
          <div className="hidden sm:flex items-center space-x-1.5 shrink-0 pl-1 border-l border-stone-100">
            {/* Rent Pill */}
            <button
              onClick={() => onSelectFilter(activeFilter === "rent" ? "all" : "rent")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                activeFilter === "rent"
                  ? "bg-orange-50 border-[#f27d26] text-[#f27d26]"
                  : "bg-[#faf8f5] border-stone-200 text-stone-700 hover:border-stone-300"
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-[#f27d26]" />
              <span>Rent</span>
            </button>

            {/* Buy Pre-loved Pill */}
            <button
              onClick={() => onSelectFilter(activeFilter === "buy" ? "all" : "buy")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                activeFilter === "buy"
                  ? "bg-orange-50 border-[#f27d26] text-[#f27d26]"
                  : "bg-[#faf8f5] border-stone-200 text-stone-700 hover:border-stone-300"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#f27d26]" />
              <span>Buy Pre-loved</span>
            </button>

            {/* AI Verified Pill */}
            <button
              onClick={() => onSelectFilter(activeFilter === "ai_verified" ? "all" : "ai_verified")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all border ${
                activeFilter === "ai_verified"
                  ? "bg-orange-50 border-[#f27d26] text-[#f27d26]"
                  : "bg-[#faf8f5] border-stone-200 text-stone-700 hover:border-stone-300"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#f27d26]" />
              <span>AI Verified</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
