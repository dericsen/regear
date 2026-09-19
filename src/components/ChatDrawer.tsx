import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  X,
  Search,
  CheckCheck,
  Tag,
  ChevronLeft,
  Plus,
  Sparkles,
  ShieldCheck,
  Circle
} from "lucide-react";
import { User, Product, Message, Conversation } from "../types";

interface ChatDrawerProps {
  isOpen: boolean;
  currentUser: User | null;
  token: string | null;
  initialPartner?: { id: string; name: string } | null;
  initialProduct?: Product | null;
  onClose: () => void;
  onOpenLogin: () => void;
  onViewProduct?: (product: Product) => void;
}

const QUICK_INQUIRIES = [
  "🎸 Is this gear still available?",
  "🔊 Can you share an audio/video demo?",
  "📦 Does it come with the original hardcase/box?",
  "🤝 Are you open to reasonable negotiation?",
  "📅 Can I test/rent this for 1 month first?"
];

export default function ChatDrawer({
  isOpen,
  currentUser,
  token,
  initialPartner,
  initialProduct,
  onClose,
  onOpenLogin,
  onViewProduct,
}: ChatDrawerProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [activePartnerName, setActivePartnerName] = useState<string>("");
  const [activePartnerUser, setActivePartnerUser] = useState<User | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations when drawer opens or user changes
  useEffect(() => {
    if (!isOpen || !token || !currentUser) return;
    fetchConversations();
    fetchAvailableUsers();

    // Set initial partner if passed from Product Detail or Contact button
    if (initialPartner) {
      setActivePartnerId(initialPartner.id);
      setActivePartnerName(initialPartner.name);
      if (initialProduct) {
        setActiveProduct(initialProduct);
      }
      fetchMessages(initialPartner.id);
    }
  }, [isOpen, token, currentUser, initialPartner, initialProduct]);

  // Live polling every 3 seconds for real-time message sync
  useEffect(() => {
    if (!isOpen || !token || !currentUser) return;

    const interval = setInterval(() => {
      fetchConversations(false);
      if (activePartnerId) {
        fetchMessages(activePartnerId, false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, token, currentUser, activePartnerId]);

  // Fetch list of conversations
  const fetchConversations = async (showLoading = true) => {
    if (!token) return;
    try {
      const res = await fetch("/api/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);

        // If no active partner and conversations exist, select first one
        if (!activePartnerId && !initialPartner && data.length > 0) {
          selectConversation(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  // Fetch available users for "New Chat"
  const fetchAvailableUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/chat/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data);
      }
    } catch (err) {
      console.error("Error fetching chat users:", err);
    }
  };

  // Fetch messages with specific partner
  const fetchMessages = async (partnerId: string, showLoading = true) => {
    if (!token) return;
    if (showLoading) setIsLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      if (showLoading) setIsLoadingMessages(false);
    }
  };

  const selectConversation = (conv: Conversation) => {
    setActivePartnerId(conv.id);
    setActivePartnerName(conv.name);
    if (conv.productId && conv.productTitle) {
      setActiveProduct({
        id: conv.productId,
        title: conv.productTitle,
        images: conv.productImage ? [conv.productImage] : [],
        price: conv.productPrice || 0,
        condition: "Used",
        category: "Gear",
        description: "",
        demoVideo: "",
        sellerId: conv.id,
        sellerName: conv.name,
        sellerVerified: true,
        sellerRating: 4.8,
        createdAt: new Date().toISOString(),
      });
    } else {
      setActiveProduct(null);
    }
    fetchMessages(conv.id);
  };

  const startChatWithUser = (user: User) => {
    setActivePartnerId(user.id);
    setActivePartnerName(user.username);
    setActivePartnerUser(user);
    setActiveProduct(null);
    setIsNewChatModalOpen(false);
    fetchMessages(user.id);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activePartnerId || !token || isSending) return;

    setIsSending(true);

    // Optimistic message update
    const optimisticMsg: Message = {
      id: "temp-" + Date.now(),
      senderId: currentUser?.id || "me",
      senderName: currentUser?.username || "Me",
      receiverId: activePartnerId,
      receiverName: activePartnerName,
      productId: activeProduct?.id,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: activePartnerId,
          content: text,
          productId: activeProduct?.id,
        }),
      });

      if (res.ok) {
        const savedMsg: Message = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? savedMsg : m))
        );
        fetchConversations(false);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  // If user is not logged in, prompt login
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-[#f27d26]">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1c1917]">ReGear Live Chat</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              Please sign in to view your messages and chat directly with instrument owners & buyers.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenLogin();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#f27d26] hover:bg-[#e06a16] text-white font-bold text-xs shadow-md transition-all"
            >
              Sign In to Chat
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.productTitle && c.productTitle.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[750px]">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 flex items-center justify-between bg-[#faf8f5]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#f27d26] text-white flex items-center justify-center font-black text-xs shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-black text-[#1c1917] tracking-tight">ReGear Chat & Inquiries</h2>
                <span className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Sync</span>
                </span>
              </div>
              <p className="text-[10px] text-stone-500">Directly talk, negotiate trials, and inquire with musicians</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-full text-xs font-bold text-stone-700 flex items-center space-x-1.5 transition-all shadow-xs"
              title="Start new conversation"
            >
              <Plus className="w-3.5 h-3.5 text-[#f27d26]" />
              <span className="hidden sm:inline">New Message</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: 2 Columns */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Column: Conversations List (Hidden on mobile if conversation is active) */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-stone-200 bg-stone-50/70 flex flex-col ${
              activePartnerId ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search filter */}
            <div className="p-3 border-b border-stone-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search chats or gear..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-100/80 rounded-xl text-xs border border-transparent focus:border-[#f27d26] focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-700">No conversations yet</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Start an inquiry with a verified seller or ask about rental options.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="mt-2 px-3 py-1.5 bg-[#f27d26] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#e06a16]"
                  >
                    Find Musicians to Message
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activePartnerId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`w-full text-left p-3.5 flex items-start space-x-3 transition-colors ${
                        isActive
                          ? "bg-white border-l-4 border-l-[#f27d26] shadow-xs"
                          : "hover:bg-stone-100/80"
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#f27d26] text-white flex items-center justify-center font-black text-xs overflow-hidden shadow-xs">
                          {conv.profileImage && conv.profileImage.startsWith("http") ? (
                            <img src={conv.profileImage} alt={conv.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{conv.name.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="text-xs font-bold text-[#1c1917] truncate">{conv.name}</span>
                            {conv.isVerified && (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="Verified Member" />
                            )}
                          </div>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            {new Date(conv.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>

                        {/* Attached product tag */}
                        {conv.productTitle && (
                          <div className="flex items-center space-x-1 text-[10px] text-[#f27d26] font-semibold mt-0.5 truncate">
                            <Tag className="w-3 h-3 shrink-0" />
                            <span className="truncate">{conv.productTitle}</span>
                          </div>
                        )}

                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Chat View */}
          <div
            className={`flex-1 flex flex-col bg-white ${
              !activePartnerId ? "hidden md:flex" : "flex"
            }`}
          >
            {activePartnerId ? (
              <>
                {/* Active Partner Top Bar */}
                <div className="p-3.5 px-4 border-b border-stone-200 flex items-center justify-between bg-white shadow-2xs">
                  <div className="flex items-center space-x-3">
                    {/* Mobile back to list */}
                    <button
                      onClick={() => setActivePartnerId(null)}
                      className="md:hidden p-1.5 -ml-1.5 rounded-lg text-stone-600 hover:bg-stone-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-[#f27d26] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-xs">
                        {activePartnerUser?.profileImage ? (
                          <img src={activePartnerUser.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{activePartnerName.substring(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-xs font-black text-[#1c1917]">{activePartnerName}</h3>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-stone-100 text-stone-600 rounded">
                          {activePartnerUser?.role || "Member"}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                        <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
                        <span>Active now • Fast responses</span>
                      </p>
                    </div>
                  </div>

                  {activeProduct && onViewProduct && (
                    <button
                      onClick={() => onViewProduct(activeProduct)}
                      className="text-xs font-bold text-[#f27d26] hover:underline flex items-center space-x-1"
                    >
                      <span>View Gear</span>
                    </button>
                  )}
                </div>

                {/* Pinned Product Preview Bar (If Context Available) */}
                {activeProduct && (
                  <div className="px-4 py-2 bg-orange-50/70 border-b border-orange-200/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 truncate">
                      {activeProduct.images?.[0] && (
                        <img
                          src={activeProduct.images[0]}
                          alt=""
                          className="w-9 h-9 object-contain rounded-lg bg-white p-0.5 border border-orange-200"
                        />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-stone-900 truncate">{activeProduct.title}</p>
                        <p className="text-[10px] text-stone-500">
                          ${activeProduct.price} • Condition: {activeProduct.condition}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-white bg-[#f27d26] px-2 py-0.5 rounded-full shrink-0">
                      Inquired Item
                    </span>
                  </div>
                )}

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf9f6]/60">
                  {isLoadingMessages && messages.length === 0 ? (
                    <div className="text-center py-12 text-xs text-stone-400 animate-pulse">
                      Loading conversation history...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10 space-y-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-orange-100 text-[#f27d26] flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800">Say hello to {activePartnerName}!</p>
                        <p className="text-[10px] text-stone-500 mt-1">
                          You can ask about sound samples, trial terms, delivery packaging, or price negotiations.
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === currentUser.id || m.senderName === currentUser.username;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[82%] sm:max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                              isMe
                                ? "bg-[#f27d26] text-white font-medium rounded-tr-xs"
                                : "bg-white border border-stone-200 text-stone-800 rounded-tl-xs"
                            }`}
                          >
                            {m.content}
                          </div>
                          <div className="flex items-center space-x-1 text-[9px] text-stone-400 mt-0.5 px-1">
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-stone-400" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Inquiries Suggestion Chips */}
                <div className="px-3 py-2 bg-white border-t border-stone-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-bold text-stone-400 shrink-0 mr-1 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-[#f27d26]" />
                    <span>Suggestions:</span>
                  </span>
                  {QUICK_INQUIRIES.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-orange-50 hover:text-[#f27d26] text-stone-700 text-[10px] font-medium whitespace-nowrap transition-colors border border-stone-200/70"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Message Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-white border-t border-stone-200 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activePartnerName}...`}
                    className="flex-1 text-xs px-3.5 py-2.5 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:border-[#f27d26] focus:bg-white transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-2.5 bg-[#f27d26] hover:bg-[#e06a16] disabled:opacity-50 text-white rounded-xl shadow-xs transition-all flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              /* Empty state if no active partner selected */
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <div className="max-w-xs space-y-3">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-[#f27d26] flex items-center justify-center mx-auto">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-black text-[#1c1917]">Select a conversation</h3>
                  <p className="text-xs text-stone-500">
                    Choose from the list on the left or tap "New Message" to chat with instrument sellers and trial providers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Member Selector Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-stone-200 shadow-2xl p-4 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h4 className="text-xs font-black text-[#1c1917]">Start a New Message</h4>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              Select a musician or certified gear seller to start an inquiry:
            </p>
            <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-stone-50">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => startChatWithUser(u)}
                  className="w-full text-left p-2 rounded-xl hover:bg-orange-50/80 flex items-center space-x-2.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f27d26] text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                    {u.profileImage ? (
                      <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{u.username.substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="truncate flex-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-bold text-stone-900">{u.username}</span>
                      {u.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-stone-500 truncate">{u.bio || u.musicGenre}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
