import type { MetadataRoute } from "next";

import { getAlbumSlugs } from "@/content/albums";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages = ["", "/projects", "/curiosity", "/resume", "/notes", "/connect"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const albumPages = getAlbumSlugs().map((slug) => ({
    url: `${siteUrl}/projects/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...pages, ...albumPages];
}
