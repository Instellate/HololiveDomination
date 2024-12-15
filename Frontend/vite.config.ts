import { reactRouter } from '@react-router/dev/vite';
import autoprefixer from 'autoprefixer';
import path from 'path';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { ServerOptions as HttpsServerOptions } from 'node:https';
import mkcert from 'vite-plugin-mkcert';
import mdx from '@mdx-js/rollup';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'

export default defineConfig({
  server: {
    https: true as unknown as HttpsServerOptions,
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [mdx({
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter]
    
  }), reactRouter(), tsconfigPaths(), mkcert()],
  resolve: {
    alias: {
      '~/': path.resolve('./app'),
    },
  },
});
