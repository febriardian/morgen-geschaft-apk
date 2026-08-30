import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton, Screen, StoreHeader } from "@/components/ui";
import { COLORS, money } from "@/constants/store";
import { useStore } from "@/context/store-context";

type MenuItem = [keyof typeof Ionicons.glyphMap, string, string];

export default function AccountScreen() {
  const { locale, user, account, logout } = useStore();
  const en = locale === "en";
  const shoppingMenu: MenuItem[] = [
    ["heart-outline", "Wishlist", "/wishlist"],
    [
      "notifications-outline",
      en ? "Notifications" : "Notifikasi",
      "/notifications",
    ],
    [
      "pricetag-outline",
      en ? "Promotions & coupons" : "Promo & kupon",
      "/promotions",
    ],
    ["star-outline", en ? "Customer reviews" : "Ulasan pelanggan", "/reviews"],
    ["book-outline", en ? "Articles" : "Artikel", "/articles"],
  ];
  const helpMenu: MenuItem[] = [
    ["sparkles-outline", en ? "Skin quiz" : "Kuis tipe kulit", "/skin-quiz"],
    ["chatbubble-ellipses-outline", "GESA Assistant", "/chat"],
    ["help-circle-outline", "FAQ", "/faq"],
    [
      "storefront-outline",
      en ? "About & contact" : "Tentang & kontak",
      "/about",
    ],
    [
      "shield-checkmark-outline",
      en ? "Privacy policy" : "Kebijakan privasi",
      "/legal/privacy",
    ],
    [
      "document-text-outline",
      en ? "Terms & conditions" : "Syarat & ketentuan",
      "/legal/terms",
    ],
  ];

  return (
    <Screen>
      <StoreHeader
        title={en ? "Account" : "Akun"}
        subtitle={
          user
            ? user.email || ""
            : en
              ? "Sign in or continue as a guest"
              : "Masuk atau lanjut sebagai tamu"
        }
      />
      {user ? (
        <>
          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={29} color={COLORS.paper} />
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={styles.member}>
                {en ? "Morgen member" : "Member Morgen"}
              </Text>
            </View>
          </View>
          <View style={styles.rewards}>
            <View style={styles.reward}>
              <Text style={styles.rewardValue}>
                {account?.customer.points || 0}
              </Text>
              <Text style={styles.rewardLabel}>{en ? "Points" : "Poin"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.reward}>
              <Text style={styles.rewardValue}>
                {money(account?.customer.referralCredit || 0, locale)}
              </Text>
              <Text style={styles.rewardLabel}>
                {en ? "Referral credit" : "Saldo referral"}
              </Text>
            </View>
          </View>
          <View style={styles.referral}>
            <Text style={styles.referralLabel}>
              {en ? "Your referral code" : "Kode referralmu"}
            </Text>
            <Text selectable style={styles.referralCode}>
              {account?.customer.referralCode || "—"}
            </Text>
            <Text style={styles.referralHint}>
              {en
                ? "Share it with friends after your account is active."
                : "Bagikan kepada teman setelah akunmu aktif."}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.guest}>
          <View style={styles.guestIcon}>
            <Ionicons
              name="person-circle-outline"
              size={40}
              color={COLORS.orange}
            />
          </View>
          <Text style={styles.guestTitle}>
            {en ? "Sign in or create an account" : "Masuk atau buat akun"}
          </Text>
          <Text style={styles.guestText}>
            {en
              ? "Use one email OTP to register or sign in. Your orders, points, saved address, and referral credit will stay connected to your account."
              : "Gunakan satu kode OTP email untuk mendaftar atau masuk. Pesanan, poin, alamat, dan saldo referral akan tersimpan di akunmu."}
          </Text>
          <PrimaryButton
            label={en ? "Sign in / Register" : "Masuk / Daftar"}
            icon="mail-outline"
            onPress={() => router.push("/login")}
          />
        </View>
      )}
      <MenuGroup title={en ? "Shopping" : "Belanja"} items={shoppingMenu} />
      <MenuGroup
        title={en ? "Help & information" : "Bantuan & informasi"}
        items={helpMenu}
      />
      {user ? (
        <PrimaryButton
          label={en ? "Sign out" : "Keluar akun"}
          variant="outline"
          onPress={() => void logout()}
        />
      ) : null}
      <Text style={styles.version}>Morgen Geschäft · Android v1.2.0</Text>
    </Screen>
  );
}

function MenuGroup({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.menu}>
        {items.map(([icon, label, href]) => (
          <Pressable
            key={href}
            style={styles.menuItem}
            onPress={() => router.push(href as never)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={icon} size={20} color={COLORS.orange} />
            </View>
            <Text style={styles.menuLabel}>{label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: COLORS.paper,
    padding: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 19,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCopy: { flex: 1 },
  email: { color: COLORS.navy, fontWeight: "900" },
  member: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  rewards: {
    flexDirection: "row",
    backgroundColor: COLORS.navy,
    borderRadius: 22,
    paddingVertical: 19,
  },
  reward: { flex: 1, alignItems: "center", gap: 4 },
  rewardValue: { color: COLORS.paper, fontSize: 19, fontWeight: "900" },
  rewardLabel: { color: "#C9D5E1", fontSize: 11 },
  divider: { width: 1, backgroundColor: "#3B526D" },
  referral: {
    padding: 17,
    borderRadius: 20,
    backgroundColor: COLORS.orangeSoft,
  },
  referralLabel: { color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  referralCode: {
    color: COLORS.orange,
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 1,
    marginVertical: 5,
  },
  referralHint: { color: COLORS.muted, fontSize: 11 },
  guest: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    gap: 11,
  },
  guestIcon: {
    width: 66,
    height: 66,
    borderRadius: 23,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  guestTitle: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 20,
    textAlign: "center",
  },
  guestText: {
    color: COLORS.muted,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 4,
  },
  group: { gap: 9 },
  groupTitle: {
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  menu: {
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 22,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, color: COLORS.navy, fontWeight: "800" },
  version: { color: COLORS.muted, fontSize: 11, textAlign: "center" },
});
