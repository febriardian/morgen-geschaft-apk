import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  EmptyState,
  PrimaryButton,
  Screen,
  StoreHeader,
} from "@/components/ui";
import { absoluteAssetUrl, COLORS, money } from "@/constants/store";
import { useStore } from "@/context/store-context";

export default function CartScreen() {
  const { locale, cart, subtotal, setQuantity, removeFromCart } = useStore();
  const en = locale === "en";
  return (
    <Screen>
      <StoreHeader
        title={en ? "Your cart" : "Keranjangmu"}
        subtitle={`${cart.length} ${en ? "items" : "jenis produk"}`}
      />
      {cart.length === 0 ? (
        <EmptyState
          icon="bag-handle-outline"
          title={en ? "Your cart is empty" : "Keranjang masih kosong"}
          message={
            en
              ? "Discover products selected for your daily routine."
              : "Temukan produk pilihan untuk rutinitas harianmu."
          }
          action={en ? "Browse catalog" : "Buka katalog"}
          onAction={() => router.push("/catalog")}
        />
      ) : (
        <>
          {cart.map((item) => (
            <View key={item.id} style={styles.line}>
              <Pressable onPress={() => router.push(`/product/${item.id}`)}>
                <Image
                  source={{ uri: absoluteAssetUrl(item.image) }}
                  style={styles.image}
                  contentFit="contain"
                />
              </Pressable>
              <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={2}>
                  {en ? item.nameEn || item.name : item.name}
                </Text>
                <Text style={styles.price}>{money(item.price, locale)}</Text>
                <View style={styles.qty}>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => setQuantity(item.id, item.qty - 1)}
                  >
                    <Ionicons name="remove" size={17} color={COLORS.navy} />
                  </Pressable>
                  <Text style={styles.qtyText}>{item.qty}</Text>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() =>
                      setQuantity(item.id, Math.min(item.qty + 1, item.stock))
                    }
                  >
                    <Ionicons name="add" size={17} color={COLORS.navy} />
                  </Pressable>
                </View>
              </View>
              <Pressable
                onPress={() => removeFromCart(item.id)}
                style={styles.remove}
              >
                <Ionicons
                  name="trash-outline"
                  size={19}
                  color={COLORS.danger}
                />
              </Pressable>
            </View>
          ))}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {en ? "Subtotal" : "Subtotal"}
              </Text>
              <Text style={styles.total}>{money(subtotal, locale)}</Text>
            </View>
            <Text style={styles.note}>
              {en
                ? "Shipping and discounts are calculated at checkout."
                : "Ongkir dan diskon dihitung saat checkout."}
            </Text>
            <PrimaryButton
              label={en ? "Continue to checkout" : "Lanjut ke checkout"}
              icon="lock-closed-outline"
              onPress={() => router.push("/checkout")}
            />
          </View>
        </>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  line: {
    flexDirection: "row",
    gap: 13,
    backgroundColor: COLORS.paper,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 12,
    alignItems: "center",
  },
  image: {
    width: 84,
    height: 84,
    backgroundColor: "#F8F5F0",
    borderRadius: 15,
  },
  copy: { flex: 1, gap: 5 },
  name: { color: COLORS.navy, fontWeight: "900", lineHeight: 19 },
  price: { color: COLORS.orange, fontWeight: "900" },
  qty: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyButton: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cream,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  qtyText: {
    minWidth: 15,
    textAlign: "center",
    color: COLORS.ink,
    fontWeight: "900",
  },
  remove: { alignSelf: "flex-start", padding: 6 },
  summary: {
    backgroundColor: COLORS.paper,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 18,
    gap: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: { color: COLORS.muted, fontWeight: "700" },
  total: { color: COLORS.navy, fontSize: 22, fontWeight: "900" },
  note: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
