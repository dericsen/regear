// src/components/PopularInstruments.tsx
import React, { useRef } from "react";
import {
  Heart,
  Star,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Volume2
} from "lucide-react";
import { Product } from "../types";

interface PopularInstrumentsProps {
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
  onViewAll: () => void;
}

export default function PopularInstruments({
  products,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onViewAll,
}: PopularInstrumentsProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Ensure our popular 4 are in front
  const popularList = [...products].sort((a, b) => {
    const order: Record<string, number> = {
      "prod-strat": 1,
      "prod-nord": 2,
      "prod-drum": 3,
      "prod-yamaha": 4,
    };
    return (order[a.id] || 99) - (order[b.id] || 99);
  });

  return (
    <div className="space-y-4">
      {/* Header with Title and "View all" */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-[#1c1917] tracking-tight">
          Popular Instruments
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onViewAll}
            className="text-xs sm:text-sm font-bold text-stone-500 hover:text-[#f27d26] transition-colors"
          >
            View all
          </button>
          <div className="hidden sm:flex items-center space-x-1">
            <button
              onClick={() => scroll("left")}
              className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-black hover:border-stone-400 transition-colors shadow-xs"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:text-black hover:border-stone-400 transition-colors shadow-xs"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex space-x-4 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {popularList.map((product) => {
          const isWishlisted = wishlistIds.includes(product.id);
          const isRent = product.listingType === "rent" || (!product.listingType && product.rentPriceMonthly && product.rentPriceMonthly > 0);
          const displayPrice = isRent
            ? `From $${product.rentPriceMonthly || 18} / month`
            : `$${product.price.toLocaleString()}`;

          // Badge style matching screenshot
          let badgeText = "BUY PRE-LOVED";
          let badgeClass = "bg-[#f27d26] text-white"; // default buy pre-loved
          if (product.listingType === "rent") {
            badgeText = "RENT";
            badgeClass = "bg-[#f27d26] text-white";
          } else if (product.id === "prod-yamaha" || (product.isVerifiedGear && !isRent && product.id !== "prod-nord")) {
            badgeText = "AI VERIFIED";
            badgeClass = "bg-emerald-600 text-white";
          } else if (product.id === "prod-nord") {
            badgeText = "BUY PRE-LOVED";
            badgeClass = "bg-[#e5532a] text-white";
          }

          return (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="w-[220px] sm:w-[240px] shrink-0 bg-white rounded-2xl p-3 border border-stone-200/80 hover:border-[#f27d26]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group snap-start relative"
            >
              {/* Card Top: Type Badge and Wishlist Heart */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badgeClass} shadow-xs`}
                >
                  {badgeText}
                </span>

                <button
                  onClick={(e) => onToggleWishlist(product.id, e)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isWishlisted
                      ? "text-red-500 bg-red-50"
                      : "text-stone-400 hover:text-red-500 bg-stone-50 hover:bg-stone-100"
                  }`}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`}
                  />
                </button>
              </div>

              {/* Product Image Container */}
              <div className="h-32 sm:h-36 rounded-xl bg-stone-50 flex items-center justify-center p-2 mb-3 overflow-hidden relative">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <ShoppingBag className="w-10 h-10 text-stone-300" />
                )}

                {/* Tone Preview Audio Indicator */}
                {product.demoVideo && (
                  <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center space-x-1 opacity-90">
                    <Volume2 className="w-2.5 h-2.5" />
                    <span>Demo</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-1 text-left">
                <h3 className="text-xs sm:text-sm font-black text-[#1c1917] line-clamp-1 group-hover:text-[#f27d26] transition-colors">
                  {product.title}
                </h3>

                {/* Price */}
                <p className="text-xs sm:text-sm font-black text-[#1c1917]">
                  {displayPrice}
                </p>

                {/* Rating and AI Verified Badge */}
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                    <span>{product.rating ? product.rating.toFixed(1) : "4.8"}</span>
                    <span className="text-stone-400 ml-1 font-normal">
                      ({product.reviewCount || 124})
                    </span>
                  </div>

                  {product.isVerifiedGear && (
                    <div className="flex items-center space-x-1 bg-orange-50 text-[#f27d26] px-1.5 py-0.5 rounded text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>AI Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
