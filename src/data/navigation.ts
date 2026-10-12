// Link map for the shared footer (ported from the Homepage project).
// `href: null` means the destination is not implemented in this repo yet:
// the item is shown but does not navigate. Developers wire the real
// destinations here after design approval.
export const ROUTES = {
  home: "/",
  aboutUs: "/about-us",
} as const;

export type NavDestination = string | null;

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

// "Summarize with AI" targets; not wired in this build.
export const AI_SUMMARY_LINKS: { label: string; logo: string; href: NavDestination }[] = [
  { label: "ChatGPT", logo: "/ai-logos/chatgpt.svg", href: null },
  { label: "Claude", logo: "/ai-logos/claude.svg", href: null },
  { label: "Gemini", logo: "/ai-logos/gemini.svg", href: null },
  { label: "Grok", logo: "/ai-logos/grok.svg", href: null },
];
