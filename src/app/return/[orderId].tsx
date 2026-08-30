import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Field, PrimaryButton, Screen } from "@/components/ui";
import { COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";
import { api } from "@/lib/api";
import { readGuestOrders } from "@/lib/order-storage";
import type { Order } from "@/types/store";

const ISSUES = [
  ["damaged_or_leaking", "Rusak atau bocor", "Damaged or leaking"],
  ["wrong_item", "Produk tidak sesuai", "Wrong item"],
  ["missing_quantity", "Jumlah kurang", "Missing quantity"],
  ["expired_or_unfit", "Kedaluwarsa atau tidak layak", "Expired or unfit"],
  ["seller_error", "Kesalahan penjual lainnya", "Other seller error"],
];
export default function ReturnScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { locale, user, account } = useStore();
  const en = locale === "en";
  const accountOrder = account?.orders.find((item) => item.orderId === orderId);
  const [resolvedOrder, setResolvedOrder] = useState<Order | undefined>(
    accountOrder,
  );
  const [phone, setPhone] = useState("");
  const [issueType, setIssueType] = useState("");
  const [resolution, setResolution] = useState<"replacement" | "refund">(
    "replacement",
  );
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  useEffect(() => {
    if (accountOrder) setResolvedOrder(accountOrder);
    void readGuestOrders().then(async (items) => {
      const access = items.find((item) => item.orderId === orderId);
      setAccessToken(access?.customerAccessToken || "");
      if (!accountOrder && access && orderId) {
        try {
          const result = await api<{ order: Order }>("/api/orders/lookup", {
            method: "POST",
            headers: { "X-Customer-Access-Token": access.customerAccessToken },
            body: JSON.stringify({
              orderId,
              customerAccessToken: access.customerAccessToken,
            }),
          });
          setResolvedOrder(result.order);
        } catch {
          setResolvedOrder(undefined);
        }
      }
    });
  }, [accountOrder, orderId]);
  const pick = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.72,
    });
    if (!result.canceled) setEvidence(result.assets.slice(0, 3));
  };
  const submit = async () => {
    if (
      !orderId ||
      description.trim().length < 20 ||
      !issueType ||
      !evidence.length
    )
      return;
    setLoading(true);
    try {
      const selectedItems = (resolvedOrder?.items || []).map((item) => ({
        id: item.id,
        qty: item.qty,
      }));
      if (!selectedItems.length)
        throw new Error(
          en
            ? "Order items are not available. Open the order again and retry."
            : "Daftar produk pesanan belum tersedia. Buka ulang pesanan lalu coba lagi.",
        );
      const body = new FormData();
      body.append("orderId", orderId);
      body.append("phone", phone);
      body.append("issueType", issueType);
      body.append("requestedResolution", resolution);
      body.append("description", description);
      body.append("policyAccepted", "true");
      body.append("selectedItems", JSON.stringify(selectedItems));
      evidence.forEach((asset, index) =>
        body.append("evidence", {
          uri: asset.uri,
          name: asset.fileName || `evidence-${index + 1}.jpg`,
          type: asset.mimeType || "image/jpeg",
        } as never),
      );
      await api("/api/returns", {
        method: "POST",
        auth: Boolean(user),
        headers: accessToken ? { "X-Customer-Access-Token": accessToken } : {},
        body,
        timeoutMs: 40000,
      });
      Alert.alert(
        en ? "Request submitted" : "Pengajuan terkirim",
        en
          ? "Our team will review it from the admin panel."
          : "Tim kami akan meninjaunya melalui panel admin.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      Alert.alert(
        en ? "Unable to submit" : "Pengajuan belum terkirim",
        (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen>
      <View style={styles.notice}>
        <Ionicons name="time-outline" size={20} color={COLORS.orange} />
        <Text style={styles.noticeText}>
          {en
            ? "Return requests are available up to 3×24 hours after delivery and require photo evidence."
            : "Pengajuan retur tersedia maksimal 3×24 jam setelah pesanan diterima dan wajib menyertakan foto bukti."}
        </Text>
      </View>
      <Field
        label={en ? "Order ID" : "ID Pesanan"}
        value={orderId || ""}
        editable={false}
      />
      <Field
        label={
          en
            ? "WhatsApp number used on the order"
            : "Nomor WhatsApp pada pesanan"
        }
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>{en ? "Issue type" : "Jenis masalah"}</Text>
      <View style={styles.options}>
        {ISSUES.map(([value, labelId, labelEn]) => (
          <Pressable
            key={value}
            style={[styles.option, issueType === value && styles.optionActive]}
            onPress={() => setIssueType(value)}
          >
            <Text
              style={[
                styles.optionText,
                issueType === value && styles.optionTextActive,
              ]}
            >
              {en ? labelEn : labelId}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>
        {en ? "Preferred resolution" : "Penyelesaian yang diinginkan"}
      </Text>
      <View style={styles.resolutions}>
        <Pressable
          style={[
            styles.resolution,
            resolution === "replacement" && styles.resolutionActive,
          ]}
          onPress={() => setResolution("replacement")}
        >
          <Text
            style={[
              styles.resolutionText,
              resolution === "replacement" && styles.resolutionTextActive,
            ]}
          >
            {en ? "Replacement" : "Penggantian produk"}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.resolution,
            resolution === "refund" && styles.resolutionActive,
          ]}
          onPress={() => setResolution("refund")}
        >
          <Text
            style={[
              styles.resolutionText,
              resolution === "refund" && styles.resolutionTextActive,
            ]}
          >
            Refund
          </Text>
        </Pressable>
      </View>
      <Field
        label={en ? "Explain the issue" : "Jelaskan masalah"}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder={en ? "At least 20 characters…" : "Minimal 20 karakter…"}
      />
      <PrimaryButton
        label={
          evidence.length
            ? `${evidence.length} ${en ? "photo(s) selected" : "foto dipilih"} ✓`
            : en
              ? "Select evidence photos"
              : "Pilih foto bukti"
        }
        icon="camera-outline"
        variant="outline"
        onPress={() => void pick()}
      />
      <PrimaryButton
        label={en ? "Submit return request" : "Kirim pengajuan retur"}
        loading={loading}
        disabled={
          phone.replace(/\D/g, "").length < 9 ||
          !issueType ||
          description.trim().length < 20 ||
          !evidence.length
        }
        onPress={() => void submit()}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    gap: 9,
    padding: 14,
    borderRadius: 17,
    backgroundColor: COLORS.orangeSoft,
  },
  noticeText: { flex: 1, color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  label: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  optionActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  optionText: { color: COLORS.navy, fontSize: 12, fontWeight: "700" },
  optionTextActive: { color: COLORS.paper },
  resolutions: { flexDirection: "row", gap: 9 },
  resolution: {
    flex: 1,
    padding: 13,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  resolutionActive: {
    backgroundColor: COLORS.orangeSoft,
    borderColor: COLORS.orange,
  },
  resolutionText: { color: COLORS.navy, fontWeight: "800", fontSize: 12 },
  resolutionTextActive: { color: COLORS.orange },
});
