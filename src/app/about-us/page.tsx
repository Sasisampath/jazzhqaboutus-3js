import type { Metadata } from "next";
import { GridBackground } from "@/components/layout/grid-background";
import { TopBanner } from "@/components/layout/top-banner";
import { AboutHeader } from "@/components/about/about-header";
import { AboutFooter } from "@/components/about/about-footer";
import { FounderStory } from "@/components/about/founder-story";
import { BackedBy } from "@/components/about/backed-by";
import { Journey } from "@/components/about/journey";
import "@/components/about/about-us.css";
import { pageSeo } from "@/lib/seo";

export const metadata: Metadata = pageSeo({
  title: "Meet the Team Building AI's Trusted Partner Marketplace",
  description:
    "JazzHQ was founded by former Freshworks leaders to fix broken AI discovery. Discover how the marketplace for vendors and partners began.",
  path: "/about-us",
});

export default function AboutPage() {
  return (
    <GridBackground>
      <TopBanner />
      <AboutHeader />
      <main className="au-page flex-1">
        <FounderStory />
        <BackedBy />
        <Journey />
      </main>
      <AboutFooter />
    </GridBackground>
  );
}
