import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  EmptyState,
  Field,
  PrimaryButton,
  Screen,
  StoreHeader,
} from "@/components/ui";
import { COLORS } from "@/constants/store";
import { FAQ_ITEMS } from "@/constants/content";
import { useStore } from "@/context/store-context";

export default function FaqScreen() {
  const { locale } = useStore();
  const en = locale === "en";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(en ? "All" : "Semua");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const allLabel = en ? "All" : "Semua";
  const localized = useMemo(
    () =>
      FAQ_ITEMS.map((item, index) => ({
        index,
        category: item.category[locale],
        q: item.q[locale],
        a: item.a[locale],
      })),
    [locale],
  );
  const categories = [
    allLabel,
    ...Array.from(new Set(localized.map((item) => item.category))),
  ];
  const normalized = query.trim().toLowerCase();
  const filtered = localized.filter(
    (item) =>
      (category === allLabel || item.category === category) &&
      (!normalized ||
        `${item.q} ${item.a} ${item.category}`
          .toLowerCase()
          .includes(normalized)),
  );

  return (
    <Screen>
      <StoreHeader
        title="FAQ"
        subtitle={en ? "Help center" : "Pusat bantuan"}
        showBack
      />
      <View style={styles.intro}>
        <Text style={styles.introTitle}>
          {en
            ? "Find the answer you need."
            : "Temukan jawaban yang kamu butuhkan."}
        </Text>
        <Text style={styles.introText}>
          {en
            ? "Information about orders, payments, shipping, returns, products, and accounts."
            : "Informasi tentang pesanan, pembayaran, pengiriman, pengembalian, produk, dan akun."}
        </Text>
      </View>
      <Field
        value={query}
        onChangeText={setQuery}
        placeholder={en ? "Search questions…" : "Cari pertanyaan…"}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {categories.map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => {
              setCategory(item);
              setOpenIndex(null);
            }}
          >
            <Text
              style={[
                styles.chipText,
                category === item && styles.chipTextActive,
              ]}
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {filtered.length ? (
        filtered.map((item) => {
          const open = openIndex === item.index;
          return (
            <View key={item.index} style={styles.item}>
              <Pressable
                style={styles.question}
                onPress={() => setOpenIndex(open ? null : item.index)}
              >
                <View style={styles.flex}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.questionText}>{item.q}</Text>
                </View>
                <Ionicons
                  name={open ? "remove" : "add"}
                  size={21}
                  color={open ? COLORS.orange : COLORS.navy}
                />
              </Pressable>
              {open ? <Text style={styles.answer}>{item.a}</Text> : null}
            </View>
          );
        })
      ) : (
        <EmptyState
          icon="search-outline"
          title={en ? "No answer found" : "Jawaban belum ditemukan"}
          message={
            en
              ? "Try another keyword or category."
              : "Coba kata kunci atau kategori lain."
          }
        />
      )}
      <View style={styles.help}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={26}
          color={COLORS.orange}
        />
        <Text style={styles.helpTitle}>
          {en ? "Still need help?" : "Masih butuh bantuan?"}
        </Text>
        <Text style={styles.helpText}>
          {en
            ? "Ask GESA for more specific store and order guidance."
            : "Tanyakan kepada GESA untuk bantuan toko dan pesanan yang lebih spesifik."}
        </Text>
        <PrimaryButton
          label={en ? "Ask GESA" : "Tanya GESA"}
          onPress={() => router.push("/chat")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 7 },
  introTitle: {
    color: COLORS.navy,
    fontWeight: "900",
    fontSize: 24,
    lineHeight: 30,
  },
  introText: { color: COLORS.muted, lineHeight: 20 },
  chips: { gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  chipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  chipText: { color: COLORS.navy, fontSize: 12, fontWeight: "800" },
  chipTextActive: { color: COLORS.paper },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 4,
  },
  question: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  flex: { flex: 1 },
  category: {
    color: COLORS.orange,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  questionText: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },
  answer: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    paddingBottom: 16,
    paddingRight: 24,
  },
  help: {
    backgroundColor: COLORS.orangeSoft,
    borderRadius: 22,
    padding: 19,
    gap: 9,
    alignItems: "center",
  },
  helpTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 19 },
  helpText: {
    color: COLORS.muted,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 3,
  },
});
