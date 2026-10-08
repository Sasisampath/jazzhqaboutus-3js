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
        <svg className="au-founders__spark" viewBox="0 0 40 36" fill="none" aria-hidden>
          <path d="M3 30 14 33M9 16l9 9M26 3l3 13" />
        </svg>

        <Image
          src={ABOUT_FOUNDERS_PHOTO.src}
          alt={ABOUT_FOUNDERS_PHOTO.alt}
          width={ABOUT_FOUNDERS_PHOTO.width}
          height={ABOUT_FOUNDERS_PHOTO.height}
          sizes="(max-width: 699px) 100vw, (max-width: 1400px) 76vw, 960px"
          className="au-founders__photo"
        />

        <svg className="au-founders__scribble" viewBox="0 0 96 64" fill="none" aria-hidden>
          <path d="M4 60C30 44 62 22 88 8c6-3 5 5 0 10-9 9-26 20-38 22-7 1-6-6 2-11 9-6 22-11 34-13" />
        </svg>

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
