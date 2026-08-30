import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Field, PrimaryButton, Screen, StoreHeader } from "@/components/ui";
import { absoluteAssetUrl, COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";
import { api } from "@/lib/api";
import type { Review } from "@/types/store";

export default function ReviewsScreen() {
  const { locale, reviews, products, refresh } = useStore();
  const en = locale === "en";
  const [helpful, setHelpful] = useState<string[]>([]);
  const [form, setForm] = useState({
    nama: "",
    produk: "",
    rating: 5,
    komentar: "",
  });
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("mg_mobile_helpful").then((value) => {
      try {
        setHelpful(value ? JSON.parse(value) : []);
      } catch {
        setHelpful([]);
      }
    });
  }, []);

  const vote = async (review: Review) => {
    const active = helpful.includes(review.id);
    try {
      await api(`/api/testimoni/${review.id}/helpful`, {
        method: "POST",
        body: JSON.stringify({ helpful: !active }),
      });
      const next = active
        ? helpful.filter((id) => id !== review.id)
        : [...helpful, review.id];
      setHelpful(next);
      await AsyncStorage.setItem("mg_mobile_helpful", JSON.stringify(next));
      await refresh();
    } catch (error) {
      Alert.alert(
        en ? "Unable to save" : "Belum dapat disimpan",
        (error as Error).message,
      );
    }
  };

  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.72,
    });
    if (!result.canceled) setImage(result.assets[0]);
  };

  const submit = async () => {
    if (form.nama.trim().length < 2 || form.komentar.trim().length < 10) return;
    setLoading(true);
    try {
      let photoUrl = "";
      if (image) {
        const body = new FormData();
        body.append("image", {
          uri: image.uri,
          name: image.fileName || "review.jpg",
          type: image.mimeType || "image/jpeg",
        } as never);
        const upload = await api<{ url: string }>("/api/testimoni/photo", {
          method: "POST",
          body,
        });
        photoUrl = upload.url;
      }
      await api("/api/testimoni", {
        method: "POST",
        body: JSON.stringify({ ...form, photoUrl }),
      });
      setForm({ nama: "", produk: "", rating: 5, komentar: "" });
      setImage(null);
      Alert.alert(
        en ? "Review submitted" : "Ulasan terkirim",
        en
          ? "It will appear after moderation."
          : "Ulasan akan tampil setelah moderasi.",
      );
    } catch (error) {
      Alert.alert(
        en ? "Unable to submit review" : "Ulasan belum terkirim",
        (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <StoreHeader
        title={en ? "Customer reviews" : "Ulasan pelanggan"}
        subtitle={`${reviews.length} ${en ? "published reviews" : "ulasan diterbitkan"}`}
        showBack
      />
      <View style={styles.summary}>
        <Text style={styles.summaryNumber}>
          {reviews.length
            ? (
                reviews.reduce((sum, item) => sum + item.rating, 0) /
                reviews.length
              ).toFixed(1)
            : "—"}
        </Text>
        <View>
          <Text style={styles.stars}>★★★★★</Text>
          <Text style={styles.summaryCopy}>
            {reviews.length} {en ? "published reviews" : "ulasan diterbitkan"}
          </Text>
        </View>
      </View>
      {reviews.map((review) => {
        const reviewImage = review.photoUrl || review.photoDataUrl;
        return (
          <View key={review.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.name}>{review.nama}</Text>
                <Text style={styles.product}>{review.produk}</Text>
              </View>
              {review.verifiedPurchase ? (
                <View style={styles.verified}>
                  <Ionicons
                    name="checkmark-circle"
                    size={13}
                    color={COLORS.success}
                  />
                  <Text style={styles.verifiedText}>
                    {en ? "Verified" : "Terverifikasi"}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.stars}>
              {"★".repeat(Math.round(review.rating))}
            </Text>
            <Text style={styles.comment}>{review.komentar}</Text>
            {reviewImage ? (
              <Image
                source={{ uri: absoluteAssetUrl(reviewImage) }}
                style={styles.reviewImage}
                contentFit="cover"
                transition={180}
              />
            ) : null}
            <Pressable style={styles.helpful} onPress={() => void vote(review)}>
              <Ionicons
                name={
                  helpful.includes(review.id)
                    ? "thumbs-up"
                    : "thumbs-up-outline"
                }
                size={16}
                color={COLORS.navy}
              />
              <Text style={styles.helpfulText}>
                {en ? "Helpful" : "Membantu"} · {review.helpfulCount || 0}
              </Text>
            </Pressable>
          </View>
        );
      })}
      <View style={styles.form}>
        <Text style={styles.formTitle}>
          {en ? "Share your experience" : "Bagikan pengalamanmu"}
        </Text>
        <Field
          label={en ? "Name" : "Nama"}
          value={form.nama}
          onChangeText={(nama) => setForm({ ...form, nama })}
        />
        <Field
          label={en ? "Product" : "Produk"}
          value={form.produk}
          onChangeText={(produk) => setForm({ ...form, produk })}
          placeholder={products[0]?.name || ""}
        />
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable
              key={value}
              onPress={() => setForm({ ...form, rating: value })}
            >
              <Ionicons
                name={value <= form.rating ? "star" : "star-outline"}
                size={29}
                color={COLORS.orange}
              />
            </Pressable>
          ))}
        </View>
        <Field
          label={en ? "Review" : "Ulasan"}
          value={form.komentar}
          onChangeText={(komentar) => setForm({ ...form, komentar })}
          multiline
          placeholder={
            en ? "Tell us what you liked…" : "Ceritakan pengalamanmu…"
          }
        />
        {image ? (
          <Image
            source={{ uri: image.uri }}
            style={styles.selectedImage}
            contentFit="cover"
          />
        ) : null}
        <PrimaryButton
          label={
            image
              ? en
                ? "Photo selected ✓"
                : "Foto dipilih ✓"
              : en
                ? "Add photo (optional)"
                : "Tambahkan foto (opsional)"
          }
          variant="outline"
          icon="camera-outline"
          onPress={() => void pick()}
        />
        <PrimaryButton
          label={en ? "Submit review" : "Kirim ulasan"}
          loading={loading}
          disabled={
            form.nama.trim().length < 2 || form.komentar.trim().length < 10
          }
          onPress={() => void submit()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    backgroundColor: COLORS.navy,
    borderRadius: 23,
    padding: 19,
  },
  summaryNumber: { color: COLORS.paper, fontSize: 35, fontWeight: "900" },
  stars: { color: COLORS.orange, letterSpacing: 2, fontWeight: "900" },
  summaryCopy: { color: "#C7D3E0", fontSize: 11, marginTop: 4 },
  card: {
    backgroundColor: COLORS.paper,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.line,
    padding: 17,
    gap: 9,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  name: { color: COLORS.navy, fontWeight: "900" },
  product: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  verified: { flexDirection: "row", gap: 4, alignItems: "center" },
  verifiedText: { color: COLORS.success, fontSize: 10, fontWeight: "800" },
  comment: { color: COLORS.ink, lineHeight: 21 },
  reviewImage: {
    width: "100%",
    height: 190,
    borderRadius: 15,
    backgroundColor: COLORS.cream,
  },
  helpful: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  helpfulText: { color: COLORS.navy, fontWeight: "700", fontSize: 11 },
  form: {
    backgroundColor: COLORS.orangeSoft,
    borderRadius: 23,
    padding: 18,
    gap: 13,
  },
  formTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 19 },
  ratingRow: { flexDirection: "row", gap: 5 },
  selectedImage: { width: "100%", height: 165, borderRadius: 15 },
});
