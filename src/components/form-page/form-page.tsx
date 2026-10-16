import { GridBackground } from "@/components/layout/grid-background";
import { Header } from "@/components/layout/header";
import Footer from "@/components/shared/footer";
import { LogoStripMarquee } from "@/components/shared/logo-strip-marquee";
import { FormVideo } from "@/components/form-page/form-video";
import { TRUSTED_BY_LOGOS } from "@/data/home";
import { FORM_PAGES } from "@/data/form-pages";
import type { JourneyKey } from "@/data/navigation";
import "@/styles/jazzhq-form-pages.css";
import "./form-page.css";

export function FormPage({ variant }: { variant: JourneyKey }) {
  const page = FORM_PAGES[variant];

  return (
    <GridBackground>
      <Header />
      <main className="flex-1">
        <div className="vf-page">
          <div className="vf-left">
            <div>
              <h1>{page.heading}</h1>
              <p>{page.subheading}</p>
            </div>
            <FormVideo />
            <div className="vf-trusted">
              <p className="vf-trusted__label">TRUSTED BY</p>
              <LogoStripMarquee logos={TRUSTED_BY_LOGOS} className="vf-ticker" />
            </div>
          </div>

          {/* Solid role colour behind the white form card. */}
          <div className={`vf-panel vf-panel--${variant}`}>
            {page.filloutId ? (
              // The existing Fillout form, embedded as-is; Fillout hosts it and handles submission.
              // Loaded eagerly: with loading="lazy" the desktop form stayed blank until a repaint.
              <iframe
                src={`https://embed.fillout.com/t/${page.filloutId}?fillout-embed-type=standard`}
                title={`${page.heading} form`}
                className="vf-fillout"
              />
            ) : (
              <div className="vf-fillout vf-fillout--pending">Fillout form not connected yet</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </GridBackground>
  );
}
