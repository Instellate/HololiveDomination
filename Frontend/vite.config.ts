import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import path from "path";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { ServerOptions as HttpsServerOptions } from "node:https";
import mkcert from'vite-plugin-mkcert'

export default defineConfig({
  server: {
    https: true as unknown as HttpsServerOptions,
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths(), mkcert()],
  resolve: {
    alias: {
      "~/": path.resolve("./app"),
    },
  },
});
