// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  experimental: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' https://i.imgur.com https://placehold.co",
        "font-src 'self' https://fonts.gstatic.com",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ],
      styleDirective: {
        resources: ["'self'", "https://fonts.googleapis.com"],
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
