// src/components/CatalogSection.tsx
import React from "react";
import {
  Heart,
  Star,
  ShieldCheck,
  Tag,
  ShoppingBag,
  Sliders,
  Volume2,
  Filter,
  Check
} from "lucide-react";
import { Product } from "../types";

interface CatalogSectionProps {
  products: Product[];
  wishlistIds: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  activeFilter: "all" | "rent" | "buy" | "ai_verified";
  onSelectFilter: (filter: "all" | "rent" | "buy" | "ai_verified") => void;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
}

const CATEGORIES = ["All", "Guitars", "Keyboards", "Drums", "Amps", "Effects"];

export default function CatalogSection({
  products,
  wishlistIds,
  selectedCategory,
  onSelectCategory,
  activeFilter,
  onSelectFilter,
  onToggleWishlist,
  onSelectProduct,
}: CatalogSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-10 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-black text-[#1c1917] tracking-tight">
            Explore All Gear
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Verified circular instruments ready for stage, studio, or rehearsal.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat.toLowerCase())}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? "bg-[#1c1917] text-white border-[#1c1917]"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-2">
          <p className="text-base font-bold text-stone-700">No instruments matched your search</p>
          <p className="text-xs text-stone-400">
            Try resetting filters or searching for different terms like "Stratocaster", "Nord", or "Yamaha".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const isRent = product.listingType === "rent" || (!product.listingType && product.rentPriceMonthly && product.rentPriceMonthly > 0);
            const displayPrice = isRent
              ? `From $${product.rentPriceMonthly || 18} / month`
              : `$${product.price.toLocaleString()}`;

            let badgeText = "BUY PRE-LOVED";
            let badgeClass = "bg-[#f27d26] text-white";
            if (product.listingType === "rent") {
              badgeText = "RENT";
              badgeClass = "bg-[#f27d26] text-white";
            } else if (product.isVerifiedGear && product.id === "prod-yamaha") {
              badgeText = "AI VERIFIED";
              badgeClass = "bg-emerald-600 text-white";
            }

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="bg-white rounded-3xl p-3.5 border border-stone-200/80 hover:border-[#f27d26]/40 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                {/* Top Badge & Heart */}
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
                  >
                    <Heart
                      className={`w-4 h-4 ${isWishlisted ? "fill-red-500" : ""}`}
                    />
                  </button>
                </div>

                {/* Product Image */}
                <div className="h-44 rounded-2xl bg-stone-50 flex items-center justify-center p-3 mb-3 overflow-hidden relative">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.demoVideo && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 opacity-90">
                      <Volume2 className="w-3 h-3" />
                      <span>Audio Demo</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1 text-left">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold">
                    <span>{product.brand || product.category}</span>
                    <span className="text-stone-600">{product.condition}</span>
                  </div>

                  <h3 className="text-sm font-black text-[#1c1917] line-clamp-1 group-hover:text-[#f27d26] transition-colors">
                    {product.title}
                  </h3>

                  <p className="text-sm font-black text-[#1c1917] pt-0.5">
                    {displayPrice}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                      <span>{product.rating ? product.rating.toFixed(1) : "4.8"}</span>
                      <span className="text-stone-400 ml-1 font-normal">
                        ({product.reviewCount || 100})
                      </span>
                    </div>

                    {product.isVerifiedGear && (
                      <div className="flex items-center space-x-1 text-[#f27d26] bg-orange-50 px-2 py-0.5 rounded-md text-[10px] font-extrabold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>AI Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
