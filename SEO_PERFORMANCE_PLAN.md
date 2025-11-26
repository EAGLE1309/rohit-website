# SEO & Performance Plan for rohit.solithix.com

This document lists concrete improvements to make the site faster, more stable (Core Web Vitals), and better optimized for SEO.

Stack summary (from codebase):

- Next.js App Router (`src/app`)
- Custom `RootLayout` with multiple fonts, `ThemeProvider`, `Lenis` smooth scroll, `next-view-transitions`
- Dynamic content from Sanity (`urlFor`, `getProjects`, `getPhotography`, `getMusics`, etc.)
- Heavy interactive routes: `/work`, `/sounds`, `/photography/[photo]`
- Custom audio player + waveform on `/sounds`, custom parallax grid on `/work`

The tasks below are grouped by **priority**. Each item references the **files/routes** you need to touch.

---

## 1. High-priority SEO tasks (ranking & CTR)

### 1.1 Page-level metadata for all key routes

**Why:** Right now only `src/app/layout.tsx` defines site-wide `metadata`. For SEO, each important page should have its own title, description, and OG/Twitter image.

**Actions:**

- **Home (`/`)** – keep `Rohit Patnala` as brand default, but ensure a strong, keyword-rich home description.
  - File: `src/app/page.tsx`
  - Add a `metadata` export or `generateMetadata` with:
    - `title`: e.g. `"Rohit Patnala – Visual Artist, DJ & Creative Director"`
    - `description`: concise, keyword-focused summary of Rohit’s work.
- **Work (`/work`)**
  - File: `src/app/work/page.tsx`
  - Add `metadata` with title like `"Work – Projects & Collaborations | Rohit Patnala"` and a description referencing creative direction, photography, visual projects.
- **Sounds (`/sounds`)**
  - File: `src/app/sounds/page.tsx`
  - Add `metadata` with title like `"Sounds – Mixes & Audio Experiments | Rohit Patnala"` and description describing DJ sets / mixes.
- **About (`/about` / `about-new`)**
  - File: `src/app/about/page.tsx` (pick one URL and remove the other to avoid duplication/cannibalization).
  - Add `metadata` with title like `"About – Rohit Patnala"` and a bio-focused description.
- **Photography detail (`/photography/[photo]`)**
  - File: `src/app/photography/[photo]/page.tsx`
  - Use `generateMetadata({ params })` to set:
    - Per-photo `title` using `photo.name`
    - Per-photo `description` using `photo.description`
    - `openGraph.images` using `urlFor(photo.image).url()`

**Goal:** Every indexable route should have a unique, descriptive title/description and OG/Twitter image. This directly improves CTR and how Google understands the site.

---

### 1.2 Sitemap and robots.txt

**Why:** A clear sitemap and robots policy help search engines discover and prioritize important pages.

**Actions (App Router style):**

- Create `src/app/sitemap.ts`:
  - Return all canonical URLs: `/`, `/work`, `/sounds`, `/about`, `/photography`, `/photography/[photo]`, etc.
  - Use base URL from `process.env.NEXT_PUBLIC_SITE_URL` (e.g. `https://rohit.solithix.com`).
- Create `src/app/robots.ts`:
  - Allow crawling of the main content.
  - Point `sitemap` to `https://rohit.solithix.com/sitemap.xml`.

**Goal:** Ensure Google and other crawlers discover all work, sounds, and photography detail pages.

---

### 1.3 Structured data (JSON-LD)

**Why:** Rich snippets and better entity understanding for a personal brand (Person / CreativeWork / MusicRecording).

**Actions:**

- Add JSON-LD in `RootLayout` or a dedicated `head` for key routes:
  - `Person` schema for Rohit (name, url, sameAs [Instagram, Twitter, SoundCloud]).
  - `CreativeWork` / `VisualArtwork` for portfolio pieces (especially `/work` and `/photography/[photo]`).
  - `MusicRecording` or `MusicAlbum` for tracks on `/sounds` (optional but beneficial).
- Use `next/script` with `type="application/ld+json"` or the `metadata` `other` field.

**Goal:** Improve eligibility for knowledge panels, rich results, and better semantic understanding.

---

### 1.4 Avoid duplicate / thin pages

**Why:** `about` vs `about-new` can look like near-duplicate content which may dilute ranking.

**Actions:**

- Decide on **one canonical About URL** and layout:
  - Keep one of `src/app/about/page.tsx` or `src/app/about-new/page.tsx`.
  - Remove or 301-redirect the other (if you keep `/about-new`, set `/about` as a redirect or vice versa).

**Goal:** One strong, consolidated About page with all signals pointing to it.

---

### 1.5 Image alt text & semantics

**Why:** Better accessibility and SEO signals (Google uses alt text for image understanding).

