// src/components/ImpactSDG.tsx
import React from "react";
import {
  Leaf,
  RefreshCw,
  Users,
  Globe,
  ChevronRight,
  Sparkles,
  ArrowRight
} from "lucide-react";
import listBoxImg from "../assets/list_box.jpg";

interface ImpactSDGProps {
  onOpenSDGModal: () => void;
  onOpenListGear: () => void;
}

export default function ImpactSDG({
  onOpenSDGModal,
  onOpenListGear,
}: ImpactSDGProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-[#1c1917] tracking-tight">
          Our Impact (SDGs)
        </h2>
        <button
          onClick={onOpenSDGModal}
          className="text-xs sm:text-sm font-bold text-stone-500 hover:text-[#f27d26] transition-colors flex items-center space-x-1"
        >
          <span>Live impact across our community</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Metric Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2.5">
        {/* Metric 1 */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xl font-black text-[#1c1917] tracking-tight">
              2,547
            </span>
            <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-stone-800 leading-tight">
              kg CO₂ avoided
            </p>
            <p className="text-[9px] text-stone-400 mt-0.5 leading-tight font-medium">
              Together we make air cleaner
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xl font-black text-[#1c1917] tracking-tight">
              1,283
            </span>
            <div className="w-6 h-6 rounded-full bg-orange-50 text-[#f27d26] flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-stone-800 leading-tight">
              Instruments given new life
            </p>
            <p className="text-[9px] text-stone-400 mt-0.5 leading-tight font-medium">
              Reuse. Extend. Inspire.
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xl font-black text-[#1c1917] tracking-tight">
              3,892
            </span>
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-stone-800 leading-tight">
              Happy musicians
            </p>
            <p className="text-[9px] text-stone-400 mt-0.5 leading-tight font-medium">
              Access to gear, access to dreams
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xl font-black text-[#1c1917] tracking-tight">
              12
            </span>
            <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-stone-800 leading-tight">
              Countries
            </p>
            <p className="text-[9px] text-stone-400 mt-0.5 leading-tight font-medium">
              One global movement
            </p>
          </div>
        </div>
      </div>

      {/* Orange Callout Banner: "List your gear. Earn. Inspire." */}
      <div className="bg-gradient-to-r from-[#f27d26] to-[#eb6412] text-white rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-sm flex items-center justify-between">
        {/* Decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />

        {/* Left Copy & CTA */}
        <div className="z-10 space-y-2 max-w-[280px]">
          <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
            List your gear. Earn. Inspire.
          </h3>
          <p className="text-xs text-white/90 font-medium leading-normal">
            Give your unused instruments a new purpose and earn passive income or quick cash.
          </p>
          <div className="pt-1">
            <button
              onClick={onOpenListGear}
              className="px-5 py-2.5 bg-white hover:bg-stone-50 text-[#f27d26] font-black rounded-full text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <span>List Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="w-32 sm:w-36 h-28 sm:h-32 shrink-0 relative flex items-center justify-center">
          <img
            src={listBoxImg}
            alt="Musician boxing and listing musical gear"
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
