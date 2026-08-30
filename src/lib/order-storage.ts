import * as SecureStore from "expo-secure-store";

export type GuestOrderAccess = {
  orderId: string;
  customerAccessToken: string;
  cancelToken?: string;
  paymentToken?: string;
  paymentRedirectUrl?: string;
  phone?: string;
  savedAt: string;
};
const KEY = "mg_mobile_guest_orders";

export async function readGuestOrders(): Promise<GuestOrderAccess[]> {
  try {
    const value = await SecureStore.getItemAsync(KEY);
    const items = value ? JSON.parse(value) : [];
    return Array.isArray(items) ? items.slice(0, 20) : [];
  } catch {
    return [];
  }
}

export async function saveGuestOrder(order: GuestOrderAccess) {
  const current = await readGuestOrders();
  const next = [
    order,
    ...current.filter((item) => item.orderId !== order.orderId),
  ].slice(0, 20);
  await SecureStore.setItemAsync(KEY, JSON.stringify(next));
}

export async function removeGuestOrder(orderId: string) {
  const current = await readGuestOrders();
  await SecureStore.setItemAsync(
    KEY,
    JSON.stringify(current.filter((item) => item.orderId !== orderId)),
  );
}
