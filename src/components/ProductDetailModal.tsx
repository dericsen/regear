// src/components/ProductDetailModal.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Star,
  ShieldCheck,
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MessageSquare,
  ShoppingCart,
  Calendar,
  Sparkles,
  Leaf,
  CheckCircle,
  Truck,
  RotateCcw,
  BadgeCheck,
  Send,
  User as UserIcon,
  Tag,
  ShoppingBag
} from "lucide-react";
import { Product, User, Comment } from "../types";

interface ProductDetailModalProps {
  product: Product;
  currentUser: User | null;
  wishlistIds: string[];
  comments: Comment[];
  onClose: () => void;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  onAddToCart: (product: Product, type: "rent" | "buy", rentalMonths?: number) => void;
  onContactSeller: (sellerId: string, sellerName: string, product: Product) => void;
  onAddComment: (text: string) => void;
}

export default function ProductDetailModal({
  product,
  currentUser,
  wishlistIds,
  comments,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onContactSeller,
  onAddComment,
}: ProductDetailModalProps) {
  // Rent vs Buy choice
  const defaultMode = product.listingType === "rent" ? "rent" : "buy";
  const [selectedMode, setSelectedMode] = useState<"rent" | "buy">(defaultMode);
  const [rentalMonths, setRentalMonths] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [newComment, setNewComment] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const isWishlisted = wishlistIds.includes(product.id);
  const rentMonthly = product.rentPriceMonthly || Math.round(product.price * 0.025);

  // Audio tone demo wave simulation
  useEffect(() => {
    if (!isPlayingAudio || !canvasRef.current) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#f27d26";
      ctx.beginPath();

      const width = canvas.width;
      const height = canvas.height;
      const mid = height / 2;

      for (let x = 0; x < width; x++) {
        const freq1 = Math.sin((x * 0.05) + t) * 12;
        const freq2 = Math.cos((x * 0.02) - (t * 1.5)) * 8;
        const y = mid + freq1 + freq2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      t += 0.08;
      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingAudio]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#faf8f5]">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-100 text-[#f27d26]">
              {product.category}
            </span>
            <span className="text-xs font-bold text-stone-500">
              Condition: {product.condition}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => onToggleWishlist(product.id, e)}
              className={`p-2 rounded-full border border-stone-200 hover:bg-stone-100 transition-colors ${
                isWishlisted ? "text-red-500 bg-red-50" : "text-stone-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-200/60 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Photos & Tone Demo */}
            <div className="md:col-span-6 space-y-4">
              {/* Main Image Display */}
              <div className="h-64 sm:h-72 rounded-2xl bg-stone-50 border border-stone-200/80 p-4 flex items-center justify-center relative overflow-hidden group">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                {/* CO2 badge */}
                <div className="absolute top-3 left-3 bg-emerald-700/90 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-xs">
                  <Leaf className="w-3 h-3" />
                  <span>Saves ~{product.co2SavedKg || 38} kg CO₂</span>
                </div>
              </div>

              {/* Thumbnail Gallery if multiple */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-14 h-14 rounded-xl border p-1 bg-stone-50 overflow-hidden transition-all ${
                        selectedImageIndex === idx
                          ? "border-[#f27d26] ring-2 ring-[#f27d26]/20"
                          : "border-stone-200 hover:border-stone-400"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive Audio Tone / Video Demo Player */}
              <div className="bg-[#faf8f5] rounded-2xl p-4 border border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#f27d26] text-white flex items-center justify-center">
                      <Volume2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#1c1917]">
                        Acoustic Tone Diagnostic
                      </h4>
                      <p className="text-[10px] text-stone-500 font-medium">
                        Real recorded harmonic response
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="px-3 py-1.5 rounded-full bg-[#f27d26] hover:bg-[#e06a16] text-white text-xs font-bold flex items-center space-x-1 shadow-xs transition-all active:scale-95"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Tone</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Play Sample</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Animated Waveform Canvas */}
                <div className="h-12 bg-white rounded-xl border border-stone-200 flex items-center justify-center px-3 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={40}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* AI Verification Scorecard */}
              {product.isVerifiedGear && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-emerald-800 font-black text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>ReGear AI Quality Diagnostic</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      Score: {product.verificationScore || 98}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-emerald-900 pt-1">
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-center">
                      <p className="text-stone-500">Tone Resonance</p>
                      <p className="text-xs font-black text-emerald-700">99% Match</p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-center">
                      <p className="text-stone-500">Hardware Test</p>
                      <p className="text-xs font-black text-emerald-700">Certified OK</p>
                    </div>
                    <div className="bg-white/80 p-2 rounded-lg border border-emerald-100 text-center">
                      <p className="text-stone-500">Authenticity</p>
                      <p className="text-xs font-black text-emerald-700">Verified OEM</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Title, Rent vs Buy selector, Seller Info & CTAs */}
            <div className="md:col-span-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#1c1917] tracking-tight">
                    {product.title}
                  </h1>
                  <div className="flex items-center space-x-3 mt-1.5 text-xs text-stone-500 font-medium">
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                      <span>{product.rating ? product.rating.toFixed(1) : "4.8"}</span>
                      <span className="text-stone-400 ml-1">
                        ({product.reviewCount || 124} reviews)
                      </span>
                    </div>
                    <span>•</span>
                    <span>Brand: <strong className="text-stone-800">{product.brand || "Fender"}</strong></span>
                  </div>
                </div>

                {/* Rent vs Buy Tabs Selector */}
                <div className="bg-stone-100 p-1 rounded-2xl flex items-center">
                  <button
                    onClick={() => setSelectedMode("rent")}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                      selectedMode === "rent"
                        ? "bg-white text-[#f27d26] shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Rent from ${rentMonthly}/mo</span>
                  </button>
                  <button
                    onClick={() => setSelectedMode("buy")}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                      selectedMode === "buy"
                        ? "bg-white text-[#f27d26] shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy for ${product.price.toLocaleString()}</span>
                  </button>
                </div>

                {/* Dynamic Price Breakdown based on chosen mode */}
                <div className="p-4 bg-[#faf8f5] rounded-2xl border border-stone-200/80 space-y-3">
                  {selectedMode === "rent" ? (
                    <div className="space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-stone-500">
                          Monthly Rental
                        </span>
                        <div className="text-right">
                          <span className="text-2xl font-black text-[#1c1917]">
                            ${rentMonthly}
                          </span>
                          <span className="text-xs text-stone-500 ml-1 font-bold">
                            / month
                          </span>
                        </div>
                      </div>

                      {/* Duration Selector */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-stone-700">
                          Select Duration:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 3, 6].map((months) => (
                            <button
                              key={months}
                              onClick={() => setRentalMonths(months)}
                              className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                rentalMonths === months
                                  ? "border-[#f27d26] bg-orange-50/80 text-[#f27d26]"
                                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                              }`}
                            >
                              {months} Month{months > 1 ? "s" : ""}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-stone-600">
                        <span>Total Initial Commitment</span>
                        <span className="text-stone-900 font-black">
                          ${rentMonthly * rentalMonths}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-stone-500">
                          Outright Pre-loved Price
                        </span>
                        <span className="text-2xl font-black text-[#1c1917]">
                          ${product.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Save up to 55% compared to purchasing new factory retail.
                      </p>
                    </div>
                  )}

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200/60 text-[11px] font-medium text-stone-600">
                    <div className="flex items-center space-x-1.5">
                      <Truck className="w-3.5 h-3.5 text-stone-400" />
                      <span>Free Insured Delivery</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
                      <span>7-Day Hassle-Free Trial</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                    About this gear
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                    {product.description}
                  </p>
                </div>

                {/* Seller Profile Summary */}
                <div className="p-3 bg-white rounded-xl border border-stone-200/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs">
                      {product.sellerName ? product.sellerName.substring(0, 2).toUpperCase() : "SE"}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-black text-[#1c1917]">
                          {product.sellerName}
                        </span>
                        {product.sellerVerified && (
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 font-medium">
                        Verified ReGear Member ★ {product.sellerRating || 4.9}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onContactSeller(product.sellerId, product.sellerName, product)}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3 h-3 text-[#f27d26]" />
                    <span>Ask Seller</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={() => onAddToCart(product, selectedMode, rentalMonths)}
                  className="w-full sm:flex-1 py-3.5 bg-[#f27d26] hover:bg-[#e06a16] text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md shadow-[#f27d26]/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {selectedMode === "rent"
                      ? `Rent Now ($${rentMonthly * rentalMonths})`
                      : `Add to Cart ($${product.price})`}
                  </span>
                </button>

                <button
                  onClick={() => onContactSeller(product.sellerId, product.sellerName, product)}
                  className="w-full sm:w-auto px-4 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Community Q&A / Musician Comments Section */}
          <div className="border-t border-stone-200/80 pt-6 space-y-4">
            <h3 className="text-sm font-black text-[#1c1917] tracking-tight">
              Musician Discussion & Verified Feedback
            </h3>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  currentUser
                    ? "Ask a question about the frets, sound, or setup..."
                    : "Sign in to leave a question or feedback"
                }
                disabled={!currentUser}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-[#1c1917] focus:outline-none focus:border-[#f27d26] font-medium"
              />
              <button
                type="submit"
                disabled={!currentUser || !newComment.trim()}
                className="px-4 py-2.5 bg-[#f27d26] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2.5">
              {comments && comments.length > 0 ? (
                comments.map((com) => (
                  <div
                    key={com.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1c1917]">{com.userName}</span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(com.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-stone-600 font-medium">{com.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 italic py-2">
                  No questions yet. Be the first musician to inquire!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
