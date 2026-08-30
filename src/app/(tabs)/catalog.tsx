import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { EmptyState, ProductCard, Screen, StoreHeader } from "@/components/ui";
import { CATEGORY_LABELS, COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";

export default function CatalogScreen() {
  const { locale, products, refresh } = useStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const en = locale === "en";
  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          products.map((item) => item.category).filter(Boolean) as string[],
        ),
      ),
    ],
    [products],
  );
  const filtered = useMemo(
    () =>
      products.filter((item) => {
        const name = `${item.name} ${item.nameEn || ""}`.toLowerCase();
        return (
          (category === "all" || item.category === category) &&
          name.includes(query.trim().toLowerCase())
        );
      }),
    [products, query, category],
  );

  return (
    <Screen onRefresh={() => void refresh()}>
      <StoreHeader
        title={en ? "Catalog" : "Katalog"}
        subtitle={`${filtered.length} ${en ? "products" : "produk"}`}
        showBack
        onBack={() => router.replace("/")}
      />
      <View style={styles.search}>
        <Ionicons name="search" size={20} color={COLORS.muted} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={en ? "Search products…" : "Cari produk…"}
          placeholderTextColor="#98A1AB"
        />
      </View>
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
              {CATEGORY_LABELS[item]?.[locale] || item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {filtered.length ? (
        <View style={styles.grid}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="search-outline"
          title={en ? "No products found" : "Produk tidak ditemukan"}
          message={
            en
              ? "Try another search or category."
              : "Coba kata pencarian atau kategori lain."
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.paper,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  searchInput: { flex: 1, color: COLORS.ink, fontSize: 15 },
  chips: { gap: 9 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.paper,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  chipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  chipText: { color: COLORS.navy, fontWeight: "800", fontSize: 12 },
  chipTextActive: { color: COLORS.paper },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
});
