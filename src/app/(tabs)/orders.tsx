import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  EmptyState,
  Field,
  PrimaryButton,
  Screen,
  StoreHeader,
} from "@/components/ui";
import {
  absoluteAssetUrl,
  COLORS,
  money,
  STORE_WHATSAPP,
} from "@/constants/store";
import { useStore } from "@/context/store-context";
import { api } from "@/lib/api";
import { GuestOrderAccess, readGuestOrders } from "@/lib/order-storage";
import type { Order } from "@/types/store";

type TrackingHistory = { note?: string; status?: string; updatedAt?: string };
type TrackingData = {
  waybill?: string;
  status?: string;
  courier?: { company?: string; driverName?: string; driverPhone?: string };
  history?: TrackingHistory[];
};

const statusColors: Record<string, string> = {
  paid: COLORS.success,
  processing: "#3070A8",
  shipped: "#715AC1",
  delivered: COLORS.success,
  pending: COLORS.orange,
  expired: "#9A7144",
  failed: COLORS.danger,
  cancelled: COLORS.danger,
};

const statusLabels = {
  id: {
    pending: "Menunggu pembayaran",
    paid: "Sudah dibayar",
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Sampai",
    expired: "Kedaluwarsa",
    failed: "Gagal",
    cancelled: "Dibatalkan",
  },
  en: {
    pending: "Awaiting payment",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    expired: "Expired",
    failed: "Failed",
    cancelled: "Cancelled",
  },
} as const;

const timelineCopy = {
  id: ["Pesanan dibuat", "Pembayaran", "Diproses", "Dikirim"],
  en: ["Order created", "Payment", "Processing", "Shipped"],
};

function uniqueOrders(orders: Order[]) {
  const seen = new Set<string>();
  return orders.filter((order) => {
    if (!order?.orderId || seen.has(order.orderId)) return false;
    seen.add(order.orderId);
    return true;
  });
}

