import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  EmptyState,
  Field,
  PrimaryButton,
  ProductCard,
  Screen,
  SectionTitle,
} from "@/components/ui";
import { absoluteAssetUrl, COLORS, money } from "@/constants/store";
import { useStore } from "@/context/store-context";
import { api } from "@/lib/api";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale, products, addToCart, wishlist, toggleWishlist } = useStore();
  const [email, setEmail] = useState("");
  const [notifying, setNotifying] = useState(false);
  const en = locale === "en";
  const product = products.find((item) => item.id === id);
  if (!product)
    return (
      <Screen>
        <EmptyState
          icon="cube-outline"
          title={en ? "Product not found" : "Produk tidak ditemukan"}
          message={
            en
              ? "This product may no longer be available."
              : "Produk ini mungkin sudah tidak tersedia."
          }
          action={en ? "Back to catalog" : "Kembali ke katalog"}
          onAction={() => router.replace("/catalog")}
        />
      </Screen>
    );
  const translated = product.translations?.en || {};
  const name = en
    ? product.nameEn ||
      (typeof translated.name === "string" ? translated.name : product.name)
    : product.name;
  const blurb = en
    ? product.blurbEn ||
      (typeof translated.blurb === "string" ? translated.blurb : product.blurb)
    : product.blurb;
  const related = products
    .filter(
      (item) => item.id !== product.id && item.category === product.category,
    )
    .slice(0, 6);
  const favorite = wishlist.some((item) => item.id === product.id);
  const notify = async () => {
    setNotifying(true);
    try {
      const result = await api<{ message: string }>("/api/notify-stock", {
        method: "POST",
        body: JSON.stringify({
          email,
          productId: product.id,
          productName: product.name,
        }),
      });
      Alert.alert(en ? "Registered" : "Berhasil", result.message);
      setEmail("");
    } catch (error) {
      Alert.alert(
        en ? "Unable to register" : "Belum berhasil",
        (error as Error).message,
      );
    } finally {
      setNotifying(false);
    }
  };
  return (
    <Screen style={styles.content}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: absoluteAssetUrl(product.image) }}
          style={styles.image}
          contentFit="contain"
        />
        <Pressable
          style={styles.favorite}
          onPress={() => toggleWishlist(product)}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={24}
            color={favorite ? COLORS.danger : COLORS.navy}
          />
        </Pressable>
      </View>
      <View style={styles.copy}>
        <Text style={styles.tag}>
          {en ? product.tagEn || product.tag : product.tag}
        </Text>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{money(product.price, locale)}</Text>
          {product.originalPrice ? (
            <Text style={styles.original}>
              {money(product.originalPrice, locale)}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.stockPill,
            Number(product.stock) <= 0 && styles.stockOut,
          ]}
        >
          <Text
            style={[
              styles.stockText,
              Number(product.stock) <= 0 && styles.stockOutText,
            ]}
          >
            {Number(product.stock) > 0
              ? `${en ? "Ready stock" : "Stok tersedia"} · ${product.stock}`
              : en
                ? "Out of stock"
                : "Stok habis"}
          </Text>
        </View>
        <Text style={styles.blurb}>{blurb}</Text>
      </View>
      {Number(product.stock) > 0 ? (
        <PrimaryButton
          label={en ? "Add to cart" : "Tambah ke keranjang"}
          icon="bag-add-outline"
          onPress={() => addToCart(product)}
        />
      ) : (
        <View style={styles.notify}>
          <Text style={styles.notifyTitle}>
            {en ? "Notify me when available" : "Kabari saat stok tersedia"}
          </Text>
          <Field
            value={email}
            onChangeText={setEmail}
            placeholder="email@contoh.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PrimaryButton
            label={en ? "Register notification" : "Daftar notifikasi"}
            loading={notifying}
            disabled={!email.includes("@")}
            onPress={() => void notify()}
          />
        </View>
      )}
      <View style={styles.detail}>
        <Text style={styles.detailTitle}>
          {en ? "Product details" : "Detail produk"}
        </Text>
        {[
          ["category", en ? "Category" : "Kategori"],
          ["condition", en ? "Condition" : "Kondisi"],
          ["packaging", en ? "Packaging" : "Pengemasan"],
          ["suitableFor", en ? "Suitable for" : "Cocok untuk"],
        ].map(([key, label]) =>
          product[key] ? (
            <View key={key} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{String(product[key])}</Text>
            </View>
          ) : null,
        )}
        {product.ingredients?.length ? (
          <View style={styles.ingredients}>
            <Text style={styles.detailLabel}>
              {en ? "Key ingredients" : "Kandungan"}
            </Text>
            <View style={styles.ingredientWrap}>
              {product.ingredients.map((item) => (
                <View key={item} style={styles.ingredient}>
                  <Text style={styles.ingredientText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
      {related.length ? (
        <>
          <SectionTitle title={en ? "You may also like" : "Pilihan lainnya"} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.related}
          >
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </ScrollView>
        </>
      ) : null}
    </Screen>
  );
}
const styles = StyleSheet.create({
  content: { paddingTop: 8 },
  imageWrap: {
    height: 340,
    borderRadius: 28,
    backgroundColor: COLORS.paper,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  image: { width: "100%", height: "100%" },
  favorite: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { gap: 9 },
  tag: {
    color: COLORS.orange,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  name: { color: COLORS.navy, fontSize: 25, lineHeight: 31, fontWeight: "900" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  price: { color: COLORS.orange, fontSize: 24, fontWeight: "900" },
  original: { color: COLORS.muted, textDecorationLine: "line-through" },
  stockPill: {
    alignSelf: "flex-start",
    backgroundColor: "#E7F6F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stockOut: { backgroundColor: "#FBEAEA" },
  stockText: { color: COLORS.success, fontSize: 11, fontWeight: "900" },
  stockOutText: { color: COLORS.danger },
  blurb: { color: COLORS.muted, fontSize: 15, lineHeight: 23 },
  notify: {
    gap: 12,
    padding: 17,
    backgroundColor: COLORS.orangeSoft,
    borderRadius: 21,
  },
  notifyTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 16 },
  detail: {
    padding: 18,
    borderRadius: 23,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 13,
  },
  detailTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 19 },
  detailRow: {
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
    paddingBottom: 10,
  },
  detailLabel: { color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  detailValue: {
    flex: 1,
    color: COLORS.ink,
    fontWeight: "700",
    textAlign: "right",
  },
  ingredients: { gap: 9 },
  ingredientWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  ingredient: {
    backgroundColor: COLORS.cream,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  ingredientText: { color: COLORS.navy, fontSize: 11, fontWeight: "700" },
  related: { gap: 12 },
});
