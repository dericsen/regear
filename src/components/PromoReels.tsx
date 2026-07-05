// src/components/PromoReels.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageSquare,
  Calendar,
  Send,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  BadgeCheck,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  Music,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, User, Comment } from "../types";

interface PromoReelsProps {
  products: Product[];
  currentUser: User | null;
  token: string | null;
  onOpenLoginModal: () => void;
  onRequestMeetup: (product: Product) => void;
  onContactSeller: (sellerId: string, sellerName: string, product?: Product) => void;
  onViewDetails: (product: Product) => void;
}

// Map categories to high-quality musical background video loops
const getCategoryVideoUrl = (product: Product): string => {
  if (product.demoVideo && product.demoVideo.trim().startsWith("http")) {
    return product.demoVideo;
  }
  const cat = product.category.toLowerCase();
  if (cat.includes("guitar")) {
    return "https://assets.mixkit.co/videos/preview/mixkit-hand-of-a-guitarist-playing-acoustic-guitar-43405-large.mp4";
  } else if (cat.includes("keyboard") || cat.includes("synth")) {
    return "https://assets.mixkit.co/videos/preview/mixkit-gloved-hand-adjusting-knobs-on-sound-synthesizer-41984-large.mp4";
  } else if (cat.includes("drum")) {
    return "https://assets.mixkit.co/videos/preview/mixkit-drummer-playing-his-drums-in-a-concert-43187-large.mp4";
  } else if (cat.includes("amp")) {
    return "https://assets.mixkit.co/videos/preview/mixkit-guitarist-performing-on-stage-with-lights-43183-large.mp4";
  } else if (cat.includes("effect") || cat.includes("pedal")) {
    return "https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-dj-playing-music-on-a-mixer-41983-large.mp4";
  }
  return "https://assets.mixkit.co/videos/preview/mixkit-guitarist-performing-on-stage-with-lights-43183-large.mp4";
};

// Generates stable random like count for each product listing
const getBaseLikes = (id: string): number => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs((hash % 450) + 120);
};

