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

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export type BreadcrumbListSchema = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
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

export function extractDescriptionFromMarkdown(content: string): string {
  const maxLength = 150;
  const trimmed = content.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return trimmed.slice(0, maxLength) + "...";
}

export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: buildCanonicalUrl(item.href),
    })),
  };
}
