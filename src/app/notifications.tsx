import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EmptyState, Screen, StoreHeader } from "@/components/ui";
import { COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";
import { api } from "@/lib/api";
import {
  createNotificationBaseline,
  filterNotificationsAfterBaseline,
  isValidNotificationBaseline,
  type NotificationBaseline,
} from "@/lib/notification-inbox";
import { readGuestOrders } from "@/lib/order-storage";

type Notification = {
  id: string;
  title?: string;
  titleEn?: string;
  body?: string;
  bodyEn?: string;
  category?: string;
  sentAt?: string;
};

const BASELINE_KEY = "mg_mobile_notif_baseline_v1";
const READ_KEY = "mg_mobile_read_notifs";
const HIDDEN_KEY = "mg_mobile_hidden_notifs";

export default function NotificationsScreen() {
  const { locale, user } = useStore();
  const en = locale === "en";
  const [items, setItems] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [storedBaseline, storedRead, storedHidden] = await Promise.all([
          AsyncStorage.getItem(BASELINE_KEY),
          AsyncStorage.getItem(READ_KEY),
          AsyncStorage.getItem(HIDDEN_KEY),
        ]);
        const parseArray = (value: string | null) => {
          try {
            const parsed = value ? JSON.parse(value) : [];
            return Array.isArray(parsed) ? parsed.map(String) : [];
          } catch {
            return [];
          }
        };
        const nextRead = parseArray(storedRead);
        const nextHidden = parseArray(storedHidden);
        if (!cancelled) {
          setReadIds(nextRead);
          setHiddenIds(nextHidden);
        }

        let result: { notifications: Notification[] };
        if (user) {
          result = await api<{ notifications: Notification[] }>(
            "/api/customer/notifications",
            { auth: true },
          );
        } else {
          const guest = await readGuestOrders();
          result = guest.length
            ? await api<{ notifications: Notification[] }>(
                "/api/notifications/orders",
                {
                  method: "POST",
                  body: JSON.stringify({
                    orders: guest.map(({ orderId, customerAccessToken }) => ({
                      orderId,
                      customerAccessToken,
                    })),
                  }),
                },
              )
            : await api<{ notifications: Notification[] }>(
                "/api/notifications",
              );
        }

        const fetched = result.notifications || [];
        let baseline: NotificationBaseline | null = null;
        try {
          baseline = storedBaseline ? JSON.parse(storedBaseline) : null;
        } catch {
          baseline = null;
        }

        // Saat aplikasi/perangkat baru pertama membuka kotak masuk, notifikasi
        // yang sudah ada dijadikan batas awal dan tidak langsung ditampilkan.
        if (!isValidNotificationBaseline(baseline)) {
          await AsyncStorage.setItem(
            BASELINE_KEY,
            JSON.stringify(createNotificationBaseline(fetched)),
          );
          if (!cancelled) setItems([]);
          return;
        }

        const visible = filterNotificationsAfterBaseline(
          fetched,
          baseline,
        ).filter((item) => !nextHidden.includes(item.id));
        if (!cancelled) setItems(visible);
      } catch (error) {
        if (!cancelled)
          Alert.alert(
            en ? "Notifications unavailable" : "Notifikasi belum dapat dimuat",
            (error as Error).message,
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, en]);

  const markAllRead = async () => {
    const next = Array.from(
      new Set([...readIds, ...items.map((item) => item.id)]),
    );
    setReadIds(next);
    await AsyncStorage.setItem(READ_KEY, JSON.stringify(next));
  };

  const hide = async (id: string) => {
    const next = Array.from(new Set([...hiddenIds, id]));
    setHiddenIds(next);
    setItems((current) => current.filter((item) => item.id !== id));
    await AsyncStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
  };

  const unreadCount = items.filter((item) => !readIds.includes(item.id)).length;

  return (
    <Screen>
      <StoreHeader
        title={en ? "Notifications" : "Notifikasi"}
        subtitle={
          unreadCount
            ? `${unreadCount} ${en ? "unread" : "belum dibaca"}`
            : en
              ? "Latest updates"
              : "Pembaruan terbaru"
        }
        showBack
      />
      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.orange}
          style={styles.loading}
        />
      ) : items.length ? (
        <>
          {unreadCount ? (
            <Pressable
              style={styles.markAll}
              onPress={() => void markAllRead()}
            >
              <Text style={styles.markAllText}>
                {en ? "Mark all as read" : "Tandai semua dibaca"}
              </Text>
            </Pressable>
          ) : null}
          {items.map((item) => {
            const unread = !readIds.includes(item.id);
            return (
              <View
                key={item.id}
                style={[styles.card, unread && styles.cardUnread]}
              >
                <View style={styles.icon}>
                  <Ionicons
                    name={
                      item.category === "produk"
                        ? "cube-outline"
                        : item.category === "pesanan"
                          ? "receipt-outline"
                          : item.category === "artikel"
                            ? "book-outline"
                            : "notifications-outline"
                    }
                    size={21}
                    color={COLORS.orange}
                  />
                </View>
                <View style={styles.copy}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>
                      {en ? item.titleEn || item.title : item.title}
                    </Text>
                    {unread ? <View style={styles.dot} /> : null}
                  </View>
                  <Text style={styles.body}>
                    {en ? item.bodyEn || item.body : item.body}
                  </Text>
                  {item.sentAt ? (
                    <Text style={styles.date}>
                      {new Date(item.sentAt).toLocaleString(
                        en ? "en-ID" : "id-ID",
                      )}
                    </Text>
                  ) : null}
                  <Pressable onPress={() => void hide(item.id)}>
                    <Text style={styles.hide}>
                      {en ? "Hide" : "Sembunyikan"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </>
      ) : (
        <EmptyState
          icon="notifications-outline"
          title={en ? "No new notifications" : "Belum ada notifikasi baru"}
          message={
            en
              ? "Only updates sent after you started using the app will appear here."
              : "Hanya pembaruan yang dikirim setelah kamu mulai memakai aplikasi yang akan tampil di sini."
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { marginTop: 90 },
  markAll: { alignSelf: "flex-end", paddingVertical: 5 },
  markAllText: { color: COLORS.orange, fontWeight: "800", fontSize: 12 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 19,
    padding: 14,
  },
  cardUnread: { backgroundColor: "#FFFDF7", borderColor: "#F0CAA2" },
  icon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  title: { flex: 1, color: COLORS.navy, fontWeight: "900" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.orange },
  body: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  date: { color: "#9DA5AE", fontSize: 10, marginTop: 3 },
  hide: { color: COLORS.danger, fontSize: 11, fontWeight: "700", marginTop: 4 },
});
