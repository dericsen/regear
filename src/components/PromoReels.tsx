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
  ArrowRight,
  BadgeCheck,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  Music,
  Share2,
  Filter,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, User, Comment } from "../types";

interface PromoReelsProps {
  products: Product[];
  currentUser: User | null;
  token: string | null;
  onOpenLoginModal: () => void;
  onPostReel?: () => void;
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

// --- CLIENT SIDE WEB AUDIO SYNTHESIS FOR DYNAMIC REELS ---
class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private activeOscs: { stop: () => void }[] = [];
  private loopId: any = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playCategorySound(category: string) {
    this.stop();
    this.init();
    if (!this.ctx) return;

    const cat = category.toLowerCase();
    let step = 0;
    const interval = cat.includes("drum") ? 0.28 : 0.45; // seconds

    const playStep = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (cat.includes("guitar")) {
        // Guitar chord arpeggiator plucks
        const chord = [196.00, 246.94, 293.66, 392.00, 440.00, 493.88]; // G major pentatonic pluck
        const freq = chord[step % chord.length];
        this.pluck(freq, now, 1.4);
      } else if (cat.includes("keyboard") || cat.includes("synth")) {
        // Cozy retro synthesizer analog chords
        const chord = step % 4 < 2 
          ? [261.63, 329.63, 392.00, 493.88] // Cmaj7
          : [293.66, 349.23, 440.00, 523.25]; // Dmin7
        chord.forEach((freq, idx) => {
          this.playPad(freq, now + idx * 0.04, 1.6, 0.03);
        });
      } else if (cat.includes("drum")) {
        // Interactive acoustic rhythm
        if (step % 4 === 0) {
          this.playKick(now);
        } else if (step % 4 === 2) {
          this.playSnare(now);
        } else {
          this.playHihat(now);
        }
      } else if (cat.includes("amp")) {
        // Warm overdriven rock guitar tone pluck
        const scale = [146.83, 220.00, 293.66, 369.99]; // D major power chord notes
        const freq = scale[step % scale.length];
        this.pluck(freq, now, 1.2);
      } else {
        // Dynamic pentatonic scales
        const scale = [220.00, 246.94, 277.18, 329.63, 370.00]; 
        const freq = scale[step % scale.length];
        this.pluck(freq, now, 1.0);
      }

      step++;
      const timeToNext = interval * 1000;
      this.loopId = setTimeout(playStep, timeToNext);
    };

    playStep();
  }

  private pluck(freq: number, time: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);

    this.activeOscs.push({ stop: () => { try { osc.stop(); } catch (_) {} } });
  }

  private playPad(freq: number, time: number, duration: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 1.006, time); // detuned chorus

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + duration);
    osc2.stop(time + duration);

    this.activeOscs.push({ stop: () => { try { osc.stop(); osc2.stop(); } catch (_) {} } });
  }

  private playKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.22);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.22);

    this.activeOscs.push({ stop: () => { try { osc.stop(); } catch (_) {} } });
  }

  private playSnare(time: number) {
    if (!this.ctx) return;
    // Synthesis of snare noise component
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1200;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + 0.2);

    // Mid punch tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(170, time);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.08);

    this.activeOscs.push({ stop: () => { try { noise.stop(); osc.stop(); } catch (_) {} } });
  }

  private playHihat(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(9000, time);

    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.04);

    this.activeOscs.push({ stop: () => { try { osc.stop(); } catch (_) {} } });
  }

  stop() {
    if (this.loopId) {
      clearTimeout(this.loopId);
      this.loopId = null;
    }
    this.activeOscs.forEach((osc) => osc.stop());
    this.activeOscs = [];
  }
}

const synthEngine = new AudioSynthEngine();

