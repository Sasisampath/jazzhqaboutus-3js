# JazzHQ About Us

Standalone copy of the redesigned JazzHQ `/about-us` page: the Three.js founder
field-notes book, founders, investors and logo strip, journey timeline and the
About Us header and footer.

This repository contains the About Us page only. The Home page, Marketplace,
APIs, backend, analytics and deployment configuration of the main JazzHQ site
are not part of it. Header and footer links to `/for-vendors`, `/for-partners`,
`/privacy-policy` and `/terms-and-conditions` point at pages that live in the
main site.

## Run

```bash
npm ci
npm run dev
```

Open http://localhost:3000/about-us (`/` redirects there).

## Where things are

- `src/app/about-us/page.tsx` — the page
- `src/components/about/` — all About Us components and `about-us.css`
- `src/components/about/founder-book-scene.ts` — the Three.js book
- `src/data/about.ts` — copy, founders, investors, timeline, book content
- `public/assets/` — images used by the page
