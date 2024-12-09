import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  runner: {
    chromiumArgs: ["--user-data-dir=./.wxt/chrome-data"],
  },
  manifest: {
    permissions: ["storage"],
    host_permissions: [
      "https://localhost/*",
      "https://*.pximg.net/*",
      "https://*.pixiv.net/*",
      "https://raw.githubusercontent.com/*"
    ],
  },
});
