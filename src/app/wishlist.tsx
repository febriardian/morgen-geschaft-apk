import { router } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { EmptyState, ProductCard, Screen } from "@/components/ui";
import { useStore } from "@/context/store-context";

export default function WishlistScreen() {
  const { locale, wishlist } = useStore();
  const en = locale === "en";
  return (
    <Screen>
      {wishlist.length ? (
        <View style={styles.grid}>
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </View>
      ) : (
        <EmptyState
          icon="heart-outline"
          title={en ? "Your wishlist is empty" : "Wishlist masih kosong"}
          message={
            en
              ? "Tap the heart on a product to save it here."
              : "Tekan ikon hati pada produk untuk menyimpannya di sini."
          }
          action={en ? "Browse catalog" : "Buka katalog"}
          onAction={() => router.replace("/catalog")}
        />
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
});
