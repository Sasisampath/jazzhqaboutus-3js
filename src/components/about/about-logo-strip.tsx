import Image from "next/image";
import { ABOUT_LOGO_MARQUEE_DURATION, type AboutLogo } from "@/data/about";

/* About Us copy of the Home logo strip. Same markup and shared
   .logo-strip-marquee styles, without depending on Home's component or data. */
export function AboutLogoStrip({
  logos,
  className = "",
}: {
  logos: AboutLogo[];
  className?: string;
}) {
  const track = [...logos, ...logos];

  return (
    <div className={`logo-strip-marquee ${className}`.trim()}>
      <div className="logo-strip-marquee__track-wrap">
        <div className="logo-strip-marquee__fade" aria-hidden />
        <div
          className="marquee-track logo-strip-marquee__track"
          style={
            { "--marquee-duration": ABOUT_LOGO_MARQUEE_DURATION } as React.CSSProperties
          }
        >
          {track.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="logo-strip-marquee__item"
              aria-hidden={index >= logos.length}
            >
              <Image
                src={logo.src}
                alt={index >= logos.length ? "" : logo.name}
                width={160}
                height={40}
                className="logo-strip-marquee__logo"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
