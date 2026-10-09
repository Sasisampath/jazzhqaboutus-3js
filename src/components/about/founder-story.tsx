import { FounderBook } from "./founder-book";
import { FounderProfiles } from "./founder-profiles";

/* Opening section: why JazzHQ exists + the founders behind it, as one story. */
export function FounderStory() {
  return (
    <section className="au-story" aria-labelledby="au-story-title">
      <div className="page-section au-story__inner">
        <header className="au-story__head">
          <h1 id="au-story-title" className="au-story__title">
            Why we are building JazzHQ
          </h1>
        </header>

        <FounderBook />
        <FounderProfiles />
      </div>
    </section>
  );
}
