import { MetadataRoute } from "next";

const BASE_URL = "https://vienydhdt.gov.vn";

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: BASE_URL, changeFrequency: "daily", priority: 1.0 },
  { url: `${BASE_URL}/gioi-thieu`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE_URL}/tin-tuc`, changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE_URL}/bac-si`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE_URL}/chuyen-khoa`, changeFrequency: "monthly", priority: 0.8 },
  { url: `${BASE_URL}/dat-lich`, changeFrequency: "monthly", priority: 0.9 },
  { url: `${BASE_URL}/bang-gia`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/duoc-lieu`, changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE_URL}/tra-cuu`, changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE_URL}/lien-he`, changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dynamicPosts: MetadataRoute.Sitemap = [];

  try {
    const isServer = typeof window === "undefined";
    const apiBase = isServer
      ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      : "";
    const res = await fetch(`${apiBase}/api/cms/posts?limit=200&offset=0`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      dynamicPosts = (json.data || []).map((post: { slug: string; updated_at: string; published_at: string }) => ({
        url: `${BASE_URL}/tin-tuc/${post.slug}`,
        lastModified: new Date(post.updated_at || post.published_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // silently skip if backend unavailable during build
  }

  return [...STATIC_ROUTES, ...dynamicPosts];
}
