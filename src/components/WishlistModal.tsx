// src/components/WishlistModal.tsx
import React from "react";
import { X, Heart, Trash2, ShoppingCart, ShoppingBag } from "lucide-react";
import { Product } from "../types";

interface WishlistModalProps {
  isOpen: boolean;
  products: Product[];
  wishlistIds: string[];
  onClose: () => void;
  onToggleWishlist: (id: string, e: React.MouseEvent) => void;
  onSelectProduct: (product: Product) => void;
}

export default function WishlistModal({
  isOpen,
  products,
  wishlistIds,
  onClose,
  onToggleWishlist,
  onSelectProduct,
}: WishlistModalProps) {
  if (!isOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="text-base font-black text-[#1c1917]">
              Saved Wishlist ({wishlistedProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Heart className="w-10 h-10 text-stone-300 mx-auto stroke-[1.5]" />
              <p className="text-sm font-bold text-stone-700">No items saved yet</p>
              <p className="text-xs text-stone-400">
                Click the heart icon on any guitar, keyboard, or drum to save it here.
              </p>
            </div>
          ) : (
            wishlistedProducts.map((p) => {
              const isRent = p.listingType === "rent";
              const priceText = isRent
                ? `From $${p.rentPriceMonthly || 18} / month`
                : `$${p.price.toLocaleString()}`;

              return (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center space-x-3 hover:border-stone-300 transition-all"
                >
                  <div
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                    className="w-14 h-14 rounded-xl bg-white p-1 border border-stone-200 shrink-0 cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-contain" />
                  </div>

                  <div
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h4 className="text-xs font-black text-[#1c1917] truncate hover:text-[#f27d26]">
                      {p.title}
                    </h4>
                    <p className="text-xs font-bold text-stone-600 mt-0.5">
                      {priceText}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        onSelectProduct(p);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#f27d26] text-white text-xs font-bold hover:bg-[#e06a16]"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => onToggleWishlist(p.id, e)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
