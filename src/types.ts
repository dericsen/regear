// src/types.ts

export type Role = "buyer" | "seller";
export type Condition = "New" | "Like New" | "Used" | "Heavily Used";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  profileImage: string;
  bio: string;
  musicGenre: string;
  instrumentsOwned: string[];
  role: Role;
  isVerified: boolean;
  rating: number; // 1-5 calculated average
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: Condition;
  category: string; // e.g., "Guitars", "Keyboards", "Drums", "Amps", "Effects", "Other"
  images: string[];
  demoVideo: string; // URL / audio / video path or demo identifier
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  sellerRating: number;
  rating?: number;
  isVerifiedGear?: boolean;
  verificationScore?: number;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
  listingType?: "rent" | "buy" | "both";
  rentPriceMonthly?: number;
  reviewCount?: number;
  co2SavedKg?: number;
  brand?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  mode?: "rent" | "buy";
  type?: "rent" | "buy";
  rentalMonths?: number;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  reviewerId: string;
  reviewerName: string;
  sellerId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  productId?: string; // Optional context for the conversation
  content: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userProfileImage: string;
  content: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
