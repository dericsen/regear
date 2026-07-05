import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Guitar,
  MessageSquare,
  Shield,
  BadgeCheck,
  Star,
  Compass,
  MapPin,
  Calendar,
  Send,
  UserCheck,
  User as UserIcon,
  Play,
  Pause,
  Sliders,
  DollarSign,
  AlertTriangle,
  X,
  Volume2,
  Lock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  Image as ImageIcon,
  Check,
  CheckCircle,
  RefreshCw,
  Edit,
  Trash2,
  Video,
} from "lucide-react";
import { User, Product, Comment, Message, MeetupRequest, Review } from "./types";
import PromoReels from "./components/PromoReels";

const CATEGORIES = ["Guitars", "Keyboards", "Amps", "Effects", "Other"];
const CONDITIONS = ["New", "Like New", "Used", "Heavily Used"];

export default function App() {
  // --- Auth & Session State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "", role: "buyer" as any });
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState("");

  // --- Profile state ---
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileBio, setProfileBio] = useState("");
  const [profileGenre, setProfileGenre] = useState("");
  const [profileInstruments, setProfileInstruments] = useState("");

  // --- Active Tab / View ---
  const [activeTab, setActiveTab] = useState<"marketplace" | "sell" | "chat" | "meetups" | "profile">("marketplace");

  // --- Marketplace Filters ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // --- Products Data ---
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Product Detail View States ---
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isMeetupModalOpen, setIsMeetupModalOpen] = useState(false);
  const [meetupMessage, setMeetupMessage] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // --- Sell Gear Form State ---
  const [newGear, setNewGear] = useState({
    title: "",
    description: "",
    price: "",
    condition: "Used" as any,
    category: "Guitars",
    imageUrl: "",
    demoUrl: "",
  });
  const [isAIPriceCalculating, setIsAIPriceCalculating] = useState(false);
  const [aiPriceRange, setAiPriceRange] = useState<{ min: number; max: number; tip: string } | null>(null);
  const [aiAuthenticityCheck, setAiAuthenticityCheck] = useState<{ score: number; reasoning: string } | null>(null);
  const [isSellingLoading, setIsSellingLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // --- Chat State ---
  const [conversations, setConversations] = useState<{ id: string; name: string; lastMessage: string; time: string }[]>([]);
  const [activeChatPartner, setActiveChatPartner] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // --- Meetups State ---
  const [meetups, setMeetups] = useState<MeetupRequest[]>([]);
  const [isMeetupsLoading, setIsMeetupsLoading] = useState(false);

  // --- Audio Waveform Simulator State ---
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // --- Notification Message ---
  const [systemTip, setSystemTip] = useState<string | null>(
    "Welcome to Regear Studio - Trust-rated authentic musical instruments marketplace."
  );

  // --- Fetch Products on mount ---
  useEffect(() => {
    fetchProducts();
    // Auto restore session if saved
    const savedToken = localStorage.getItem("regear_token");
    const savedUser = localStorage.getItem("regear_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
    } else {
      // Direct auto-login as David the buyer for stellar frictionless initial loading experience
      handleInstantLogin("DavidSustain");
    }
  }, []);

  // Poll for active chat or comments if selected product / partner is active
  useEffect(() => {
    let interval: any;
    if (activeChatPartner && token) {
      fetchChatMessages(activeChatPartner);
      interval = setInterval(() => {
        fetchChatMessages(activeChatPartner);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [activeChatPartner, token]);

  useEffect(() => {
    let interval: any;
    if (selectedProduct) {
      fetchProductComments(selectedProduct.id);
      interval = setInterval(() => {
        fetchProductComments(selectedProduct.id);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [selectedProduct]);

  // Audio wave visualizer effect
  useEffect(() => {
    if (isPlayingDemo) {
      drawWaveform();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearWaveform();
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlayingDemo, selectedProduct]);

  // --- Audio Waveform Drawing ---
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#f27d26"; // Accent Orange
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const sliceWidth = canvas.width / 40;
      for (let i = 0; i < 40; i++) {
        const x = i * sliceWidth + sliceWidth / 2;
        // Generate random amplitude peaks scaled nicely
        const noise = Math.sin(i * 0.15 + phase) * Math.cos(i * 0.05 - phase);
        const amp = Math.abs(noise) * (canvas.height * 0.75);
        const yTop = (canvas.height - amp) / 2;
        const yBottom = (canvas.height + amp) / 2;
        ctx.moveTo(x, yTop);
        ctx.lineTo(x, yBottom);
      }
      ctx.stroke();
      phase += 0.12;
      animationRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const clearWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  // --- API Integrations ---

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const q = new URLSearchParams();
      if (selectedCategory !== "all") q.append("category", selectedCategory);
      if (selectedCondition !== "all") q.append("condition", selectedCondition);
      if (searchQuery) q.append("search", searchQuery);
      if (minPrice) q.append("minPrice", minPrice);
      if (maxPrice) q.append("maxPrice", maxPrice);

      const res = await fetch(`/api/products?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        // Sync selected product with updated fields if open
        if (selectedProduct) {
          const updatedSelected = data.find((p: Product) => p.id === selectedProduct.id);
          if (updatedSelected) setSelectedProduct(updatedSelected);
        }
      }
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchProductComments = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedProduct || !newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newCommentText }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewCommentText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const requestMeetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedProduct) return;

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/meetup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: meetupMessage }),
      });
      if (res.ok) {
        showSuccessTip("Trial meetup requested successfully! The seller will receive your details.");
        setIsMeetupModalOpen(false);
        setMeetupMessage("");
        fetchMeetups();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to make request.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const postReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedProduct) return;

    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (res.ok) {
        showSuccessTip("Thank you! Your review has been recorded to build trustworthy seller stars.");
        setIsReviewModalOpen(false);
        setReviewComment("");
        fetchProducts(); // Refresh seller scores on products
      } else {
        const err = await res.json();
        alert(err.error || "Cannot review product.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVerifiedBadge = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/verify-badge`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        showSuccessTip("Toggle verified status updated!");
        if (currentUser && currentUser.id === userId) {
          const updatedUser = { ...currentUser, isVerified: data.user.isVerified };
          setCurrentUser(updatedUser);
          localStorage.setItem("regear_user", JSON.stringify(updatedUser));
        }
        // Sync selected product's badge state if they own it
        if (selectedProduct && selectedProduct.sellerId === userId) {
          setSelectedProduct((prev) => prev ? { ...prev, sellerVerified: data.user.isVerified } : null);
        }
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Real-time Price Suggestions on list input ---
  const getAIPriceMeter = async () => {
    if (!newGear.title || !newGear.category) return;
    setIsAIPriceCalculating(true);
    setAiPriceRange(null);
    setAiAuthenticityCheck(null);
    try {
      // 1. Get prices
      const q = new URLSearchParams({
        title: newGear.title,
        category: newGear.category,
        condition: newGear.condition,
        description: newGear.description,
      });
      const res1 = await fetch(`/api/products/smart-price?${q.toString()}`);
      if (res1.ok) {
        const data1 = await res1.json();
        setAiPriceRange(data1);
      }

      // 2. Run automatic counterfeit scan simulation
      const res2 = await fetch("/api/ai/verify-gear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newGear.title,
          description: newGear.description,
          price: newGear.price || "300",
        }),
      });
      if (res2.ok) {
        const data2 = await res2.json();
        setAiAuthenticityCheck(data2);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAIPriceCalculating(false);
    }
  };

  // Trigger preview analysis whenever price, title, or category changes slightly
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newGear.title && activeTab === "sell") {
        getAIPriceMeter();
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [newGear.title, newGear.category, newGear.condition, activeTab]);

  const handleSellGear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!newGear.title || !newGear.price || !newGear.description) {
      alert("Please complete required product fields");
      return;
    }

    setIsSellingLoading(true);
    try {
      if (editingProductId) {
        const res = await fetch(`/api/products/${editingProductId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newGear.title,
            description: newGear.description,
            price: newGear.price,
            condition: newGear.condition,
            category: newGear.category,
            images: newGear.imageUrl ? [newGear.imageUrl] : [],
            demoVideo: newGear.demoUrl,
          }),
        });
        if (res.ok) {
          const updated = await res.json();
          showSuccessTip(`Listing "${updated.title}" updated successfully!`);
          setEditingProductId(null);
          setNewGear({
            title: "",
            description: "",
            price: "",
            condition: "Used",
            category: "Guitars",
            imageUrl: "",
            demoUrl: "",
          });
          setAiPriceRange(null);
          setAiAuthenticityCheck(null);
          setSelectedProduct(updated);
          setActiveTab("marketplace");
          fetchProducts();
        } else {
          const err = await res.json();
          alert(err.error || "Failed to update gear listing.");
        }
        return;
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newGear.title,
          description: newGear.description,
          price: newGear.price,
          condition: newGear.condition,
          category: newGear.category,
          images: newGear.imageUrl ? [newGear.imageUrl] : [],
          demoVideo: newGear.demoUrl,
        }),
      });
      if (res.ok) {
        const added = await res.json();
        showSuccessTip(`Listing "${added.title}" uploaded! Verified authenticity scan rating: ${added.verificationScore}%`);
        setNewGear({
          title: "",
          description: "",
          price: "",
          condition: "Used",
          category: "Guitars",
          imageUrl: "",
          demoUrl: "",
        });
        setAiPriceRange(null);
        setAiAuthenticityCheck(null);
        setActiveTab("marketplace");
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed listing gear.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSellingLoading(false);
    }
  };

  // --- Messaging chat panel triggers ---
  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChatMessages = async (partnerId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/chat/messages/${partnerId}`, {
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

  const startInstantChatWithSeller = (sellerId: string, sellerName: string) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (sellerId === currentUser.id) {
      showSuccessTip("This is your instrument listing. Looking stylish!");
      return;
    }
    // Set active partner, switch screen, query messages
    setActiveChatPartner(sellerId);
    setActiveTab("chat");
    fetchChatMessages(sellerId);
    showSuccessTip(`Connecting to ${sellerName}... Send a quick message to negotiate or verify testing details.`);
  };

  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeChatPartner || !newMessageText.trim()) return;

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: activeChatPartner,
          content: newMessageText,
          productId: selectedProduct?.id,
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setChatMessages((prev) => [...prev, msg]);
        setNewMessageText("");
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Meetups Operations ---
  const fetchMeetups = async () => {
    if (!token) return;
    setIsMeetupsLoading(true);
    try {
      const res = await fetch("/api/meetups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMeetups(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMeetupsLoading(false);
    }
  };

  const updateMeetupTracker = async (id: string, newStatus: "accepted" | "declined") => {
    try {
      const res = await fetch(`/api/meetups/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showSuccessTip(`Meetup status successfully updated to: ${newStatus.toUpperCase()}`);
        fetchMeetups();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Profile Edits ---
  const loadProfileFields = () => {
    if (!currentUser) return;
    setProfileBio(currentUser.bio || "");
    setProfileGenre(currentUser.musicGenre || "");
    setProfileInstruments(currentUser.instrumentsOwned?.join(", ") || "");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const parsedInstruments = profileInstruments
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: profileBio,
          musicGenre: profileGenre,
          instrumentsOwned: parsedInstruments,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem("regear_user", JSON.stringify(data.user));
        setIsProfileEditing(false);
        showSuccessTip("Dynamic profile specs saved to Regear database.");
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Auth Controls ---
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const url = isRegisterMode ? "/api/auth/register" : "/api/auth/login";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: authForm.username,
          email: authForm.email,
          password: authForm.password,
          role: authForm.role,
        }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        let cleanText = text.substring(0, 150).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        if (cleanText.includes("NOT_FOUND") || cleanText.includes("Action required") || cleanText.includes("The page could not be found")) {
          cleanText = "Platform proxy block. Please open the app in a NEW TAB (button at top-right of the preview window) to bypass browser cookie security constraints.";
        }
        throw new Error(cleanText || `Server returned status code ${res.status}`);
      }

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        return;
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem("regear_token", data.token);
      localStorage.setItem("regear_user", JSON.stringify(data.user));
      setIsLoginModalOpen(false);
      showSuccessTip(`Welcome back, ${data.user.username}! Mode: ${data.user.role.toUpperCase()}`);
      
      // Cleanup forms
      setAuthForm({ username: "", email: "", password: "", role: "buyer" });
    } catch (err: any) {
      setAuthError(err.message || "Network error logging in");
    }
  };

  const handleInstantLogin = async (username: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: "passwordbypass" }), // Fast simulated gateway
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("regear_token", data.token);
        localStorage.setItem("regear_user", JSON.stringify(data.user));
        showSuccessTip(`Logged in as ${data.user.username} (${data.user.role === "seller" ? "Seller" : "Buyer"}).`);
      }
    } catch (e) {
      console.warn("Bypass auth error, fallback to mock memory direct login local token.", e);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("regear_token");
    localStorage.removeItem("regear_user");
    showSuccessTip("Goodbye! See you down the tour road.");
    setActiveTab("marketplace");
  };

  const handleStartEditGear = (prod: Product) => {
    setEditingProductId(prod.id);
    setNewGear({
      title: prod.title,
      description: prod.description,
      price: prod.price.toString(),
      condition: prod.condition as any,
      category: prod.category,
      imageUrl: prod.images[0] || "",
      demoUrl: prod.demoVideo || "",
    });
    setAiPriceRange({
      min: prod.suggestedPriceMin || Math.round(prod.price * 0.9),
      max: prod.suggestedPriceMax || Math.round(prod.price * 1.1),
      tip: "Listing details are loaded. Adjust specs to view live market suggested prices."
    });
    setAiAuthenticityCheck({
      score: prod.verificationScore || 95,
      reasoning: "Reviewing active product editing authenticity screening profile."
    });
    setActiveTab("sell");
  };

  const handleDeleteGear = async (productId: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        showSuccessTip("Listing deleted successfully.");
        setSelectedProduct(null);
        fetchProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete listing.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // System alert tips logic
  const showSuccessTip = (msg: string) => {
    setSystemTip(msg);
    setTimeout(() => {
      setSystemTip((curr) => (curr === msg ? null : curr));
    }, 9000);
  };

  // Run initial filters sync
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedCondition]);

  return (
    <div id="elegant-dark-node" className="bg-[#0a0a0b] text-[#e0e0e0] font-sans min-h-screen flex flex-col antialiased selection:bg-[#f27d26] selection:text-black">
      
      {/* Main Header Navigation */}
      <nav id="header-nav-comp" className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#09090a] sticky top-0 z-40">
        <div className="flex items-center space-x-10">
          <button
            onClick={() => {
              setSelectedProduct(null);
              setActiveTab("marketplace");
              fetchProducts();
            }}
            className="text-2xl font-extrabold tracking-tighter text-[#f27d26] hover:opacity-90 flex items-center space-x-2"
          >
            <span>REGEAR</span>
            <span className="text-[10px] tracking-widest font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">STUDIO</span>
          </button>
          
          <div className="hidden lg:flex space-x-7 text-sm font-semibold tracking-wide">
            <button
              onClick={() => {
                setActiveTab("marketplace");
                setSelectedProduct(null);
              }}
              className={`pb-1 transition-all hover:text-white ${
                activeTab === "marketplace" ? "text-white border-b-2 border-[#f27d26]" : "text-white/50"
              }`}
            >
              Browse Gear
            </button>
            <button
              onClick={() => {
                setActiveTab("reels");
                setSelectedProduct(null);
              }}
              className={`pb-1 transition-all hover:text-white flex items-center space-x-1.5 ${
                activeTab === "reels" ? "text-white border-b-2 border-[#f27d26]" : "text-white/50"
              }`}
            >
              <Video className="w-3.5 h-3.5 text-[#f27d26]" />
              <span>Gear Reels 🎥</span>
            </button>
            <button
              onClick={() => {
                if (!currentUser) setIsLoginModalOpen(true);
                else {
                  setActiveTab("sell");
                  setAiPriceRange(null);
                }
              }}
              className={`pb-1 transition-all hover:text-white ${
                activeTab === "sell" ? "text-white border-b-2 border-[#f27d26]" : "text-white/50"
              }`}
            >
              + Sell Gear
            </button>
            <button
              onClick={() => {
                if (!currentUser) setIsLoginModalOpen(true);
                else {
                  setActiveTab("chat");
                  fetchConversations();
                }
              }}
              className={`pb-1 transition-all hover:text-white relative ${
                activeTab === "chat" ? "text-white border-b-2 border-[#f27d26]" : "text-white/50"
              }`}
            >
              Chat Room
            </button>
            <button
              onClick={() => {
                if (!currentUser) setIsLoginModalOpen(true);
                else {
                  setActiveTab("meetups");
                  fetchMeetups();
                }
              }}
              className={`pb-1 transition-all hover:text-white ${
                activeTab === "meetups" ? "text-white border-b-2 border-[#f27d26]" : "text-white/50"
              }`}
            >
              Try-Out Requests
            </button>
          </div>
        </div>

        {/* Header Right Sidebar controls */}
        <div className="flex items-center space-x-6">
          <div className="relative hidden md:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
              placeholder="Search gear..."
              className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-5 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-[#f27d26] text-white placeholder-white/30 transition-all font-medium"
            />
            <Search className="absolute left-4 top-3 text-white/30 w-4 h-4" />
          </div>

          <div id="auth-state-header" className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setActiveTab("profile");
                    loadProfileFields();
                  }}
                  className="group flex items-center space-x-3 text-left focus:outline-none"
                >
                  <img
                    src={currentUser.profileImage}
                    alt={currentUser.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/5 group-hover:border-[#f27d26] transition-all"
                  />
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-white group-hover:text-[#f27d26] transition-all leading-tight">
                      {currentUser.username}
                    </p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                      {currentUser.role} • {currentUser.isVerified ? "Verified" : "Standard"}
                    </p>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[11px] font-semibold text-white/70 hover:text-white transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsRegisterMode(false);
                  setIsLoginModalOpen(true);
                }}
                className="px-4 py-2 bg-[#f27d26] text-black font-extrabold rounded-lg text-xs tracking-wider uppercase hover:opacity-95 shadow-md shadow-[#f27d26]/10 transition-all flex items-center space-x-1"
              >
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Global Live System Tip Notification Banner */}
      {systemTip && (
        <div className="bg-[#f27d26]/10 border-b border-[#f27d26]/20 px-8 py-3 text-xs text-[#f27d26]/90 font-medium flex items-center justify-between transition-all">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 shrink-0 animate-spin" />
            <span>{systemTip}</span>
          </div>
          <button onClick={() => setSystemTip(null)} className="hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Secondary Subnav for responsive small screens */}
      <div className="lg:hidden bg-[#0d0d0f] border-b border-white/5 p-3 flex justify-around text-xs font-bold text-white/50">
        <button
          onClick={() => {
            setActiveTab("marketplace");
            setSelectedProduct(null);
          }}
          className={activeTab === "marketplace" ? "text-[#f27d26]" : ""}
        >
          Browse
        </button>
        <button
          onClick={() => {
            setActiveTab("reels");
            setSelectedProduct(null);
          }}
          className={activeTab === "reels" ? "text-[#f27d26]" : ""}
        >
          Reels 🎥
        </button>
        <button
          onClick={() => {
            if (!currentUser) setIsLoginModalOpen(true);
            else setActiveTab("sell");
          }}
          className={activeTab === "sell" ? "text-[#f27d26]" : ""}
        >
          + Sell
        </button>
        <button
          onClick={() => {
            if (!currentUser) setIsLoginModalOpen(true);
            else {
              setActiveTab("chat");
              fetchConversations();
            }
          }}
          className={activeTab === "chat" ? "text-[#f27d26]" : ""}
        >
          Chat
        </button>
        <button
          onClick={() => {
            if (!currentUser) setIsLoginModalOpen(true);
            else {
              setActiveTab("meetups");
              fetchMeetups();
            }
          }}
          className={activeTab === "meetups" ? "text-[#f27d26]" : ""}
        >
          Trial
        </button>
      </div>

      {/* Main Content Layout container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* VIEW 0: PROMO REELS FEED */}
        {activeTab === "reels" && (
          <PromoReels
            products={products}
            currentUser={currentUser}
            token={token}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onRequestMeetup={(product) => {
              if (!currentUser) {
                setIsLoginModalOpen(true);
                return;
              }
              setSelectedProduct(product);
              setMeetupMessage(`Hey ${product.sellerName}, I watched your promo video reel for the "${product.title}" and loved the tone! Would love to request a test meetup or try-out session.`);
              setIsMeetupModalOpen(true);
            }}
            onContactSeller={(sellerId, sellerName, product) => {
              if (!currentUser) {
                setIsLoginModalOpen(true);
                return;
              }
              if (product) setSelectedProduct(product);
              startInstantChatWithSeller(sellerId, sellerName);
            }}
            onViewDetails={(product) => {
              setSelectedProduct(product);
              setActiveTab("marketplace");
            }}
          />
        )}

        {/* VIEW 1: MARKETPLACE */}
        {activeTab === "marketplace" && (
          <>
            {/* Sidebar filter controls (Only displayed in browse index) */}
            {!selectedProduct && (
              <aside className="w-full md:w-64 border-b md:border-r border-white/5 p-6 flex flex-col space-y-6 flex-none bg-[#0d0d0f]">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4 font-bold flex items-center">
                    <Sliders className="w-3.5 h-3.5 mr-1.5 text-[#f27d26]" />
                    Gear Categories
                  </h3>
                  <div className="flex flex-wrap md:flex-col gap-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-all flex justify-between items-center ${
                        selectedCategory === "all"
                          ? "bg-[#f27d26]/10 text-[#f27d26]"
                          : "text-white/60 hover:text-white bg-white/5"
                      }`}
                    >
                      <span>All Categories</span>
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-all flex justify-between items-center ${
                          selectedCategory.toLowerCase() === cat.toLowerCase()
                            ? "bg-[#f27d26]/10 text-[#f27d26]"
                            : "text-white/60 hover:text-white bg-white/5"
                        }`}
                      >
                        <span>{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4 font-bold">
                    Condition Specs
                  </h3>
                  <div className="flex flex-wrap md:flex-col gap-2">
                    <button
                      onClick={() => setSelectedCondition("all")}
                      className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                        selectedCondition === "all"
                          ? "bg-[#f27d26]/10 text-[#f27d26]"
                          : "text-white/60 hover:text-white bg-white/5"
                      }`}
                    >
                      All Conditions
                    </button>
                    {CONDITIONS.map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setSelectedCondition(cond)}
                        className={`text-left text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                          selectedCondition.toLowerCase() === cond.toLowerCase()
                            ? "bg-[#f27d26]/10 text-[#f27d26]"
                            : "text-white/60 hover:text-white bg-white/5"
                        }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-4 font-bold flex items-center">
                    <DollarSign className="w-3 h-3 text-[#f27d26]" />
                    Price Range (USD)
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="bg-white/5 border border-white/5 rounded px-2.5 py-1.5 text-xs text-white placeholder-white/20 w-full focus:outline-none focus:border-[#f27d26]"
                    />
                    <span className="text-white/30 text-xs">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-white/5 border border-white/5 rounded px-2.5 py-1.5 text-xs text-white placeholder-white/20 w-full focus:outline-none focus:border-[#f27d26]"
                    />
                  </div>
                  <button
                    onClick={fetchProducts}
                    className="w-full mt-3 bg-[#f27d26]/20 text-[#f27d26] hover:bg-[#f27d26]/30 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all"
                  >
                    Apply Price Filter
                  </button>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5 mt-auto">
                  <div className="text-[10px] text-[#f27d26] font-bold uppercase mb-1 italic flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1" />
                    Try Before Buy
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed italic">
                    Found something local? Use our integrated request meetup system on any listing to schedule a safe demo run in a studio.
                  </p>
                </div>
              </aside>
            )}

            {/* Core Feed Grid */}
            <main className="flex-1 p-6 overflow-y-auto flex flex-col">
              {selectedProduct ? (
                /* --- PRODUCT DETAIL SCREEN VIEW --- */
                <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
                  
                  {/* Back button */}
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex items-center space-x-2 text-white/50 hover:text-white text-xs font-bold transition-all uppercase tracking-wider pb-3"
                  >
                    <span>← Back to Gear Feed</span>
                  </button>

                  {/* Intro specs block */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl relative overflow-hidden">
                    
                    {/* Media Display left panel */}
                    <div className="space-y-4">
                      <div className="aspect-[4/3] bg-black/40 rounded-2xl overflow-hidden relative border border-white/5">
                        <img
                          src={selectedProduct.images[0] || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop"}
                          alt={selectedProduct.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-[#f27d26]">
                          {selectedProduct.category}
                        </span>
                        
                        {/* Authentic Gear Trust Badges */}
                        {selectedProduct.isVerifiedGear && (
                          <div className="absolute top-3 right-3 bg-green-500 text-black px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center space-x-1 shadow-md">
                            <BadgeCheck className="w-3 h-3" />
                            <span>Verified Authentic</span>
                          </div>
                        )}
                      </div>

                      {/* Video Demotape playback section */}
                      {selectedProduct.demoVideo ? (
                        <div className="bg-[#101012] border border-white/5 rounded-2xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest flex items-center">
                              <Play className="w-3.5 h-3.5 text-[#f27d26] mr-1" />
                              Audio Demo Tape
                            </span>
                            <span className="text-[10px] text-green-400 font-semibold bg-green-400/10 px-2 py-0.5 rounded">
                              Trust Video Attached
                            </span>
                          </div>
                          
                          {/* Rich Simulated live Waveform Preview */}
                          <div className="relative h-14 bg-black/50 rounded-xl flex flex-col justify-center px-4 overflow-hidden mb-3 border border-white/5">
                            <canvas ref={canvasRef} width={400} height={50} className="w-full h-full" />
                          </div>

                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setIsPlayingDemo(!isPlayingDemo)}
                              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white flex items-center space-x-2 transition-all"
                            >
                              {isPlayingDemo ? (
                                <>
                                  <Pause className="w-3.5 h-3.5 text-[#f27d26]" />
                                  <span>Stop Tone Wave</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 text-green-400" />
                                  <span>Simulate Audio Demo Tape</span>
                                </>
                              )}
                            </button>
                            <span className="text-[11px] text-white/30 italic">Synthetic instrument signature verified</span>
                          </div>
                          
                          {/* Simple video player */}
                          {isPlayingDemo && (
                            <div className="mt-4 rounded-xl overflow-hidden border border-white/10">
                              <video
                                src={selectedProduct.demoVideo}
                                controls
                                autoPlay
                                className="w-full bg-black h-48"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                          <p className="text-[11px] text-white/40 italic">No audio demo tape loaded by the seller yet.</p>
                        </div>
                      )}
                    </div>

                    {/* Meta specifications right details panel */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-2xl font-bold tracking-tight text-white">{selectedProduct.title}</h2>
                          <div className="text-right">
                            <div className="text-2xl font-extrabold text-[#f27d26]">${selectedProduct.price.toLocaleString()}</div>
                            <span className="text-[10px] bg-white/10 px-2.5 py-1 rounded text-white/80 font-bold tracking-wider uppercase block mt-1">
                              {selectedProduct.condition}
                            </span>
                          </div>
                        </div>

                        {/* Interactive AI pricing breakdown */}
                        <div className="bg-gradient-to-br from-[#121214] to-[#0a0a0b] border border-[#f27d26]/20 p-4 rounded-xl space-y-2.5 my-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-widest text-[#f27d26] font-bold flex items-center">
                              <Sparkles className="w-3.5 h-3.5 mr-1" />
                              AI Assistant Price Guidance
                            </span>
                            <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                              FAIR VALUE METRIC
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-white/70">
                            Current listing is <span className="text-white font-bold">${selectedProduct.price}</span>. Smart suggestions estimate this {selectedProduct.category} condition value between:
                          </p>
                          <div className="flex justify-between items-center text-xs font-mono font-bold text-white py-1 border-y border-white/5">
                            <span>Suggestion Min: ${selectedProduct.suggestedPriceMin || Math.round(selectedProduct.price * 0.9)}</span>
                            <span>Suggestion Max: ${selectedProduct.suggestedPriceMax || Math.round(selectedProduct.price * 1.1)}</span>
                          </div>
                          
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
                            <div className="absolute top-0 bottom-0 bg-[#f27d26] rounded-full left-[20%] right-[30%]"></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-white/40 font-mono">
                            <span>Underpriced</span>
                            <span className="text-green-400 font-bold uppercase">Target Zone</span>
                            <span>Overpriced</span>
                          </div>
                        </div>

                        <p className="text-sm text-white/70 leading-relaxed mt-4 whitespace-pre-wrap">
                          {selectedProduct.description}
                        </p>
                      </div>

                      {/* Live Actions & Try Out buttons */}
                      <div className="space-y-3 pt-6 border-t border-white/5">
                        {currentUser && selectedProduct.sellerId === currentUser.id ? (
                          <div className="flex space-x-3">
                            <button
                              id="btn-edit-gear"
                              onClick={() => handleStartEditGear(selectedProduct)}
                              className="flex-1 py-3 bg-[#f27d26] hover:bg-[#d15a1a] text-black font-extrabold rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit Listing Specs</span>
                            </button>
                            
                            <button
                              id="btn-delete-gear"
                              onClick={() => handleDeleteGear(selectedProduct.id)}
                              className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-500 font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 border border-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete Listing</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => startInstantChatWithSeller(selectedProduct.sellerId, selectedProduct.sellerName)}
                              className="flex-1 py-3 bg-[#f27d26] hover:bg-[#d15a1a] text-black font-extrabold rounded-xl transition-all text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Contact Seller (Negotiate)</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                if (!currentUser) setIsLoginModalOpen(true);
                                else setIsMeetupModalOpen(true);
                              }}
                              className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 border border-white/5"
                            >
                              <Calendar className="w-4 h-4 text-[#f27d26]" />
                              <span>Try Before Buy</span>
                            </button>
                          </div>
                        )}

                        {/* Leave a review workflow */}
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => {
                              if (!currentUser) setIsLoginModalOpen(true);
                              else setIsReviewModalOpen(true);
                            }}
                            className="text-[11px] text-white/50 hover:text-white hover:underline uppercase font-bold tracking-wider"
                          >
                            ★ Rate and review this Seller
                          </button>
                          <span className="text-[10px] text-white/30 font-mono">Verified listings enjoy 1.5x buyer reach</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Seller Profile Trust Verification Details */}
                  <div className="bg-[#0b0b0d] border border-white/5 rounded-3xl p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      {/* Avatar Details */}
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f27d26] to-[#d15a1a] flex items-center justify-center text-lg font-black">
                            {selectedProduct.sellerName.substring(0, 2).toUpperCase()}
                          </div>
                          {selectedProduct.sellerVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-[#f27d26] text-black p-1 rounded-full">
                              <BadgeCheck className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base font-bold text-white">{selectedProduct.sellerName}</h4>
                            {selectedProduct.sellerVerified ? (
                              <span className="px-2 py-0.5 bg-[#f27d26]/10 text-[#f27d26] text-[9px] font-bold uppercase rounded-full">
                                Verified Seller
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-white/5 text-white/40 text-[9px] font-bold uppercase rounded-full">
                                Unverified Account
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50">Trusted Community Musician • Rating: {selectedProduct.sellerRating}★</p>
                        </div>
                      </div>

                      {/* Display ratings */}
                      <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <div className="flex space-x-1 text-yellow-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(selectedProduct.sellerRating || 5) ? "fill-yellow-400" : "text-white/20"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-mono font-bold text-white">{selectedProduct.sellerRating || "5.0"} avg</span>
                      </div>
                    </div>
                  </div>

                  {/* Community QA comment Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Community discussion QA</h3>
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-6">
                      
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {comments.length === 0 ? (
                          <div className="text-center py-6">
                            <HelpCircle className="w-8 h-8 text-white/20 mx-auto mb-2" />
                            <p className="text-xs text-white/40 italic">No community comments on this gear yet. Ask &ldquo;Is this worth the price?&rdquo;</p>
                          </div>
                        ) : (
                          comments.map((com) => (
                            <div key={com.id} className="flex space-x-3 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                              <img
                                src={com.userProfileImage || `https://api.dicebear.com/7.x/identicon/svg?seed=${com.userName}`}
                                alt={com.userName}
                                className="w-8 h-8 rounded-full object-cover border border-white/10"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-[#f27d26]">{com.userName}</span>
                                  <span className="text-[10px] text-white/30 font-mono">
                                    {new Date(com.createdAt).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed font-medium">{com.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Post QA Form */}
                      <form onSubmit={postComment} className="flex items-center space-x-3 pt-4 border-t border-white/10">
                        <input
                          type="text"
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Ask the seller about conditions, testing, or playability..."
                          className="flex-1 bg-[#141416] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#f27d26]"
                        />
                        <button
                          type="submit"
                          className="bg-[#f27d26]/20 text-[#f27d26] border border-[#f27d26]/30 hover:bg-[#f27d26]/30 px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                        >
                          Ask Question
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              ) : (
                /* --- MARKETPLACE FEED LISTING INDEX --- */
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header bar listings count */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 space-y-2 sm:space-y-0">
                      <div>
                        <h2 className="text-xl font-light italic tracking-tight uppercase">
                          Featured <span className="font-extrabold not-italic text-white">Gear Listings</span>
                        </h2>
                        <p className="text-xs text-white/40 mt-1">
                          Buy, sell, and schedule local try-outs with certified peer reviews.
                        </p>
                      </div>
                      <div className="text-xs text-[#f27d26] bg-[#f27d26]/10 px-3 py-1.5 rounded-full border border-[#f27d26]/20 font-bold uppercase tracking-wider">
                        {products.length} instruments matching filters
                      </div>
                    </div>

                    {/* Loading or listings display */}
                    {isLoadingProducts ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <RefreshCw className="w-10 h-10 text-[#f27d26]/80 animate-spin" />
                        <p className="text-xs text-white/40">Synchronizing instrument database...</p>
                      </div>
                    ) : products.length === 0 ? (
                      <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl">
                        <Guitar className="w-16 h-16 text-white/10 mx-auto mb-4" />
                        <h3 className="text-base font-bold">No Match Detected</h3>
                        <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
                          Try typing a broader search term or resetting sidebar specific condition specifications.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedCategory("all");
                            setSelectedCondition("all");
                            setSearchQuery("");
                            setMinPrice("");
                            setMaxPrice("");
                            setTimeout(() => fetchProducts(), 50);
                          }}
                          className="mt-4 bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedProduct(p);
                              fetchProductComments(p.id);
                            }}
                            className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#f27d26]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                          >
                            <div className="aspect-[4/3] bg-[#1a1a1c] relative overflow-hidden">
                              <img
                                src={p.images[0] || "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop"}
                                alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[9px] font-extrabold uppercase tracking-widest text-[#f27d26]">
                                {p.category}
                              </div>
                              
                              {p.isVerifiedGear && (
                                <div className="absolute top-3 right-3 bg-green-500/90 text-black px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex items-center space-x-0.5">
                                  <BadgeCheck className="w-3.5 h-3.5" />
                                  <span>VERIFIED</span>
                                </div>
                              )}
                              
                              {p.demoVideo && (
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="px-4 py-2 bg-white text-black text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center space-x-1.5 scale-90 group-hover:scale-100 transition-transform">
                                    <Play className="w-3.5 h-3.5 text-[#f27d26] fill-current" />
                                    <span>Play Demo Tape</span>
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                              <div>
                                <div className="flex justify-between items-start mb-1">
                                  <h3 className="text-sm font-bold text-white group-hover:text-[#f27d26] transition-colors line-clamp-1">
                                    {p.title}
                                  </h3>
                                  <span className="text-sm font-black text-[#f27d26] ml-2 shrink-0">
                                    ${p.price.toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-[11px] text-white/50 line-clamp-2">
                                  {p.description}
                                </p>
                              </div>

                              <div className="text-[10px] border-t border-white/5 pt-3 flex items-center justify-between">
                                <span className="text-white/40 italic flex items-center space-x-1">
                                  <span>{p.sellerName}</span>
                                  <span className="text-yellow-400">({p.sellerRating}★)</span>
                                </span>
                                <span className="px-2.5 py-0.5 bg-white/5 text-white/80 rounded uppercase font-semibold text-[9px]">
                                  {p.condition}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </>
        )}

        {/* VIEW 2: SELL GEAR (INTEGRATIVE FORM) */}
        {activeTab === "sell" && (
          <main className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-light italic tracking-tight uppercase">
                {editingProductId ? (
                  <>
                    Edit your <span className="font-extrabold not-italic text-white">Instrument Listing</span>
                  </>
                ) : (
                  <>
                    List your <span className="font-extrabold not-italic text-white">Instrument</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-white/40 mt-1">
                {editingProductId
                  ? "Modify your gear listing title, pricing, image, or demo tape path below."
                  : "Calculate smart suggested pricing on-demand, scan authenticity, and load a Trust demo-tape."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column Form */}
              <form onSubmit={handleSellGear} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                    Instrument Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newGear.title}
                    onChange={(e) => setNewGear({ ...newGear, title: e.target.value })}
                    placeholder="e.g., 1978 Fender Sunburst Stratocaster"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#f27d26]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={newGear.category}
                      onChange={(e) => setNewGear({ ...newGear, category: e.target.value })}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#f27d26]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                      Condition *
                    </label>
                    <select
                      value={newGear.condition}
                      onChange={(e) => setNewGear({ ...newGear, condition: e.target.value as any })}
                      className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#f27d26]"
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      required
                      value={newGear.price}
                      onChange={(e) => setNewGear({ ...newGear, price: e.target.value })}
                      placeholder="e.g., 1450"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#f27d26]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                      Demo Video / Audio Path URL
                    </label>
                    <input
                      type="text"
                      value={newGear.demoUrl}
                      onChange={(e) => setNewGear({ ...newGear, demoUrl: e.target.value })}
                      placeholder="e.g., https://mov_bbb.mp4"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#f27d26]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                    Primary Image URL
                  </label>
                  <input
                    type="text"
                    value={newGear.imageUrl}
                    onChange={(e) => setNewGear({ ...newGear, imageUrl: e.target.value })}
                    placeholder="e.g., https://unsplash.com/your-image"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#f27d26]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                    Description Specs *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newGear.description}
                    onChange={(e) => setNewGear({ ...newGear, description: e.target.value })}
                    placeholder="Provide full original features, repairs, upgrades, playability feel, or history..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#f27d26]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSellingLoading}
                  className="w-full py-3.5 bg-[#f27d26] text-black font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider hover:opacity-95 shadow-md flex items-center justify-center space-x-2"
                >
                  {isSellingLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{editingProductId ? "Updating listing..." : "Uploading instrument..."}</span>
                    </>
                  ) : (
                    <>
                      <Guitar className="w-4 h-4" />
                      <span>{editingProductId ? "Save Edited Changes" : "Post Product to Regear Marketplace"}</span>
                    </>
                  )}
                </button>

                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(null);
                      setNewGear({
                        title: "",
                        description: "",
                        price: "",
                        condition: "Used",
                        category: "Guitars",
                        imageUrl: "",
                        demoUrl: "",
                      });
                      setAiPriceRange(null);
                      setAiAuthenticityCheck(null);
                      setActiveTab("marketplace");
                    }}
                    className="w-full py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-bold rounded-xl transition-all text-xs uppercase tracking-wider mt-2"
                  >
                    Cancel Editing
                  </button>
                )}
              </form>

              {/* Right Column: AI Assistant suggestions display */}
              <div className="bg-[#101012] border border-white/10 p-6 rounded-3xl space-y-6">
                <div>
                  <span className="text-[10px] text-[#f27d26] uppercase font-mono tracking-widest font-bold">
                    Regear Engine
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center mt-1">
                    <Sparkles className="w-4 h-4 text-[#f27d26] mr-1.5" />
                    AI Pricing Guide Scanner
                  </h3>
                </div>

                {isAIPriceCalculating ? (
                  <div className="py-12 text-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-[#f27d26] animate-spin mx-auto animate-pulse" />
                    <p className="text-xs text-white/50">Analyzing vintage markets and conditions...</p>
                  </div>
                ) : aiPriceRange ? (
                  <div className="space-y-4 animate-fade-in">
                    <div className="bg-white/5 p-4 rounded-2xl border border-[#f27d26]/10">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
                        ESTIMATED MARKET RANGE
                      </span>
                      <div className="text-xl font-mono font-bold text-[#f27d26]">
                        ${aiPriceRange.min} – ${aiPriceRange.max}
                      </div>
                      <p className="text-xs text-white/50 italic mt-2 leading-relaxed">
                        &quot;{aiPriceRange.tip}&quot;
                      </p>
                    </div>

                    {aiAuthenticityCheck && (
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-white/40 uppercase tracking-wider block">
                            AUTHENTICITY PROBABILITY
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                              aiAuthenticityCheck.score >= 80 ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {aiAuthenticityCheck.score}% Secure
                          </span>
                        </div>

                        {/* Confidence Meter bar */}
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              aiAuthenticityCheck.score >= 80 ? "bg-green-500" : "bg-yellow-500"
                            }`}
                            style={{ width: `${aiAuthenticityCheck.score}%` }}
                          ></div>
                        </div>

                        <p className="text-[11px] text-white/55 italic">
                          Scanner assessment: {aiAuthenticityCheck.reasoning}
                        </p>
                      </div>
                    )}

                    <div className="p-3.5 bg-yellow-400/5 text-yellow-400 border border-yellow-400/10 rounded-xl text-xs space-y-1">
                      <div className="font-extrabold flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        PEER COMMUNITY NOTICE:
                      </div>
                      <p className="text-[11px] leading-relaxed text-white/70">
                        Adding an Audio/Video demo tape increases listing credibility scores by over 45%, fostering faster meet-ups.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-white/30 space-y-3">
                    <Guitar className="w-12 h-12 text-white/10 mx-auto" />
                    <p className="text-xs max-w-xs mx-auto">
                      Pricing and fraud scanners generate live predictions once you input an instrument title.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}

        {/* VIEW 3: CHAT ROOM MODULE */}
        {activeTab === "chat" && (
          <main className="flex-1 p-6 overflow-hidden flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 max-w-6xl mx-auto w-full animate-fade-in">
            {/* List of active partners */}
            <aside className="w-full md:w-80 bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#f27d26] px-2 mb-2">
                Active Discussions
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-12 text-white/30 italic text-xs">
                    No active chat rooms. Choose an instrument to contact sellers.
                  </div>
                ) : (
                  conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveChatPartner(c.id);
                        fetchChatMessages(c.id);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start space-x-3 focus:outline-none ${
                        activeChatPartner === c.id
                          ? "bg-[#f27d26]/10 border-[#f27d26]"
                          : "bg-white/5 hover:bg-white/10 border-white/5"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f27d26] to-[#d15a1a] flex items-center justify-center text-xs font-bold italic shrink-0">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-extrabold text-white truncate">{c.name}</span>
                          <span className="text-[9px] text-white/30 font-mono">
                            {new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50 truncate mt-1">
                          {c.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </aside>

            {/* Conversation detail panel */}
            <section className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col justify-between overflow-hidden">
              {activeChatPartner ? (
                <>
                  {/* Chat header */}
                  <div className="pb-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-[#f27d26] text-black flex items-center justify-center text-sm font-bold">
                        {conversations.find((c) => c.id === activeChatPartner)?.name.substring(0, 2).toUpperCase() || "M"}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">
                          Chat Room with {conversations.find((c) => c.id === activeChatPartner)?.name || "Musician"}
                        </h4>
                        <span className="text-[10px] text-green-400 flex items-center font-mono">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 px-0 py-0 animate-pulse"></span>
                          ESTABLISHED CONNECTION ACTIVE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message stack */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-2">
                    {chatMessages.map((m) => {
                      const isMe = m.senderId === currentUser?.id;
                      const isSystem = m.content.startsWith("[Meetup Automation]");
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isSystem ? "justify-center" : isMe ? "justify-end" : "justify-start"}`}
                        >
                          {isSystem ? (
                            <div className="bg-[#f27d26]/10 text-[#f27d26] border border-[#f27d26]/20 px-4 py-2 rounded-2xl text-[10px] max-w-md font-bold uppercase tracking-wider text-center">
                              {m.content}
                            </div>
                          ) : (
                            <div className={`p-4 rounded-2xl text-xs max-w-sm border ${
                              isMe
                                ? "bg-[#f27d26] text-black font-semibold border-[#f27d26]"
                                : "bg-[#141416] text-white/90 border-white/5"
                            }`}>
                              <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                              <div className="text-[9px] text-black/40 font-mono text-right mt-1.5 flex justify-end">
                                <span className={isMe ? "text-black/50" : "text-white/30"}>
                                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick-Reply Chips */}
                  <div className="flex flex-col space-y-1.5 pb-2.5 pt-2 border-t border-white/5">
                    <div className="flex items-center space-x-1.5 px-1">
                      <Sparkles className="w-3 h-3 text-[#f27d26]" />
                      <span className="text-[10px] uppercase tracking-wider text-white/40 font-mono font-bold">
                        Quick Replies
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5 scroll-smooth">
                      {[
                        "Is it still available?",
                        "What is your best price?",
                        "Can I test it?",
                        "Where can we meetup?",
                        "Does it include cases/accessories?"
                      ].map((reply, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setNewMessageText(reply);
                            chatInputRef.current?.focus();
                          }}
                          className="px-3.5 py-1.5 bg-white/5 hover:bg-[#f27d26]/10 hover:text-[#f27d26] hover:border-[#f27d26]/30 text-white/80 border border-white/5 rounded-full text-[11px] font-semibold transition-all shrink-0 active:scale-95"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input form */}
                  <form onSubmit={sendChatMessage} className="flex space-x-3 pt-3 border-t border-white/5">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      placeholder="Type your message, offer, or preferred trial meetup coordinates..."
                      className="flex-1 bg-[#141416] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/35 focus:outline-none focus:ring-1 focus:ring-[#f27d26]"
                    />
                    <button
                      type="submit"
                      className="px-5 bg-[#f27d26] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-white/30 space-y-3">
                  <MessageSquare className="w-12 h-12 text-white/10 animate-bounce" />
                  <p className="text-xs">Select any user room discussion from the side tray to read history logs.</p>
                </div>
              )}
            </section>
          </main>
        )}

        {/* VIEW 4: TRY OUT MEETUPS TRACKER */}
        {activeTab === "meetups" && (
          <main className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-light italic tracking-tight uppercase">
                Trial Meetup <span className="font-extrabold not-italic text-white">Requests</span>
              </h2>
              <p className="text-xs text-white/40 mt-1">
                Manage requests dynamically to meet, play instruments, and verify sound tones before buy execution.
              </p>
            </div>

            <div className="space-y-4">
              {isLoadingProducts || isMeetupsLoading ? (
                <div className="py-12 text-center text-white/40">Loading track schedules...</div>
              ) : meetups.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/5 rounded-3xl bg-white/5">
                  <Calendar className="w-12 h-12 text-white/10 mx-auto mb-3" />
                  <p className="text-xs text-white/40">You have no trial coordinates registered yet.</p>
                </div>
              ) : (
                meetups.map((r) => {
                  const isIncoming = r.sellerId === currentUser?.id;
                  return (
                    <div
                      key={r.id}
                      className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] bg-[#f27d26]/10 text-[#f27d26] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            {isIncoming ? "Incoming Shop Request" : "Your Sent Request"}
                          </span>
                          <span className="text-[10px] text-white/30 font-mono">ID: {r.id}</span>
                        </div>
                        
                        <h4 className="text-base font-bold text-white mb-1">
                          Instrument: <span className="text-yellow-400">{r.productTitle}</span>
                        </h4>
                        
                        <p className="text-xs text-white/70 italic">
                          &ldquo;{r.message}&rdquo;
                        </p>

                        <div className="text-[10px] text-white/40 font-mono flex items-center space-x-3 pt-1">
                          <span>Buyer: {r.buyerName}</span>
                          <span>•</span>
                          <span>Seller: {r.sellerName}</span>
                        </div>
                      </div>

                      {/* Status display or workflow trigger */}
                      <div className="shrink-0 flex sm:flex-col items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                        <div className="mr-auto sm:mr-0">
                          <span className="text-[10px] text-white/30 block mb-1">CURRENT STATUS</span>
                          <span className={`px-3 py-1 text-xs font-bold rounded uppercase ${
                            r.status === "accepted"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : r.status === "declined"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                          }`}>
                            {r.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Interactive updates for incoming seller requests */}
                        {isIncoming && r.status === "pending" && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateMeetupTracker(r.id, "accepted")}
                              className="px-3 py-1.5 bg-green-500 text-black text-[11px] font-bold rounded-lg uppercase hover:opacity-95"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateMeetupTracker(r.id, "declined")}
                              className="px-3 py-1.5 bg-red-500/20 text-[#ff4a4a] text-[11px] font-bold rounded-lg uppercase hover:bg-red-500/30"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </main>
        )}

        {/* VIEW 5: USER PROFILE VIEW/EDIT */}
        {activeTab === "profile" && currentUser && (
          <main className="flex-1 p-8 overflow-y-auto max-w-3xl mx-auto w-full space-y-8 animate-fade-in">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div className="flex items-center space-x-5">
                  <div className="relative">
                    <img
                      src={currentUser.profileImage}
                      alt={currentUser.username}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white/10"
                    />
                    {currentUser.isVerified && (
                      <div className="absolute bottom-0 right-0 bg-[#f27d26] text-black p-1.5 rounded-full">
                        <BadgeCheck className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-0.5">{currentUser.username}</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-mono">
                      Role: {currentUser.role} • Rating: {currentUser.rating}★
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleVerifiedBadge(currentUser.id)}
                    className="px-3 py-2 bg-[#f27d26]/10 hover:bg-[#f27d26]/20 text-[#f27d26] border border-[#f27d26]/30 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                  >
                    Toggle verified badge
                  </button>
                </div>
              </div>

              {isProfileEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                      Bio Description
                    </label>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="Write your musician history..."
                      className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#f27d26]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                        Music Genre focus
                      </label>
                      <input
                        type="text"
                        value={profileGenre}
                        onChange={(e) => setProfileGenre(e.target.value)}
                        placeholder="e.g., Synthwave, Bluegrass"
                        className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#f27d26]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-white/50 mb-1.5">
                        Instruments owned (comma separated)
                      </label>
                      <input
                        type="text"
                        value={profileInstruments}
                        onChange={(e) => setProfileInstruments(e.target.value)}
                        placeholder="e.g., Korg MS-20, Stratocaster"
                        className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#f27d26]"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#f27d26] text-black font-extrabold rounded-lg text-xs tracking-wider uppercase hover:opacity-95"
                    >
                      Save Specifications
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsProfileEditing(false)}
                      className="px-4 py-2.5 bg-white/5 text-white rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-2">My Bio</h4>
                      <p className="text-xs text-white/70 leading-relaxed font-semibold italic">
                        {currentUser.bio || "No biography added yet. Click edit below to tell other musicians about your musical history."}
                      </p>
                    </div>

                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-1">Genre Interest</h4>
                        <p className="text-xs font-bold text-[#f27d26]">{currentUser.musicGenre || "All Music Styles"}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-white/30 mb-1">Instruments Collection</h4>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {currentUser.instrumentsOwned && currentUser.instrumentsOwned.length > 0 ? (
                            currentUser.instrumentsOwned.map((inst, index) => (
                              <span key={index} className="px-2.5 py-1 bg-white/5 rounded text-[10px] font-bold tracking-tight text-white border border-white/5">
                                {inst}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-white/40 italic">No instrument items logged yet.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <button
                      onClick={() => {
                        loadProfileFields();
                        setIsProfileEditing(true);
                      }}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                    >
                      Edit Profile Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}

      </div>

      {/* FOOTER METADATA STATUS BAR */}
      <footer className="h-10 border-t border-white/5 bg-[#0d0d0f] flex items-center justify-between px-6 flex-none text-[10px]">
        <div id="footer-details" className="flex space-x-6 text-white/40 font-mono">
          <span className="hidden sm:inline">REGEAR INSTRUMENT ENGINE V1.4</span>
          <span>DB: SYNCHRONIZED</span>
          <span>LISTINGS RUNNING: {products.length}</span>
        </div>
        <div className="text-[#f27d26] flex items-center tracking-wider font-bold">
          <span className="mr-2 animate-pulse text-[12px]">●</span>
          SECURE TRANSACTION NODE ACTIVE
        </div>
      </footer>

      {/* LOGIN & SIGNUP AUTH MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#101012] border border-white/15 p-6 md:p-8 rounded-3xl max-w-sm w-full space-y-6 relative animate-fade-in shadow-2xl">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                {isRegisterMode ? "Sign Up Regear Account" : "Access Regear Portal"}
              </h3>
              <p className="text-[11px] text-white/40 mt-1">
                Collect, review, and exchange instruments with authentic trust ratings.
              </p>
            </div>

            {authError && (
              <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-xs font-mono border border-red-500/20">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  placeholder="e.g., ToneLover"
                  className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#f27d26]"
                />
              </div>

              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#f27d26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1">
                      Trading Role *
                    </label>
                    <select
                      value={authForm.role}
                      onChange={(e) => setAuthForm({ ...authForm, role: e.target.value })}
                      className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#f27d26]"
                    >
                      <option value="buyer">Buyer (Browse & Test Instruments)</option>
                      <option value="seller">Seller (Post Instrument Demos & Gear)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#f27d26]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#f27d26] text-black font-extrabold rounded-xl transition-all text-xs uppercase tracking-wider hover:opacity-95 shadow-md mt-2"
              >
                {isRegisterMode ? "Generate Credential Profile" : "Access Space Sandbox"}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-white/5">
              <button
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setAuthError("");
                }}
                className="text-[11px] text-white/50 hover:text-white"
              >
                {isRegisterMode ? "Already a member? Log In" : "New instrument trading? Create profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEETUP COORDINATES SCHEDULE REQUEST MODAL */}
      {isMeetupModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#101012] border border-white/15 p-6 md:p-8 rounded-3xl max-w-sm w-full space-y-6 relative animate-fade-in shadow-2xl">
            <button
              onClick={() => setIsMeetupModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] text-[#f27d26] uppercase font-mono tracking-widest font-extrabold">
                Try Before You Buy
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                Schedule Demo Trial
              </h3>
              <p className="text-[11px] text-white/40 mt-1 hover:underline">
                Request a secure studio session to test this &ldquo;{selectedProduct.title}&rdquo; before closing standard trade.
              </p>
            </div>

            <form onSubmit={requestMeetup} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5">
                  Message coordinates for seller
                </label>
                <textarea
                  rows={4}
                  required
                  value={meetupMessage}
                  onChange={(e) => setMeetupMessage(e.target.value)}
                  placeholder={`Hey ${selectedProduct.sellerName}, can I test this Strat on Tuesday at a local studio downtown?`}
                  className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#f27d26]"
                />
              </div>

              <div className="bg-yellow-400/5 text-yellow-400 border border-yellow-400/10 p-3 rounded-xl text-[10px] leading-relaxed">
                Safe trade tips: Never carry large physical cash values. Meet in verified public studios or highly frequented music stores.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#f27d26] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all"
              >
                Send Try-Out Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RATING & REVIEW FORM MODAL */}
      {isReviewModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#101012] border border-white/15 p-6 md:p-8 rounded-3xl max-w-sm w-full space-y-6 relative animate-fade-in shadow-2xl">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] text-[#f27d26] uppercase font-mono tracking-widest font-extrabold">
                Trust reviews System
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                Rate Seller {selectedProduct.sellerName}
              </h3>
              <p className="text-[11px] text-white/40 mt-1">
                Provide quick rating feedback about listing honesty, response speed, or packaging care quality.
              </p>
            </div>

            <form onSubmit={postReview} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-2">
                  Number of stars rating
                </label>
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none text-2xl"
                    >
                      <span className={star <= reviewRating ? "text-yellow-400" : "text-white/20"}>★</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-1.5">
                  Review Statement
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Excellent trade, item packaging was safe and tone was perfect vintage..."
                  className="w-full bg-[#0a0a0b] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#f27d26]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#f27d26] text-black font-extrabold rounded-xl text-xs uppercase tracking-wider hover:opacity-95 transition-all"
              >
                Log Trust Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
