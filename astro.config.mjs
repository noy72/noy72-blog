// @ts-check
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkImgurImage from "./src/plugins/remark-imgur-image.ts";

// https://astro.build/config
export default defineConfig({
  site: "https://noy72.com",
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkMath, remarkImgurImage],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
  experimental: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' https://i.imgur.com https://placehold.co",
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
        "object-src 'none'",
        "base-uri 'self'",
        "upgrade-insecure-requests",
      ],
      styleDirective: {
        resources: [
          "'self'",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net",
        ],
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
