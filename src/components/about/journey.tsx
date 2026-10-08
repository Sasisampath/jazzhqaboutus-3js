import Image from "next/image";
import {
  ABOUT_FINAL_IMAGE,
  ABOUT_FINAL_IMAGE_LABEL,
  ABOUT_JOURNEY_SUBTITLE,
  ABOUT_JOURNEY_TITLE,
  ABOUT_TIMELINE,
} from "@/data/about";

const ACCENTS = ["red", "purple", "green", "yellow"] as const;

function JourneyFinalImage() {
  return (
    <figure className="au-final">
      <figcaption className="au-final__label">{ABOUT_FINAL_IMAGE_LABEL}</figcaption>
      {ABOUT_FINAL_IMAGE ? (
        <Image
          src={ABOUT_FINAL_IMAGE.src}
          alt={ABOUT_FINAL_IMAGE.alt}
          width={ABOUT_FINAL_IMAGE.width}
          height={ABOUT_FINAL_IMAGE.height}
          sizes="(max-width: 1400px) 100vw, 1400px"
          className="au-final__image"
        />
      ) : (
        // Slot for the approved replacement image (see ABOUT_FINAL_IMAGE).
        <div className="au-final__pending" role="img" aria-label="Approved image pending">
          <span>Approved image pending</span>
        </div>
      )}
    </figure>
  );
}

export function Journey() {
  return (
    <section className="au-journey" aria-labelledby="au-journey-title">
      <div className="page-section au-journey__inner">
        <header className="au-section-head">
          <h2 id="au-journey-title" className="au-section-head__title">
            {ABOUT_JOURNEY_TITLE}
          </h2>
          <p className="au-section-head__subtitle">{ABOUT_JOURNEY_SUBTITLE}</p>
        </header>

        <ol className="au-timeline">
          {ABOUT_TIMELINE.map((item, index) => (
            <li
              key={item.title}
              className={`au-milestone au-milestone--${ACCENTS[index % ACCENTS.length]}`}
            >
              <span className="au-milestone__dot" aria-hidden />
              <div className="au-milestone__text">
                <p className="au-milestone__date">
                  <time>{item.date}</time>
                </p>
                <h3 className="au-milestone__title">{item.title}</h3>
                <p className="au-milestone__copy">{item.description}</p>
              </div>
              <div className="au-milestone__media">
                <Image
                  src={item.image}
                  alt={`${item.title}, ${item.date}`}
                  width={item.imageWidth}
                  height={item.imageHeight}
                  sizes="(max-width: 899px) 100vw, 560px"
                />
              </div>
            </li>
          ))}
        </ol>

        <JourneyFinalImage />
      </div>
    </section>
  );
}
