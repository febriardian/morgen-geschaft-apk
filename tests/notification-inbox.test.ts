import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createNotificationBaseline,
  filterNotificationsAfterBaseline,
  isValidNotificationBaseline,
  notificationTime,
} from "../src/lib/notification-inbox.ts";

describe("notification inbox", () => {
  it("normalizes supported timestamp formats", () => {
    assert.equal(notificationTime({ id: "a", sentAt: 1_000 }), 1_000);
    assert.equal(notificationTime({ id: "b", sentAt: { seconds: 2 } }), 2_000);
    assert.equal(
      notificationTime({ id: "c", sentAt: "2026-08-30T00:00:00.000Z" }),
      1_788_048_000_000,
    );
  });

  it("hides baseline notifications and keeps newer notifications", () => {
    const existing = [
      { id: "old", sentAt: 1_000 },
      { id: "latest-a", sentAt: 2_000 },
      { id: "latest-b", sentAt: 2_000 },
    ];
    const baseline = createNotificationBaseline(existing);

    assert.equal(isValidNotificationBaseline(baseline), true);
    assert.deepEqual(
      filterNotificationsAfterBaseline(
        [
          ...existing,
          { id: "new-at-same-time", sentAt: 2_000 },
          { id: "newer", sentAt: 3_000 },
        ],
        baseline,
      ).map((item) => item.id),
      ["new-at-same-time", "newer"],
    );
  });

  it("rejects malformed baselines", () => {
    assert.equal(isValidNotificationBaseline(null), false);
    assert.equal(
      isValidNotificationBaseline({
        version: 1,
        sentAtMs: "now",
        idsAtSentAt: [],
      }),
      false,
    );
  });
});
