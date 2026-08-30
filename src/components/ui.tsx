import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { absoluteAssetUrl, COLORS, money } from "@/constants/store";
import { useStore } from "@/context/store-context";
import type { Product } from "@/types/store";

export function Screen({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  style,
}: PropsWithChildren<{
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
}>) {
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.screenContent, style]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.orange}
          />
        ) : undefined
      }
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, style]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {body}
    </SafeAreaView>
  );
}

export function StoreHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  showAccount = false,
}: {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showAccount?: boolean;
}) {
  const { locale, setLocale, user } = useStore();
  const goBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) return router.back();
    router.replace("/");
  };
  return (
    <View style={styles.header}>
      <View style={styles.headerBrand}>
        {showBack ? (
          <Pressable
            style={styles.backButton}
            onPress={goBack}
            accessibilityLabel={locale === "en" ? "Back" : "Kembali"}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.navy} />
          </Pressable>
        ) : (
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.headerLogo}
            contentFit="contain"
          />
        )}
        <View style={styles.flex}>
          <Text style={styles.headerTitle}>{title || "Morgen Geschäft"}</Text>
          {subtitle ? (
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.headerActions}>
        <Pressable
          style={styles.localeButton}
          onPress={() => setLocale(locale === "id" ? "en" : "id")}
          accessibilityLabel="Ganti bahasa"
        >
          <Text style={styles.localeText}>{locale.toUpperCase()}</Text>
        </Pressable>
        <Pressable
          style={styles.roundButton}
          onPress={() => router.push("/notifications")}
          accessibilityLabel="Notifikasi"
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.navy}
          />
        </Pressable>
        {showAccount ? (
          <Pressable
            style={styles.roundButton}
            onPress={() => router.push("/account")}
            accessibilityLabel={locale === "en" ? "Account" : "Akun"}
          >
            <Ionicons
              name={user ? "person-circle" : "person-circle-outline"}
              size={23}
              color={user ? COLORS.orange : COLORS.navy}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.flex}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={styles.actionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const { locale, addToCart, wishlist, toggleWishlist } = useStore();
  const english = locale === "en";
  const translatedName = product.translations?.en?.name;
  const name = english
    ? product.nameEn ||
      (typeof translatedName === "string" ? translatedName : product.name)
    : product.name;
  const isFavorite = wishlist.some((item) => item.id === product.id);
  return (
    <Pressable
      style={[styles.productCard, compact && styles.productCardCompact]}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={styles.productImageWrap}>
        <Image
          source={{ uri: absoluteAssetUrl(product.image) }}
          style={styles.productImage}
          contentFit="contain"
          transition={180}
        />
        <Pressable
          style={styles.favorite}
          onPress={(event) => {
            event.stopPropagation();
            toggleWishlist(product);
          }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            color={isFavorite ? COLORS.danger : COLORS.navy}
            size={19}
          />
        </Pressable>
      </View>
      <View style={styles.productBody}>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.price}>{money(product.price, locale)}</Text>
        <View style={styles.stockRow}>
          <Text
            style={[styles.stock, Number(product.stock) <= 0 && styles.out]}
          >
            {Number(product.stock) > 0
              ? `${english ? "Stock" : "Stok"} ${product.stock}`
              : english
                ? "Out of stock"
                : "Stok habis"}
          </Text>
          <Pressable
            disabled={Number(product.stock) <= 0}
            style={[
              styles.addMini,
              Number(product.stock) <= 0 && styles.disabled,
            ]}
            onPress={(event) => {
              event.stopPropagation();
              addToCart(product);
            }}
          >
            <Ionicons name="add" size={20} color={COLORS.paper} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "primary" | "outline" | "danger";
}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        variant === "outline" && styles.outlineButton,
        variant === "danger" && styles.dangerButton,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? COLORS.navy : COLORS.paper}
        />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? (
            <Ionicons
              name={icon}
              size={20}
              color={variant === "outline" ? COLORS.navy : COLORS.paper}
            />
          ) : null}
          <Text
            style={[
              styles.primaryButtonText,
              variant === "outline" && styles.outlineButtonText,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label?: string }) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#99A2AC"
        {...props}
        style={[
          styles.field,
          props.multiline && styles.fieldMultiline,
          props.style,
        ]}
      />
    </View>
  );
}

