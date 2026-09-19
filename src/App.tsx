// src/App.tsx
import React, { useState, useEffect } from "react";
import {
  User,
  Product,
  CartItem,
  Comment,
  Message
} from "./types";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import PopularInstruments from "./components/PopularInstruments";
import ImpactSDG from "./components/ImpactSDG";
import CatalogSection from "./components/CatalogSection";
import FooterFeatures from "./components/FooterFeatures";
import ProductDetailModal from "./components/ProductDetailModal";
import CartDrawer from "./components/CartDrawer";
import WishlistModal from "./components/WishlistModal";
import PromoReels from "./components/PromoReels";
import { DEFAULT_PRODUCTS } from "./data/defaultProducts";
import {
  HowItWorksModal,
  SDGImpactModal,
  AIVerifiedModal,
  AboutUsModal,
  ListGearModal,
  AuthModal,
  ChatModal
} from "./components/Modals";

export default function App() {
  // --- Auth State with LocalStorage Persistence ---
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("regear_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("regear_token") || null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState("");

  // --- Products Data (Default to seed products immediately) ---
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);

  // --- Search & Filters ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "rent" | "buy" | "ai_verified">("all");

  // --- Shopping Cart & Wishlist ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("regear_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("regear_wishlist");
      return saved ? JSON.parse(saved) : ["prod-strat", "prod-nord"];
    } catch {
      return ["prod-strat", "prod-nord"];
    }
  });

  // --- View States & Modals ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSDGOpen, setIsSDGOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isListGearOpen, setIsListGearOpen] = useState(false);
  const [isReelsOpen, setIsReelsOpen] = useState(false);

  // --- Product Detail Modal ---
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productComments, setProductComments] = useState<Comment[]>([]);

  // --- Chat State ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatPartner, setActiveChatPartner] = useState<{ id: string; name: string } | null>(null);
  const [chatProduct, setChatProduct] = useState<Product | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  // Sync Cart & Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("regear_cart", JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("regear_wishlist", JSON.stringify(wishlistIds));
    } catch (e) {}
  }, [wishlistIds]);

  // Fetch products with local fallback
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory && selectedCategory !== "all") params.append("category", selectedCategory);
      if (activeFilter === "rent") params.append("listingType", "rent");
      if (activeFilter === "buy") params.append("listingType", "buy");
      if (activeFilter === "ai_verified") params.append("aiVerified", "true");

      const res = await fetch(`/api/products?${params.toString()}`);
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setProducts(data);
        return;
      }
    } catch (err) {
      console.warn("Backend API unreachable, using local products fallback:", err);
    } finally {
      setIsLoading(false);
    }

    // Fallback filtering if backend is offline or static preview
    let filtered = [...DEFAULT_PRODUCTS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (activeFilter === "rent") {
      filtered = filtered.filter((p) => p.listingType === "rent" || (p.rentPriceMonthly && p.rentPriceMonthly > 0));
    }
    if (activeFilter === "buy") {
      filtered = filtered.filter((p) => p.listingType === "buy" || p.listingType === "both" || !p.listingType);
    }
    if (activeFilter === "ai_verified") {
      filtered = filtered.filter((p) => p.isVerifiedGear);
    }
    setProducts(filtered);
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, activeFilter]);

  // Load comments when selected product changes
  useEffect(() => {
    if (selectedProduct) {
      fetchComments(selectedProduct.id);
    }
  }, [selectedProduct]);

  const fetchComments = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setProductComments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!selectedProduct || !currentUser) return;
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        fetchComments(selectedProduct.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Wishlist handler
  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Cart handler
  const handleAddToCart = (product: Product, type: "rent" | "buy", rentalMonths?: number) => {
    setCart((prev) => [
      ...prev,
      {
        product,
        type,
        rentalMonths: rentalMonths || 1,
        quantity: 1,
      },
    ]);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleRemoveCartItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Chat handlers
  const handleContactSeller = (sellerId: string, sellerName: string, product?: Product) => {
    setActiveChatPartner({ id: sellerId, name: sellerName });
    if (product) setChatProduct(product);
    setSelectedProduct(null);
    setIsChatOpen(true);
    fetchChat(sellerId);
  };

  const fetchChat = async (partnerId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChatPartner || !token) return;
    try {
      const res = await fetch(`/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: activeChatPartner.id,
          productId: chatProduct ? chatProduct.id : undefined,
          content,
        }),
      });
      if (res.ok) {
        fetchChat(activeChatPartner.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Real Auth submission (Register / Login)
  const handleAuthSubmit = async (data: { username: string; email?: string; password: string }) => {
    setAuthError("");
    const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const resData = await res.json();
        if (res.ok) {
          setToken(resData.token);
          setCurrentUser(resData.user);
          localStorage.setItem("regear_token", resData.token);
          localStorage.setItem("regear_user", JSON.stringify(resData.user));
          setIsLoginModalOpen(false);
          return;
        } else {
          setAuthError(resData.error || (isRegisterMode ? "Failed to create account" : "Invalid username or password"));
          return;
        }
      } else {
        const text = await res.text();
        console.error("Non-JSON response from server:", res.status, text.slice(0, 150));
        setAuthError(`Server error (${res.status}): Please check backend service.`);
      }
    } catch (e: any) {
      console.error("Authentication fetch error:", e);
      setAuthError("Network connection error. Could not reach authentication server.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("regear_token");
    localStorage.removeItem("regear_user");
  };

  // List gear submission
  const handleSubmitGear = async (gearData: any) => {
    if (!currentUser || !token) {
      setIsLoginModalOpen(true);
      return;
    }

    const newProduct: Product = {
      id: "prod-" + Math.random().toString(36).substring(2, 9),
      title: gearData.title,
      brand: gearData.brand || "Custom",
      description: gearData.description,
      price: gearData.price,
      rentPriceMonthly: gearData.rentPriceMonthly,
      listingType: gearData.listingType,
      condition: gearData.condition,
      category: gearData.category,
      images: gearData.images,
      demoVideo: gearData.demoVideo || "",
      sellerId: currentUser.id,
      sellerName: currentUser.username,
      sellerVerified: currentUser.isVerified,
      sellerRating: currentUser.rating,
      isVerifiedGear: true,
      verificationScore: 98,
      rating: 5.0,
      reviewCount: 0,
      co2SavedKg: 35,
      createdAt: new Date().toISOString(),
    };

    // Optimistically prepend to active products list
    setProducts((prev) => [newProduct, ...prev]);

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(gearData),
      });
    } catch (e) {
      console.warn("Product listed in session:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1917] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. TOP HEADER & FLOATING SEARCH BAR */}
      <Header
        currentUser={currentUser}
        cart={cart}
        wishlistIds={wishlistIds}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenLogin={() => {
          setIsRegisterMode(false);
          setIsLoginModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenSDG={() => setIsSDGOpen(true)}
        onOpenAIModal={() => setIsAIOpen(true)}
        onOpenAboutUs={() => setIsAboutUsOpen(true)}
        onOpenListGear={() => setIsListGearOpen(true)}
        onOpenReels={() => setIsReelsOpen(true)}
        onOpenProfile={() => setIsListGearOpen(true)}
        onGoHome={() => {
          setActiveFilter("all");
          setSelectedCategory("all");
          setSearchQuery("");
        }}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <HeroSection
          onExplore={() => {
            const catalogElem = document.getElementById("catalog-section");
            if (catalogElem) catalogElem.scrollIntoView({ behavior: "smooth" });
          }}
          onHowItWorks={() => setIsHowItWorksOpen(true)}
          onOpenSDG={() => setIsSDGOpen(true)}
          onOpenAIModal={() => setIsAIOpen(true)}
        />

        {/* 3. MIDDLE SECTION (TWO COLUMNS: POPULAR INSTRUMENTS & OUR IMPACT SDGs) */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (lg:col-span-7): Popular Instruments Carousel */}
            <div className="lg:col-span-7">
              <PopularInstruments
                products={products}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                onSelectProduct={setSelectedProduct}
                onViewAll={() => {
                  const catalogElem = document.getElementById("catalog-section");
                  if (catalogElem) catalogElem.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>

            {/* Right Column (lg:col-span-5): Our Impact (SDGs) & "List your gear" */}
            <div className="lg:col-span-5">
              <ImpactSDG
                onOpenSDGModal={() => setIsSDGOpen(true)}
                onOpenListGear={() => setIsListGearOpen(true)}
              />
            </div>
          </div>
        </section>

        {/* 4. FULL CATALOG EXPLORE SECTION */}
        <div id="catalog-section">
          <CatalogSection
            products={products}
            wishlistIds={wishlistIds}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={setSelectedProduct}
          />
        </div>

        {/* 5. FOOTER VALUE PROPOSITIONS BAR */}
        <FooterFeatures />
      </main>

      {/* --- MODALS & DRAWERS --- */}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          currentUser={currentUser}
          wishlistIds={wishlistIds}
          comments={productComments}
          onClose={() => setSelectedProduct(null)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
          onContactSeller={handleContactSeller}
          onAddComment={handleAddComment}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        cart={cart}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        products={products}
        wishlistIds={wishlistIds}
        onClose={() => setIsWishlistOpen(false)}
        onToggleWishlist={handleToggleWishlist}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsWishlistOpen(false);
        }}
      />

      {/* How It Works Modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      {/* SDG Impact Modal */}
      <SDGImpactModal
        isOpen={isSDGOpen}
        onClose={() => setIsSDGOpen(false)}
      />

      {/* AI Verified Modal */}
      <AIVerifiedModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      {/* About Us Modal */}
      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
      />

      {/* List Your Gear Modal */}
      <ListGearModal
        isOpen={isListGearOpen}
        currentUser={currentUser}
        onClose={() => setIsListGearOpen(false)}
        onSubmitGear={handleSubmitGear}
        onOpenLogin={() => {
          setIsRegisterMode(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isLoginModalOpen}
        isRegisterMode={isRegisterMode}
        authError={authError}
        onClose={() => setIsLoginModalOpen(false)}
        onSubmit={handleAuthSubmit}
        onToggleMode={() => {
          setAuthError("");
          setIsRegisterMode(!isRegisterMode);
        }}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        sellerName={activeChatPartner ? activeChatPartner.name : "Seller"}
        product={chatProduct}
        messages={chatMessages}
        onClose={() => {
          setIsChatOpen(false);
          setActiveChatPartner(null);
          setChatProduct(null);
        }}
        onSendMessage={handleSendMessage}
      />

      {/* Promo Tone Reels Modal */}
      {isReelsOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="p-4 flex items-center justify-between text-white border-b border-stone-800">
            <span className="text-sm font-black tracking-tight flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f27d26] animate-pulse"></span>
              <span>ReGear Tone Reels 🎥</span>
            </span>
            <button
              onClick={() => setIsReelsOpen(false)}
              className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-white rounded-full text-xs font-bold"
            >
              Exit Reels
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <PromoReels
              products={products}
              currentUser={currentUser}
              token={token}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onContactSeller={handleContactSeller}
              onViewDetails={(p) => {
                setSelectedProduct(p);
                setIsReelsOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
