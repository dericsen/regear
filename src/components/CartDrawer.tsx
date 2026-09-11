// src/components/CartDrawer.tsx
import React, { useState } from "react";
import {
  X,
  Trash2,
  Leaf,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  Tag,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  cart,
  onClose,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((acc, item) => {
    if (item.type === "rent") {
      const monthly = item.product.rentPriceMonthly || Math.round(item.product.price * 0.025);
      return acc + (monthly * (item.rentalMonths || 1) * item.quantity);
    }
    return acc + (item.product.price * item.quantity);
  }, 0);

  const totalCo2Saved = cart.reduce((acc, item) => {
    return acc + (item.product.co2SavedKg || 35);
  }, 0);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderComplete(true);
      onClearCart();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-black text-[#1c1917]">Your Cart</h2>
            <span className="bg-[#f27d26] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {orderComplete ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#1c1917]">
                Order Confirmed!
              </h3>
              <p className="text-xs text-stone-600 max-w-xs mx-auto leading-relaxed">
                Thank you for contributing to the circular music economy! Your gear has been inspected and will be delivered in 2-3 business days.
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center space-x-1.5">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>You saved {totalCo2Saved || 45} kg CO₂ on this order!</span>
              </div>
              <button
                onClick={() => {
                  setOrderComplete(false);
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 bg-[#f27d26] text-white font-extrabold text-xs rounded-full"
              >
                Continue Browsing
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-[#f27d26] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-stone-700">Your cart is empty</p>
              <p className="text-xs text-stone-400">
                Explore our pre-loved guitars, keyboards, drums, and synthesizers.
              </p>
            </div>
          ) : (
            <>
              {/* CO2 Impact Banner */}
              <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200/80 flex items-center space-x-2.5 text-xs text-emerald-800 font-bold">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Leaf className="w-4 h-4 text-emerald-700" />
                </div>
                <span>
                  This order prevents ~{totalCo2Saved} kg of carbon emissions compared to buying newly manufactured instruments.
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cart.map((item, index) => {
                  const monthly = item.product.rentPriceMonthly || Math.round(item.product.price * 0.025);
                  const itemPrice = item.type === "rent"
                    ? monthly * (item.rentalMonths || 1)
                    : item.product.price;

                  return (
                    <div
                      key={index}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 flex space-x-3 items-center"
                    >
                      <div className="w-14 h-14 rounded-xl bg-white p-1 border border-stone-200 shrink-0 overflow-hidden flex items-center justify-center">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-[#1c1917] truncate">
                          {item.product.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              item.type === "rent"
                                ? "bg-orange-100 text-[#f27d26]"
                                : "bg-stone-200 text-stone-700"
                            }`}
                          >
                            {item.type === "rent"
                              ? `Rent (${item.rentalMonths || 1} mo)`
                              : "Buy Pre-loved"}
                          </span>
                          <span className="text-xs font-black text-[#1c1917]">
                            ${itemPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer / Checkout */}
        {!orderComplete && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-100 bg-[#faf8f5] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-600">
              <span>Insured Shipping</span>
              <span className="text-emerald-600">FREE</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-stone-800">Total</span>
              <span className="text-xl font-black text-[#1c1917]">
                ${totalAmount.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="w-full py-3.5 bg-[#f27d26] hover:bg-[#e06a16] disabled:opacity-60 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-[#f27d26]/20 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isCheckingOut ? "Securing Order..." : "Proceed to Checkout"}</span>
            </button>
            <div className="flex items-center justify-center space-x-2 text-[10px] text-stone-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>7-Day Return Guarantee & AI Authenticity Shield</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
