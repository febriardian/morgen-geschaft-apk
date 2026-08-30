import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState, Screen, StoreHeader } from "@/components/ui";
import { absoluteAssetUrl, COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";

const CATEGORY_NAMES: Record<string, { id: string; en: string }> = {
  "panduan-skincare": { id: "Panduan Skincare", en: "Skincare Guide" },
  "bahan-aktif": { id: "Bahan Aktif", en: "Active Ingredients" },
  "perawatan-harian": { id: "Perawatan Harian", en: "Daily Care" },
  "berita-produk": { id: "Berita Produk", en: "Product News" },
};

export default function ArticlesScreen() {
  const { locale, blogs } = useStore();
  const en = locale === "en";
  const [category, setCategory] = useState("all");
  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(blogs.map((post) => post.category).filter(Boolean) as string[]),
      ),
    ],
    [blogs],
  );
  const filtered =
    category === "all"
      ? blogs
      : blogs.filter((post) => post.category === category);

  return (
    <Screen>
      <StoreHeader
        title={en ? "Articles" : "Artikel"}
        subtitle={`${filtered.length} ${en ? "articles" : "artikel"}`}
        showBack
      />
      {categories.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {categories.map((item) => (
            <Pressable
              key={item}
              style={[styles.chip, category === item && styles.chipActive]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === item && styles.chipTextActive,
                ]}
              >
                {item === "all"
                  ? en
                    ? "All"
                    : "Semua"
                  : CATEGORY_NAMES[item]?.[locale] || item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {filtered.length ? (
        filtered.map((post, index) => {
          const cover = post.coverImage || post.image;
          const mark = String(
            blogs.findIndex((item) => item.id === post.id) + 1,
          ).padStart(2, "0");
          return (
            <Pressable
              key={post.id}
              style={styles.card}
              onPress={() => router.push(`/article/${post.id}`)}
            >
              <View style={[styles.cover, !cover && styles.coverPlaceholder]}>
                {cover ? (
                  <Image
                    source={{ uri: absoluteAssetUrl(cover) }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    transition={180}
                  />
                ) : null}
                {cover ? (
                  <View style={styles.coverShade} />
                ) : (
                  <View style={styles.ring} />
                )}
                <Text style={[styles.mark, cover && styles.markOnImage]}>
                  {mark}
                </Text>
                <Text style={[styles.category, cover && styles.textOnImage]}>
                  {CATEGORY_NAMES[post.category || ""]?.[locale] ||
                    post.category ||
                    "JOURNAL"}
                </Text>
                <Text
                  style={[styles.title, cover && styles.textOnImage]}
                  numberOfLines={3}
                >
                  {en ? post.titleEn || post.title : post.title}
                </Text>
              </View>
              <View style={styles.copy}>
                <Text style={styles.excerpt} numberOfLines={3}>
                  {en ? post.excerptEn || post.excerpt : post.excerpt}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>
                    {en
                      ? post.readTimeEn || post.readTime || "3 min read"
                      : post.readTime || "3 menit"}
                  </Text>
                  <View style={styles.readMore}>
                    <Text style={styles.readMoreText}>
                      {en ? "Read" : "Baca"}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color={COLORS.orange}
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })
      ) : (
        <EmptyState
          icon="book-outline"
          title={en ? "No articles yet" : "Belum ada artikel"}
          message={
            en
              ? "New stories will appear here."
              : "Artikel baru akan tampil di sini."
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { gap: 9 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: COLORS.paper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  chipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  chipText: { color: COLORS.navy, fontSize: 12, fontWeight: "800" },
  chipTextActive: { color: COLORS.paper },
  card: {
    borderRadius: 23,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    overflow: "hidden",
  },
  cover: {
    height: 178,
    backgroundColor: COLORS.navy,
    padding: 19,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  coverPlaceholder: { backgroundColor: "#F6EBDD" },
  coverShade: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(22,43,69,.60)",
  },
  ring: {
    position: "absolute",
    width: 155,
    height: 155,
    borderRadius: 78,
    borderWidth: 25,
    borderColor: "rgba(242,140,40,.17)",
    right: -38,
    bottom: -52,
  },
  mark: {
    position: "absolute",
    top: 15,
    right: 18,
    color: "rgba(22,43,69,.12)",
    fontSize: 45,
    lineHeight: 48,
    fontWeight: "900",
  },
  markOnImage: { color: "rgba(255,255,255,.22)" },
  category: {
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    zIndex: 1,
    marginBottom: 7,
  },
  title: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 22,
    lineHeight: 27,
    maxWidth: "82%",
    zIndex: 1,
  },
  textOnImage: { color: COLORS.paper },
  copy: { padding: 17, gap: 12 },
  excerpt: { color: COLORS.muted, lineHeight: 20, fontSize: 13 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: { color: COLORS.muted, fontSize: 11 },
  readMore: { flexDirection: "row", alignItems: "center", gap: 5 },
  readMoreText: { color: COLORS.orange, fontWeight: "800", fontSize: 12 },
});
