import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

import { COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  catalog: "grid-outline",
  cart: "bag-handle-outline",
  orders: "receipt-outline",
  account: "person-circle-outline",
};

export default function TabLayout() {
  const { cartCount, locale } = useStore();
  const labels =
    locale === "en"
      ? {
          index: "Home",
          catalog: "Catalog",
          cart: "Cart",
          orders: "Orders",
          account: "Account",
        }
      : {
          index: "Beranda",
          catalog: "Katalog",
          cart: "Keranjang",
          orders: "Pesanan",
          account: "Akun",
        };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          height: 70,
          paddingTop: 7,
          paddingBottom: 9,
          borderTopColor: COLORS.line,
          backgroundColor: COLORS.paper,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ color, size, focused }) => {
          const outline = String(
            icons[route.name] || "ellipse-outline",
          ) as keyof typeof Ionicons.glyphMap;
          const filled = String(outline).replace(
            "-outline",
            "",
          ) as keyof typeof Ionicons.glyphMap;
          return (
            <Ionicons
              name={focused ? filled : outline}
              color={color}
              size={size + 1}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: labels.index }} />
      <Tabs.Screen name="catalog" options={{ title: labels.catalog }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: labels.cart,
          tabBarBadge: cartCount || undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.orange },
        }}
      />
      <Tabs.Screen name="orders" options={{ title: labels.orders }} />
      <Tabs.Screen name="account" options={{ title: labels.account }} />
    </Tabs>
  );
}