**Actions by file:**

- `src/app/page.tsx` (home hero)
  - `HoverGif` currently uses `alt=""`. Change to something like `"Animated portrait of Rohit Patnala"`.
- `src/app/about/page.tsx` and/or `about-new/page.tsx`
  - All `<img>` tags should have descriptive alt text (who/what is in each photo).
- `src/app/photography/[photo]/component.tsx`
  - Main `<img>` for `photo.image` should have alt based on `photo.name` or a short description of the scene.
- `src/app/sounds/components/flyers.tsx` & `photographs.tsx`
  - Card `<img>` tags currently just display the flyer/photograph.
  - Use alt attributes like `"Flyer – {title}"` or `"Photograph – {title}"`.
- `src/components/layout/navbar.tsx`
  - Logo `<img>` alt could be `"Rohit Patnala logo"`.

**Goal:** No decorative-but-meaningful images with empty alt, and descriptive alt for portfolio work.

---

## 2. High-priority performance tasks (Core Web Vitals)

### 2.1 Use `next/image` consistently

You already use `next/image` in many places (e.g. work grid, sound main images), but several key images are still raw `<img>`.

**Targets:**

- `src/app/about/page.tsx` & `about-new/page.tsx`
- `src/app/photography/[photo]/component.tsx`
- `src/app/sounds/components/flyers.tsx` (card thumbnails)
- `src/app/sounds/components/photographs.tsx` (card thumbnails)
- `src/components/layout/navbar.tsx` (logo)

**Actions:**

- Replace `<img>` with Next’s `Image` for all **content images** (not just decorative backgrounds).
- Specify reasonable `width`/`height` or use `fill` with constrained containers.
- For carousels:
  - Use `sizes` prop to reflect layout (`(max-width: 768px) 50vw, 20vw` etc.).
  - For below-the-fold images, rely on built-in lazy loading instead of `priority`.

**Effect:**

- Smaller image payloads
- Better LCP and CLS (no layout shift when images load)

---

### 2.2 Reserve layout space for nav & hero

**Why:** The fixed navbar and tall hero sections can cause CLS if heights aren’t predictable.

**Actions:**

- `src/components/layout/navbar.tsx`
  - Ensure the height is stable via Tailwind classes and that pages using it add top padding/margin equal to nav height (you’re already using `mt-24`/`pt-28` in some layouts – keep this consistent).
- `src/app/page.tsx`
  - Verify that hero content does not jump as fonts load (next/font helps) and images have fixed dimensions.

**Effect:**

- Reduced cumulative layout shift (CLS), better UX on slow connections.

---

### 2.3 Static generation & caching for Sanity content

Pages like `/work`, `/sounds`, and `/photography/[photo]` are built from Sanity content.

**Actions:**

- For each route that uses Sanity data (`getProjects`, `getPhotography`, `getMusics`, etc.):
  - Add `export const revalidate = <seconds>` (e.g. 60 or 300) at the **route** level.
  - Make sure Sanity queries are cache-friendly (use `next` options or caching helpers if available).
- Example targets:
  - `src/app/work/page.tsx`
  - `src/app/sounds/page.tsx`
  - `src/app/photography/[photo]/page.tsx`

**Effect:**

- Static HTML for portfolio pages (better TTFB, LCP)
- Controlled revalidation when content updates

---

### 2.4 Audio player & waveform performance (`/sounds`)

`src/app/sounds/components/musics.tsx` is a very heavy client-side component:

- Web Audio API (AnalyserNode)
- Custom waveform drawing
- A lot of React state and effects

**Recommended optimizations:**

1. **Defer heavy JS until user intent**
   - Keep the track list visible in basic form, but initialize the full Web Audio + waveform **only after** the user presses Play on a track.
   - Move Web Audio wiring into a lazily loaded module (e.g. dynamic import or separate hook).
2. **Dynamic import of the music player**
   - In `src/app/sounds/component.tsx`, dynamically import the heavy `MusicsComponent` with `ssr: false` if it’s not critical for first paint.
3. **Limit `requestAnimationFrame` work**
   - Ensure the waveform render loop does minimal DOM work per frame and is properly cancelled on unmount.
4. **Network considerations**
   - The proxy route `src/app/api/proxy-audio/route.ts` currently uses `cache: "no-store"` and sets `Cache-Control: "no-store"`.
   - For static audio files from Sanity, consider a long-lived cache (`public, max-age=31536000, immutable`) if URLs are content-addressed; otherwise, keep `no-store`.

**Effect:**

- Less JS on initial load of `/sounds`
- Smoother playback and less CPU usage during long sessions

---

### 2.5 Parallax grid performance (`/work`)

