import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React from "react";
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Screen, StoreHeader } from "@/components/ui";
import {
  COLORS,
  MARKETPLACE_LINKS,
  STORE_EMAIL,
  STORE_WHATSAPP,
} from "@/constants/store";
import { useStore } from "@/context/store-context";

const open = async (url: string) => {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Tautan belum dapat dibuka.");
  }
};

export default function AboutScreen() {
  const { locale } = useStore();
  const en = locale === "en";
  const channels = [
    {
      icon: "logo-whatsapp",
      name: "WhatsApp",
      subtitle: en
        ? "Orders and customer support"
        : "Pesanan dan bantuan pelanggan",
      url: `https://wa.me/${STORE_WHATSAPP}`,
    },
    {
      icon: "bag-handle-outline",
      name: "Shopee",
      subtitle: en ? "Official marketplace" : "Marketplace resmi",
      url: MARKETPLACE_LINKS.shopee,
    },
    {
      icon: "paper-plane-outline",
      name: "Telegram",
      subtitle: en ? "Automated ordering bot" : "Bot pemesanan otomatis",
      url: MARKETPLACE_LINKS.telegram,
    },
    {
      icon: "musical-notes-outline",
      name: "TikTok Shop",
      subtitle: en
        ? "Content and product updates"
        : "Konten dan pembaruan produk",
      url: MARKETPLACE_LINKS.tiktok,
    },
    {
      icon: "mail-outline",
      name: "Email",
      subtitle: STORE_EMAIL,
      url: `mailto:${STORE_EMAIL}`,
    },
  ];
  return (
    <Screen>
      <StoreHeader
        title={en ? "About & contact" : "Tentang & kontak"}
        subtitle="Morgen Geschäft"
        showBack
      />
      <View style={styles.brand}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.eyebrow}>MORGEN FRISCH · MORGEN GROUP</Text>
        <Text style={styles.title}>
          {en
            ? "Simple, clear, and reliable daily care."
            : "Perawatan harian yang sederhana, jelas, dan tepercaya."}
        </Text>
        <Text style={styles.copy}>
          {en
            ? "Morgen Geschäft brings together authentic selected products, practical product information, secure checkout, and customer support in one shopping experience."
            : "Morgen Geschäft menghadirkan produk pilihan yang original, informasi produk yang praktis, checkout aman, dan layanan pelanggan dalam satu pengalaman belanja."}
        </Text>
      </View>
      <View style={styles.values}>
        {[
          [
            en ? "Authentic products" : "Produk original",
            "shield-checkmark-outline",
          ],
          [
            en ? "Clear information" : "Informasi jelas",
            "document-text-outline",
          ],
          [
            en ? "Customer support" : "Bantuan pelanggan",
            "chatbubble-ellipses-outline",
          ],
        ].map(([label, icon]) => (
          <View key={label} style={styles.value}>
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={COLORS.orange}
            />
            <Text style={styles.valueText}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.sectionTitle}>
        {en ? "Official channels" : "Kanal resmi"}
      </Text>
      <View style={styles.channels}>
        {channels.map((item) => (
          <Pressable
            key={item.name}
            style={styles.channel}
            onPress={() => void open(item.url)}
          >
            <View style={styles.channelIcon}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={21}
                color={COLORS.orange}
              />
            </View>
            <View style={styles.channelCopy}>
              <Text style={styles.channelName}>{item.name}</Text>
              <Text style={styles.channelSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={COLORS.muted} />
          </Pressable>
        ))}
      </View>
      <Text style={styles.footer}>
        © 2026 Morgen Frisch - Morgen Group. All rights reserved.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  brand: {
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 25,
    padding: 22,
  },
  logo: { width: 76, height: 76, borderRadius: 24 },
  eyebrow: {
    color: COLORS.orange,
    fontWeight: "900",
    fontSize: 10,
    letterSpacing: 1.1,
  },
  title: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 23,
    lineHeight: 29,
    textAlign: "center",
  },
  copy: { color: COLORS.muted, lineHeight: 21, textAlign: "center" },
  values: { flexDirection: "row", gap: 9 },
  value: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    padding: 13,
    backgroundColor: COLORS.orangeSoft,
    borderRadius: 17,
  },
  valueText: {
    color: COLORS.navy,
    fontWeight: "800",
    fontSize: 11,
    textAlign: "center",
  },
  sectionTitle: { color: COLORS.navy, fontSize: 20, fontWeight: "900" },
  channels: {
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 22,
    overflow: "hidden",
  },
  channel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  channelCopy: { flex: 1 },
  channelName: { color: COLORS.navy, fontWeight: "900" },
  channelSubtitle: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  footer: { color: COLORS.muted, fontSize: 10, textAlign: "center" },
});
