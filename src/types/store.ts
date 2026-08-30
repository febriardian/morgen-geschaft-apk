export type Locale = "id" | "en";

export type Product = {
  id: string;
  name: string;
  nameEn?: string;
  image?: string;
  images?: string[];
  tag?: string;
  tagEn?: string;
  blurb?: string;
  blurbEn?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category?: string;
  ingredients?: string[];
  translations?: { en?: Record<string, unknown> };
  [key: string]: unknown;
};

export type CartLine = Product & { qty: number };

export type Promotion = {
  code: string;
  type: "fixed" | "percent";
  value: number;
  minOrder?: number;
  desc?: string;
  label?: string;
  translations?: { en?: { desc?: string; label?: string } };
};

export type Review = {
  id: string;
  nama: string;
  produk?: string;
  rating: number;
  komentar: string;
  photoUrl?: string;
  photoDataUrl?: string;
  verifiedPurchase?: boolean;
  helpfulCount?: number;
};

export type BlogPost = {
  id: string;
  title: string;
  titleEn?: string;
  excerpt?: string;
  excerptEn?: string;
  content?: string;
  contentEn?: string;
  image?: string;
  coverImage?: string;
  category?: string;
  date?: string;
  readTime?: string;
  readTimeEn?: string;
};

export type PublicContent = {
  products: Product[];
  promotions: Promotion[];
  reviews: Review[];
  blogs: BlogPost[];
  flashSale: Record<string, unknown> | null;
};

export type AccountData = {
  customer: {
    uid: string;
    email: string;
    points: number;
    referralCredit: number;
    referralCode: string;
    successfulReferrals?: number;
    addresses?: Address[];
  };
  rules?: Record<string, number>;
  orders: Order[];
  rewardTransactions?: Record<string, unknown>[];
};

export type Address = {
  label: string;
  recipient: string;
  phone: string;
  address: string;
  areaId: string;
  areaName: string;
};

export type Order = {
  id?: string;
  orderId: string;
  status: string;
  amount: number;
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
  shippingCourier?: string;
  shippingService?: string;
  destinationAreaName?: string;
  customerName?: string;
  address?: string;
  items?: {
    id: string;
    name: string;
    price: number;
    qty: number;
    image?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationSource?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingStatus?: string;
  notes?: string;
  statusHistory?: {
    status?: string;
    note?: string;
    at?: string;
    updatedAt?: string;
  }[];
  paymentStartedAt?: string;
  paymentExpiresAt?: string;
  returnEligibility?: { eligible?: boolean; reason?: string; until?: string };
  returnRequest?: Record<string, unknown> | null;
  [key: string]: unknown;
};