`src/components/work/parallax.tsx` rewrites grid children into column containers and updates transforms on scroll.

**Actions:**

- Ensure it only runs on larger viewports where the effect adds value; fall back to a simpler grid on mobile.
- Guard against re-running the expensive DOM mutation logic on every re-render.
- Ensure scroll listener is removed correctly for both Lenis and window scroll.

**Effect:**

- Lower scroll jank and main-thread work on pages with many projects/photographs.

---

## 3. Medium-priority improvements

### 3.1 Reduce `use client` surface where possible

**Why:** Client components increase JS bundle size and hydration cost.

**Review candidates:**

- `src/components/layout/navbar.tsx` – must remain client because of state and `useTheme` but consider extracting purely presentational parts into server components.
- `src/app/work/component.tsx` – interactive tabs + motion animations require client; just ensure no unnecessary client logic lives here.
- `src/app/photography/[photo]/component.tsx` – currently `"use client"` but mostly static content; if you remove client-only APIs, you might be able to make this a **server component**.

**Actions:**

- Audit each `"use client"` file to see if it truly needs hooks or browser APIs.
- Where possible:
  - Move pure layout/typography into server components.
  - Wrap only interactive parts as small client components.

**Effect:**

- Smaller JS payloads
- Faster hydration, better INP/TTI

---

### 3.2 Fonts & loading

`src/app/layout.tsx` uses multiple fonts (`DM_Mono`, `Inter`, `Geist`, local Neue Montreal) via `next/font`. That’s good for optimization, but too many font families can still hurt FCP.

**Actions:**

- Confirm which fonts you actually need across the site.
- If some are only used in a specific section, consider loading them only there or dropping them.
- Keep `display: "swap"` (already set for Neue Montreal) and avoid blocking the render for non-critical fonts.

---

### 3.3 Security headers and CSP in `next.config.ts`

You already set strong security headers (HSTS, X-Content-Type-Options, CSP). However, CSP currently has:

```text
script-src 'self' 'unsafe-inline' 'unsafe-eval'
```

**Actions:**

- Aim to remove `'unsafe-eval'` and then `'unsafe-inline'` if possible.
- If you rely on inline scripts, migrate them to proper modules and use nonces/hashes instead.

**Effect:**

- Better security posture and potentially fewer issues with future browser changes.

---

### 3.4 Home hero & GIF optimization

`src/components/hover-gif.tsx` overlays a GIF on hover.

**Actions:**

- Ensure the static PNG (`/home.png`) is optimized (compressed, correct dimensions).
- Keep GIF size small or consider modern formats like MP4/WEBM for the animation if you need higher visual fidelity.
- Consider not marking the hero GIF as `priority` if LCP is driven by text instead of the image.

---

## 4. Low-priority / future enhancements

### 4.1 Content strategy for SEO

Beyond technical work, rankings will depend on content depth and topical authority.

**Ideas:**

- Add a `/journal` or `/writing` section with essays on visual art, DJing, creative direction.
- Case-study style pages under `/work` that go deeper on key projects (process, tools, outcomes).

### 4.2 Analytics & A/B testing

**Actions:**

- Add privacy-friendly analytics (Vercel Analytics, Plausible, or GA4) to measure:
  - CTR from search to `/`, `/work`, `/sounds`, `/about`.
  - Engagement and scroll depth on portfolio pages.
- Test different hero copy and meta descriptions for CTR improvements.

---

## 5. Quick checklist

Use this as a working list while you implement changes:

- [ ] Add route-level `metadata` / `generateMetadata` for: `/`, `/work`, `/sounds`, `/about`, `/photography/[photo]`.
- [ ] Implement `sitemap.ts` and `robots.ts` with `NEXT_PUBLIC_SITE_URL`.
- [ ] Add Person + CreativeWork JSON-LD for Rohit and key projects.
- [ ] Decide canonical About page; remove/redirect the duplicate.
- [ ] Convert remaining `<img>` tags (nav logo, about images, photography detail, flyers/photographs cards) to `next/image` where appropriate.
- [ ] Review and improve alt text for all portfolio/media images.
- [ ] Set `revalidate` on Sanity-driven routes for static generation.
- [ ] Optimize `/sounds` audio player: lazy init Web Audio, dynamic import heavy parts.
- [ ] Review parallax grid performance and consider disabling on mobile.
- [ ] Audit `"use client"` components; move purely visual sections to server components.
- [ ] Tighten CSP by gradually removing `'unsafe-eval'` and `'unsafe-inline'`.
- [ ] Revisit fonts and remove unused families/weights.

Once these are done, rerun Lighthouse (mobile + desktop) focusing on:

- Performance (LCP, CLS, INP)
- SEO (titles, descriptions, crawlability)
- Best Practices & Accessibility
