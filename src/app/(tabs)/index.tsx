import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  EmptyState,
  HeroCard,
  ProductCard,
  Screen,
  SectionTitle,
  StoreHeader,
} from "@/components/ui";
import { COLORS, money } from "@/constants/store";
import { useStore } from "@/context/store-context";

export default function HomeScreen() {
  const {
    locale,
    products,
    promotions,
    reviews,
    blogs,
    loading,
    error,
    refresh,
  } = useStore();
  const en = locale === "en";
  if (loading && products.length === 0)
    return (
      <Screen>
        <StoreHeader />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.orange} />
          <Text style={styles.muted}>
            {en ? "Preparing your store…" : "Menyiapkan toko…"}
          </Text>
        </View>
      </Screen>
    );
  if (error && products.length === 0)
    return (
      <Screen>
        <StoreHeader />
        <EmptyState
          icon="cloud-offline-outline"
          title={en ? "Store is unavailable" : "Toko belum dapat dimuat"}
          message={error}
          action={en ? "Try again" : "Coba lagi"}
          onAction={() => void refresh()}
        />
      </Screen>
    );

  return (
    <Screen onRefresh={() => void refresh()}>
      <StoreHeader
        subtitle={
          en ? "Skincare, made simpler" : "Skincare jadi lebih sederhana"
        }
        showAccount
      />
      <HeroCard
        title={
          en
            ? "Find care that fits your skin."
            : "Temukan perawatan yang cocok untuk kulitmu."
        }
        subtitle={
          en
            ? "Curated essentials, secure checkout, and delivery across Indonesia."
            : "Produk terpilih, pembayaran aman, dan pengiriman ke seluruh Indonesia."
        }
        action={en ? "Shop now" : "Belanja sekarang"}
        onAction={() => router.push("/catalog")}
      />

      <View style={styles.quickRow}>
        {[
          ["sparkles-outline", en ? "Skin Quiz" : "Kuis Kulit", "/skin-quiz"],
          ["chatbubble-ellipses-outline", "GESA", "/chat"],
          ["heart-outline", "Wishlist", "/wishlist"],
          ["star-outline", en ? "Reviews" : "Ulasan", "/reviews"],
        ].map(([icon, label, href]) => (
          <Pressable
            key={href}
            style={styles.quick}
            onPress={() => router.push(href as never)}
          >
            <View style={styles.quickIcon}>
              <Ionicons
                name={icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={COLORS.orange}
              />
            </View>
            <Text style={styles.quickText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {promotions.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoRow}
        >
          {promotions.slice(0, 5).map((promo) => (
            <View key={promo.code} style={styles.promo}>
              <Text style={styles.promoCode}>{promo.code}</Text>
              <Text style={styles.promoTitle}>
                {promo.type === "percent"
                  ? `${promo.value}%`
                  : money(promo.value, locale)}{" "}
                {en ? "off" : "diskon"}
              </Text>
              <Text style={styles.promoDesc} numberOfLines={2}>
                {en ? promo.translations?.en?.desc || promo.desc : promo.desc}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <SectionTitle
        eyebrow={en ? "RECOMMENDED" : "REKOMENDASI"}
        title={en ? "Popular picks" : "Pilihan populer"}
        action={en ? "See all" : "Lihat semua"}
        onAction={() => router.push("/catalog")}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productRow}
      >
        {products.slice(0, 8).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ScrollView>

      <SectionTitle
        eyebrow={en ? "REAL STORIES" : "CERITA PELANGGAN"}
        title={en ? "Customer reviews" : "Ulasan pelanggan"}
        action={en ? "See all" : "Lihat semua"}
        onAction={() => router.push("/reviews")}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.reviewRow}
      >
        {reviews.slice(0, 5).map((review) => (
          <View key={review.id} style={styles.review}>
            <Text style={styles.stars}>
              {"★".repeat(Math.round(review.rating))}
            </Text>
            <Text style={styles.reviewCopy} numberOfLines={4}>
              “{review.komentar}”
            </Text>
            <Text style={styles.reviewName}>{review.nama}</Text>
            <Text style={styles.reviewProduct}>{review.produk}</Text>
          </View>
        ))}
      </ScrollView>

      {blogs.length ? (
        <>
          <SectionTitle
            eyebrow="JOURNAL"
            title={en ? "Learn about your skin" : "Kenali kulitmu"}
            action={en ? "All articles" : "Semua artikel"}
            onAction={() => router.push("/articles")}
          />
          <Pressable
            style={styles.article}
            onPress={() => router.push(`/article/${blogs[0].id}`)}
          >
            <View style={styles.articleIcon}>
              <Ionicons name="book-outline" size={25} color={COLORS.orange} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.articleTitle} numberOfLines={2}>
                {en ? blogs[0].titleEn || blogs[0].title : blogs[0].title}
              </Text>
              <Text style={styles.articleExcerpt} numberOfLines={2}>
                {en ? blogs[0].excerptEn || blogs[0].excerpt : blogs[0].excerpt}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.navy} />
          </Pressable>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { paddingTop: 120, alignItems: "center", gap: 12 },
  muted: { color: COLORS.muted },
  quickRow: { flexDirection: "row", justifyContent: "space-between" },
  quick: { alignItems: "center", width: "23%", gap: 7 },
  quickIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  quickText: {
    color: COLORS.navy,
    fontWeight: "800",
    fontSize: 11,
    textAlign: "center",
  },
  promoRow: { gap: 12 },
  promo: {
    width: 225,
    padding: 17,
    borderRadius: 21,
    backgroundColor: COLORS.orangeSoft,
    borderWidth: 1,
    borderColor: "#F7D7B5",
  },
  promoCode: {
    alignSelf: "flex-start",
    color: COLORS.paper,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  promoTitle: {
    color: COLORS.navy,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },
  promoDesc: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  productRow: { gap: 12 },
  reviewRow: { gap: 12 },
  review: {
    width: 265,
    padding: 18,
    borderRadius: 22,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  stars: { color: COLORS.orange, letterSpacing: 2 },
  reviewCopy: { color: COLORS.ink, lineHeight: 21, marginVertical: 10 },
  reviewName: { color: COLORS.navy, fontWeight: "900" },
  reviewProduct: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  article: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 21,
    padding: 15,
  },
  articleIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  articleTitle: { color: COLORS.navy, fontWeight: "900", lineHeight: 20 },
  articleExcerpt: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});
