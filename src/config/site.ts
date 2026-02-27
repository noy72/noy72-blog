export const SITE_CONFIG = {
  siteName: "noy72.com",
  baseUrl: import.meta.env.PROD ? "https://noy72.com" : "http://localhost:4321",
  defaultImage: "/og-default.jpg",
  description: "Webアプリケーションエンジニアの趣味と仕事のことを書くブログ",
  author: "noy72",
  gaMeasurementId: "G-NWM51D2Q35",
} as const;
