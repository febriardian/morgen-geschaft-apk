import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton, ProductCard, Screen } from "@/components/ui";
import { COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";

const QUESTIONS = [
  {
    id: "feel",
    idText: "Bagaimana kulit terasa setelah mencuci wajah?",
    enText: "How does your skin feel after cleansing?",
    options: [
      { id: "oily", idLabel: "Cepat berminyak", en: "Gets oily quickly" },
      { id: "dry", idLabel: "Kering atau tertarik", en: "Dry or tight" },
      { id: "balanced", idLabel: "Cukup nyaman", en: "Mostly comfortable" },
    ],
  },
  {
    id: "concern",
    idText: "Masalah utama yang ingin kamu bantu rawat?",
    enText: "What is your main skin concern?",
    options: [
      {
        id: "acne",
        idLabel: "Jerawat atau komedo",
        en: "Acne or clogged pores",
      },
      { id: "dull", idLabel: "Kusam", en: "Dullness" },
      { id: "sensitive", idLabel: "Mudah kemerahan", en: "Sensitivity" },
    ],
  },
  {
    id: "sun",
    idText: "Seberapa rutin kamu memakai sunscreen?",
    enText: "How regularly do you use sunscreen?",
    options: [
      { id: "daily", idLabel: "Setiap hari", en: "Every day" },
      { id: "sometimes", idLabel: "Kadang-kadang", en: "Sometimes" },
      { id: "never", idLabel: "Belum rutin", en: "Not regularly yet" },
    ],
  },
];

export default function SkinQuizScreen() {
  const { locale, products } = useStore();
  const en = locale === "en";
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = step >= QUESTIONS.length;
  const recommendations = useMemo(() => {
    const wanted = new Set<string>();
    if (answers.concern === "acne" || answers.feel === "oily") {
      wanted.add("facewash");
      wanted.add("serum");
    }
    if (answers.concern === "dull") {
      wanted.add("facewash");
      wanted.add("serum");
    }
    if (answers.sun !== "daily") wanted.add("sunscreen");
    if (!wanted.size) wanted.add("bundle");
    return products
      .filter((item) => wanted.has(item.category || ""))
      .slice(0, 6);
  }, [answers, products]);
  if (done)
    return (
      <Screen>
        <View style={styles.result}>
          <View style={styles.resultIcon}>
            <Ionicons name="sparkles" size={30} color={COLORS.orange} />
          </View>
          <Text style={styles.resultTitle}>
            {en ? "A simple routine for you" : "Rutinitas sederhana untukmu"}
          </Text>
          <Text style={styles.resultText}>
            {en
              ? "Start slowly, patch test new products, and stop use if irritation occurs. This quiz is a shopping guide, not a diagnosis."
              : "Mulai perlahan, lakukan patch test, dan hentikan pemakaian jika terjadi iritasi. Kuis ini panduan belanja, bukan diagnosis."}
          </Text>
        </View>
        <View style={styles.grid}>
          {recommendations.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </View>
        <PrimaryButton
          label={en ? "Retake quiz" : "Ulangi kuis"}
          variant="outline"
          onPress={() => {
            setStep(0);
            setAnswers({});
          }}
        />
        <PrimaryButton
          label={en ? "Open full catalog" : "Buka semua katalog"}
          onPress={() => router.replace("/catalog")}
        />
      </Screen>
    );
  const question = QUESTIONS[step];
  return (
    <Screen>
      <View style={styles.progress}>
        <View
          style={[
            styles.progressFill,
            { width: `${((step + 1) / QUESTIONS.length) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.counter}>
        {en ? "Question" : "Pertanyaan"} {step + 1}/{QUESTIONS.length}
      </Text>
      <Text style={styles.question}>
        {en ? question.enText : question.idText}
      </Text>
      <View style={styles.options}>
        {question.options.map((option) => (
          <Pressable
            key={option.id}
            style={styles.option}
            onPress={() => {
              setAnswers({ ...answers, [question.id]: option.id });
              setStep(step + 1);
            }}
          >
            <Text style={styles.optionText}>
              {en ? option.en : option.idLabel}
            </Text>
            <Ionicons
              name="arrow-forward-circle-outline"
              size={23}
              color={COLORS.orange}
            />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  progress: {
    height: 8,
    backgroundColor: COLORS.line,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: COLORS.orange },
  counter: {
    color: COLORS.orange,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  question: {
    color: COLORS.navy,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
  },
  options: { gap: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 65,
    paddingHorizontal: 17,
    borderRadius: 19,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  optionText: { flex: 1, color: COLORS.navy, fontWeight: "800" },
  result: {
    alignItems: "center",
    padding: 20,
    gap: 10,
    backgroundColor: COLORS.paper,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  resultIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  resultTitle: {
    color: COLORS.navy,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  resultText: { color: COLORS.muted, lineHeight: 20, textAlign: "center" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
});
