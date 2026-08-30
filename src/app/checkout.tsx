import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState, Field, PrimaryButton, Screen } from "@/components/ui";
import { COLORS, money } from "@/constants/store";
import { useStore } from "@/context/store-context";
import { api, makeIdempotencyKey } from "@/lib/api";
import { saveGuestOrder } from "@/lib/order-storage";
import type { Promotion } from "@/types/store";

type Area = {
  id: string;
  name: string;
  city?: string;
  province?: string;
  postalCode?: string;
};
type Shipping = {
  company: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  price: number;
  duration?: string;
  quoteToken: string;
};

export default function CheckoutScreen() {
  const { locale, cart, subtotal, clearCart, user, account } = useStore();
  const en = locale === "en";
  const saved = account?.customer.addresses?.[0];
  const [name, setName] = useState(saved?.recipient || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(saved?.phone || "");
  const [address, setAddress] = useState(saved?.address || "");
  const [areaQuery, setAreaQuery] = useState(saved?.areaName || "");
  const [areas, setAreas] = useState<Area[]>([]);
  const [area, setArea] = useState<Area | null>(
    saved?.areaId ? { id: saved.areaId, name: saved.areaName } : null,
  );
  const [shipping, setShipping] = useState<Shipping[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<Shipping | null>(
    null,
  );
  const [freeQuoteToken, setFreeQuoteToken] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Promotion | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [useReferral, setUseReferral] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);
  const pointValue = Number(account?.rules?.pointValue || 100);
  const maxPoints = Math.max(
    0,
    Math.min(
      Number(account?.customer.points || 0),
      Math.floor(
        (subtotal * Number(account?.rules?.maximumPointDiscountRate || 0.2)) /
          pointValue,
      ),
    ),
  );
  const pointsUsed =
    usePoints &&
    maxPoints >= Number(account?.rules?.minimumRedemptionPoints || 10)
      ? maxPoints
      : 0;
  const referralUsed = useReferral
    ? Math.min(
        Math.floor(Number(account?.customer.referralCredit || 0) / 10000) *
          10000,
        Math.floor(
          Math.max(0, subtotal - couponDiscount - pointsUsed * pointValue) /
            10000,
        ) * 10000,
      )
    : 0;
  const shippingFee = selectedShipping?.price || 0;
  const total = Math.max(
    0,
    subtotal +
      shippingFee -
      couponDiscount -
      pointsUsed * pointValue -
      referralUsed,
  );
  const quoteToken = selectedShipping?.quoteToken || freeQuoteToken;
  const valid =
    name.trim().length >= 2 &&
    phone.replace(/\D/g, "").length >= 9 &&
    address.trim().length >= 10 &&
    Boolean(area?.id && quoteToken) &&
    cart.length > 0;
  const pointsLabel = `${en ? "Use points" : "Pakai poin"} (${maxPoints})`;
  const referralLabel = `${en ? "Use referral credit" : "Pakai saldo referral"} (${money(account?.customer.referralCredit || 0, locale)})`;

  const searchAreas = async () => {
    if (areaQuery.trim().length < 3) return;
    setLoading(true);
    try {
      const result = await api<{ areas: Area[] }>(
        `/api/shipping/areas?input=${encodeURIComponent(areaQuery.trim())}`,
      );
      setAreas(result.areas || []);
    } catch (error) {
      Alert.alert(
        en ? "Area search failed" : "Area belum ditemukan",
        (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };
  const chooseArea = async (next: Area) => {
    setArea(next);
    setAreaQuery(next.name);
    setAreas([]);
    setShipping([]);
    setSelectedShipping(null);
    setFreeQuoteToken("");
    setLoading(true);
    try {
      const result = await api<{
        freeShipping: boolean;
        quoteToken?: string;
        pricing: Shipping[];
        message?: string;
      }>("/api/shipping/rates", {
        method: "POST",
        body: JSON.stringify({
          destinationAreaId: next.id,
          destinationAreaName: next.name,
          items: cart.map((item) => ({ id: item.id, qty: item.qty })),
        }),
      });
      if (result.freeShipping) {
        setFreeQuoteToken(result.quoteToken || "");
        Alert.alert(
          en ? "Free shipping" : "Gratis ongkir",
          result.message || "",
        );
      } else {
        setShipping(result.pricing || []);
        setSelectedShipping(result.pricing?.[0] || null);
      }
    } catch (error) {
      Alert.alert(
        en ? "Shipping unavailable" : "Ongkir belum tersedia",
        (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };
  const applyCoupon = async () => {
    setLoading(true);
    try {
      const result = await api<{
        valid: boolean;
        coupon: Promotion;
        discount: number;
      }>("/api/coupons/validate", {
        method: "POST",
        body: JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          subtotal,
          email,
          phone,
        }),
      });
      setCoupon(result.coupon);
      setCouponDiscount(Number(result.discount) || 0);
    } catch (error) {
      setCoupon(null);
      setCouponDiscount(0);
      Alert.alert(
        en ? "Coupon unavailable" : "Kupon belum dapat dipakai",
        (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    if (!valid || !area) return;
    setLoading(true);
    try {
      const result = await api<{
        token: string;
        redirect_url: string;
        orderId: string;
        customerAccessToken: string;
        cancelToken: string;
      }>("/api/create-transaction", {
        method: "POST",
        auth: Boolean(user),
        timeoutMs: 40000,
        body: JSON.stringify({
          idempotencyKey: makeIdempotencyKey(),
          locale,
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone,
          address: `${address.trim()} · ${area.name}`,
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: item.qty,
          })),
          couponCode: coupon?.code || "",
          shippingQuoteToken: quoteToken,
          destinationAreaId: area.id,
          loyaltyPointsToRedeem: pointsUsed,
          referralCreditToRedeem: referralUsed,
        }),
      });
      if (user) {
        await api("/api/customer/account/addresses", {
          method: "PATCH",
          auth: true,
          body: JSON.stringify({
            addresses: [
              {
                label: en ? "Primary address" : "Alamat utama",
                recipient: name.trim(),
                phone,
                address: address.trim(),
                areaId: area.id,
                areaName: area.name,
              },
            ],
          }),
        }).catch(() => null);
      }
      await saveGuestOrder({
        orderId: result.orderId,
        customerAccessToken: result.customerAccessToken,
        cancelToken: result.cancelToken,
        paymentToken: result.token,
        paymentRedirectUrl: result.redirect_url,
        phone,
        savedAt: new Date().toISOString(),
      });
      clearCart();
      if (result.redirect_url)
        await WebBrowser.openBrowserAsync(result.redirect_url, {
          toolbarColor: COLORS.navy,
          controlsColor: COLORS.orange,
        });
      Alert.alert(
        en ? "Order created" : "Pesanan dibuat",
        `${en ? "Order ID" : "ID Pesanan"}: ${result.orderId}`,
        [
          {
            text: en ? "View orders" : "Lihat pesanan",
            onPress: () => router.replace("/orders"),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        en ? "Checkout failed" : "Checkout belum berhasil",
        (error as Error).message,
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cart.length)
    return (
      <Screen>
        <EmptyState
          icon="bag-outline"
          title={en ? "Your cart is empty" : "Keranjang masih kosong"}
          message={
            en
              ? "Add a product before checkout."
              : "Tambahkan produk sebelum checkout."
          }
          action={en ? "Browse catalog" : "Buka katalog"}
          onAction={() => router.replace("/catalog")}
        />
      </Screen>
    );
  return (
    <Screen>
      <View style={styles.steps}>
        <Step number="1" label={en ? "Contact" : "Kontak"} />
        <Step number="2" label={en ? "Delivery" : "Pengiriman"} />
        <Step number="3" label={en ? "Payment" : "Pembayaran"} />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>
          {en ? "Contact details" : "Data penerima"}
        </Text>
        <Field
          label={en ? "Full name" : "Nama lengkap"}
          value={name}
          onChangeText={setName}
        />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label={en ? "WhatsApp number" : "Nomor WhatsApp"}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Field
          label={en ? "Complete address" : "Alamat lengkap"}
          value={address}
          onChangeText={setAddress}
          multiline
          placeholder={
            en
              ? "Street, house number, landmark…"
              : "Jalan, nomor rumah, patokan…"
          }
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>
          {en ? "Delivery area" : "Area pengiriman"}
        </Text>
        <Field
          value={areaQuery}
          onChangeText={(value) => {
            setAreaQuery(value);
            setArea(null);
          }}
          placeholder={
            en
              ? "Search district or postal code"
              : "Cari kecamatan atau kode pos"
          }
        />
        <PrimaryButton
          label={en ? "Search area" : "Cari area"}
          variant="outline"
          loading={loading && !area}
          disabled={areaQuery.trim().length < 3}
          onPress={() => void searchAreas()}
        />
        {areas.map((item) => (
          <Pressable
            key={item.id}
            style={styles.option}
            onPress={() => void chooseArea(item)}
          >
            <View style={styles.flex}>
              <Text style={styles.optionTitle}>{item.name}</Text>
              <Text style={styles.optionSub}>
                {[item.city, item.province, item.postalCode]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </Pressable>
        ))}
        {area ? (
          <View style={styles.selectedArea}>
            <Ionicons name="location" size={19} color={COLORS.success} />
            <Text style={styles.selectedAreaText}>{area.name}</Text>
          </View>
        ) : null}
        {shipping.map((item) => (
          <Pressable
            key={`${item.company}-${item.serviceCode}`}
            style={[
              styles.option,
              selectedShipping?.quoteToken === item.quoteToken &&
                styles.optionActive,
            ]}
            onPress={() => setSelectedShipping(item)}
          >
            <View style={styles.flex}>
              <Text style={styles.optionTitle}>
                {item.courierName} · {item.serviceName}
              </Text>
              <Text style={styles.optionSub}>{item.duration}</Text>
            </View>
            <Text style={styles.optionPrice}>{money(item.price, locale)}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.title}>
          {en ? "Discounts & rewards" : "Diskon & reward"}
        </Text>
        <View style={styles.couponRow}>
          <View style={styles.flex}>
            <Field
              value={couponInput}
              onChangeText={setCouponInput}
              autoCapitalize="characters"
              placeholder={en ? "Coupon code" : "Kode kupon"}
            />
          </View>
          <Pressable style={styles.apply} onPress={() => void applyCoupon()}>
            <Text style={styles.applyText}>{en ? "Apply" : "Pakai"}</Text>
          </Pressable>
        </View>
        {coupon ? (
          <Text style={styles.successText}>
            ✓ {coupon.code} · -{money(couponDiscount, locale)}
          </Text>
        ) : null}
        {user && account ? (
          <>
            <ToggleRow
              label={pointsLabel}
              active={usePoints}
              disabled={maxPoints < 10}
              onPress={() => setUsePoints(!usePoints)}
            />
            <ToggleRow
              label={referralLabel}
              active={useReferral}
              disabled={account.customer.referralCredit < 10000}
              onPress={() => setUseReferral(!useReferral)}
            />
          </>
        ) : (
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.loginHint}>
              {en
                ? "Sign in to use points and referral credit."
                : "Masuk untuk memakai poin dan saldo referral."}
            </Text>
          </Pressable>
        )}
      </View>
      <View style={styles.summary}>
        <SummaryRow label="Subtotal" value={money(subtotal, locale)} />
        <SummaryRow
          label={en ? "Shipping" : "Ongkir"}
          value={
            quoteToken
              ? shippingFee
                ? money(shippingFee, locale)
                : en
                  ? "Free"
                  : "Gratis"
              : "—"
          }
        />
        {couponDiscount ? (
          <SummaryRow
            label={en ? "Coupon" : "Kupon"}
            value={`-${money(couponDiscount, locale)}`}
          />
        ) : null}
        {pointsUsed ? (
          <SummaryRow
            label={en ? "Points" : "Poin"}
            value={`-${money(pointsUsed * pointValue, locale)}`}
          />
        ) : null}
        {referralUsed ? (
          <SummaryRow
            label="Referral"
            value={`-${money(referralUsed, locale)}`}
          />
        ) : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>{money(total, locale)}</Text>
        </View>
        <PrimaryButton
          label={
            en ? "Pay securely with Midtrans" : "Bayar aman dengan Midtrans"
          }
          icon="shield-checkmark-outline"
          loading={loading}
          disabled={!valid}
          onPress={() => void pay()}
        />
        <Text style={styles.secure}>
          {en
            ? "Payment opens in a secure browser. No server key is stored in the app."
            : "Pembayaran dibuka melalui browser aman. Server key tidak disimpan di aplikasi."}
        </Text>
      </View>
    </Screen>
  );
}

function Step({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepCircle}>
        <Text style={styles.stepNumber}>{number}</Text>
      </View>
      <Text style={styles.stepLabel}>{label}</Text>
    </View>
  );
}
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}
function ToggleRow({
  label,
  active,
  disabled,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.toggleRow, disabled && styles.disabled]}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggle, active && styles.toggleActive]}>
        <View style={[styles.toggleDot, active && styles.toggleDotActive]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  steps: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 3,
  },
  step: { alignItems: "center", gap: 6 },
  stepCircle: {
    width: 35,
    height: 35,
    borderRadius: 13,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: { color: COLORS.paper, fontWeight: "900" },
  stepLabel: { color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  section: {
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 23,
    padding: 17,
    gap: 13,
  },
  title: { color: COLORS.navy, fontWeight: "900", fontSize: 18 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 15,
    padding: 13,
  },
  optionActive: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeSoft,
  },
  optionTitle: { color: COLORS.navy, fontWeight: "800", fontSize: 13 },
  optionSub: { color: COLORS.muted, fontSize: 11, marginTop: 3 },
  optionPrice: { color: COLORS.orange, fontWeight: "900" },
  selectedArea: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    backgroundColor: "#E9F7F1",
    padding: 12,
    borderRadius: 14,
  },
  selectedAreaText: {
    flex: 1,
    color: COLORS.success,
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 17,
  },
  couponRow: { flexDirection: "row", alignItems: "flex-end", gap: 9 },
  apply: {
    height: 50,
    borderRadius: 15,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: { color: COLORS.paper, fontWeight: "900" },
  successText: { color: COLORS.success, fontWeight: "800", fontSize: 12 },
  loginHint: {
    color: COLORS.orange,
    textDecorationLine: "underline",
    fontWeight: "700",
    fontSize: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  toggleLabel: { flex: 1, color: COLORS.navy, fontWeight: "700", fontSize: 13 },
  toggle: {
    width: 45,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#D8DDE2",
    padding: 3,
  },
  toggleActive: { backgroundColor: COLORS.orange },
  toggleDot: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: COLORS.paper,
  },
  toggleDotActive: { alignSelf: "flex-end" },
  disabled: { opacity: 0.45 },
  summary: {
    backgroundColor: COLORS.navy,
    borderRadius: 24,
    padding: 19,
    gap: 12,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { color: "#C7D2DE" },
  summaryValue: { color: COLORS.paper, fontWeight: "800" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#40556D",
    paddingTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { color: COLORS.paper, fontWeight: "900", fontSize: 17 },
  total: { color: COLORS.orange, fontSize: 23, fontWeight: "900" },
  secure: {
    color: "#B9C6D4",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
  },
});