export default function PromoReels({
  products,
  currentUser,
  token,
  onOpenLoginModal,
  onPostReel,
  onContactSeller,
  onViewDetails,
}: PromoReelsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [localLikesOffset, setLocalLikesOffset] = useState<Record<string, number>>({});
  
  // Category quick filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

  // Show Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Comments overlay drawer
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  // Double tap custom animation states
  const [showHeartAnimation, setShowHeartAnimation] = useState<string | null>(null);

  // Video references for play/pause control
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<number, boolean>>({});

  // Filter products by selectedCategoryFilter
  const promoProducts = products.filter((p) => {
    if (selectedCategoryFilter === "All") return true;
    return p.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
  });

  // Handle playing state & Web Audio synth sequence
  useEffect(() => {
    const activeProd = promoProducts[activeIndex];
    
    // Stop synthesize sequence first
    synthEngine.stop();

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

    // If unmuted, play client-side category sound progression
    if (!isMuted && activeProd) {
      synthEngine.playCategorySound(activeProd.category);
    }

    // Reset comments & toast state when switching reels
    setIsCommentsOpen(false);
    setNewCommentText("");
  }, [activeIndex, promoProducts.length, isMuted, selectedCategoryFilter]);

  // Clean sound synth on unmount
  useEffect(() => {
    return () => {
      synthEngine.stop();
    };
  }, []);

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
        // Auto-scroll comments list
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
        video.play().catch(() => {});
        setIsPlaying((prev) => ({ ...prev, [index]: true }));
        if (!isMuted && promoProducts[index]) {
          synthEngine.playCategorySound(promoProducts[index].category);
        }
      } else {
        video.pause();
        setIsPlaying((prev) => ({ ...prev, [index]: false }));
        synthEngine.stop();
      }
    } else {
      // For fallback mode when no video exists
      setIsPlaying((prev) => {
        const nextState = !prev[index];
        if (nextState) {
          if (!isMuted && promoProducts[index]) {
            synthEngine.playCategorySound(promoProducts[index].category);
          }
        } else {
          synthEngine.stop();
        }
        return { ...prev, [index]: nextState };
      });
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

  // Double Click / Double Tap to Like interaction
  const handleDoubleClick = (id: string) => {
    if (!likedMap[id]) {
      handleToggleLike(id);
    }
    setShowHeartAnimation(id);
    setTimeout(() => {
      setShowHeartAnimation(null);
    }, 850);
  };

  const triggerShareLink = (prod: Product) => {
    const simulatedLink = `${window.location.origin}/reels/${prod.id}`;
    navigator.clipboard.writeText(simulatedLink).then(() => {
      setToastMessage(`Copied promotional link for "${prod.title}"!`);
      setTimeout(() => setToastMessage(null), 3000);
    }).catch(() => {
      setToastMessage("Link copied successfully!");
      setTimeout(() => setToastMessage(null), 3000);
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

  const categories = ["All", "Guitars", "Keyboards", "Amps", "Effects", "Other"];

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
              regear studio loops
            </span>
          </div>
          <h2 className="text-xl font-black text-white leading-tight">
            Vertical Promotion Feed
          </h2>
          <p className="text-xs text-white/50 leading-relaxed">
            Browse verified community instrument promotions. Double-tap to show support, listen to dynamic audio chord progressions, and comment in real-time.
          </p>

          {/* POST REEL OPTION BUTTON */}
          {onPostReel && (
            <button
              onClick={onPostReel}
              className="w-full py-3 bg-[#f27d26] text-black font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:opacity-90 shadow-lg shadow-[#f27d26]/15 transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>+ Post a Promo Reel</span>
            </button>
          )}

          {/* CATEGORIES CHIPS FILTER FOR COZY DISCOVERY */}
          <div className="pt-2">
            <span className="text-[9px] uppercase font-mono text-white/40 block mb-2">
              Filter by category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategoryFilter(cat);
                    setActiveIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide uppercase transition-all flex items-center space-x-1 ${
                    selectedCategoryFilter === cat
                      ? "bg-[#f27d26] text-black shadow-md shadow-[#f27d26]/10"
                      : "bg-white/5 hover:bg-white/10 text-white/70"
                  }`}
                >
                  {selectedCategoryFilter === cat && <Check className="w-3 h-3 text-black mr-0.5" />}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-4 space-y-3">
            <div className="flex items-start space-x-2.5 text-xs text-white/70">
              <span className="text-[#f27d26] font-mono font-black mt-0.5">01</span>
              <span><strong>Interactive Sounds:</strong> Tap to pause or play. Turn off mute to activate the integrated high-fidelity Web Synthesizer!</span>
            </div>
            <div className="flex items-start space-x-2.5 text-xs text-white/70">
              <span className="text-[#f27d26] font-mono font-black mt-0.5">02</span>
              <span><strong>Double-Tap gesture:</strong> Double-click any part of the phone container to instantly express like-support.</span>
            </div>
            <div className="flex items-start space-x-2.5 text-xs text-white/70">
              <span className="text-[#f27d26] font-mono font-black mt-0.5">03</span>
              <span><strong>Durable synchronicity:</strong> All comment and Q&A logs align securely with standard product spec columns.</span>
            </div>
          </div>
        </div>

        {/* Short stats panel */}
        <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center justify-between">
          <div className="text-left">
            <span className="text-[9px] uppercase font-mono text-white/40">Filtered Reels</span>
            <div className="text-xl font-black text-white font-mono">{promoProducts.length}</div>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-mono text-white/40">Sound Engine</span>
            <div className="text-xs font-bold text-[#f27d26] flex items-center justify-end font-mono">
              <span>Web Audio v2</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Vertical Snap Scrolling Instagram Reels Frame */}
      <div className="relative flex flex-col items-center">
        
        {/* Mobile/Tablet categories quick picker overlay */}
        <div className="flex items-center space-x-2 max-w-[360px] md:hidden pb-4 overflow-x-auto scrollbar-none">
          {onPostReel && (
            <button
              onClick={onPostReel}
              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#f27d26] text-black shrink-0 flex items-center space-x-1"
            >
              <span>+ Post Reel</span>
            </button>
          )}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategoryFilter(cat);
                setActiveIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all shrink-0 ${
                selectedCategoryFilter === cat
                  ? "bg-[#f27d26] text-black"
                  : "bg-white/5 text-white/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

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
          {/* TOAST OVERLAY PANEL */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-16 inset-x-4 z-50 bg-[#121214]/95 text-white border border-white/10 rounded-2xl px-4 py-3 text-center text-xs font-medium shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  <span>{toastMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* INNER VERTICAL CONTAINER WITH CSS SNAP SCROLL */}
          {promoProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0b] h-full">
              <Filter className="w-12 h-12 text-[#f27d26]/40 mb-3" />
              <h4 className="text-sm font-bold text-white uppercase">No items in filter</h4>
              <p className="text-[11px] text-white/40 mt-1 max-w-[200px]">
                No verified dynamic loops currently match the &quot;{selectedCategoryFilter}&quot; category. Try choosing other tabs.
              </p>
              <button
                onClick={() => setSelectedCategoryFilter("All")}
                className="mt-4 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10"
              >
                Clear Filters
              </button>
            </div>
          ) : (
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
                const productImg = prod.images && prod.images[0] ? prod.images[0] : "";

                // Determine if custom tape is present or if we are using the category default loop
                const isCustomTape = prod.demoVideo && prod.demoVideo.trim().startsWith("http");

                return (
                  <div
                    key={prod.id}
                    onDoubleClick={() => handleDoubleClick(prod.id)}
                    className="w-full h-full snap-start shrink-0 relative bg-[#040405] flex flex-col justify-between overflow-hidden cursor-pointer"
                    style={{ height: "100%" }}
                  >
                    {/* VIDEO/MEDIA RENDERER WITH ZOOM FALLBACK BLURRED BG */}
                    {isCustomTape ? (
                      <video
                        ref={(el) => {
                          videoRefs.current[index] = el;
                        }}
                        src={videoSrc}
                        loop
                        muted={isMuted}
                        playsInline
                        onClick={() => handleTogglePlay(index)}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                    ) : (
                      // Fallback mode: Zoomed blurred background product image + Center centered crisp card
                      <div className="absolute inset-0 z-0 flex items-center justify-center bg-black overflow-hidden" onClick={() => handleTogglePlay(index)}>
                        <div 
                          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
                          style={{ backgroundImage: `url(${productImg || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop"})` }}
                        />
                        <div className="relative z-10 w-[84%] max-h-[64%] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#121214]/60 backdrop-blur-md p-4 space-y-3">
                          <img 
                            src={productImg || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop"}
                            alt={prod.title}
                            className="w-full h-44 object-cover rounded-2xl border border-white/5 shadow-inner"
                          />
                          
                          {/* Animated Sound Wave Bar Visualizer to signify tape play state */}
                          <div className="flex items-center justify-between bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/5">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-white/50">
                              Synthesizer Tone
                            </span>
                            
                            {/* Animated Audio bars */}
                            <div className="flex items-end space-x-1 h-3 shrink-0">
                              <span className={`w-0.5 bg-[#f27d26] rounded-full ${isPlaying[index] && !isMuted ? "animate-bounce h-full" : "h-1"}`} style={{ animationDelay: "0.1s" }}></span>
                              <span className={`w-0.5 bg-[#f27d26] rounded-full ${isPlaying[index] && !isMuted ? "animate-bounce h-3" : "h-1.5"}`} style={{ animationDelay: "0.3s" }}></span>
                              <span className={`w-0.5 bg-[#f27d26] rounded-full ${isPlaying[index] && !isMuted ? "animate-bounce h-2" : "h-0.5"}`} style={{ animationDelay: "0.5s" }}></span>
                              <span className={`w-0.5 bg-[#f27d26] rounded-full ${isPlaying[index] && !isMuted ? "animate-bounce h-3.5" : "h-2"}`} style={{ animationDelay: "0.2s" }}></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Top overlay: Category identifier + sound state controls */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent p-2.5 rounded-2xl">
                      <div className="flex items-center space-x-1.5 text-[10px] text-white font-mono bg-black/50 backdrop-blur-md border border-white/15 rounded-full px-3 py-1">
                        <Music className="w-3 h-3 text-[#f27d26] animate-pulse" />
                        <span className="uppercase tracking-wider font-bold">{prod.category}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isCustomTape && (
                          <span className="text-[9px] uppercase font-mono tracking-widest text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                            Tape Loop
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMuted(!isMuted);
                          }}
                          className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:text-[#f27d26] transition-all shadow-md"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-white/60" /> : <Volume2 className="w-4 h-4 text-[#f27d26] animate-pulse" />}
                        </button>
                      </div>
                    </div>

                    {/* Double-Click Heart Pop Animation */}
                    <AnimatePresence>
                      {showHeartAnimation === prod.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.3 }}
                          animate={{ opacity: 1, scale: 1.4 }}
                          exit={{ opacity: 0, scale: 1.8 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                        >
                          <div className="bg-red-500/25 p-6 rounded-full backdrop-blur-sm border border-red-500/30">
                            <Heart className="w-14 h-14 text-red-500 fill-current drop-shadow-2xl filter" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Play/Pause Overlay Animated Feedback */}
                    <AnimatePresence>
                      {!isPlaying[index] && isCurrent && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.2 }}
                          onClick={() => handleTogglePlay(index)}
                          className="absolute inset-0 flex items-center justify-center z-10 bg-black/15"
                        >
                          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#f27d26] shadow-2xl transition-transform hover:scale-105">
                            <Play className="w-7 h-7 fill-current ml-1" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Gradient to darken bottom overlay for legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-0 pointer-events-none" />

                    {/* BOTTOM OVERLAY & SIDE ACTIONS GRAPHS */}
                    <div className="mt-auto w-full p-4 relative z-10 flex items-end justify-between space-x-3">
                      
                      {/* Bottom Metadata Info: Title, Specs, Price, Seller */}
                      <div className="flex-1 text-left space-y-3 pb-2 max-w-[70%]">
                        
                        {/* Price tag & condition */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-black bg-[#f27d26] px-3 py-1 rounded-full shadow-lg font-mono">
                            ${prod.price.toLocaleString()}
                          </span>
                          <span className="text-[9px] uppercase font-mono tracking-widest text-white/90 bg-white/10 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full">
                            {prod.condition}
                          </span>
                        </div>

                        {/* Product Title */}
                        <h3 className="text-sm font-extrabold text-white leading-tight truncate-2-lines drop-shadow-md">
                          {prod.title}
                        </h3>

                        {/* Bio description preview */}
                        <p className="text-[11px] text-white/70 truncate drop-shadow leading-relaxed">
                          {prod.description}
                        </p>

                        {/* Seller Profile block */}
                        <div className="flex items-center space-x-2 pt-1">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f27d26] to-[#d15a1a] flex items-center justify-center text-[10px] font-black text-white shrink-0 border border-white/10 overflow-hidden shadow-md">
                            <span className="uppercase">{prod.sellerName.substring(0,2)}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs font-bold text-white truncate drop-shadow">{prod.sellerName}</span>
                              {prod.sellerVerified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-[#f27d26] shrink-0" />
                              )}
                            </div>
                            <span className="text-[9px] text-white/40 block font-mono">Rating: {prod.sellerRating}★</span>
                          </div>
                        </div>
                      </div>

                      {/* Right-Side Floating Actions panel */}
                      <div className="flex flex-col space-y-3.5 shrink-0 items-center pb-2">
                        
                        {/* LIKE/LOVE BUTTON */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLike(prod.id);
                            }}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border shadow-lg ${
                              isLiked
                                ? "bg-red-500/25 border-red-500 text-red-500 scale-110"
                                : "bg-black/55 border-white/10 text-white hover:text-red-400"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCommentsOpen(true);
                            }}
                            className="w-11 h-11 rounded-full bg-black/55 border border-white/10 flex items-center justify-center text-white hover:text-[#f27d26] transition-all shadow-lg"
                          >
                            <MessageSquare className="w-5 h-5" />
                          </button>
                          <span className="text-[10px] font-mono text-white/80 mt-1 font-bold">
                            Q&A
                          </span>
                        </div>

                        {/* CHAT/DISCUSS DIRECT PORTAL */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onContactSeller(prod.sellerId, prod.sellerName, prod);
                            }}
                            title="Contact Seller / Negotiate"
                            className="w-11 h-11 rounded-full bg-black/55 border border-white/10 flex items-center justify-center text-white hover:text-[#f27d26] transition-all hover:scale-105 shadow-lg"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <span className="text-[9px] text-white/50 uppercase tracking-tighter mt-1 font-semibold">
                            Negotiate
                          </span>
                        </div>

                        {/* SOCIAL PROMO SHARE ACTION */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerShareLink(prod);
                            }}
                            title="Copy Promo Link"
                            className="w-9 h-9 rounded-full bg-black/55 border border-white/10 flex items-center justify-center text-white hover:text-[#f27d26] transition-all shadow-md"
                          >
                            <Share2 className="w-4 h-4 text-white/80" />
                          </button>
                          <span className="text-[8px] text-white/40 uppercase tracking-tighter mt-1 font-mono">
                            Share
                          </span>
                        </div>

                        {/* VIEW MARKETPLACE SPEC DETAILS */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(prod);
                            }}
                            title="Browse Marketplace specs"
                            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:text-[#f27d26] transition-all shadow-md"
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
          )}

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