function dateLabel(value: string | undefined, en: boolean, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(en ? "en-GB" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function getTimelineState(status: string, index: number) {
  if (["expired", "failed", "cancelled"].includes(status)) {
    if (index === 0) return "done";
    if (index === 1) return "error";
    return "upcoming";
  }
  const progress =
    (
      {
        pending: 1,
        paid: 2,
        processing: 2,
        shipped: 3,
        delivered: 4,
      } as Record<string, number>
    )[status] ?? 0;
  if (index < progress) return "done";
  if (index === progress && progress < 4) return "active";
  return "upcoming";
}

export default function OrdersScreen() {
  const { locale, user, account, products, refreshAccount } = useStore();
  const en = locale === "en";
  const [guestOrders, setGuestOrders] = useState<Order[]>([]);
  const [savedAccess, setSavedAccess] = useState<GuestOrderAccess[]>([]);
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [error, setError] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState("");
  const [resumingId, setResumingId] = useState("");

  const findAccess = useCallback(
    (id: string) => savedAccess.find((item) => item.orderId === id),
    [savedAccess],
  );

  const lookupOrder = useCallback(
    async (requestedId?: string, requestedPhone?: string) => {
      const targetId = String(requestedId || orderId)
        .trim()
        .toUpperCase();
      const targetPhone = String(requestedPhone ?? phone).trim();
      if (!targetId) {
        setError(
          en
            ? "Enter an order ID first."
            : "Masukkan ID pesanan terlebih dahulu.",
        );
        return;
      }
      const access = findAccess(targetId);
      setLoading(true);
      setError("");
      setTracking(null);
      setTrackingError("");
      try {
        const result = await api<{ order: Order }>("/api/orders/lookup", {
          method: "POST",
          auth: Boolean(user),
          headers: access?.customerAccessToken
            ? { "X-Customer-Access-Token": access.customerAccessToken }
            : undefined,
          body: JSON.stringify({
            orderId: targetId,
            phone: targetPhone,
            customerAccessToken: access?.customerAccessToken || "",
          }),
        });
        setOrderId(targetId);
        setPhone(targetPhone || access?.phone || "");
        setSelected(result.order);
      } catch (requestError) {
        setSelected(null);
        setError(
          (requestError as Error).message ||
            (en ? "Order could not be loaded." : "Pesanan belum dapat dimuat."),
        );
      } finally {
        setLoading(false);
      }
    },
    [en, findAccess, orderId, phone, user],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const access = await readGuestOrders();
      setSavedAccess(access);
      if (!phone && access[0]?.phone) setPhone(access[0].phone);
      const resolved = await Promise.all(
        access.map(async (item) => {
          try {
            const result = await api<{ order: Order }>("/api/orders/lookup", {
              method: "POST",
              headers: { "X-Customer-Access-Token": item.customerAccessToken },
              body: JSON.stringify({
                orderId: item.orderId,
                customerAccessToken: item.customerAccessToken,
              }),
            });
            return result.order;
          } catch {
            return null;
          }
        }),
      );
      setGuestOrders(resolved.filter(Boolean) as Order[]);
      if (user) await refreshAccount();
    } finally {
      setLoading(false);
    }
  }, [phone, refreshAccount, user]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const orders = useMemo(
    () => uniqueOrders([...(account?.orders || []), ...guestOrders]),
    [account?.orders, guestOrders],
  );

  const fetchTracking = async (order: Order) => {
    if (!order.trackingNumber) return;
    setTrackingLoading(true);
    setTrackingError("");
    try {
      const result = await api<TrackingData>(
        `/api/shipping/track?waybill=${encodeURIComponent(order.trackingNumber)}&courier=${encodeURIComponent(order.shippingCourier || "jne")}`,
      );
      setTracking(result);
    } catch (requestError) {
      setTracking(null);
      setTrackingError(
        (requestError as Error).message ||
          (en
            ? "Tracking is not available yet."
            : "Data tracking belum tersedia."),
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const cancelOrder = (order: Order) => {
    const access = findAccess(order.orderId);
    if (!access?.cancelToken) {
      Alert.alert(
        en ? "Cannot cancel" : "Tidak dapat dibatalkan",
        en
          ? "Cancellation is only available on the device used at checkout."
          : "Pembatalan hanya tersedia di perangkat yang dipakai saat checkout.",
      );
      return;
    }
    Alert.alert(
      en ? "Cancel this order?" : "Batalkan pesanan ini?",
      en
        ? "The payment session will be closed permanently."
        : "Sesi pembayaran akan ditutup permanen.",
      [
        { text: en ? "Keep order" : "Jangan batalkan", style: "cancel" },
        {
          text: en ? "Cancel order" : "Batalkan pesanan",
          style: "destructive",
          onPress: () => {
            setCancellingId(order.orderId);
            void api(
              `/api/orders/${encodeURIComponent(order.orderId)}/cancel`,
              {
                method: "POST",
                body: JSON.stringify({ cancelToken: access.cancelToken }),
              },
            )
              .then(() => {
                setSelected((current) =>
                  current?.orderId === order.orderId
                    ? { ...current, status: "cancelled" }
                    : current,
                );
                return load();
              })
              .catch((requestError) => {
                Alert.alert(
                  en ? "Unable to cancel" : "Pesanan belum dibatalkan",
                  (requestError as Error).message,
                );
              })
              .finally(() => setCancellingId(""));
          },
        },
      ],
    );
  };

  const resumePayment = async (order: Order) => {
    const access = findAccess(order.orderId);
    const paymentUrl = access?.paymentRedirectUrl;
    if (!paymentUrl) {
      Alert.alert(
        en ? "Payment session unavailable" : "Sesi pembayaran tidak tersedia",
        en
          ? "This order was not created with the latest app version or not on this device."
          : "Pesanan ini tidak dibuat dari versi aplikasi terbaru atau bukan dari perangkat ini.",
      );
      return;
    }
    setResumingId(order.orderId);
    try {
      const synced = await api<{ status?: string }>(
        `/api/orders/${encodeURIComponent(order.orderId)}/payment-expire-check`,
        {
          method: "POST",
          auth: Boolean(user),
          headers: access?.customerAccessToken
            ? { "X-Customer-Access-Token": access.customerAccessToken }
            : undefined,
          body: JSON.stringify({
            customerAccessToken: access?.customerAccessToken || "",
          }),
        },
      );
      if (synced.status && synced.status !== "pending") {
        await lookupOrder(order.orderId, access?.phone);
        return;
      }
      await WebBrowser.openBrowserAsync(paymentUrl, {
        toolbarColor: COLORS.navy,
        controlsColor: COLORS.orange,
      });
      await lookupOrder(order.orderId, access?.phone);
    } catch (requestError) {
      Alert.alert(
        en ? "Payment could not be opened" : "Pembayaran belum dapat dibuka",
        (requestError as Error).message,
      );
    } finally {
      setResumingId("");
    }
  };

  const openLiveTracking = async (order: Order) => {
    const url =
      order.trackingUrl ||
      `https://tracking.biteship.com/?waybill_id=${encodeURIComponent(order.trackingNumber || "")}`;
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: COLORS.navy,
      controlsColor: COLORS.orange,
    });
  };

  const openAdminChat = async (order: Order) => {
    const message = en
      ? `Hello Morgen Geschäft, I need help with order ${order.orderId}.`
      : `Halo Morgen Geschäft, saya meminta bantuan terkait pesanan ${order.orderId}.`;
    await WebBrowser.openBrowserAsync(
      `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`,
    );
  };

  if (selected) {
    return (
      <OrderDetail
        order={selected}
        en={en}
        locale={locale}
        products={products}
        access={findAccess(selected.orderId)}
        tracking={tracking}
        trackingError={trackingError}
        trackingLoading={trackingLoading}
        cancelling={cancellingId === selected.orderId}
        resuming={resumingId === selected.orderId}
        onBack={() => {
          setSelected(null);
          setTracking(null);
          setTrackingError("");
        }}
        onRefresh={() =>
          void lookupOrder(
            selected.orderId,
            findAccess(selected.orderId)?.phone,
          )
        }
        onTracking={() => void fetchTracking(selected)}
        onLiveTracking={() => void openLiveTracking(selected)}
        onCancel={() => cancelOrder(selected)}
        onResume={() => void resumePayment(selected)}
        onReturn={() => router.push(`/return/${selected.orderId}`)}
        onContact={() => void openAdminChat(selected)}
      />
    );
  }

  return (
    <Screen onRefresh={() => void load()} refreshing={loading}>
      <StoreHeader
        title={en ? "Track orders" : "Lacak pesanan"}
        subtitle={
          user
            ? user.email || ""
            : en
              ? "Securely linked to this device"
              : "Terhubung aman ke perangkat ini"
        }
      />
      <View style={styles.searchCard}>
        <Text style={styles.eyebrow}>
          {en ? "ORDER TRACKING" : "LACAK PEMESANAN"}
        </Text>
        <Text style={styles.searchTitle}>
          {en ? "Check your order status" : "Cek status pesananmu"}
        </Text>
        <Text style={styles.searchCopy}>
          {en
            ? "Enter the order ID. For an order from another device, sign in with the same verified email."
            : "Masukkan ID pesanan. Untuk pesanan dari perangkat lain, masuk dengan email terverifikasi yang sama."}
        </Text>
        <Field
          label={en ? "Order ID" : "ID pesanan"}
          value={orderId}
          onChangeText={(value) => setOrderId(value.toUpperCase())}
          autoCapitalize="characters"
          placeholder="MG-1719…"
        />
        <Field
          label={
            en
              ? "WhatsApp number used at checkout"
              : "Nomor WhatsApp saat checkout"
          }
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="08…"
        />
        <PrimaryButton
          label={en ? "Check order" : "Cek pesanan"}
          loading={loading}
          disabled={!orderId.trim()}
          onPress={() => void lookupOrder()}
        />
        {!user ? (
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.signInHint}>
              {en
                ? "Order not on this device? Sign in here."
                : "Pesanan tidak ada di perangkat ini? Masuk di sini."}
            </Text>
          </Pressable>
        ) : null}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color={COLORS.danger}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>

      {savedAccess.length ? (
        <View style={styles.historyBlock}>
          <Text style={styles.historyLabel}>
            {en
              ? "Recent orders on this device"
              : "Pesanan terakhir di perangkat ini"}
          </Text>
          <View style={styles.chips}>
            {savedAccess.slice(0, 5).map((item) => (
              <Pressable
                key={item.orderId}
                style={styles.chip}
                onPress={() => {
                  setOrderId(item.orderId);
                  setPhone(item.phone || phone);
                  void lookupOrder(item.orderId, item.phone || phone);
                }}
              >
                <Text style={styles.chipText}>{item.orderId}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>
          {en ? "Order history" : "Riwayat pesanan"}
        </Text>
        <Text style={styles.listCount}>{orders.length}</Text>
      </View>
      {loading && !orders.length ? (
        <ActivityIndicator
          size="large"
          color={COLORS.orange}
          style={styles.loading}
        />
      ) : orders.length ? (
        orders.map((order) => (
          <OrderCard
            key={order.orderId}
            order={order}
            en={en}
            locale={locale}
            onPress={() =>
              void lookupOrder(order.orderId, findAccess(order.orderId)?.phone)
            }
          />
        ))
      ) : (
        <EmptyState
          icon="receipt-outline"
          title={en ? "No orders yet" : "Belum ada pesanan"}
          message={
            en
              ? "Orders made from this device or account will appear here."
              : "Pesanan dari perangkat atau akun ini akan muncul di sini."
          }
          action={en ? "Start shopping" : "Mulai belanja"}
          onAction={() => router.push("/catalog")}
        />
      )}
    </Screen>
  );
}

function OrderCard({
  order,
  en,
  locale,
  onPress,
}: {
  order: Order;
  en: boolean;
  locale: "id" | "en";
  onPress: () => void;
}) {
  const color = statusColors[order.status] || COLORS.muted;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <View style={styles.flex}>
          <Text style={styles.id}>{order.orderId}</Text>
          <Text style={styles.date}>{dateLabel(order.createdAt, en)}</Text>
        </View>
        <View style={[styles.status, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.statusText, { color }]}>
            {(statusLabels[locale] as Record<string, string>)[order.status] ||
              order.status}
          </Text>
        </View>
      </View>
      <View style={styles.itemRow}>
        <Ionicons name="cube-outline" size={18} color={COLORS.muted} />
        <Text style={styles.items} numberOfLines={1}>
          {order.items?.map((item) => `${item.qty}× ${item.name}`).join(", ") ||
            (en ? "Order details" : "Detail pesanan")}
        </Text>
      </View>
      {order.trackingNumber ? (
        <Text style={styles.trackingNumber}>
          {en ? "Tracking number" : "Nomor resi"}: {order.trackingNumber}
        </Text>
      ) : null}
      <View style={styles.cardBottom}>
        <Text style={styles.amount}>{money(order.amount, locale)}</Text>
        <View style={styles.detailLink}>
          <Text style={styles.detailLinkText}>
            {en ? "Details" : "Lihat detail"}
          </Text>
          <Ionicons name="chevron-forward" size={17} color={COLORS.orange} />
        </View>
      </View>
    </Pressable>
  );
}

function OrderDetail({
  order,
  en,
  locale,
  products,
  access,
  tracking,
  trackingError,
  trackingLoading,
  cancelling,
  resuming,
  onBack,
  onRefresh,
  onTracking,
  onLiveTracking,
  onCancel,
  onResume,
  onReturn,
  onContact,
}: {
  order: Order;
  en: boolean;
  locale: "id" | "en";
  products: ReturnType<typeof useStore>["products"];
  access?: GuestOrderAccess;
  tracking: TrackingData | null;
  trackingError: string;
  trackingLoading: boolean;
  cancelling: boolean;
  resuming: boolean;
  onBack: () => void;
  onRefresh: () => void;
  onTracking: () => void;
  onLiveTracking: () => void;
  onCancel: () => void;
  onResume: () => void;
  onReturn: () => void;
  onContact: () => void;
}) {
  const color = statusColors[order.status] || COLORS.muted;
  const labels = timelineCopy[locale];
  return (
    <Screen onRefresh={onRefresh} refreshing={false}>
      <Pressable style={styles.backRow} onPress={onBack}>
        <Ionicons name="arrow-back" size={21} color={COLORS.navy} />
        <Text style={styles.backText}>
          {en ? "Back to order history" : "Kembali ke riwayat pesanan"}
        </Text>
      </Pressable>
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <View style={styles.flex}>
            <Text style={styles.detailKicker}>
              {en ? "ORDER ID" : "ID PESANAN"}
            </Text>
            <Text style={styles.detailId}>{order.orderId}</Text>
            <Text style={styles.date}>
              {en ? "Created" : "Dibuat"} {dateLabel(order.createdAt, en, true)}
            </Text>
          </View>
          <View style={[styles.status, { backgroundColor: `${color}18` }]}>
            <Text style={[styles.statusText, { color }]}>
              {(statusLabels[locale] as Record<string, string>)[order.status] ||
                order.status}
            </Text>
          </View>
        </View>
        <View style={styles.timeline}>
          {labels.map((label, index) => {
            const state = getTimelineState(order.status, index);
            const stepColor =
              state === "error"
                ? COLORS.danger
                : ["done", "active"].includes(state)
                  ? COLORS.navy
                  : "#D7D0C1";
            return (
              <View key={label} style={styles.timelineStep}>
                {index < labels.length - 1 ? (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor:
                          state === "done" ? COLORS.navy : COLORS.line,
                      },
                    ]}
                  />
                ) : null}
                <View
                  style={[
                    styles.timelineDot,
                    {
                      borderColor: stepColor,
                      backgroundColor:
                        state === "upcoming" ? COLORS.paper : stepColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.timelineNumber,
                      state === "upcoming" && { color: COLORS.muted },
                    ]}
                  >
                    {state === "error"
                      ? "×"
                      : state === "done"
                        ? "✓"
                        : index + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    state === "upcoming" && { color: COLORS.muted },
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>

        {order.status === "pending" ? (
          <View style={styles.paymentBox}>
            <Text style={styles.paymentTitle}>
              {en ? "Payment not completed" : "Pembayaran belum selesai"}
            </Text>
            <Text style={styles.paymentCopy}>
              {access?.paymentRedirectUrl
                ? en
                  ? "The secure payment page can still be opened from this device."
                  : "Halaman pembayaran aman masih dapat dibuka dari perangkat ini."
                : en
                  ? "The payment session is not stored on this device."
                  : "Sesi pembayaran tidak tersimpan di perangkat ini."}
            </Text>
            {access?.paymentRedirectUrl ? (
              <PrimaryButton
                label={en ? "Continue payment" : "Lanjutkan pembayaran"}
                loading={resuming}
                onPress={onResume}
              />
            ) : null}
            {access?.cancelToken ? (
              <PrimaryButton
                label={en ? "Cancel order" : "Batalkan pesanan"}
                variant="danger"
                loading={cancelling}
                onPress={onCancel}
              />
            ) : null}
          </View>
        ) : null}
        {["expired", "cancelled", "failed"].includes(order.status) ? (
          <View style={styles.neutralBox}>
            <Text style={styles.neutralTitle}>
              {order.status === "cancelled"
                ? en
                  ? "Order cancelled"
                  : "Pesanan dibatalkan"
                : order.status === "expired"
                  ? en
                    ? "Payment session expired"
                    : "Sesi pembayaran berakhir"
                  : en
                    ? "Payment failed"
                    : "Pembayaran gagal"}
            </Text>
            <Text style={styles.neutralCopy}>
              {en
                ? "This payment session cannot be continued. You can create a new order from the catalog."
                : "Sesi pembayaran ini tidak dapat dilanjutkan. Kamu dapat membuat pesanan baru dari katalog."}
            </Text>
            <PrimaryButton
              label={en ? "Open catalog" : "Buka katalog"}
              variant="outline"
              onPress={() => router.push("/catalog")}
            />
          </View>
        ) : null}

        <SectionLabel>
          {en ? "Product summary" : "Ringkasan produk"}
        </SectionLabel>
        {order.items?.map((item, index) => {
          const product = products.find(
            (candidate) => candidate.id === item.id,
          );
          const image = absoluteAssetUrl(product?.image || item.image);
          return (
            <View key={`${item.id}-${index}`} style={styles.productRow}>
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={styles.productImage}
                  contentFit="contain"
                />
              ) : (
                <View style={styles.productImageFallback}>
                  <Ionicons
                    name="leaf-outline"
                    size={20}
                    color={COLORS.orange}
                  />
                </View>
              )}
              <View style={styles.flex}>
                <Text style={styles.productName}>
                  {product?.name || item.name}
                </Text>
                <Text style={styles.productMeta}>
                  {item.qty} × {money(item.price, locale)}
                </Text>
              </View>
              <Text style={styles.productTotal}>
                {money(item.qty * item.price, locale)}
              </Text>
            </View>
          );
        })}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{money(order.amount, locale)}</Text>
        </View>

        <View style={styles.infoGrid}>
          <InfoCard
            icon="location-outline"
            label={en ? "DELIVERY ADDRESS" : "ALAMAT PENGIRIMAN"}
            value={order.address || "—"}
          />
          <InfoCard
            icon="car-outline"
            label={en ? "SHIPPING" : "PENGIRIMAN"}
            value={
              order.shippingFee
                ? `${money(order.shippingFee, locale)} · ${(order.shippingCourier || "").toUpperCase()} ${(order.shippingService || "").toUpperCase()}`
                : order.destinationAreaName
                  ? en
                    ? "Free shipping"
                    : "Gratis ongkir"
                  : "—"
            }
          />
        </View>

        {order.trackingNumber &&
        ["shipped", "delivered"].includes(order.status) ? (
          <View style={styles.shippingBox}>
            <Text style={styles.detailKicker}>
              {en ? "TRACKING NUMBER" : "NOMOR RESI"}
            </Text>
            <Text style={styles.waybill}>{order.trackingNumber}</Text>
            <View style={styles.shippingActions}>
              <Pressable
                disabled={trackingLoading}
                style={styles.trackButton}
                onPress={onTracking}
              >
                <Ionicons name="navigate-outline" size={17} color="#229ED9" />
                <Text style={styles.trackButtonText}>
                  {trackingLoading
                    ? en
                      ? "Loading…"
                      : "Memuat…"
                    : tracking
                      ? en
                        ? "Refresh tracking"
                        : "Refresh tracking"
                      : en
                        ? "Track shipment"
                        : "Lacak pengiriman"}
                </Text>
              </Pressable>
              <Pressable style={styles.liveButton} onPress={onLiveTracking}>
                <Ionicons name="open-outline" size={17} color={COLORS.navy} />
                <Text style={styles.liveButtonText}>
                  {en ? "Live tracking" : "Live tracking"}
                </Text>
              </Pressable>
            </View>
            {trackingError ? (
              <Text style={styles.trackingError}>{trackingError}</Text>
            ) : null}
            {tracking?.courier?.company ? (
              <Text style={styles.courierText}>
                {en ? "Courier" : "Kurir"}:{" "}
                {tracking.courier.company.toUpperCase()}
                {tracking.courier.driverName
                  ? ` · ${tracking.courier.driverName}`
                  : ""}
              </Text>
            ) : null}
            {tracking?.history?.length ? (
              <View style={styles.trackingHistory}>
                {[...tracking.history].reverse().map((item, index) => (
                  <View
                    key={`${item.updatedAt}-${index}`}
                    style={styles.trackingRow}
                  >
                    <View style={styles.trackingMarkerWrap}>
                      <View
                        style={[
                          styles.trackingMarker,
                          index === 0 && styles.trackingMarkerActive,
                        ]}
                      />
                      {index < (tracking.history?.length || 0) - 1 ? (
                        <View style={styles.trackingConnector} />
                      ) : null}
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.trackingNote}>
                        {item.note || item.status || "—"}
                      </Text>
                      <Text style={styles.trackingDate}>
                        {dateLabel(item.updatedAt, en, true)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : tracking ? (
              <Text style={styles.noTracking}>
                {en
                  ? "No courier updates yet. Try again later."
                  : "Belum ada pembaruan dari kurir. Coba lagi nanti."}
              </Text>
            ) : null}
          </View>
        ) : null}

        {order.statusHistory?.length ? (
          <View style={styles.orderHistoryBox}>
            <SectionLabel>
              {en ? "Order status history" : "Riwayat status pesanan"}
            </SectionLabel>
            {[...order.statusHistory].reverse().map((item, index) => (
              <View
                key={`${item.at || item.updatedAt}-${index}`}
                style={styles.simpleHistoryRow}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={index === 0 ? COLORS.orange : COLORS.success}
                />
                <View style={styles.flex}>
                  <Text style={styles.simpleHistoryTitle}>
                    {(statusLabels[locale] as Record<string, string>)[
                      item.status || ""
                    ] ||
                      item.status ||
                      (en ? "Status updated" : "Status diperbarui")}
                  </Text>
                  {item.note ? (
                    <Text style={styles.simpleHistoryNote}>{item.note}</Text>
                  ) : null}
                  <Text style={styles.trackingDate}>
                    {dateLabel(item.at || item.updatedAt, en, true)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.footerActions}>
          {order.status === "delivered" ? (
            <PrimaryButton
              label={en ? "Request a return" : "Ajukan retur"}
              variant="outline"
              onPress={onReturn}
            />
          ) : null}
          {["paid", "processing", "shipped"].includes(order.status) ? (
            <PrimaryButton
              label={en ? "Contact admin" : "Hubungi admin"}
              variant="outline"
              icon="logo-whatsapp"
              onPress={onContact}
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}
function InfoCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoCard}>
      <Ionicons name={icon} size={19} color={COLORS.orange} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { marginTop: 70 },
  searchCard: {
    padding: 18,
    borderRadius: 23,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 12,
  },
  eyebrow: {
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  searchTitle: { color: COLORS.navy, fontSize: 23, fontWeight: "900" },
  searchCopy: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  signInHint: {
    color: COLORS.orange,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  errorBox: {
    flexDirection: "row",
    gap: 8,
    padding: 11,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    alignItems: "flex-start",
  },
  errorText: { flex: 1, color: COLORS.danger, fontSize: 12, lineHeight: 17 },
  historyBlock: { gap: 9 },
  historyLabel: { color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.paper,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipText: { color: COLORS.navy, fontSize: 10, fontWeight: "800" },
  listHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  listTitle: { color: COLORS.navy, fontSize: 19, fontWeight: "900" },
  listCount: {
    minWidth: 25,
    height: 25,
    borderRadius: 9,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: COLORS.orangeSoft,
    color: COLORS.orange,
    fontWeight: "900",
    fontSize: 11,
  },
  card: {
    padding: 17,
    borderRadius: 21,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    gap: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  id: { color: COLORS.navy, fontWeight: "900" },
  date: { color: COLORS.muted, fontSize: 11, marginTop: 4 },
  status: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    maxWidth: "48%",
  },
  statusText: { fontSize: 10, fontWeight: "900", textAlign: "center" },
  itemRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  items: { flex: 1, color: COLORS.muted, fontSize: 12 },
  trackingNumber: { color: COLORS.navy, fontSize: 12, fontWeight: "700" },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  amount: { color: COLORS.orange, fontWeight: "900", fontSize: 18 },
  detailLink: { flexDirection: "row", alignItems: "center", gap: 2 },
  detailLinkText: { color: COLORS.orange, fontWeight: "900", fontSize: 12 },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: { color: COLORS.navy, fontWeight: "800", fontSize: 13 },
  detailCard: {
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 24,
    overflow: "hidden",
    padding: 18,
    gap: 16,
  },
  detailHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingBottom: 16,
  },
  detailKicker: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  detailId: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 5,
  },
  timeline: { flexDirection: "row", paddingTop: 2 },
  timelineStep: { flex: 1, alignItems: "center", position: "relative" },
  timelineLine: {
    position: "absolute",
    top: 12,
    left: "50%",
    right: "-50%",
    height: 2,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  timelineNumber: { color: COLORS.paper, fontSize: 10, fontWeight: "900" },
  timelineLabel: {
    color: COLORS.navy,
    fontSize: 9,
    textAlign: "center",
    lineHeight: 12,
    marginTop: 6,
    paddingHorizontal: 2,
    fontWeight: "700",
  },
  paymentBox: {
    backgroundColor: "#FFF7EC",
    borderWidth: 1,
    borderColor: "#EBCFAE",
    borderRadius: 16,
    padding: 15,
    gap: 10,
  },
  paymentTitle: { color: "#7B5737", fontSize: 15, fontWeight: "900" },
  paymentCopy: { color: "#7B5737", fontSize: 12, lineHeight: 18 },
  neutralBox: {
    backgroundColor: "#F7F4EE",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 16,
    padding: 15,
    gap: 10,
  },
  neutralTitle: { color: COLORS.navy, fontWeight: "900", fontSize: 15 },
  neutralCopy: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  sectionLabel: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingBottom: 11,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#F7F4EE",
  },
  productImageFallback: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  productName: { color: COLORS.navy, fontSize: 12, fontWeight: "800" },
  productMeta: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  productTotal: { color: COLORS.navy, fontSize: 11, fontWeight: "900" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FBF8F2",
    borderRadius: 13,
    padding: 13,
  },
  totalLabel: { color: COLORS.navy, fontWeight: "900" },
  totalValue: { color: COLORS.orange, fontSize: 19, fontWeight: "900" },
  infoGrid: { gap: 10 },
  infoCard: {
    backgroundColor: "#FBF8F2",
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    padding: 13,
    gap: 6,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  infoValue: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  shippingBox: {
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingTop: 16,
    gap: 10,
  },
  waybill: { color: COLORS.navy, fontSize: 15, fontWeight: "900" },
  shippingActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#229ED9",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  trackButtonText: { color: "#229ED9", fontSize: 11, fontWeight: "800" },
  liveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.navy,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  liveButtonText: { color: COLORS.navy, fontSize: 11, fontWeight: "800" },
  trackingError: { color: COLORS.danger, fontSize: 11, lineHeight: 16 },
  courierText: { color: COLORS.muted, fontSize: 11, fontWeight: "700" },
  trackingHistory: { marginTop: 3 },
  trackingRow: { flexDirection: "row", gap: 10, minHeight: 55 },
  trackingMarkerWrap: { width: 14, alignItems: "center" },
  trackingMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.line,
  },
  trackingMarkerActive: { backgroundColor: "#229ED9" },
  trackingConnector: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.line,
    marginTop: 3,
  },
  trackingNote: {
    color: COLORS.navy,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  trackingDate: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  noTracking: { color: COLORS.muted, fontSize: 11 },
  orderHistoryBox: { gap: 10 },
  simpleHistoryRow: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  simpleHistoryTitle: { color: COLORS.navy, fontSize: 12, fontWeight: "800" },
  simpleHistoryNote: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  footerActions: { gap: 9, paddingTop: 4 },
});
