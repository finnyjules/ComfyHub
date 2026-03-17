// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

import node from "@astrojs/node";

export default defineConfig({
  devToolbar: { enabled: false },
  output: "static",
  adapter: node({
    mode: "standalone",
  }),
  server: {
    host: "0.0.0.0",
  },
  integrations: [vue()],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "/src/styles/_variables";\n@import "/src/styles/_mixins";\n`,
        },
      },
    },
  },
});