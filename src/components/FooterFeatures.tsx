// src/components/FooterFeatures.tsx
import React from "react";
import {
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Users,
  CreditCard
} from "lucide-react";

export default function FooterFeatures() {
  const features = [
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Safe & encrypted transactions with buyer protection escrow.",
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      icon: Sparkles,
      title: "Quality AI Verification",
      description: "Checked for acoustic resonance, electronics, and authenticity.",
      iconBg: "bg-orange-50 text-[#f27d26]",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "Hassle-free 7-day trial and return policy on all rentals & buys.",
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of musicians advancing the circular economy.",
      iconBg: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="border-t border-stone-200/80 pt-10 pb-8 mt-12 max-w-7xl mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={idx}
              className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white/70 border border-stone-200/60 shadow-xs hover:bg-white transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl ${feat.iconBg} flex items-center justify-center shrink-0 shadow-xs`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-[#1c1917] tracking-tight">
                  {feat.title}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                  {feat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle bottom footer copyright and SDGs tagline */}
      <div className="mt-8 pt-6 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-3 font-medium">
        <p>© 2026 ReGear Inc. — Supporting UN SDG 12 & SDG 13.</p>
        <p className="flex items-center space-x-2">
          <span>Play More, Waste Less.</span>
          <span>•</span>
          <span>Circular Music Economy</span>
        </p>
      </div>
    </div>
  );
}
