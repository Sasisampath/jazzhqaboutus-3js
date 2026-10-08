import {
  ABOUT_BOOK_COVER,
  ABOUT_BOOK_SPREADS,
  type BookBlock,
  type BookPage,
  type BookRun,
} from "@/data/about";

/* Flat, DOM-only rendering of the founder note. Used as the poster while the
   3D book loads, as the WebGL fallback, and as the screen-reader transcript. */

function Runs({ runs }: { runs: BookRun[] }) {
  return (
    <>
      {runs.map((run, index) =>
        run.mark === "marker" ? (
          <mark key={index} className="au-note-marker">
            {run.text}
          </mark>
        ) : run.mark === "underline" ? (
          <span key={index} className="au-note-underline">
            {run.text}
          </span>
        ) : (
          <span key={index}>{run.text}</span>
        ),
      )}
    </>
  );
}

function Block({ block }: { block: BookBlock }) {
  switch (block.kind) {
    case "eyebrow":
      return (
        <p
          className={`au-note-eyebrow${block.tone === "accent" ? " au-note-eyebrow--accent" : ""}`}
        >
          {block.text}
        </p>
      );
    case "display":
      return (
        <p className={`au-note-display au-note-display--${block.size ?? "md"}`}>
          {block.lines.map((line) => (
            <span key={line}>{line} </span>
          ))}
        </p>
      );
    case "lead":
      return (
        <p className="au-note-lead">
          <Runs runs={block.runs} />
        </p>
      );
    case "body":
      return (
        <p className="au-note-body">
          <Runs runs={block.runs} />
        </p>
      );
    case "note":
      return (
        <p className="au-note-annotation">
          {block.text} <span aria-hidden>→</span>
        </p>
      );
    case "rule":
      return <span className="au-note-rule" aria-hidden />;
  }
}

function FlatPage({ page, side, folio }: { page: BookPage; side: "left" | "right"; folio: number }) {
  return (
    <div
      className={`au-flat-page au-flat-page--${side}${page.valign === "center" ? " au-flat-page--center" : ""}`}
    >
      <div className="au-flat-page__body">
        {page.blocks.map((block, index) => (
          <Block key={index} block={block} />
        ))}
      </div>
      <span className="au-flat-page__folio">{String(folio).padStart(2, "0")}</span>
    </div>
  );
}

export function FounderBookCover() {
  return (
    <div className="au-flat-cover">
      <span className="au-flat-cover__brand">{ABOUT_BOOK_COVER.brand}</span>
      <span className="au-flat-cover__title">
        {ABOUT_BOOK_COVER.title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
      <span className="au-flat-cover__volume">{ABOUT_BOOK_COVER.volume}</span>
      <span className="au-flat-cover__subtitle">
        {ABOUT_BOOK_COVER.subtitle.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </span>
      <span className="au-flat-cover__dots" aria-hidden>
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

export function FounderBookSpread({
  spread,
  side,
  single,
}: {
  spread: number;
  side: 0 | 1;
  single: boolean;
}) {
  const pages = ABOUT_BOOK_SPREADS[spread];
  return (
    <div className={`au-flat-spread${single ? " au-flat-spread--single" : ""}`}>
      {(!single || side === 0) && (
        <FlatPage page={pages.left} side="left" folio={spread * 2 + 1} />
      )}
      {(!single || side === 1) && (
        <FlatPage page={pages.right} side="right" folio={spread * 2 + 2} />
      )}
    </div>
  );
}

/** Full note as plain reading text for assistive technology. */
export function FounderBookTranscript() {
  return (
    <div className="au-sr-only">
      {ABOUT_BOOK_SPREADS.flatMap((spread) => [spread.left, spread.right]).flatMap(
        (page, pageIndex) =>
          page.blocks.map((block, index) => {
            if (block.kind === "rule") return null;
            const text =
              block.kind === "display"
                ? block.lines.join(" ")
                : block.kind === "lead" || block.kind === "body"
                  ? block.runs.map((run) => run.text).join("")
                  : block.text;
            return <p key={`${pageIndex}-${index}`}>{text}</p>;
          }),
      )}
    </div>
  );
}
