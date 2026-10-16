import Image from "next/image";
import { LOGO_MARQUEE_DURATION, type LogoItem } from "@/data/home";

type LogoStripMarqueeProps = {
  logos: LogoItem[];
  label?: string;
  className?: string;
};

export function LogoStripMarquee({
  logos,
  label,
  className = "",
}: LogoStripMarqueeProps) {
  const track = [...logos, ...logos];

  return (
    <div className={`logo-strip-marquee ${className}`.trim()}>
      {label && (
        <div className="logo-strip-marquee__label">
          <p>{label}</p>
        </div>
      )}

      <div className="logo-strip-marquee__track-wrap">
        <div className="logo-strip-marquee__fade" aria-hidden />
        <div
          className="marquee-track logo-strip-marquee__track"
          style={
            { "--marquee-duration": LOGO_MARQUEE_DURATION } as React.CSSProperties
          }
        >
          {track.map((logo, index) => (
            <div key={`${logo.name}-${index}`} className="logo-strip-marquee__item">
              <Image
                src={logo.src}
                alt={logo.name}
                width={160}
                height={40}
                className="logo-strip-marquee__logo"
                style={logo.scale ? ({ "--logo-scale": logo.scale } as React.CSSProperties) : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
