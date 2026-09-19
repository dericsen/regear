# 🎸 ReGear — Play More, Waste Less

> **A Sustainable Circular Economy Marketplace & Rental Platform for Pre-loved Musical Instruments powered by React 19, Node.js/Express, Tailwind CSS v4, and Google Gemini AI.**

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Source Code & Architecture](#-source-code--architecture)
5. [Installation & Setup Guide](#-installation--setup-guide)
6. [Deployment Guide (Railway & Cloud Run)](#-deployment-guide)
7. [Technical Documentation & API Reference](#-technical-documentation--api-reference)
8. [Data Models & Schema](#-data-models--schema)
9. [UN Sustainable Development Goals (SDGs)](#-un-sustainable-development-goals-sdgs)
10. [License & Credits](#-license--credits)

---

## 🌟 Project Overview

**ReGear** addresses the twin challenges of expensive musical instrument access and music equipment e-waste. By providing an authenticated marketplace where musicians can either **rent gear flexibly (starting at $15/month)** or **buy certified pre-loved instruments at up to 60% below retail**, ReGear keeps instruments in active circulation for decades.

Each instrument undergoes strict **AI Acoustic & Physical Verification** (using Google Gemini 2.5 Flash) analyzing harmonic frequencies, electronic pot integrity, neck straightness, and cosmetic wear before shipment.

---

## ⚡ Key Features

- **🔄 Dual Marketplace (Rent or Buy)**: Choose flexible monthly rentals with option-to-buy equity, or outright purchases with 7-day hassle-free trials.
- **🤖 AI Acoustic & Diagnostic Verification**: Gemini 2.5 Flash assisted diagnostic engine evaluates audio recordings and instrument photos for fret buzz, pot crackle, neck relief, and harmonic sustain.
- **💬 Real-Time Musician Chat & Inquiries**:
  - Direct buyer-to-seller instant messaging.
  - Pinned instrument context cards within the chat window.
  - Quick-inquiry preset chips (*"Is this gear still available?"*, *"Can you share an audio sample?"*, etc.).
  - Multi-conversation inbox with unread counter badges and auto-polling synchronization.
- **🎥 ReGear Tone Reels**: Vertical video format featuring instrument play-tests, tone demos, and quick "Rent Now" or "Chat with Seller" buttons.
- **🔊 Real-time Web Audio Synthesizer & Oscilloscope**: Interactive sound preview for guitars, synthesizers, basses, and acoustic drums using browser-native Web Audio API and HTML5 Canvas waveform visualization.
- **🌱 Real-Time SDG & Carbon Impact Tracking**: Automated calculation of carbon emissions avoided (kg CO₂) and rare tonewood/e-waste diverted from landfills.
- **🛍️ Complete E-Commerce Experience**: Real-time shopping cart with monthly commitment breakdowns, wishlist tracking, category filters, and search.
- **🔐 Role-Based Authentication**: Seamless user accounts supporting Buyers, Sellers, and Certified Luthiers.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Animations**: [Motion](https://motion.dev/) (`motion/react`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio & Visualizer**: Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `AnalyserNode`) + HTML5 Canvas

### Backend & API
- **Runtime**: [Node.js](https://nodejs.org/) (>= 20.0.0)
- **Server Framework**: [Express 4.x](https://expressjs.com/)
- **Development Execution**: `tsx` (instant TypeScript runtime)
- **Production Bundler**: `esbuild` (bundles `server.ts` to CommonJS `dist/server.cjs` for container reliability)

### AI & Diagnostics
- **AI SDK**: [`@google/genai`](https://www.npmjs.com/package/@google/genai)
- **Model**: `gemini-2.5-flash` for instrument diagnostics, tone appraisal, and circular economy valuation.

### Persistence & Storage
- **Database Engine**: Persistent JSON Document Store (`src/db/dbService.ts` & `src/db/db.json`)
- **Client Storage**: `localStorage` caching for session state, active carts, and wishlists.

---

## 📁 Source Code & Architecture

```
regear/
├── .env.example              # Environment variables template
├── metadata.json             # App metadata & permission capabilities
├── package.json              # Dependencies and compilation scripts
├── tsconfig.json             # TypeScript compiler configuration
├── vite.config.ts            # Vite 6 configuration with Tailwind v4 plugin
├── index.html                # HTML entry point with Plus Jakarta Sans typography
├── server.ts                 # Express full-stack API server & Vite middleware
│
└── src/
    ├── main.tsx              # React client application bootstrap
    ├── App.tsx               # Root component, state management & modal dispatchers
    ├── types.ts              # TypeScript domain types (Product, User, Message, etc.)
    ├── index.css             # Tailwind v4 theme and custom utilities
    │
    ├── components/           # UI Component Library
    │   ├── Header.tsx            # Sticky navigation, search, wishlist & chat triggers
    │   ├── HeroSection.tsx       # Landing display with circular economy metrics
    │   ├── PopularInstruments.tsx# Featured gear carousel & quick sound-check
    │   ├── CatalogSection.tsx    # Filterable gear catalog (Guitars, Synths, Amps, etc.)
    │   ├── ProductDetailModal.tsx# Deep-dive view with audio player & spec sheet
    │   ├── ChatDrawer.tsx        # Real-time multi-conversation chat & inquiry drawer
    │   ├── CartDrawer.tsx        # Shopping cart with rent vs. buy subtotal calculations
    │   ├── WishlistModal.tsx     # Saved instruments board
    │   ├── PromoReels.tsx        # Musician video & tone test feed
    │   ├── ImpactSDG.tsx         # Circular economy statistics & metric counters
    │   ├── FooterFeatures.tsx    # Sustainable guarantee badges & trust markers
    │   └── Modals.tsx            # How-it-works, SDG impact, and Auth dialogs
    │
    ├── data/
    │   └── defaultProducts.ts    # Seed catalog of authenticated vintage & pre-loved gear
    │
    └── db/
        ├── dbService.ts          # Server-side persistent storage manager
        └── db.json               # Auto-generated database storage file
```

---

## 🚀 Installation & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: version `20.0.0` or higher
- **npm**: version `9.0.0` or higher

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/regear.git
cd regear
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```
Open `.env` and set your configuration:
```env
# Google Gemini AI API Key (Optional for local dev; enables AI Quality Diagnostics)
GEMINI_API_KEY="your_gemini_api_key_here"

# Application URL
APP_URL="http://localhost:3000"

# Port (Defaults to 3000)
PORT=3000
```

### 5. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🚢 Deployment Guide

### Deploying to Railway
This repository is optimized for one-click deployment on [Railway](https://railway.app):
1. Push your repository to **GitHub**.
2. Log into Railway and select **"New Project" -> "Deploy from GitHub repo"**.
3. Railway will automatically detect `package.json` with Node.js 20+.
4. In Railway project settings, add the environment variable `GEMINI_API_KEY`.
5. The build runs:
   ```bash
   npm run build
   ```
6. The production server starts with:
   ```bash
   npm start
   ```

### Custom Domain Setup
1. In the Railway dashboard, click on your service.
2. Go to the **Settings** tab -> **Networking** -> **Custom Domains**.
3. Add your custom domain (e.g. `regear.yourdomain.com`).
4. Set up the requested **CNAME** or **A record** with your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.).
5. Automatic SSL/TLS certificates will be generated by Railway within a few minutes.

---

## 📡 Technical Documentation & API Reference

All backend endpoints are prefixed with `/api` and handled in `server.ts`.

### 1. Authentication Endpoints
- **`POST /api/auth/register`**
  - Registers a new musician account.
  - Body: `{ username, email, password, role }`
  - Returns: `{ user, token }`
- **`POST /api/auth/login`**
  - Authenticates an existing user.
  - Body: `{ username, password }`
  - Returns: `{ user, token }`

### 2. Product Endpoints
- **`GET /api/products`**
  - Query parameters: `search`, `category`, `listingType` (`rent` | `buy`), `aiVerified` (`true` | `false`).
  - Returns an array of filtered `Product` objects.
- **`GET /api/products/:id`**
  - Returns details for a single product by ID.
- **`POST /api/products`**
  - Lists a new instrument. Requires `Authorization: Bearer <token>` header.
  - Body: `Product` payload.

### 3. Chat & Inquiries Endpoints
- **`GET /api/chat/conversations`**
  - Retrieves active conversation threads for the authenticated user.
  - Requires `Authorization: Bearer <token>`.
  - Returns: Array of `Conversation` objects with avatar, last message, and timestamp.
- **`GET /api/chat/messages/:partnerId`**
  - Retrieves chronological message history between the authenticated user and `partnerId`.
  - Requires `Authorization: Bearer <token>`.
- **`POST /api/chat/messages`**
  - Sends a new message.
  - Requires `Authorization: Bearer <token>`.
  - Body: `{ receiverId, productId, content }`
- **`GET /api/chat/users`**
  - Returns a list of sellers and musicians available for chat.

### 4. AI Verification Endpoints
- **`POST /api/ai/verify`**
  - Invokes Google Gemini 2.5 Flash to perform acoustic frequency, neck relief, and electronic health diagnostics.
  - Body: `{ audioSampleUrl, productSpecs, notes }`

---

## 📊 Data Models & Schema

### `Product`
```typescript
interface Product {
  id: string;
  title: string;
  category: "guitars" | "keyboards" | "amps" | "drums" | "audio";
  brand: string;
  model: string;
  year?: number;
  condition: "Mint" | "Excellent" | "Very Good" | "Good" | "Vintage Restored";
  listingType: "rent" | "buy" | "both";
  price: number;              // Outright purchase price ($)
  rentMonthly?: number;       // Monthly rental rate ($/mo)
  images: string[];
  description: string;
  specs: Record<string, string>;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  aiVerified: boolean;
  audioPreviewUrl?: string;
  savedCO2Kg: number;         // Carbon emissions diverted
  treesEquivalent: number;
}
```

### `Message`
```typescript
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  productId?: string;
  content: string;
  createdAt: string;
}
```

---

## 🌍 UN Sustainable Development Goals (SDGs)

ReGear was built from the ground up to support the United Nations 2030 Agenda:

- **🎯 SDG 12: Responsible Consumption & Production (Target 12.5)**
  - Promotes circular economy lifecycles for complex electronic and wood equipment, substantially reducing waste generation through reuse and refurbishment.
- **🎯 SDG 13: Climate Action (Target 13.3)**
  - Offsets up to 45 kg of CO₂ per instrument by avoiding new factory manufacturing and trans-oceanic freight.
- **🎯 SDG 4: Quality Education (Target 4.4)**
  - Removes financial barriers for aspiring students and musicians by offering ultra-low cost rental rates ($15–$30/mo) with full maintenance coverage.

---

## 📄 Available Scripts

In the project root, you can run:

- **`npm run dev`**: Starts the local server in development mode with `tsx`.
- **`npm run build`**: Compiles the React client with Vite and bundles the Node server with `esbuild`.
- **`npm start`**: Runs the compiled CommonJS server in production (`dist/server.cjs`).
- **`npm run lint`**: Executes TypeScript type checking without emitting files (`tsc --noEmit`).
- **`npm run clean`**: Cleans up previous build artifacts.

---

## 📜 License & Credits

Built with ❤️ for musicians and the planet.  
*ReGear — Play More, Waste Less.*
