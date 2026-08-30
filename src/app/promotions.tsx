import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { EmptyState, Screen, StoreHeader } from "@/components/ui";
import { COLORS, money } from "@/constants/store";
import { useStore } from "@/context/store-context";

export default function PromotionsScreen() {
  const { locale, promotions } = useStore();
  const en = locale === "en";
  return (
    <Screen>
      <StoreHeader
        title={en ? "Promotions" : "Promo"}
        subtitle={
          en ? "Active offers and coupons" : "Penawaran dan kupon aktif"
        }
        showBack
      />
      {promotions.length ? (
        promotions.map((promo, index) => {
          const description = en
            ? promo.translations?.en?.desc || promo.desc
            : promo.desc;
          return (
            <View
              key={promo.code}
              style={[styles.card, index % 2 === 1 && styles.cardAlt]}
            >
              <View style={styles.top}>
                <View style={styles.icon}>
                  <Ionicons
                    name="pricetag-outline"
                    size={23}
                    color={COLORS.orange}
                  />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.kicker}>
                    {en ? "ACTIVE COUPON" : "KUPON AKTIF"}
                  </Text>
                  <Text style={styles.value}>
                    {promo.type === "percent"
                      ? `${promo.value}%`
                      : money(promo.value, locale)}{" "}
                    {en ? "off" : "diskon"}
                  </Text>
                </View>
              </View>
              <Text style={styles.description}>
                {description ||
                  (en
                    ? "Use this code during checkout."
                    : "Gunakan kode ini saat checkout.")}
              </Text>
              {promo.minOrder ? (
                <Text style={styles.minimum}>
                  {en ? "Minimum order" : "Minimal belanja"}{" "}
                  {money(promo.minOrder, locale)}
                </Text>
              ) : null}
              <View style={styles.codeRow}>
                <Text selectable style={styles.code}>
                  {promo.code}
                </Text>
                <Pressable
                  style={styles.share}
                  onPress={() =>
                    void Share.share({
                      message: `${promo.code} — ${description || "Morgen Geschäft"}`,
                    })
                  }
                >
                  <Ionicons
                    name="share-social-outline"
                    size={18}
                    color={COLORS.paper}
                  />
                  <Text style={styles.shareText}>
                    {en ? "Share" : "Bagikan"}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })
      ) : (
        <EmptyState
          icon="pricetag-outline"
          title={en ? "No active promotions" : "Belum ada promo aktif"}
          message={
            en
              ? "New offers will appear here automatically."
              : "Penawaran baru akan muncul otomatis di sini."
          }
        />
      )}
      <Pressable style={styles.bundle} onPress={() => router.push("/catalog")}>
        <View style={styles.bundleIcon}>
          <Ionicons name="gift-outline" size={25} color={COLORS.orange} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.bundleTitle}>
            {en ? "See value bundles" : "Lihat bundle hemat"}
          </Text>
          <Text style={styles.bundleText}>
            {en
              ? "Find bundled products at a better combined price."
              : "Temukan paket produk dengan harga gabungan lebih hemat."}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.navy} />
      </Pressable>
    </Screen>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    padding: 19,
    borderRadius: 23,
    backgroundColor: COLORS.orangeSoft,
    borderWidth: 1,
    borderColor: "#F3D2AE",
    gap: 12,
  },
  cardAlt: { backgroundColor: "#EEF3F8", borderColor: "#D4DFE9" },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: {
    color: COLORS.orange,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  value: { color: COLORS.navy, fontSize: 22, fontWeight: "900", marginTop: 3 },
  description: { color: COLORS.muted, lineHeight: 20 },
  minimum: { color: COLORS.navy, fontWeight: "700", fontSize: 11 },
  codeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  code: {
    flex: 1,
    color: COLORS.orange,
    backgroundColor: COLORS.paper,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  share: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.navy,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 12,
  },
  shareText: { color: COLORS.paper, fontWeight: "800", fontSize: 12 },
  bundle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 21,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  bundleIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.orangeSoft,
  },
  bundleTitle: { color: COLORS.navy, fontWeight: "900" },
  bundleText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});
