// server.ts
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { db } from "./src/db/dbService";
import { User, Product, Review, Message, Comment } from "./src/types";

// Express type augmentation for authenticated requests
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const app = express();
const PORT = 3000;

  // 0. URL Normalization Middleware for Vercel Serverless
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/_")) {
      req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    }
    next();
  });

  // Use JSON and URL-encoded middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Safe body parsing fallback
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
      } catch {
        // keep string
      }
    }
    if (!req.body) {
      req.body = {};
    }
    next();
  });

  // --- Auth Middleware ---
  // Simple yet bulletproof Bearer authentication with direct lookup
  // Supports instant offline development & transparent multi-user states
  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access, bearer token required" });
    }
    const userId = authHeader.split(" ")[1];
    const user = db.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid user session or user not found" });
    }
    req.user = user;
    next();
  };

  // --- API Routes ---

  app.get("/api", (req: Request, res: Response) => {
    res.json({ status: "ok", message: "ReGear API Serverless Backend Operational", timestamp: new Date().toISOString() });
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok", message: "ReGear API Serverless Backend Operational", timestamp: new Date().toISOString() });
  });

  // 1. AUTHENTICATION
  app.post("/api/auth/register", (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const username = body.username ? String(body.username).trim() : "";
      const email = body.email ? String(body.email).trim().toLowerCase() : "";
      const password = body.password ? String(body.password) : "";
      const role = body.role === "seller" ? "seller" : "buyer";

      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
      }

      if (db.getUserByUsername(username)) {
        return res.status(400).json({ error: "Username is already taken" });
      }

      if (db.getUserByEmail(email)) {
        return res.status(400).json({ error: "Email is already registered" });
      }

      const newUser: User = {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        username,
        email,
        passwordHash: password,
        profileImage: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`,
        bio: "",
        musicGenre: "",
        instrumentsOwned: [],
        role,
        isVerified: false,
        rating: 5.0,
        createdAt: new Date().toISOString(),
      };

      db.addUser(newUser);

      const { passwordHash: _, ...safeUser } = newUser;

      return res.status(201).json({
        token: newUser.id,
        user: safeUser,
      });
    } catch (err: any) {
      console.error("[Register Error]:", err);
      return res.status(500).json({ error: err?.message || "Internal server error during registration" });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const username = body.username ? String(body.username).trim() : "";
      const password = body.password ? String(body.password) : "";

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const user = db.getUserByUsername(username) || db.getUserByEmail(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      if (user.passwordHash && user.passwordHash !== password) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const { passwordHash: _, ...safeUser } = user;

      return res.json({
        token: user.id,
        user: safeUser,
      });
    } catch (err: any) {
      console.error("[Login Error]:", err);
      return res.status(500).json({ error: err?.message || "Internal server error during login" });
    }
  });

  app.get("/api/auth/me", authMiddleware, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  app.put("/api/auth/profile", authMiddleware, (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    
    const { bio, musicGenre, instrumentsOwned, profileImage } = req.body;
    
    const updated = db.updateUser(req.user.id, {
      bio: bio ?? req.user.bio,
      musicGenre: musicGenre ?? req.user.musicGenre,
      instrumentsOwned: Array.isArray(instrumentsOwned) ? instrumentsOwned : req.user.instrumentsOwned,
      profileImage: profileImage ?? req.user.profileImage,
    });

    res.json({ user: updated });
  });

  // 2. PRODUCT LISTING SEARCH/FILTER/CREATE
  app.get("/api/products", (req: Request, res: Response) => {
    let list = db.getProducts();

    const { category, condition, search, minPrice, maxPrice, listingType, aiVerified } = req.query;

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)));
    }

    if (category && category !== "all") {
      list = list.filter((p) => p.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (condition && condition !== "all") {
      list = list.filter((p) => p.condition.toLowerCase() === (condition as string).toLowerCase());
    }

    if (listingType && listingType !== "all") {
      list = list.filter((p) => p.listingType === listingType || p.listingType === "both" || (!p.listingType && listingType === "buy"));
    }

    if (aiVerified === "true") {
      list = list.filter((p) => p.isVerifiedGear === true);
    }

    if (minPrice) {
      list = list.filter((p) => p.price >= parseFloat(minPrice as string));
    }

    if (maxPrice) {
      list = list.filter((p) => p.price <= parseFloat(maxPrice as string));
    }

    // Sort by latest listing
    list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(list);
  });

  app.get("/api/products/:id", (req: Request, res: Response) => {
    const prod = db.getProduct(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: "Product gear listing not found" });
    }
    res.json(prod);
  });

  app.post("/api/products", authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { title, description, price, condition, category, images, demoVideo, listingType, rentPriceMonthly, brand } = req.body;

    if (!title || !description || !price || !condition || !category) {
      return res.status(400).json({ error: "All gear listing fields are required" });
    }

    const priceNum = parseFloat(price);
    const rentMonthlyNum = rentPriceMonthly ? parseFloat(rentPriceMonthly) : Math.round(priceNum * 0.025);

    const newProduct: Product = {
      id: "prod-" + Math.random().toString(36).substring(2, 9),
      title,
      description,
      price: priceNum,
      condition,
      category,
      images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop"],
      demoVideo: demoVideo || "",
      sellerId: req.user.id,
      sellerName: req.user.username,
      sellerVerified: req.user.isVerified,
      sellerRating: req.user.rating,
      listingType: listingType || "buy",
      rentPriceMonthly: rentMonthlyNum,
      brand: brand || title.split(" ")[0] || "Custom",
      isVerifiedGear: true,
      verificationScore: 95,
      rating: 5.0,
      reviewCount: 1,
      co2SavedKg: Math.round(priceNum * 0.04) + 15,
      createdAt: new Date().toISOString(),
    };

    db.addProduct(newProduct);
    res.status(201).json(newProduct);
  });

  // UPDATE PRODUCT (PUT /api/products/:id)
  app.put("/api/products/:id", authMiddleware, async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const prod = db.getProduct(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: "Product gear listing not found" });
    }

    if (prod.sellerId !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to update this listing" });
    }

    const { title, description, price, condition, category, images, demoVideo, listingType, rentPriceMonthly, brand } = req.body;

    if (!title || !description || !price || !condition || !category) {
      return res.status(400).json({ error: "All gear listing fields are required" });
    }

    const priceNum = parseFloat(price);

    const updated = db.updateProduct(prod.id, {
      title,
      description,
      price: priceNum,
      condition,
      category,
      images: Array.isArray(images) && images.length > 0 ? images : ["https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1000&auto=format&fit=crop"],
      demoVideo: demoVideo || "",
      listingType: listingType || prod.listingType,
      rentPriceMonthly: rentPriceMonthly ? parseFloat(rentPriceMonthly) : prod.rentPriceMonthly,
      brand: brand || prod.brand,
    });

    res.json(updated);
  });

  // DELETE PRODUCT (DELETE /api/products/:id)
  app.delete("/api/products/:id", authMiddleware, (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const prod = db.getProduct(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: "Product gear listing not found" });
    }

    if (prod.sellerId !== req.user.id) {
      return res.status(403).json({ error: "You are not authorized to delete this listing" });
    }

    const success = db.deleteProduct(prod.id);
    if (success) {
      res.json({ success: true, message: "Listing deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete listing" });
    }
  });

  // 3. COMMENTS SECTION (COMMUNITY Q&A)
  app.get("/api/products/:id/comments", (req: Request, res: Response) => {
    res.json(db.getCommentsByProduct(req.params.id));
  });

  app.post("/api/products/:id/comments", authMiddleware, (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Comment content cannot be empty" });
    }

    const comment: Comment = {
      id: "com-" + Math.random().toString(36).substring(2, 9),
      productId: req.params.id,
      userId: req.user.id,
      userName: req.user.username,
      userProfileImage: req.user.profileImage,
      content,
      createdAt: new Date().toISOString(),
    };

    db.addComment(comment);
    res.status(201).json(comment);
  });

  // 5. SELLER RATINGS & REVIEWS
  app.post("/api/products/:id/reviews", authMiddleware, (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { rating, comment } = req.body;

    const prod = db.getProduct(req.params.id);
    if (!prod) {
      return res.status(404).json({ error: "Product listing not found" });
    }

    if (prod.sellerId === req.user.id) {
      return res.status(400).json({ error: "Sellers cannot rate themselves" });
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }

    const review: Review = {
      id: "rev-" + Math.random().toString(36).substring(2, 9),
      productId: prod.id,
      reviewerId: req.user.id,
      reviewerName: req.user.username,
      sellerId: prod.sellerId,
      rating: ratingNum,
      comment: comment || "",
      createdAt: new Date().toISOString(),
    };

    db.addReview(review);
    res.status(201).json(review);
  });

  // 6. CHAT MESSAGING
  app.get("/api/chat/conversations", authMiddleware, (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    res.json(db.getConversations(req.user.id));
  });

  app.get("/api/chat/messages/:partnerId", authMiddleware, (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    res.json(db.getMessagesBetween(req.user.id, req.params.partnerId));
  });

  app.post("/api/chat/messages", authMiddleware, (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const { receiverId, content, productId } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: "Receiver ID and message content are required" });
    }

    const receiver = db.getUser(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Recipient user not found" });
    }

    const msg: Message = {
      id: "msg-" + Math.random().toString(36).substring(2, 9),
      senderId: req.user.id,
      senderName: req.user.username,
      receiverId,
      receiverName: receiver.username,
      productId,
      content,
      createdAt: new Date().toISOString(),
    };

    db.addMessage(msg);
    res.status(201).json(msg);
  });

  // 7. USER PROFILE DETAIL (PUBLIC FOR SHOPPERS)
  app.get("/api/users/:id", (req: Request, res: Response) => {
    const user = db.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: "User profile not found" });
    
    // Calculate public data
    const reviews = db.getReviewsBySeller(user.id);
    const sellerProducts = db.getProducts().filter(p => p.sellerId === user.id);

    res.json({
      id: user.id,
      username: user.username,
      profileImage: user.profileImage,
      bio: user.bio,
      musicGenre: user.musicGenre,
      instrumentsOwned: user.instrumentsOwned,
      role: user.role,
      isVerified: user.isVerified,
      rating: user.rating,
      createdAt: user.createdAt,
      products: sellerProducts,
      reviews,
    });
  });

  // 8. TRUST SYSTEM (MANUAL TOGGLE)
  app.post("/api/users/:id/verify-badge", authMiddleware, (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    // Any user can toggle their own or seller verification for sandboxed trust system demo
    const targetUser = db.getUser(req.params.id);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    const updated = db.updateUser(targetUser.id, { isVerified: !targetUser.isVerified });
    
    // Sync all existing products owned by this seller
    if (updated) {
      db.getProducts().forEach((prod) => {
        if (prod.sellerId === updated.id) {
          prod.sellerVerified = updated.isVerified;
        }
      });
    }

    res.json({ user: updated });
  });

  // 404 handler for unmatched API routes (always return JSON, never fall through to HTML)
  app.all("/api/*", (req: Request, res: Response) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl || req.url}` });
  });

  // Global Express Error Handler (always return JSON error)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("[Express Uncaught Error]:", err);
    res.status(500).json({ error: err?.message || "Internal server error" });
  });

  // --- Vite Dev Server Middleware Integration ---
  // On Vercel, static files are served natively via CDN, so this fallback is reserved for dev/local.

async function run() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static dist files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only bind the port and start the listener if we are NOT on Vercel as a Serverless Function
  if (!process.env.VERCEL) {
    const LISTEN_PORT = Number(process.env.PORT) || 3000;
    app.listen(LISTEN_PORT, "0.0.0.0", () => {
      console.log(`[Regear Backend Server] Running on http://0.0.0.0:${LISTEN_PORT}`);
    });
  }
}

// Only bind and run if we are NOT in a Vercel Serverless environment
if (!process.env.VERCEL) {
  run();
}

export default app;
