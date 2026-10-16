// Tuned for the 11-logo strip so it keeps the original perceived speed.
export const LOGO_MARQUEE_DURATION = "50s";

export type LogoItem = {
  name: string;
  src: string;
  /** Optical size correction relative to the strip's logo height (default 1). */
  scale?: number;
};

export const TRUSTED_BY_LOGOS: LogoItem[] = [
  {
    name: "SurveySparrow",
    src: "/assets/logos/surveysparrow.png",
  },
  {
    name: "Monday.com",
    src: "/assets/logos/monday.svg",
  },
  {
    name: "WATI",
    src: "/assets/logos/wati.svg",
  },
  {
    name: "SeamlessHR",
    src: "/assets/logos/seamlesshr.svg",
  },
  {
    name: "SuperOps",
    src: "/assets/logos/superops.svg",
  },
  {
    name: "Rocketlane",
    src: "/assets/logos/rocketlane.svg",
  },
  {
    name: "ElevenLabs",
    src: "/assets/logos/elevenlabs.svg",
  },
  {
    name: "HubSpot",
    src: "/assets/logos/hubspot-trusted.svg",
  },
  {
    name: "Enmovil",
    src: "/assets/logos/enmovil.svg",
  },
  {
    name: "Wrike",
    src: "/assets/logos/wrike.svg",
  },
  {
    name: "Keka",
    src: "/assets/logos/keka.svg",
    scale: 0.86,
  },
];
