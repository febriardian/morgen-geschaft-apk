import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/lib/api";
import {
  AuthUser,
  clearAuthSession,
  restoreAuthSession,
  signInWithFirebaseCustomToken,
} from "@/lib/auth-client";
import type {
  AccountData,
  BlogPost,
  CartLine,
  Locale,
  Product,
  Promotion,
  PublicContent,
  Review,
} from "@/types/store";

type SlimLine = { id: string; qty: number };

type StoreValue = PublicContent & {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  cart: CartLine[];
  wishlist: Product[];
  cartCount: number;
  subtotal: number;
  addToCart: (product: Product) => void;
  setQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  user: AuthUser | null;
  authReady: boolean;
  account: AccountData | null;
  refreshAccount: () => Promise<void>;
  requestOtp: (
    email: string,
    referralCode?: string,
  ) => Promise<{ challengeId: string; expiresIn?: number }>;
  verifyOtp: (
    email: string,
    challengeId: string,
    code: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const StoreContext = createContext<StoreValue | null>(null);
const EMPTY: PublicContent = {
  products: [],
  promotions: [],
  reviews: [],
  blogs: [],
  flashSale: null,
};

function sortProducts(products: Product[]) {
  return [...products]
    .filter((item) => item && item.isArchived !== true)
    .sort((a, b) => Number(a.order ?? 99999) - Number(b.order ?? 99999));
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>("id");
  const [content, setContent] = useState<PublicContent>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartSlim, setCartSlim] = useState<SlimLine[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [account, setAccount] = useState<AccountData | null>(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const [products, promotions, reviews, blogs, flashSale] =
        await Promise.all([
          api<{ products: Product[] }>("/api/products"),
          api<{ coupons: Promotion[] }>("/api/promotions"),
          api<{ reviews: Review[] }>("/api/testimoni"),
          api<{ posts: BlogPost[] }>("/api/blogs"),
          api<Record<string, unknown>>("/api/flash-sales/current").catch(
            () => ({ sale: null }),
          ),
        ]);
      setContent({
        products: sortProducts(products.products || []),
        promotions: promotions.coupons || [],
        reviews: reviews.reviews || [],
        blogs: blogs.posts || [],
        flashSale: (flashSale.sale as Record<string, unknown>) || null,
      });
    } catch (requestError) {
      setError(
        (requestError as Error).message || "Data toko belum dapat dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const [storedCart, storedWishlist, storedLocale] = await Promise.all([
        AsyncStorage.getItem("mg_mobile_cart"),
        AsyncStorage.getItem("mg_mobile_wishlist"),
        AsyncStorage.getItem("mg_mobile_locale"),
      ]);
      try {
        setCartSlim(storedCart ? JSON.parse(storedCart) : []);
      } catch {
        setCartSlim([]);
      }
      try {
        setWishlistIds(storedWishlist ? JSON.parse(storedWishlist) : []);
      } catch {
        setWishlistIds([]);
      }
      if (storedLocale === "en") setLocaleState("en");
      setStorageReady(true);
    })();
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void restoreAuthSession()
      .then(setUser)
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    void AsyncStorage.multiSet([
      ["mg_mobile_cart", JSON.stringify(cartSlim)],
      ["mg_mobile_wishlist", JSON.stringify(wishlistIds)],
      ["mg_mobile_locale", locale],
    ]);
  }, [cartSlim, wishlistIds, locale, storageReady]);

  const cart = useMemo(
    () =>
      cartSlim
        .map((line) => {
          const product = content.products.find((item) => item.id === line.id);
          if (!product) return null;
          return {
            ...product,
            qty: Math.min(
              Math.max(1, line.qty),
              Math.max(1, Number(product.stock) || 1),
            ),
          };
        })
        .filter(Boolean) as CartLine[],
    [cartSlim, content.products],
  );

  const wishlist = useMemo(
    () =>
      wishlistIds
        .map((id) => content.products.find((item) => item.id === id))
        .filter(Boolean) as Product[],
    [wishlistIds, content.products],
  );

  const addToCart = useCallback((product: Product) => {
    if (Number(product.stock) <= 0) return;
    setCartSlim((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) =>
            item.id === product.id
              ? { ...item, qty: Math.min(item.qty + 1, product.stock) }
              : item,
          )
        : [...current, { id: product.id, qty: 1 }];
    });
    void Haptics.selectionAsync();
  }, []);

  const setQuantity = useCallback((id: string, qty: number) => {
    setCartSlim((current) =>
      current
        .map((item) => (item.id === id ? { ...item, qty } : item))
        .filter((item) => item.qty > 0),
    );
  }, []);

  const refreshAccount = useCallback(async () => {
    if (!user) {
      setAccount(null);
      return;
    }
    const data = await api<AccountData>("/api/customer/account", {
      auth: true,
    });
    setAccount(data);
  }, [user]);

  useEffect(() => {
    if (user) void refreshAccount().catch(() => setAccount(null));
  }, [user, refreshAccount]);

  const requestOtp = useCallback(async (email: string, referralCode = "") => {
    return api<{ challengeId: string; expiresIn?: number }>(
      "/api/customer-auth/request-otp",
      {
        method: "POST",
        body: JSON.stringify({ email, referralCode }),
      },
    );
  }, []);

  const verifyOtp = useCallback(
    async (email: string, challengeId: string, code: string) => {
      const result = await api<{ customToken: string }>(
        "/api/customer-auth/verify-otp",
        {
          method: "POST",
          body: JSON.stringify({ email, challengeId, code }),
        },
      );
      const nextUser = await signInWithFirebaseCustomToken(
        result.customToken,
        email,
      );
      setUser(nextUser);
    },
    [],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ...content,
      locale,
      setLocale: setLocaleState,
      loading,
      error,
      refresh,
      cart,
      wishlist,
      cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
      subtotal: cart.reduce(
        (sum, item) => sum + Number(item.price) * item.qty,
        0,
      ),
      addToCart,
      setQuantity,
      removeFromCart: (id) =>
        setCartSlim((current) => current.filter((item) => item.id !== id)),
      clearCart: () => setCartSlim([]),
      toggleWishlist: (product) =>
        setWishlistIds((current) =>
          current.includes(product.id)
            ? current.filter((id) => id !== product.id)
            : [...current, product.id],
        ),
      user,
      authReady,
      account,
      refreshAccount,
      requestOtp,
      verifyOtp,
      logout: async () => {
        await clearAuthSession();
        setUser(null);
        setAccount(null);
      },
    }),
    [
      content,
      locale,
      loading,
      error,
      refresh,
      cart,
      wishlist,
      addToCart,
      setQuantity,
      user,
      authReady,
      account,
      refreshAccount,
      requestOtp,
      verifyOtp,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore harus dipakai di dalam StoreProvider.");
  return value;
}
