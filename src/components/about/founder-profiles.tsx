import Image from "next/image";
import {
  ABOUT_FOUNDERS,
  ABOUT_FOUNDERS_LABEL,
  ABOUT_FOUNDERS_PHOTO,
} from "@/data/about";

/* Founders: one shared photo with names beneath, closing the founder note. */
export function FounderProfiles() {
  return (
    <div className="au-founders">
      <h2 className="au-founders__label">
        <span>{ABOUT_FOUNDERS_LABEL}</span>
      </h2>

      <div className="au-founders__frame">
        <Image
          src={ABOUT_FOUNDERS_PHOTO.src}
          alt={ABOUT_FOUNDERS_PHOTO.alt}
          width={ABOUT_FOUNDERS_PHOTO.width}
          height={ABOUT_FOUNDERS_PHOTO.height}
          sizes="(max-width: 699px) 100vw, (max-width: 1400px) 76vw, 960px"
          className="au-founders__photo"
        />

        <ul className="au-founders__list" role="list">
          {ABOUT_FOUNDERS.map((founder) => (
            <li key={founder.name} className={`au-founder au-founder--${founder.accent}`}>
              <h3 className="au-founder__name">{founder.name}</h3>
              <p className="au-founder__role">{founder.role}</p>
              <a
                className="au-founder__link"
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${founder.name} on LinkedIn (opens in a new tab)`}
              >
                LinkedIn <span aria-hidden>↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
