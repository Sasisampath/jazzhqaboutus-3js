import type { Metadata } from "next";

export const SITE_URL = "https://www.jazzhq.ai";
export const SITE_NAME = "JazzHQ";
export const DEFAULT_TITLE = "JazzHQ";
export const DEFAULT_DESCRIPTION =
  "JazzHQ empowers you with AI-powered products, services, and expert guidance for partner-driven businesses.";
export const DEFAULT_OG_IMAGE = "/assets/WebsitePreview.png";
export const DEFAULT_SITE_ICON = "/assets/logo/monogram.png";

export const INDEXABLE_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
  },
};

export const NOINDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: true,
};

type PageSeoOptions = {
  title: string;
  description?: string;
  path: string;
  indexable?: boolean;
  image?: string;
};

function pageUrls(path: string) {
  const canonical = path === "/" || !path ? "/" : path.replace(/\/$/, "");
  const absolute =
    canonical === "/" ? `${SITE_URL}/` : `${SITE_URL}${canonical}`;

  return { canonical, absolute };
}

export function canonicalUrl(path: string) {
  return pageUrls(path).absolute;
}

export function pageAlternates(
  path: string,
): NonNullable<Metadata["alternates"]> {
  const { canonical, absolute } = pageUrls(path);

  return {
    canonical,
    languages: {
      "x-default": absolute,
      "en-US": absolute,
    },
  };
}

export function pageSeo({
  title,
  description,
  path,
  indexable = true,
  image = DEFAULT_OG_IMAGE,
}: PageSeoOptions): Metadata {
  const url = canonicalUrl(path);
  const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return {
    title,
    ...(description !== undefined ? { description } : {}),
    alternates: pageAlternates(path),
    robots: indexable ? INDEXABLE_ROBOTS : NOINDEX_ROBOTS,
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title,
      ...(description !== undefined ? { description } : {}),
      images: [
        {
          url: ogImage,
          alt: title,
          ...(image === DEFAULT_OG_IMAGE
            ? { width: 1470, height: 771, type: "image/png" }
            : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      ...(description !== undefined ? { description } : {}),
      images: [ogImage],
    },
  };
}
