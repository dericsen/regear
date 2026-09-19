// src/db/dbService.ts
import fs from "fs";
import path from "path";
import { User, Product, Review, Message, Comment } from "../types";

const isVercel = Boolean(process.env.VERCEL);
const DB_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "src", "db");
const DB_FILE = path.join(DB_DIR, "db.json");

interface DBStructure {
  users: User[];
  products: Product[];
  reviews: Review[];
  messages: Message[];
  comments: Comment[];
}

const DEFAULT_USERS: User[] = [
  {
    id: "seller-jimi",
    username: "JimiToneMaster",
    email: "jimi@regear.com",
    passwordHash: "password123",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    bio: "Classic rock and blues expert. Collecting and trading since the late 70s. All gear is certified pristine.",
    musicGenre: "Psychedelic Rock / Blues",
    instrumentsOwned: ["1968 Fender Stratocaster", "vintage Marshall Plexi Amp", "Univibe Pedal"],
    role: "seller",
    isVerified: true,
    rating: 4.8,
    createdAt: new Date("2025-01-15T08:00:00Z").toISOString(),
  },
  {
    id: "seller-moog",
    username: "AlexGear",
    email: "alex@regear.com",
    passwordHash: "password123",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    bio: "Analog synthesizers builder and audio engineer. Specializing in modular components and custom filter circuitry.",
    musicGenre: "Electronic / Ambient",
    instrumentsOwned: ["Custom Eurorack Modular", "Moog One", "Korg MS-20"],
    role: "seller",
    isVerified: true,
    rating: 4.9,
    createdAt: new Date("2025-02-10T11:30:00Z").toISOString(),
  },
  {
    id: "buyer-david",
    username: "DavidSustain",
    email: "david@regear.com",
    passwordHash: "password123",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    bio: "Looking for long delays and warm tones. Constantly exploring soundscapes.",
    musicGenre: "Progressive Rock / Ambient",
    instrumentsOwned: ["Black Strat", "Binson Echorec Delay"],
    role: "buyer",
    isVerified: false,
    rating: 5.0,
    createdAt: new Date("2025-03-01T15:45:00Z").toISOString(),
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-strat",
    title: "1978 Fender Stratocaster Vintage Sunburst",
    description: "Fully original 1978 Sunburst Stratocaster with an ash body and maple fretboard. Incredible acoustic resonance. Original grey bottom pickups with a warm, distinctive 70s chime. Single owner, gigged lightly. Minor belt buckle rash on the back, but structural condition is pristine.",
    price: 2450,
    condition: "Used",
    category: "Guitars",
    images: [
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=1000&auto=format&fit=crop"
    ],
    demoVideo: "https://www.w3schools.com/html/mov_bbb.mp4",
    sellerId: "seller-jimi",
    sellerName: "JimiToneMaster",
    sellerVerified: true,
    sellerRating: 4.8,
    isVerifiedGear: true,
    verificationScore: 96,
    suggestedPriceMin: 2200,
    suggestedPriceMax: 2600,
    createdAt: new Date("2026-05-10T12:00:00Z").toISOString(),
  },
  {
    id: "prod-sub37",
    title: "Moog Subsequent 37 Dual-VCO Synthesizer",
    description: "In immaculate condition. No scratches, smoke-free home studio usage only. The subsequent 37 upgrades the classic Sub 37 engine with twice the mixer headroom, more filter drive options, and a supreme Fatar keyboard bed. Includes original wooden side panels, box, power supply, and templates.",
    price: 1350,
    condition: "Like New",
    category: "Keyboards",
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop"
    ],
    demoVideo: "https://www.w3schools.com/html/movie.mp4",
    sellerId: "seller-moog",
    sellerName: "AlexGear",
    sellerVerified: true,
    sellerRating: 4.9,
    isVerifiedGear: true,
    verificationScore: 98,
    suggestedPriceMin: 1250,
    suggestedPriceMax: 1450,
    createdAt: new Date("2026-05-18T16:20:00Z").toISOString(),
  },
  {
    id: "prod-jcm800",
    title: "Marshall JCM800 2203 100-Watt Amplifier Head",
    description: "Vintage 1984 Marshall JCM800. Authentic rock sound that defined the 80s. Retubed with premium matched Electro-Harmonix EL34s and filtered JJ caps last month. Features a Master Volume mod that allows organic tubes crunch at sensible levels. Massive gain response.",
    price: 1750,
    condition: "Used",
    category: "Amps",
    images: [
      "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=1000&auto=format&fit=crop"
    ],
    demoVideo: "",
    sellerId: "seller-jimi",
    sellerName: "JimiToneMaster",
    sellerVerified: true,
    sellerRating: 4.8,
    isVerifiedGear: true,
    verificationScore: 91,
    suggestedPriceMin: 1600,
    suggestedPriceMax: 1900,
    createdAt: new Date("2026-05-25T10:15:00Z").toISOString(),
  },
  {
    id: "prod-bigsky",
    title: "Strymon BigSky Multidimensional Space Reverb",
    description: "Brand new, never mounted on a pedalboard. Strymon BigSky features twelve premium reverb machines including Room, Hall, Plate, Spring, Swell, Bloom, Cloud, Chorale, and Magneto. True bypass with full factory warranty in box with original 9V charger.",
    price: 420,
    condition: "New",
    category: "Effects",
    images: [
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop"
    ],
    demoVideo: "https://www.w3schools.com/html/mov_bbb.mp4",
    sellerId: "seller-moog",
    sellerName: "SynthSynthesist",
    sellerVerified: true,
    sellerRating: 4.9,
    isVerifiedGear: false,
    verificationScore: 100, // Box is sealed
    suggestedPriceMin: 390,
    suggestedPriceMax: 440,
    createdAt: new Date("2026-06-01T09:30:00Z").toISOString(),
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    productId: "prod-strat",
    reviewerId: "buyer-david",
    reviewerName: "DavidSustain",
    sellerId: "seller-jimi",
    rating: 5,
    comment: "Incredible transaction! Item was packed perfectly and sounds even better than described. Real vintage authority here.",
    createdAt: new Date("2026-05-15T15:00:00Z").toISOString(),
  },
  {
    id: "rev-2",
    productId: "prod-sub37",
    reviewerId: "buyer-david",
    reviewerName: "DavidSustain",
    sellerId: "seller-moog",
    rating: 5,
    comment: "Wendy is a legend. The subsequent has custom presets loaded that are absolutely beautiful. Super fast shipping.",
    createdAt: new Date("2026-05-22T19:00:00Z").toISOString(),
  }
];

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "msg-1",
    senderId: "buyer-david",
    senderName: "DavidSustain",
    receiverId: "seller-jimi",
    receiverName: "JimiToneMaster",
    productId: "prod-strat",
    content: "Hey Jimi, love the 1978 Sunburst Strat. Is the neck fully straight and original truss rod functional?",
    createdAt: new Date("2026-06-05T10:00:00Z").toISOString(),
  },
  {
    id: "msg-2",
    senderId: "seller-jimi",
    senderName: "JimiToneMaster",
    receiverId: "buyer-david",
    receiverName: "DavidSustain",
    productId: "prod-strat",
    content: "Hey David! Yes indeed, neck is straight as an arrow and truss rod works smoothly package-turn both directions. It's a real dream to play.",
    createdAt: new Date("2026-06-05T10:30:00Z").toISOString(),
  }
];

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "com-1",
    productId: "prod-strat",
    userId: "buyer-david",
    userName: "DavidSustain",
    userProfileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    content: "Do you feel the ash body heavy weight limits long gig performance on this guy?",
    createdAt: new Date("2026-06-05T11:00:00Z").toISOString(),
  },
  {
    id: "com-2",
    productId: "prod-strat",
    userId: "seller-jimi",
    userName: "JimiToneMaster",
    userProfileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    content: "It's around 8.4 lbs - solid but nicely distributed. I played 2-hour set with it with a wide leather strap comfortably, hope that helps!",
    createdAt: new Date("2026-06-05T12:00:00Z").toISOString(),
  }
];

