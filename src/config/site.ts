export const SITE_CONFIG = {
  siteName: "noy72.com",
  baseUrl: import.meta.env.PROD ? "https://noy72.com" : "http://localhost:4321",
  defaultImage: "/og-default.jpg",
  description: "Web開発とプログラミングに関する技術ブログ",
  author: "noy72",
} as const;