export function EmptyState({
  icon = "cube-outline",
  title,
  message,
  action,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={COLORS.orange} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {action && onAction ? (
        <PrimaryButton label={action} onPress={onAction} variant="outline" />
      ) : null}
    </View>
  );
}

export function HeroCard({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <LinearGradient
      colors={[COLORS.navy, COLORS.navySoft]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroCopy}>
        <Text style={styles.heroKicker}>MORGEN GESCHÄFT</Text>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
        <Pressable style={styles.heroButton} onPress={onAction}>
          <Text style={styles.heroButtonText}>{action}</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.navy} />
        </Pressable>
      </View>
      <Image
        source={require("../../assets/images/maskot.png")}
        style={styles.heroMascot}
        contentFit="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: COLORS.cream },
  screenContent: { padding: 18, paddingBottom: 110, gap: 18 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  headerBrand: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerLogo: { width: 42, height: 42, borderRadius: 13 },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.paper,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  headerTitle: { color: COLORS.navy, fontSize: 19, fontWeight: "900" },
  headerSubtitle: { color: COLORS.muted, fontSize: 11, marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 8 },
  localeButton: {
    minWidth: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  localeText: { color: COLORS.orange, fontWeight: "900", fontSize: 12 },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.paper,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
  },
  eyebrow: {
    color: COLORS.orange,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  sectionTitle: { color: COLORS.navy, fontSize: 22, fontWeight: "900" },
  actionText: { color: COLORS.orange, fontWeight: "800", fontSize: 13 },
  productCard: {
    width: 172,
    borderRadius: 22,
    backgroundColor: COLORS.paper,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  productCardCompact: { width: "48%" },
  productImageWrap: { height: 156, backgroundColor: "#F8F5F0", padding: 13 },
  productImage: { width: "100%", height: "100%" },
  favorite: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  productBody: { padding: 12, gap: 7 },
  productName: {
    color: COLORS.ink,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "800",
    minHeight: 38,
  },
  price: { color: COLORS.orange, fontSize: 16, fontWeight: "900" },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stock: { color: COLORS.success, fontSize: 11, fontWeight: "700" },
  out: { color: COLORS.danger },
  addMini: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.navy,
  },
  outlineButton: {
    backgroundColor: COLORS.paper,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
  },
  dangerButton: { backgroundColor: COLORS.danger },
  primaryButtonText: { color: COLORS.paper, fontWeight: "900", fontSize: 15 },
  outlineButtonText: { color: COLORS.navy },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  fieldWrap: { gap: 7 },
  fieldLabel: { color: COLORS.ink, fontSize: 13, fontWeight: "800" },
  field: {
    minHeight: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: COLORS.paper,
    color: COLORS.ink,
    borderWidth: 1,
    borderColor: COLORS.line,
    fontSize: 15,
  },
  fieldMultiline: { minHeight: 110, paddingTop: 14, textAlignVertical: "top" },
  empty: {
    marginTop: 70,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: COLORS.orangeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: COLORS.navy,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyMessage: {
    color: COLORS.muted,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 7,
  },
  hero: {
    minHeight: 224,
    borderRadius: 28,
    padding: 22,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  heroCopy: { width: "70%", zIndex: 2 },
  heroKicker: {
    color: COLORS.orange,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  heroTitle: {
    color: COLORS.paper,
    fontWeight: "900",
    fontSize: 27,
    lineHeight: 31,
  },
  heroSubtitle: {
    color: "#DDE6EF",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 9,
    marginBottom: 16,
  },
  heroButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 15,
    height: 42,
    borderRadius: 14,
  },
  heroButtonText: { color: COLORS.navy, fontWeight: "900" },
  heroMascot: {
    width: 142,
    height: 170,
    position: "absolute",
    right: -27,
    bottom: -9,
  },
});
