// src/components/Modals.tsx
import React, { useState } from "react";
import {
  X,
  Sparkles,
  ShieldCheck,
  Leaf,
  RotateCcw,
  DollarSign,
  CheckCircle,
  Truck,
  Globe,
  Upload,
  Send,
  MessageSquare,
  Lock,
  User as UserIcon,
  Tag,
  ShoppingBag,
  ArrowRight,
  Calculator
} from "lucide-react";
import { User, Product, Message } from "../types";

// 1. HOW IT WORKS MODAL
export function HowItWorksModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const steps = [
    {
      num: "01",
      title: "Browse, Rent, or Buy Pre-loved",
      description: "Explore authenticated guitars, synthesizers, amps, and drums. Choose flexible monthly rentals (from $15/mo) or buy pre-loved gear at up to 60% below retail.",
      iconBg: "bg-orange-100 text-[#f27d26]",
    },
    {
      num: "02",
      title: "AI Quality & Acoustic Verification",
      description: "Every instrument is inspected with real harmonic frequency diagnostics, pot crackle analysis, and neck relief verification before leaving our hub.",
      iconBg: "bg-emerald-100 text-emerald-700",
    },
    {
      num: "03",
      title: "Play, Return, or Upgrade",
      description: "Enjoy playing with complete peace of mind. When your gig or creative project concludes, return or swap gear seamlessly. Keep the music circulating!",
      iconBg: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <span className="text-xs font-black text-[#f27d26] uppercase tracking-wider">
              Circular Economy Explained
            </span>
            <h2 className="text-2xl font-black text-[#1c1917] tracking-tight mt-1">
              How ReGear Works
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
              Empowering musicians with flexible gear access while eliminating manufacturing e-waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#faf8f5] border border-stone-200/80 space-y-2 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-stone-400">{s.num}</span>
                    <span className={`w-8 h-8 rounded-xl ${s.iconBg} flex items-center justify-center font-black text-xs`}>
                      ★
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#1c1917] leading-snug">
                    {s.title}
                  </h3>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed font-medium mt-2">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-stone-700">
                Over 2,500 kg of CO₂ avoided by ReGear musicians this year alone.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#f27d26] text-white text-xs font-black rounded-xl hover:bg-[#e06a16] shrink-0 ml-2"
            >
              Start Playing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. SDG IMPACT CALCULATOR MODAL
export function SDGImpactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<"guitar" | "keyboard" | "drum" | "amp">("guitar");
  const [rentCount, setRentCount] = useState(2);

  if (!isOpen) return null;

  const co2Data = {
    guitar: { co2: 38, timber: "1.2 kg rosewood / alder", factor: "Equal to 160 miles driven in a standard car" },
    keyboard: { co2: 54, timber: "3.4 kg plastics & lithium circuits", factor: "Equal to powering an apartment for 18 days" },
    drum: { co2: 82, timber: "8.5 kg 9-ply cured birch shells", factor: "Saves 1 mature hardwood tree branch" },
    amp: { co2: 45, timber: "4.8 kg copper windings & transformer steel", factor: "Prevents toxic heavy metal mining runoffs" },
  };

  const curr = co2Data[selectedCategory];
  const totalCo2Saved = curr.co2 * rentCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1c1917] tracking-tight">
                SDG Impact Calculator
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                UN Sustainable Development Goals 12 (Responsible Consumption) & 13 (Climate Action)
              </p>
            </div>
          </div>

          {/* Interactive Calculator */}
          <div className="p-4 bg-[#faf8f5] rounded-2xl border border-stone-200 space-y-4">
            <div>
              <label className="text-xs font-black text-stone-700 block mb-2">
                Select Instrument Type to Measure:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["guitar", "keyboard", "drum", "amp"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-2 text-xs font-bold rounded-xl capitalize transition-all border ${
                      selectedCategory === cat
                        ? "bg-[#f27d26] text-white border-[#f27d26] shadow-xs"
                        : "bg-white text-stone-700 border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1">
                <span>Number of instruments circulated / reused:</span>
                <span className="text-[#f27d26] font-black">{rentCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={rentCount}
                onChange={(e) => setRentCount(parseInt(e.target.value))}
                className="w-full accent-[#f27d26]"
              />
            </div>

            {/* Calculated Result */}
            <div className="p-4 bg-white rounded-xl border border-emerald-200/80 grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-2xl font-black text-emerald-700">
                  {totalCo2Saved} kg
                </span>
                <p className="text-[11px] font-bold text-stone-600 mt-0.5">
                  CO₂ Footprint Avoided
                </p>
              </div>
              <div>
                <span className="text-xs font-black text-stone-800 block pt-1">
                  {curr.timber}
                </span>
                <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                  Raw Timber & Ore Conserved
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-500 italic text-center">
              {curr.factor}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#f27d26] text-white font-extrabold rounded-xl text-xs hover:bg-[#e06a16]"
            >
              Close Calculator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. AI VERIFIED MODAL
export function AIVerifiedModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-orange-100 text-[#f27d26] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1c1917] tracking-tight">
                AI Verified Quality
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                Scientific instrument testing before every delivery
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-stone-600 leading-relaxed font-medium">
            <div className="p-3 bg-[#faf8f5] rounded-xl border border-stone-200">
              <h4 className="font-black text-[#1c1917] mb-1 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f27d26]" />
                <span>1. Acoustic Resonance FFT Analysis</span>
              </h4>
              <p>
                Our AI model records open notes and compares spectral harmonics with authentic golden-standard manufacturer curves to detect hidden structural cracks.
              </p>
            </div>

            <div className="p-3 bg-[#faf8f5] rounded-xl border border-stone-200">
              <h4 className="font-black text-[#1c1917] mb-1 flex items-center space-x-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Electronics Potentiometer & Solder Inspection</span>
              </h4>
              <p>
                Checks for audio signal scratchiness, hum levels, grounding integrity, and pickup output millivolts.
              </p>
            </div>

            <div className="p-3 bg-[#faf8f5] rounded-xl border border-stone-200">
              <h4 className="font-black text-[#1c1917] mb-1 flex items-center space-x-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                <span>3. Physical Action & Intonation Calibration</span>
              </h4>
              <p>
                Ensures proper fret leveling, zero fret buzz at standard string action (1.5mm–2.0mm), and exact 12th fret octave intonation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#f27d26] text-white font-extrabold rounded-xl text-xs hover:bg-[#e06a16]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. ABOUT US MODAL
export function AboutUsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4 text-left">
          <span className="text-xs font-black text-[#f27d26] uppercase tracking-wider">
            Our Mission & Story
          </span>
          <h2 className="text-2xl font-black text-[#1c1917] tracking-tight">
            Play More, Waste Less.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            Over 2.5 million instruments sit unused in attics, closets, and basements worldwide, while millions of emerging musicians cannot afford high-end instruments to pursue their creative voice.
          </p>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            <strong>ReGear</strong> transforms this paradigm into a thriving circular economy. By combining AI acoustic verification with flexible rental and pre-loved sales, we make pro-level instruments affordable, protect our planet’s forests, and reduce electronic waste.
          </p>
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-700">
            <span>Founded for Musicians, by Musicians</span>
            <span className="text-[#f27d26]">ReGear © 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. LIST YOUR GEAR MODAL ("List your gear. Earn. Inspire.")
export function ListGearModal({
  isOpen,
  currentUser,
  onClose,
  onSubmitGear,
  onOpenLogin,
}: {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onSubmitGear: (gearData: any) => void;
  onOpenLogin: () => void;
}) {
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Guitars");
  const [condition, setCondition] = useState("Like New");
  const [listingType, setListingType] = useState<"rent" | "buy" | "both">("both");
  const [price, setPrice] = useState("");
  const [rentPriceMonthly, setRentPriceMonthly] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-white w-full max-w-sm rounded-3xl border border-stone-200 p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-[#f27d26] flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#1c1917]">Sign In to List Gear</h3>
          <p className="text-xs text-stone-500">
            Please log in or register to publish your instrument to the ReGear circular community.
          </p>
          <div className="flex space-x-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#f27d26] text-white text-xs font-black hover:bg-[#e06a16]"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;
    onSubmitGear({
      title,
      brand: brand || title.split(" ")[0] || "Fender",
      category,
      condition,
      listingType,
      price: parseFloat(price),
      rentPriceMonthly: rentPriceMonthly ? parseFloat(rentPriceMonthly) : Math.round(parseFloat(price) * 0.025),
      description: description || `Certified authentic ${title} in ${condition} condition. Checked with AI diagnostic for full playability.`,
      images: imageUrl ? [imageUrl] : ["https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop"],
      demoVideo: demoUrl || "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl p-6 relative my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <span className="text-[10px] font-black text-[#f27d26] uppercase tracking-wider">
              Earn from your unused instruments
            </span>
            <h2 className="text-xl font-black text-[#1c1917] tracking-tight">
              List Your Gear
            </h2>
          </div>

          {/* Listing Type: Rent, Buy, Both */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1.5">
              Listing Objective
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "both", label: "Rent & Buy" },
                { id: "rent", label: "Rent Only" },
                { id: "buy", label: "Sale Only" },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setListingType(t.id as any)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    listingType === t.id
                      ? "border-[#f27d26] bg-orange-50 text-[#f27d26]"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Instrument Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fender Player Stratocaster Sunburst"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26] bg-white"
              >
                <option value="Guitars">Guitars</option>
                <option value="Keyboards">Keyboards & Synths</option>
                <option value="Drums">Drums & Percussion</option>
                <option value="Amps">Amps & Cabinets</option>
                <option value="Effects">Pedals & Effects</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26] bg-white"
              >
                <option value="Like New">Like New</option>
                <option value="Used">Used (Good)</option>
                <option value="Heavily Used">Vintage / Relic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Sale Price ($ USD)
              </label>
              <input
                type="number"
                required
                placeholder="750"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Monthly Rent ($/mo)
              </label>
              <input
                type="number"
                placeholder={price ? `${Math.round(parseFloat(price) * 0.025)}` : "18"}
                value={rentPriceMonthly}
                onChange={(e) => setRentPriceMonthly(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Image URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Description & Playability Notes
            </label>
            <textarea
              rows={2}
              placeholder="Describe setup, pickups, neck feel, and any cosmetic flaws..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#f27d26] hover:bg-[#e06a16] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-[#f27d26]/20 transition-all active:scale-95"
          >
            Publish to Circular Marketplace
          </button>
        </form>
      </div>
    </div>
  );
}

// 6. AUTH MODAL (LOGIN / REGISTER)
export function AuthModal({
  isOpen,
  isRegisterMode,
  authError,
  onClose,
  onSubmit,
  onToggleMode,
}: {
  isOpen: boolean;
  isRegisterMode: boolean;
  authError: string;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onToggleMode: () => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ username, email, password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl border border-stone-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4 text-left">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-[#f27d26] flex items-center justify-center mx-auto mb-2">
              <UserIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-[#1c1917] tracking-tight">
              {isRegisterMode ? "Join ReGear" : "Welcome Back"}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              {isRegisterMode
                ? "Start renting, buying, and sharing musical gear."
                : "Sign in to access your wishlist, rentals, and chats."}
            </p>
          </div>

          {authError && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-200">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. JimiHendrix"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26]"
              />
            </div>

            {isRegisterMode && (
              <div>
                <label className="text-[11px] font-bold text-stone-700 block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jimi@regear.music"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26]"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#f27d26] hover:bg-[#e06a16] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-[#f27d26]/20 transition-all active:scale-95"
            >
              {isRegisterMode ? "Create Free Account" : "Sign In"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-100">
            <button
              onClick={onToggleMode}
              className="text-xs font-bold text-stone-500 hover:text-[#f27d26] transition-colors"
            >
              {isRegisterMode
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. DIRECT CHAT MODAL
export function ChatModal({
  isOpen,
  sellerName,
  product,
  messages,
  onClose,
  onSendMessage,
}: {
  isOpen: boolean;
  sellerName: string;
  product?: Product | null;
  messages: Message[];
  onClose: () => void;
  onSendMessage: (text: string) => void;
}) {
  const [msg, setMsg] = useState("");

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    onSendMessage(msg.trim());
    setMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f27d26] text-white flex items-center justify-center font-bold text-xs">
              {sellerName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xs font-black text-[#1c1917]">{sellerName}</h3>
              <p className="text-[10px] text-emerald-600 font-bold">Online • Fast Response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product preview if present */}
        {product && (
          <div className="px-4 py-2 bg-stone-50 border-b border-stone-200 flex items-center space-x-2.5 text-xs">
            <img src={product.images[0]} alt="" className="w-8 h-8 object-contain rounded bg-white p-0.5 border" />
            <div className="truncate flex-1">
              <p className="font-bold text-stone-800 truncate">{product.title}</p>
              <p className="text-[10px] text-stone-500">${product.price} • {product.condition}</p>
            </div>
          </div>
        )}

        {/* Message area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-stone-50/50">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-xs text-stone-400">
              <p>Say hello to {sellerName}!</p>
              <p className="text-[10px] mt-1">Ask about trial periods, condition, or bundled cables.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.senderName === sellerName ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    m.senderName === sellerName
                      ? "bg-white border border-stone-200 text-stone-800"
                      : "bg-[#f27d26] text-white font-medium"
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[9px] text-stone-400 mt-0.5 px-1">
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-100 flex space-x-2">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 text-xs px-3 py-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26]"
          />
          <button
            type="submit"
            className="p-2 bg-[#f27d26] hover:bg-[#e06a16] text-white rounded-xl"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
