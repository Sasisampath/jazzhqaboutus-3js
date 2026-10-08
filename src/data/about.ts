export type AboutFounder = {
  name: string;
  role: string;
  /** Approved LinkedIn profile URL. */
  linkedin: string;
  accent: "green" | "purple";
};

// Order matches the photo: Krish on the left, Vijayraj on the right.
export const ABOUT_FOUNDERS: AboutFounder[] = [
  {
    name: "Krish Ramachandran",
    role: "Founder & CEO",
    linkedin: "https://www.linkedin.com/in/aboutrk/",
    accent: "green",
  },
  {
    name: "Vijayraj",
    role: "Co-founder & CTO",
    linkedin: "https://www.linkedin.com/in/mvijayaraj/",
    accent: "purple",
  },
];

export const ABOUT_FOUNDERS_LABEL = "Founders \u00b7 JazzHQ";

// Supplied black-and-white photo; its tilt, border and rounded corners are part of the asset.
export const ABOUT_FOUNDERS_PHOTO = {
  src: "/assets/about/founders/founders-krish-vijayraj.webp",
  width: 2000,
  height: 1181,
  alt: "Krish Ramachandran and Vijayraj, the founders of JazzHQ, smiling side by side",
};

export type AboutTimelineItem = {
  date: string;
  title: string;
  description: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
};

export const ABOUT_TIMELINE: AboutTimelineItem[] = [
  {
    date: "July 2023",
    title: "The Idea Takes Shape",
    description:
      "JazzHQ began with a simple belief: AI products will need trusted humans to sell, implement, and support them.",
    image: "/assets/about/timeline/idea-takes-shape.webp",
    imageWidth: 1563,
    imageHeight: 881,
  },
  {
    date: "Jan 2024",
    title: "Partner Advisory Goes Live",
    description:
      "We started working with AI-first and SaaS companies to help them design partner programs, recruit partners, and build repeatable go-to-market playbooks.",
    image: "/assets/about/timeline/partner-advisory.webp",
    imageWidth: 1563,
    imageHeight: 956,
  },
  {
    date: "July 2024",
    title: "From Services To System",
    description:
      "After working with multiple vendors and partner teams, we saw the same problem repeat: partner discovery, onboarding, enablement, and co-selling were still being run through spreadsheets, calls, and scattered tools.",
    image: "/assets/about/timeline/services-to-system.webp",
    imageWidth: 1563,
    imageHeight: 1031,
  },
  {
    date: "Jan 2025",
    title: "JazzHQ Starts Becoming A Platform",
    description:
      "We began building the Partner OS: An AI-native platform to help vendors manage partner onboarding, training, content, lead sharing, and partner operations in one place.",
    image: "/assets/about/timeline/platform.jpg",
    imageWidth: 500,
    imageHeight: 306,
  },
  {
    date: "July 2025",
    title: "The Partner Network Expands",
    description:
      "JazzHQ started building a global ecosystem of consultants, agencies, and channel partners who want to add AI products and services to their portfolio.",
    image: "/assets/about/timeline/partner-network.webp",
    imageWidth: 1563,
    imageHeight: 956,
  },
  {
    date: "Jan 2026",
    title: "Marketplace Vision Comes Together",
    description:
      "We brought vendors, partners, templates, training, and partner operations into one connected marketplace experience.",
    image: "/assets/about/timeline/marketplace-vision.webp",
    imageWidth: 1563,
    imageHeight: 881,
  },
  {
    date: "July 2026",
    title: "The AI Partner Marketplace Goes Live",
    description:
      "JazzHQ launches as the marketplace where AI companies and trusted partners come together to create, sell, deploy, and grow AI revenue.",
    image: "/assets/about/timeline/marketplace-live.webp",
    imageWidth: 1563,
    imageHeight: 1044,
  },
];

export const ABOUT_JOURNEY_TITLE = "Our journey so far";

export const ABOUT_JOURNEY_SUBTITLE =
  "How we built the AI Reselling infrastructure from scratch.";


/**
 * Large closing image shown after the journey.
 * The approved replacement for the previous team image.
 */
export type AboutFinalImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const ABOUT_FINAL_IMAGE: AboutFinalImage | null = {
  src: "/assets/about/current-chapter-2026.jpg",
  width: 2000,
  height: 1006,
  alt: "Group photo of people gathered at a JazzHQ event, smiling in front of a red wall",
};

export const ABOUT_FINAL_IMAGE_LABEL = "Current chapter · 2026";

/* ── Backed by (About Us copy of the Home investor content) ── */

export type AboutInvestor = {
  name: string;
  role: string;
  photo: string;
  accent: "green" | "red" | "purple";
};

export const ABOUT_BACKED_TITLE = "Backed by the Best in the Industry";

export const ABOUT_BACKED_SUBTITLE =
  "Our early investors include prominent founders and seasoned executives, who\u2019ve worked at large corporates and leading marketplaces.";

