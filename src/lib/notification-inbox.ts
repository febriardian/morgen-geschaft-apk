export type NotificationItem = {
  id: string;
  sentAt?: string | number | { seconds?: number; _seconds?: number };
  [key: string]: unknown;
};

export type NotificationBaseline = {
  version: 1;
  sentAtMs: number;
  idsAtSentAt: string[];
};

export function notificationTime(notification: NotificationItem) {
  const sentAt = notification.sentAt;
  if (typeof sentAt === "number" && Number.isFinite(sentAt)) return sentAt;
  if (typeof sentAt === "string") {
    const parsed = Date.parse(sentAt);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (sentAt && typeof sentAt === "object") {
    const seconds = sentAt.seconds ?? sentAt._seconds;
    if (typeof seconds === "number" && Number.isFinite(seconds))
      return seconds * 1000;
  }
  return null;
}

export function isValidNotificationBaseline(
  value: unknown,
): value is NotificationBaseline {
  if (!value || typeof value !== "object") return false;
  const baseline = value as NotificationBaseline;
  return (
    baseline.version === 1 &&
    Number.isFinite(baseline.sentAtMs) &&
    Array.isArray(baseline.idsAtSentAt)
  );
}

export function createNotificationBaseline(
  notifications: NotificationItem[],
): NotificationBaseline {
  const times = notifications
    .map(notificationTime)
    .filter((value): value is number => Number.isFinite(value));
  const sentAtMs = times.length ? Math.max(...times) : Date.now();
  const idsAtSentAt = notifications
    .filter((item) => notificationTime(item) === sentAtMs)
    .map((item) => String(item.id || ""))
    .filter(Boolean);
  return { version: 1, sentAtMs, idsAtSentAt };
}

export function filterNotificationsAfterBaseline<T extends NotificationItem>(
  notifications: T[],
  baseline: NotificationBaseline,
) {
  return notifications.filter((notification) => {
    const time = notificationTime(notification);
    if (!Number.isFinite(time)) return false;
    if ((time as number) > baseline.sentAtMs) return true;
    if ((time as number) < baseline.sentAtMs) return false;
    return !baseline.idsAtSentAt.includes(String(notification.id || ""));
  });
}