export default function PromoReels({
  products,
  currentUser,
  token,
  onOpenLoginModal,
  onRequestMeetup,
  onContactSeller,
  onViewDetails,
}: PromoReelsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [localLikesOffset, setLocalLikesOffset] = useState<Record<string, number>>({});
  
  // Comments overlay drawer
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  // Video references for play/pause control
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<number, boolean>>({});

  // Filters out only products that can be promoted, defaults to all if empty
  const promoProducts = products && products.length > 0 ? products : [];

  // Play/Pause active video based on activeIndex
  useEffect(() => {
    Object.keys(videoRefs.current).forEach((key) => {
      const idx = parseInt(key);
      const video = videoRefs.current[idx];
      if (video) {
        if (idx === activeIndex) {
          video.currentTime = 0;
          video.play().then(() => {
            setIsPlaying((prev) => ({ ...prev, [idx]: true }));
          }).catch((err) => {
            console.log("Autoplay block / error:", err);
            setIsPlaying((prev) => ({ ...prev, [idx]: false }));
          });
        } else {
          video.pause();
          setIsPlaying((prev) => ({ ...prev, [idx]: false }));
        }
      }
    });

    // Reset comments state when switching reels
    setIsCommentsOpen(false);
    setNewCommentText("");
  }, [activeIndex, promoProducts.length]);

  // Load comments for active reel when comments drawer is opened
  useEffect(() => {
    if (isCommentsOpen && promoProducts[activeIndex]) {
      fetchCommentsForActive();
    }
  }, [isCommentsOpen, activeIndex]);

  const fetchCommentsForActive = async () => {
    const activeProd = promoProducts[activeIndex];
    if (!activeProd) return;
    
    setIsCommentsLoading(true);
    try {
      const res = await fetch(`/api/products/${activeProd.id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentUser) {
      onOpenLoginModal();
      return;
    }
    if (!newCommentText.trim()) return;

    const activeProd = promoProducts[activeIndex];
    if (!activeProd) return;

    try {
      const res = await fetch(`/api/products/${activeProd.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newCommentText }),
      });
      if (res.ok) {
        const added = await res.json();
        setCommentsList((prev) => [...prev, added]);
        setNewCommentText("");
        // Simple auto-scroll comments list
        setTimeout(() => {
          const scroller = document.getElementById("reels-comments-scroller");
          if (scroller) scroller.scrollTop = scroller.scrollHeight;
        }, 80);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying((prev) => ({ ...prev, [index]: true }));
      } else {
        video.pause();
        setIsPlaying((prev) => ({ ...prev, [index]: false }));
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / container.clientHeight);
    if (index !== activeIndex && index >= 0 && index < promoProducts.length) {
      setActiveIndex(index);
    }
  };

  const handleToggleLike = (id: string) => {
    setLikedMap((prev) => {
      const wasLiked = !!prev[id];
      const newStatus = !wasLiked;
      
      // Update local offset
      setLocalLikesOffset((prevOffset) => ({
        ...prevOffset,
        [id]: (prevOffset[id] || 0) + (newStatus ? 1 : -1),
      }));

      return {
        ...prev,
        [id]: newStatus,
      };
    });
  };

  const navigateReel = (direction: "up" | "down") => {
    const container = containerRef.current;
    if (container) {
      const step = container.clientHeight;
      const targetScroll = container.scrollTop + (direction === "down" ? step : -step);
      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  };

  if (promoProducts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0b] animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#f27d26] mb-4">
          <Heart className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-bold text-white">No promotions running</h3>
        <p className="text-xs text-white/50 max-w-sm mt-2 leading-relaxed">
          Be the first to list and promote an instrument! Add an audio or video path in the &quot;Sell Gear&quot; workspace to render your live dynamic promotional tape.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-8 p-4 md:p-8 overflow-y-auto w-full max-w-6xl mx-auto animate-fade-in">
      
      {/* LEFT COLUMN: Educational & Creative Promotion Info Panels */}
      <div className="w-full lg:w-96 space-y-6 shrink-0 text-left hidden md:block">
        <div className="bg-[#101012] border border-white/10 p-6 rounded-3xl space-y-4">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-[#f27d26]/10 text-[#f27d26] rounded-lg">
              <Sparkles className="w-5 h-5 shrink-0 animate-spin" />
            </span>
            <span className="text-[10px] text-[#f27d26] uppercase font-mono tracking-widest font-extrabold">
              regear dynamic loop
            </span>
          </div>
          <h2 className="text-xl font-black text-white leading-tight">
            Vertical Promotion Feed
          </h2>
          <p className="text-xs text-white/50 leading-relaxed">
            Welcome to the community promotion loop. Scroll through verified instruments, preview rich sound tones live, ask questions in real-time, or coordinate immediate trial meetups.
          </p>
          
          <div className="border-t border-white/5 pt-4 space-y-3">
            <div className="flex items-start space-x-2.5 text-xs text-white/70">
              <span className="text-[#f27d26] font-mono font-black mt-0.5">01</span>
              <span><strong>Interactive Sound:</strong> Tap on any promotional frame to toggle play or pause. Toggle volume to hear active dynamic tones.</span>
            </div>
            <div className="flex items-start space-x-2.5 text-xs text-white/70">
              <span className="text-[#f27d26] font-mono font-black mt-0.5">02</span>
              <span><strong>Unified Q&A:</strong> Comment logs are synchronized across Reels and the Marketplace. Responses instantly notify standard logs.</span>
            </div>
            <div className="flex items-start space-x-2.5 text-xs text-white/70">
              <span className="text-[#f27d26] font-mono font-black mt-0.5">03</span>
              <span><strong>Trust Verification:</strong> Every listing has been analyzed by AI security modules to verify serials and original craftsmanship.</span>
            </div>
          </div>
        </div>

        {/* Short stats panel */}
        <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center justify-between">
          <div className="text-left">
            <span className="text-[9px] uppercase font-mono text-white/40">Active promo tapes</span>
            <div className="text-2xl font-black text-white font-mono">{promoProducts.length}</div>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono text-white/40">Community Feedback</span>
            <div className="text-xs font-bold text-[#f27d26] flex items-center justify-end">
              <Heart className="w-3.5 h-3.5 text-[#f27d26] fill-[#f27d26] mr-1" />
              <span>Verified Trades</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Vertical Snap Scrolling Instagram Reels Frame */}
      <div className="relative flex flex-col items-center">
        
        {/* Desktop Quick Up/Down Side Controls */}
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col space-y-3 hidden xl:flex">
          <button
            onClick={() => navigateReel("up")}
            disabled={activeIndex === 0}
            className="w-10 h-10 rounded-full bg-[#101012] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 hover:border-[#f27d26] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateReel("down")}
            disabled={activeIndex === promoProducts.length - 1}
            className="w-10 h-10 rounded-full bg-[#101012] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 hover:border-[#f27d26] transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Smartphone-Style Video Container Shell */}
        <div 
          className="w-full xs:w-[360px] sm:w-[380px] md:w-[400px] h-[640px] md:h-[680px] bg-black rounded-[40px] border-[8px] border-[#101012] shadow-2xl relative overflow-hidden flex flex-col select-none"
        >
          {/* Inner vertical container with CSS snap scroll */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {promoProducts.map((prod, index) => {
              const videoSrc = getCategoryVideoUrl(prod);
              const isCurrent = index === activeIndex;
              const isLiked = !!likedMap[prod.id];
              const likesCount = getBaseLikes(prod.id) + (localLikesOffset[prod.id] || 0);

              return (
                <div
                  key={prod.id}
                  className="w-full h-full snap-start shrink-0 relative bg-[#040405] flex flex-col justify-between"
                  style={{ height: "100%" }}
                >
                  {/* Background Video Player */}
                  <video
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    src={videoSrc}
                    loop
                    muted={isMuted}
                    playsInline
                    onClick={() => handleTogglePlay(index)}
                    className="absolute inset-0 w-full h-full object-cover z-0 cursor-pointer"
                  />

                  {/* Top overlay: Sound controls & Verification indicator */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent p-2 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-[10px] text-white font-mono bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1">
                      <Music className="w-3 h-3 text-[#f27d26] animate-pulse" />
                      <span className="uppercase tracking-wider">{prod.category}</span>
                    </div>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:text-[#f27d26] transition-all"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Play/Pause Overlay Animated Feedback */}
                  <AnimatePresence>
                    {!isPlaying[index] && isCurrent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        onClick={() => handleTogglePlay(index)}
                        className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#f27d26] shadow-xl">
                          <Play className="w-8 h-8 fill-current ml-1" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Gradient to darken bottom overlay for pristine legibility */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0 pointer-events-none" />

                  {/* BOTTOM OVERLAY & SIDE ACTIONS GRAPHS */}
                  <div className="mt-auto w-full p-4 relative z-10 flex items-end justify-between space-x-3">
                    
                    {/* Bottom Metadata Info: Title, Specs, Price, Seller */}
                    <div className="flex-1 text-left space-y-3 pb-2 max-w-[70%]">
                      
                      {/* Price tag & condition */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-black bg-[#f27d26] px-3 py-1 rounded-full shadow-md font-mono">
                          ${prod.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] uppercase font-mono tracking-widest text-white/80 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full">
                          {prod.condition}
                        </span>
                      </div>

                      {/* Product Title */}
                      <h3 className="text-sm font-extrabold text-white leading-tight truncate-2-lines drop-shadow">
                        {prod.title}
                      </h3>

                      {/* Bio short preview */}
                      <p className="text-[11px] text-white/70 truncate drop-shadow leading-relaxed">
                        {prod.description}
                      </p>

                      {/* Seller Profile block */}
                      <div className="flex items-center space-x-2 pt-1">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f27d26] to-[#d15a1a] flex items-center justify-center text-[10px] font-black text-white shrink-0 border border-white/10 overflow-hidden">
                          <span className="uppercase">{prod.sellerName.substring(0,2)}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-bold text-white truncate">{prod.sellerName}</span>
                            {prod.sellerVerified && (
                              <BadgeCheck className="w-3.5 h-3.5 text-[#f27d26] shrink-0" />
                            )}
                          </div>
                          <span className="text-[9px] text-white/40 block font-mono">Rating: {prod.sellerRating}★</span>
                        </div>
                      </div>
                    </div>

                    {/* Right-Side Floating Actions panel */}
                    <div className="flex flex-col space-y-4 shrink-0 items-center pb-2">
                      
                      {/* LIKE/LOVE BUTTON */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => handleToggleLike(prod.id)}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${
                            isLiked
                              ? "bg-red-500/20 border-red-500 text-red-500 scale-110"
                              : "bg-black/45 border-white/10 text-white hover:text-red-400"
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                        </button>
                        <span className="text-[10px] font-mono text-white/80 mt-1 font-bold">
                          {likesCount}
                        </span>
                      </div>

                      {/* REAL-TIME COMMENTS DRAWER TRIGGER */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => setIsCommentsOpen(true)}
                          className="w-11 h-11 rounded-full bg-black/45 border border-white/10 flex items-center justify-center text-white hover:text-[#f27d26] transition-all"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                        <span className="text-[10px] font-mono text-white/80 mt-1 font-bold">
                          Q&A
                        </span>
                      </div>

                      {/* TRY-OUT SCHEDULE COORDINATE TRIGGER */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => onRequestMeetup(prod)}
                          title="Try Before Buy Demo"
                          className="w-11 h-11 rounded-full bg-black/45 border border-white/10 flex items-center justify-center text-white hover:text-yellow-400 transition-all hover:scale-105"
                        >
                          <Calendar className="w-5 h-5 text-[#f27d26]" />
                        </button>
                        <span className="text-[9px] font-bold text-[#f27d26] uppercase tracking-tighter mt-1">
                          Try Out
                        </span>
                      </div>

                      {/* CHAT/DISCUSS DIRECT PORTAL */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => onContactSeller(prod.sellerId, prod.sellerName, prod)}
                          title="Contact Seller / Negotiate"
                          className="w-11 h-11 rounded-full bg-black/45 border border-white/10 flex items-center justify-center text-white hover:text-[#f27d26] transition-all hover:scale-105"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <span className="text-[9px] text-white/50 uppercase tracking-tighter mt-1 font-semibold">
                          Negotiate
                        </span>
                      </div>

                      {/* VIEW MARKETPLACE SPEC DETAILS */}
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => onViewDetails(prod)}
                          title="Browse Marketplace specs"
                          className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:text-[#f27d26] transition-all"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <span className="text-[8px] text-white/40 uppercase tracking-tighter mt-1">
                          Specs
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* BOTTOM LOADING TIMELINE INDICATOR BAR */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
                    {isCurrent && isPlaying[index] && (
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="h-full bg-[#f27d26]"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* INNER COMING SLIDEOUT COMMENTS PANEL */}
          <AnimatePresence>
            {isCommentsOpen && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="absolute inset-x-0 bottom-0 h-[68%] bg-[#0e0e10]/95 backdrop-blur-xl border-t border-white/15 rounded-t-3xl z-30 flex flex-col justify-between"
              >
                {/* Header title */}
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 text-[#f27d26] mr-1.5" />
                      Live Community Q&A Logs
                    </h4>
                    <span className="text-[9px] text-white/40 block mt-0.5">
                      All comments synchronize with the main specs catalog.
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCommentsOpen(false)}
                    className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Comments Scroll Container */}
                <div
                  id="reels-comments-scroller"
                  className="flex-1 overflow-y-auto p-5 space-y-4 text-left"
                >
                  {isCommentsLoading ? (
                    <div className="text-center py-8 text-xs text-white/30 italic">
                      Synchronizing logs...
                    </div>
                  ) : commentsList.length === 0 ? (
                    <div className="text-center py-10 text-white/30 italic text-xs space-y-2">
                      <MessageSquare className="w-8 h-8 text-white/5 mx-auto" />
                      <p>Be the first to leave a verified question or tone feedback!</p>
                    </div>
                  ) : (
                    commentsList.map((com) => (
                      <div key={com.id} className="flex items-start space-x-3 border-b border-white/5 pb-3">
                        <img
                          src={com.userProfileImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${com.userName}`}
                          alt={com.userName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="text-xs font-bold text-white truncate">{com.userName}</span>
                            <span className="text-[8px] text-white/30 font-mono">
                              {new Date(com.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                            {com.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Post Footer Form */}
                <form
                  onSubmit={handlePostComment}
                  className="p-4 border-t border-white/5 bg-[#121214] flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={currentUser ? "Ask seller a question..." : "Log in to add comment..."}
                    className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#f27d26]"
                  />
                  <button
                    type="submit"
                    className="h-9 px-3.5 bg-[#f27d26] hover:bg-[#d15a1a] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center transition-all shrink-0"
                  >
                    Send
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Small screen Helper Swipe indicators */}
        <div className="mt-3 text-[10px] text-white/40 uppercase tracking-widest font-mono flex items-center space-x-1.5 animate-pulse">
          <span>Scroll down for next promotional tape</span>
          <span>↓</span>
        </div>

      </div>

    </div>
  );
}
