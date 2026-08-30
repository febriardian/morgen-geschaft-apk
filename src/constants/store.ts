export const COLORS = {
  navy: "#162B45",
  navySoft: "#244261",
  orange: "#F28C28",
  orangeSoft: "#FFF0DF",
  cream: "#FFF9F0",
  paper: "#FFFFFF",
  ink: "#132238",
  muted: "#6F7D8D",
  line: "#E7E0D8",
  success: "#16855B",
  danger: "#C94B4B",
} as const;

export const API_BASE = (
  process.env.EXPO_PUBLIC_API_BASE || "https://morgengeschaft.com"
)
  .trim()
  .replace(/\/$/, "");

export const APP_NAME = "Morgen Geschäft";
export const STORE_WHATSAPP =
  process.env.EXPO_PUBLIC_STORE_WHATSAPP || "6289601725019";
export const STORE_EMAIL = "morgengeschaft@gmail.com";

export const MARKETPLACE_LINKS = {
  shopee: "https://s.shopee.co.id/3qKoPG98iY",
  telegram: "https://t.me/MorgenGeschaftBot",
  tiktok: "https://www.tiktok.com/@morgengeschaft?_r=1&_t=ZS-97HERmuR66K",
} as const;

export const CATEGORY_LABELS: Record<string, { id: string; en: string }> = {
  all: { id: "Semua", en: "All" },
  facewash: { id: "Pembersih", en: "Cleanser" },
  sunscreen: { id: "Sunscreen", en: "Sunscreen" },
  serum: { id: "Serum", en: "Serum" },
  bodywash: { id: "Perawatan tubuh", en: "Body care" },
  bundle: { id: "Paket hemat", en: "Bundles" },
};

export function money(value: number, locale: "id" | "en" = "id") {
  return new Intl.NumberFormat(locale === "en" ? "en-ID" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function absoluteAssetUrl(value?: string) {
  if (!value) return "";
  if (value.startsWith("data:")) return value;

  // Deployment website mengoptimalkan isi /photos menjadi WebP, sedangkan
  // sebagian data produk lama di Firestore masih menyimpan ekstensi .png.
  const optimizedValue = value.replace(
    /(\/photos\/[^?#]+?)\.(?:png|jpe?g)(?=([?#]|$))/i,
    "$1.webp",
  );
  const resolved = /^https?:\/\//i.test(optimizedValue)
    ? optimizedValue
    : `${API_BASE}${optimizedValue.startsWith("/") ? optimizedValue : `/${optimizedValue}`}`;

  // Spasi pada nama foto (contoh: Product 6.webp) perlu dienkode agar dapat
  // dimuat konsisten oleh expo-image pada Android.
  return encodeURI(resolved);
}
