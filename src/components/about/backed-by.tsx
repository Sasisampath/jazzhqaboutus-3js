import Image from "next/image";
import { AboutLogoStrip } from "./about-logo-strip";
import {
  ABOUT_BACKED_SUBTITLE,
  ABOUT_FOUNDING_LOGOS,
  ABOUT_BACKED_TITLE,
  ABOUT_INVESTORS,
} from "@/data/about";

/* About Us version of "Backed by": investor cards with the logo strip beneath. */
export function BackedBy() {
  return (
    <section className="au-backed" aria-labelledby="au-backed-title">
      <div className="page-section au-backed__inner">
        <header className="au-section-head">
          <h2 id="au-backed-title" className="au-section-head__title">
            {ABOUT_BACKED_TITLE}
          </h2>
          <p className="au-section-head__subtitle">{ABOUT_BACKED_SUBTITLE}</p>
        </header>

        <ul className="au-investors" role="list">
          {ABOUT_INVESTORS.map((investor) => (
            <li
              key={investor.name}
              className={`au-investor au-investor--${investor.accent}`}
            >
              <div className="au-investor__photo">
                <Image
                  src={investor.photo}
                  alt={`Portrait of ${investor.name}`}
                  width={132}
                  height={132}
                />
              </div>
              <h3 className="au-investor__name">{investor.name}</h3>
              <p className="au-investor__role">{investor.role}</p>
            </li>
          ))}
        </ul>
      </div>

      <AboutLogoStrip logos={ABOUT_FOUNDING_LOGOS} className="au-backed__logos" />
    </section>
  );
}
