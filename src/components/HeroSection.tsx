// src/components/HeroSection.tsx
import React from "react";
import {
  Play,
  ShieldCheck,
  Leaf,
  DollarSign,
  Sparkles,
  ArrowRight,
  Music
} from "lucide-react";
import heroBandImg from "../assets/hero_band.jpg";

interface HeroSectionProps {
  onExplore: () => void;
  onHowItWorks: () => void;
  onOpenSDG: () => void;
  onOpenAIModal: () => void;
}

export default function HeroSection({
  onExplore,
  onHowItWorks,
  onOpenSDG,
  onOpenAIModal,
}: HeroSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-8">
      <div className="bg-[#faf6f0]/60 rounded-3xl p-6 sm:p-8 md:p-10 border border-[#f2ede4] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden">
        {/* Subtle decorative background music notes */}
        <div className="absolute top-4 right-1/2 text-orange-200/40 pointer-events-none select-none">
          <Music className="w-16 h-16 transform -rotate-12" />
        </div>

        {/* Left Column: Headline, Description, CTAs, 3 Value Chips */}
        <div className="lg:col-span-6 space-y-6 z-10">
          <div>
            <div className="flex items-center space-x-1.5 mb-1 text-[#f27d26]">
              <Sparkles className="w-4 h-4 fill-[#f27d26]" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Circular Music Marketplace
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#1c1917] tracking-tight leading-[1.1]">
              Good Gear.
              <span className="text-[#f27d26] block relative">
                Greater Impact.
                {/* Visual leaf accent graphic */}
                <svg
                  className="inline-block w-7 h-7 sm:w-8 sm:h-8 text-[#f27d26] ml-2 -mt-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12c0 3.6 2 6.8 5 8.5V18c0-3.3 2.7-6 6-6h1c1.7 0 3-1.3 3-3V7c0-2.8-2.2-5-5-5z" />
                </svg>
              </span>
            </h1>
          </div>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-lg font-medium">
            ReGear is a circular economy platform for renting and buying pre-loved
            musical instruments—affordable for you, sustainable for our planet.
          </p>

          {/* CTA Buttons from Screenshot */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              onClick={onExplore}
              className="px-6 py-3.5 bg-[#f27d26] hover:bg-[#e06a16] text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-md shadow-[#f27d26]/25 hover:shadow-lg hover:shadow-[#f27d26]/35 transition-all flex items-center space-x-2 active:scale-[0.98]"
            >
              <span>Explore Instruments</span>
            </button>

            <button
              onClick={onHowItWorks}
              className="px-5 py-3.5 bg-white hover:bg-stone-50 text-[#1c1917] font-bold rounded-2xl text-xs sm:text-sm border border-stone-200/90 shadow-sm transition-all flex items-center space-x-2 active:scale-[0.98]"
            >
              <span>How It Works</span>
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                <Play className="w-2.5 h-2.5 fill-[#f27d26] text-[#f27d26] ml-0.5" />
              </div>
            </button>
          </div>

          {/* 3 Value Propositions Chips below buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-stone-700">
            <div className="flex items-center space-x-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200/60 shadow-xs">
              <div className="w-5 h-5 rounded-full bg-orange-50 text-[#f27d26] flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Affordable Access</span>
            </div>

            <button
              onClick={onOpenAIModal}
              className="flex items-center space-x-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200/60 shadow-xs hover:border-orange-300 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-orange-50 text-[#f27d26] flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>AI Verified Quality</span>
            </button>

            <button
              onClick={onOpenSDG}
              className="flex items-center space-x-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200/60 shadow-xs hover:border-emerald-300 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <span>Sustainable Future</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Illustration & Floating Movement Badge */}
        <div className="lg:col-span-6 relative">
          {/* Floating Badge in Top Right Corner matching Screenshot */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 border border-stone-200 shadow-md flex items-center space-x-2.5 max-w-[220px]">
            <div className="w-8 h-8 rounded-full bg-[#f27d26] flex items-center justify-center shrink-0 text-white shadow-xs">
              <Leaf className="w-4 h-4 fill-white" />
            </div>
            <div>
              <p className="text-[11px] font-black text-[#1c1917] leading-tight">
                Join the Movement
              </p>
              <p className="text-[10px] font-medium text-stone-500 leading-tight">
                Music for you, better for Earth.
              </p>
            </div>
          </div>

          {/* Main Hero Visual Illustration */}
          <div className="relative rounded-3xl overflow-hidden shadow-md border border-stone-200/80 bg-white aspect-[16/10] sm:aspect-[16/10] flex items-center justify-center group">
            <img
              src={heroBandImg}
              alt="ReGear band jamming with electric guitar, red Nord keyboard synthesizer, and drum kit"
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
            />
            {/* Subtle warm overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
