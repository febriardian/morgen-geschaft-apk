import { useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Screen, StoreHeader } from "@/components/ui";
import { COLORS } from "@/constants/store";
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from "@/constants/content";
import { useStore } from "@/context/store-context";

export default function LegalScreen() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const { locale } = useStore();
  const en = locale === "en";
  const privacy = kind === "privacy";
  const title = privacy
    ? en
      ? "Privacy policy"
      : "Kebijakan privasi"
    : en
      ? "Terms & conditions"
      : "Syarat & ketentuan";
  const sections = privacy ? PRIVACY_SECTIONS : TERMS_SECTIONS;
  return (
    <Screen>
      <StoreHeader
        title={title}
        subtitle={
          en ? "Last updated: August 2026" : "Terakhir diperbarui: Agustus 2026"
        }
        showBack
      />
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          {en
            ? "This in-app summary follows the customer information shown on the Morgen Geschäft website."
            : "Ringkasan di aplikasi ini mengikuti informasi pelanggan yang ditampilkan pada website Morgen Geschäft."}
        </Text>
      </View>
      {sections.map((section, index) => (
        <View key={section.id} style={styles.section}>
          <View style={styles.number}>
            <Text style={styles.numberText}>
              {String(index + 1).padStart(2, "0")}
            </Text>
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>{en ? section.en : section.id}</Text>
            <Text style={styles.body}>
              {en ? section.bodyEn : section.bodyId}
            </Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
const styles = StyleSheet.create({
  notice: { padding: 15, borderRadius: 17, backgroundColor: COLORS.orangeSoft },
  noticeText: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  section: {
    flexDirection: "row",
    gap: 13,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  number: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { color: COLORS.orange, fontWeight: "900", fontSize: 12 },
  copy: { flex: 1, gap: 6 },
  title: { color: COLORS.navy, fontWeight: "900", fontSize: 17 },
  body: { color: COLORS.muted, fontSize: 14, lineHeight: 22 },
});
