import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { COLORS } from "@/constants/store";
import { StoreProvider } from "@/context/store-context";

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.cream },
          headerTintColor: COLORS.navy,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.cream },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[id]"
          options={{ title: "Detail Produk" }}
        />
        <Stack.Screen
          name="checkout"
          options={{ title: "Checkout", presentation: "modal" }}
        />
        <Stack.Screen
          name="login"
          options={{ title: "Masuk", presentation: "modal" }}
        />
        <Stack.Screen name="wishlist" options={{ title: "Wishlist" }} />
        <Stack.Screen name="reviews" options={{ headerShown: false }} />
        <Stack.Screen name="articles" options={{ headerShown: false }} />
        <Stack.Screen name="article/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="chat" options={{ title: "GESA Assistant" }} />
        <Stack.Screen name="skin-quiz" options={{ title: "Kuis Tipe Kulit" }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="promotions" options={{ headerShown: false }} />
        <Stack.Screen name="faq" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="legal/[kind]" options={{ headerShown: false }} />
        <Stack.Screen
          name="return/[orderId]"
          options={{ title: "Ajukan Retur" }}
        />
      </Stack>
    </StoreProvider>
  );
}
