// Central link map for this frontend approval build.
// `href: null` means the destination is not implemented in this repo yet:
// the item is shown but does not navigate. Developers wire the real
// destinations here after design approval.
// In this repo only /about-us exists, so it is the one wired page link.
export const ROUTES = {
  home: "/",
  aboutUs: "/about-us",
  vendorForm: "/for-vendors",
  partnerForm: "/for-partners",
  buyerForm: "/for-buyers",
} as const;

export type NavDestination = string | null;

export const NAV_ITEMS: { label: string; href: NavDestination }[] = [
  { label: "Home", href: null },
  { label: "About Us", href: ROUTES.aboutUs },
  { label: "Events", href: null },
  { label: "Marketplace", href: null },
  { label: "Stories", href: null },
];

export type JourneyKey = "buyer" | "vendor" | "partner";

export const JOURNEYS: { key: JourneyKey; title: string; description: string; href: NavDestination }[] = [
  { key: "buyer", title: "I’m an AI Buyer", description: "Find AI solutions", href: ROUTES.buyerForm },
  { key: "vendor", title: "I’m an AI Vendor", description: "List your product", href: ROUTES.vendorForm },
  { key: "partner", title: "I’m a Channel Partner", description: "Partner with AI companies", href: ROUTES.partnerForm },
];

export const FOOTER_COMPANY: { label: string; href: NavDestination }[] = [
  { label: "About us", href: ROUTES.aboutUs },
  { label: "Marketplace", href: null },
];

export const FOOTER_HELP: { label: string; href: NavDestination }[] = [
  { label: "Contact us", href: null },
  { label: "Privacy policy", href: null },
  { label: "Terms and conditions", href: null },
];

export const FOOTER_LEGAL: { label: string; href: NavDestination }[] = [
  { label: "Privacy Policy", href: null },
  { label: "Terms of Service", href: null },
];
