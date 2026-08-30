import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { absoluteAssetUrl } from "../src/constants/store.ts";

describe("absoluteAssetUrl", () => {
  it("resolves relative paths against the configured API base", () => {
    assert.equal(
      absoluteAssetUrl("/images/logo.png"),
      "https://morgengeschaft.com/images/logo.png",
    );
  });

  it("maps legacy product photos to optimized WebP files", () => {
    assert.equal(
      absoluteAssetUrl("/photos/Product 6.png"),
      "https://morgengeschaft.com/photos/Product%206.webp",
    );
  });

  it("preserves data URLs", () => {
    assert.equal(
      absoluteAssetUrl("data:image/png;base64,abc"),
      "data:image/png;base64,abc",
    );
  });
});
