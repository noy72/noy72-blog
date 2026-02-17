import { SITE_CONFIG } from "../config/site";

export type BlogPostingSchema = {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  image: string;
  datePublished: string;
  author: {
    "@type": "Person";
    name: typeof SITE_CONFIG.author;
  };
  description?: string;
};

export function buildCanonicalUrl(pathname: string): string {
  const cleanPath =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;
  return `${SITE_CONFIG.baseUrl}${cleanPath}`;
}

export function buildAbsoluteImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${SITE_CONFIG.baseUrl}${imagePath}`;
}