export const ABOUT_INVESTORS: AboutInvestor[] = [
  {
    name: "Shan Krishnasamy",
    role: "Prev. Co-founder & CTO, Freshworks",
    photo: "/assets/backed-by/advisor-shan.webp",
    accent: "green",
  },
  {
    name: "Sidharth Malik",
    role: "Advisory Board Member WestBridge Capital;\nPrev. CEO, CleverTap; CRO, Freshworks;\nMD, Akamai Technologies",
    photo: "/assets/backed-by/advisor-sidharth.png",
    accent: "red",
  },
  {
    name: "Shihab Muhammed",
    role: "Founder & CEO, SurveySparrow;\nPrev. Emp #1 & Co-founder - Freshservice",
    photo: "/assets/backed-by/advisor-shihab.webp",
    accent: "purple",
  },
];

/* Logo strip under the investor cards (same logos and order as Home). */

export type AboutLogo = { name: string; src: string };

export const ABOUT_LOGO_MARQUEE_DURATION = "36s";

export const ABOUT_FOUNDING_LOGOS: AboutLogo[] = [
  { name: "ElevenLabs", src: "/assets/logos/elevenlabs.svg" },
  { name: "Intercom", src: "/assets/logos/intercom.svg" },
  { name: "EY", src: "/assets/logos/ey.svg" },
  { name: "plum", src: "/assets/logos/plum.svg" },
  { name: "Klarna", src: "/assets/logos/klarna.svg" },
  { name: "Microsoft", src: "/assets/logos/microsoft.svg" },
  { name: "Zoho", src: "/assets/logos/zoho.svg" },
  { name: "talabat", src: "/assets/logos/talabat.svg" },
  { name: "coupang", src: "/assets/logos/coupang.svg" },
];

/* ── Founder note (field-notes book) ── */

export type BookRun = { text: string; mark?: "marker" | "underline" };

export type BookBlock =
  | { kind: "eyebrow"; text: string; tone?: "muted" | "accent" }
  | { kind: "display"; lines: string[]; size?: "lg" | "xl" }
  | { kind: "lead"; runs: BookRun[] }
  | { kind: "body"; runs: BookRun[] }
  | { kind: "note"; text: string }
  | { kind: "rule" };

export type BookPage = {
  blocks: BookBlock[];
  valign?: "top" | "center";
};

export type BookSpread = { left: BookPage; right: BookPage };

export const ABOUT_BOOK_COVER = {
  brand: "JAZZHQ",
  title: ["FIELD", "NOTES"],
  volume: "VOL. 01",
  subtitle: ["WHY WE\u2019RE", "BUILDING THIS"],
};

export const ABOUT_BOOK_SPREADS: BookSpread[] = [
  {
    left: {
      valign: "center",
      blocks: [
        { kind: "eyebrow", text: "A note from the founders" },
        { kind: "eyebrow", text: "JazzHQ \u00b7 2026", tone: "accent" },
        { kind: "display", lines: ["WHY WE ARE", "BUILDING", "JAZZHQ"], size: "lg" },
        { kind: "note", text: "It started with one observation" },
      ],
    },
    right: {
      valign: "center",
      blocks: [
        { kind: "lead", runs: [{ text: "AI has changed how software is built." }] },
        {
          kind: "lead",
          runs: [
            { text: "But it has not changed one truth: " },
            { text: "software still needs humans to make it successful.", mark: "marker" },
          ],
        },
      ],
    },
  },
  {
    left: {
      blocks: [
        { kind: "eyebrow", text: "Observation 01" },
        { kind: "display", lines: ["DISCOVERY", "IS BROKEN."] },
        {
          kind: "body",
          runs: [
            {
              text: "The market is full of powerful AI products, but discovery is broken. Vendors struggle to reach the right customers, build trust, and drive adoption through traditional channels.",
            },
          ],
        },
        {
          kind: "body",
          runs: [{ text: "Buyers are overwhelmed. Great products get missed." }],
        },
      ],
    },
    right: {
      blocks: [
        { kind: "eyebrow", text: "Observation 02" },
        { kind: "display", lines: ["THE ECOSYSTEM", "IS FRAGMENTED."] },
        {
          kind: "body",
          runs: [
            {
              text: "At the same time, consultants, agencies, and channel partners are looking for new ways to build revenue around AI. They want credible products to represent, practical training, ready-to-use templates, and a clear path to monetization.",
            },
          ],
        },
        {
          kind: "body",
          runs: [
            { text: "But " },
            { text: "the ecosystem is fragmented", mark: "underline" },
            {
              text: ". Vendors and partners are still finding each other through scattered networks, manual outreach, spreadsheets, and luck.",
            },
          ],
        },
      ],
    },
  },
  {
    left: {
      valign: "center",
      blocks: [
        { kind: "eyebrow", text: "Because" },
        { kind: "display", lines: ["AI DOESN\u2019T", "DEPLOY", "ITSELF."], size: "xl" },
      ],
    },
    right: {
      valign: "center",
      blocks: [
        {
          kind: "lead",
          runs: [
            {
              text: "It needs humans who understand customers, workflows, adoption, and outcomes.",
            },
          ],
        },
        { kind: "rule" },
        {
          kind: "lead",
          runs: [
            { text: "JazzHQ is where AI companies and those humans " },
            { text: "come together.", mark: "marker" },
          ],
        },
      ],
    },
  },
];