class DatabaseService {
  private data: DBStructure = {
    users: [],
    products: [],
    reviews: [],
    messages: [],
    comments: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        // If DB_FILE is in /tmp or not created yet, check if project seed db.json exists
        const projectSeedFile = path.join(process.cwd(), "src", "db", "db.json");
        if (fs.existsSync(projectSeedFile)) {
          try {
            const seedContent = fs.readFileSync(projectSeedFile, "utf-8");
            this.data = JSON.parse(seedContent);
          } catch {
            this.data = {
              users: [...DEFAULT_USERS],
              products: [...DEFAULT_PRODUCTS],
              reviews: [...DEFAULT_REVIEWS],
              messages: [...DEFAULT_MESSAGES],
              comments: [...DEFAULT_COMMENTS],
            };
          }
        } else {
          this.data = {
            users: [...DEFAULT_USERS],
            products: [...DEFAULT_PRODUCTS],
            reviews: [...DEFAULT_REVIEWS],
            messages: [...DEFAULT_MESSAGES],
            comments: [...DEFAULT_COMMENTS],
          };
        }
        this.save();
      }
    } catch (err) {
      console.warn("Failed to initialize database file, falling back to memory database.", err);
      this.data = {
        users: [...DEFAULT_USERS],
        products: [...DEFAULT_PRODUCTS],
        reviews: [...DEFAULT_REVIEWS],
        messages: [...DEFAULT_MESSAGES],
        comments: [...DEFAULT_COMMENTS],
      };
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.warn("Warning: Could not write to disk storage (read-only filesystem). State remains active in memory:", err);
    }
  }

  // --- Users CRUD ---
  getUsers(): User[] {
    return this.data.users;
  }

  getUser(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.data.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates } as User;
    this.save();
    return this.data.users[idx];
  }

  // --- Products ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getProduct(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  addProduct(product: Product): Product {
    this.data.products.push(product);
    this.save();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates } as Product;
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id: string): boolean {
    const originalLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    const success = this.data.products.length < originalLen;
    if (success) this.save();
    return success;
  }

  // --- Reviews ---
  getReviewsBySeller(sellerId: string): Review[] {
    return this.data.reviews.filter((r) => r.sellerId === sellerId);
  }

  addReview(review: Review): Review {
    this.data.reviews.push(review);
    
    // Recalculate seller rating
    const sellerReviews = this.data.reviews.filter((r) => r.sellerId === review.sellerId);
    if (sellerReviews.length > 0) {
      const avg = sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length;
      const rounded = Math.round(avg * 10) / 10;
      this.updateUser(review.sellerId, { rating: rounded });
      
      // Update all products owned by this seller to show latest seller rating
      this.data.products.forEach((prod) => {
        if (prod.sellerId === review.sellerId) {
          prod.sellerRating = rounded;
        }
      });
    }

    this.save();
    return review;
  }

  // --- Messages / Chat ---
  getMessagesBetween(userA: string, userB: string): Message[] {
    return this.data.messages
      .filter(
        (m) =>
          (m.senderId === userA && m.receiverId === userB) ||
          (m.senderId === userB && m.receiverId === userA)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  addMessage(msg: Message): Message {
    this.data.messages.push(msg);
    this.save();
    return msg;
  }

  getConversations(userId: string) {
    const userMessages = this.data.messages.filter(
      (m) => m.senderId === userId || m.receiverId === userId
    );

    const partners = new Map<string, { id: string; name: string; lastMessage: string; time: string }>();

    userMessages.forEach((m) => {
      const isSender = m.senderId === userId;
      const partnerId = isSender ? m.receiverId : m.senderId;
      const partnerName = isSender ? m.receiverName : m.senderName;
      
      const current = partners.get(partnerId);
      if (!current || new Date(m.createdAt).getTime() > new Date(current.time).getTime()) {
        partners.set(partnerId, {
          id: partnerId,
          name: partnerName,
          lastMessage: m.content,
          time: m.createdAt,
        });
      }
    });

    return Array.from(partners.values()).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }

  // --- Comments ---
  getCommentsByProduct(productId: string): Comment[] {
    return this.data.comments
      .filter((c) => c.productId === productId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  addComment(comment: Comment): Comment {
    this.data.comments.push(comment);
    this.save();
    return comment;
  }
}

export const db = new DatabaseService();
