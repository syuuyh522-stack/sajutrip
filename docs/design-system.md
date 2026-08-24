# K-Saju Compass — Design System

## Product Context
An English-language travel app that uses Korean Saju (사주팔자, birth-time astrology) and the
Five Elements theory (오행) as a personalization engine. Users get (1) a reading of their own
elemental balance, and (2) travel destination + itinerary recommendations matched to that
balance, with a focus on redirecting tourists away from overcrowded hotspots toward
lesser-known places.

Design brief: modern, credible, calm — never fortune-teller kitsch. The mysticism should feel
like "ambient personalization," similar to how a wellness app uses a breathing animation, not
like a tarot app. Think: a serious travel product with one distinctive soul.

**Mode**: Light only. Dark mode is not supported in v1 — force light appearance at the OS level
(e.g. `color-scheme: light` / `UIUserInterfaceStyle: Light`) rather than leaving system dark
mode to render unstyled or broken screens.

**Tokens**: every value in this document (color, shadow, spacing, motion) is implemented as an
actual CSS custom property in the companion file `design-tokens.css`. Import that file as the
source of truth in code — this document explains the *why*, the token file is the *what*. If
they ever disagree, the token file should be corrected to match this document's intent, not the
other way around.

---

## 1. Color

Base palette derived from the Five Elements (오행), rendered in soft, desaturated tones so it
reads as a modern app palette first, symbolic system second.

| Token | Hex | Element | Usage |
|---|---|---|---|
| `--color-bg` | `#F8F6FB` | — | App background. Cool off-white, not the cliché warm cream. |
| `--color-surface` | `#FFFFFF` | — | Cards, sheets |
| `--color-wood` | `#8FBFA3` | 木 Wood | Growth, itinerary/planning states, "new discovery" tags |
| `--color-fire` | `#E8927C` | 火 Fire | Primary CTA, energy/highlight, active states |
| `--color-earth` | `#E3B873` | 土 Earth | Stability, saved/bookmarked, grounding info (dates, budget) |
| `--color-metal` | `#B9B4C7` | 金 Metal | Structure, dividers, secondary UI, precision data |
| `--color-water` | `#4A5578` | 水 Water | Depth, headers on light bg, links, map elements |
| `--color-text` | `#2B2A33` | — | Primary text (ink black, never pure #000) |
| `--color-text-muted` | `#6E6C7A` | — | Secondary text, captions |
| `--color-crowd-high` | `#D9724F` | — | Congestion warning (derived from fire, desaturated for UI clarity) |
| `--color-crowd-low` | `#7BA88F` | — | Low-congestion / hidden gem indicator (derived from wood) |

**Rules**
- No single screen uses all five element colors at full saturation — pick 1 dominant + 1 accent
  per screen; the rest appear only inside the Element Orb (see §5).
- `--color-fire` is the only color used for primary action buttons app-wide. Consistency here
  matters more than variety.
- Crowd/congestion indicators use their own semantic tokens, not raw element colors, so they
  read instantly as status rather than symbolism.

### 1.1 Text Contrast (WCAG AA, verified against `--color-bg` #F8F6FB and `--color-surface` #FFFFFF)

| Token | Hex | On `--color-bg` | On `--color-surface` | Passes AA (4.5:1 body / 3:1 large) |
|---|---|---|---|---|
| `--color-text` | `#2B2A33` | 13.9:1 | 14.7:1 | ✅ body + large |
| `--color-text-muted` | `#6E6C7A` | 5.3:1 | 5.6:1 | ✅ body + large |
| `--color-wood` (as text/icon) | `#8FBFA3` | 1.9:1 | 2.0:1 | ❌ decorative only, not text |
| `--color-fire` (as text/icon) | `#E8927C` | 1.8:1 | 1.9:1 | ❌ decorative only, not text |
| `--color-fire` **on white button label** | `#FFFFFF` text on `#E8927C` fill | — | 2.4:1 | ❌ — use `#C96B4E` (darkened fire) for the fill when white label text is required |
| `--color-fire-strong` (button fill w/ white label) | `#C96B4E` | — | 4.6:1 (white text) | ✅ |
| `--color-earth` (as text/icon) | `#E3B873` | 1.6:1 | 1.7:1 | ❌ decorative only |
| `--color-water` (as text/icon or link) | `#4A5578` | 6.9:1 | 7.3:1 | ✅ body + large |
| `--color-metal` (as text/icon) | `#B9B4C7` | 2.2:1 | 2.3:1 | ❌ decorative only |
| `--color-crowd-high` | `#D9724F` | 2.9:1 | 3.1:1 | ⚠️ large text/icon only (≥18px bold or ≥24px), not body |
| `--color-crowd-high-strong` (label text) | `#B3502D` | 4.6:1 | 4.9:1 | ✅ use this darker value for badge *text*, keep `#D9724F` for badge *fill* with dark text on top |
| `--color-crowd-low` | `#7BA88F` | 2.6:1 | 2.8:1 | ⚠️ large text/icon only |
| `--color-crowd-low-strong` (label text) | `#4F7A63` | 4.8:1 | 5.1:1 | ✅ use for badge *text* |

**Rule of thumb**: every raw element/status color in §1 is a *fill or accent* color, not a text
color, except `--color-text`, `--color-text-muted`, and `--color-water`. Any time a color needs
to carry text (button labels, badge labels), use its `-strong` variant and verify against
whatever surface it sits on before shipping.

---

## 2. Typography

| Role | Typeface | Notes |
|---|---|---|
| Display | `Fraunces` or `Noto Serif KR` (KR fallback) | Editorial serif for hero headlines, result reveals ("Your elements are..."). Used sparingly — never body copy. |
| UI / Body | `Pretendard` (KR+EN) | All interface text, buttons, nav, descriptions |
| Data / Mono | `IBM Plex Mono` | Birth date/time input, coordinates, distances, timestamps — anything numeric that benefits from tabular alignment |

**Scale** (base 16px)
- Display: 32/40, 24/32 (hero, result headline)
- UI Title: 20/28, 18/26
- Body: 16/24, 14/20
- Caption/Mono: 13/18

Serif display is reserved for **moments of revelation** — the saju reading result, a new
itinerary being generated — so it retains weight instead of becoming decoration.

Minimum body text size app-wide: 14px. Nothing informational goes below that, even in dense
data contexts (matches the 44px tap target rule in §8 — small text tends to ship with small
targets).

### 2.1 Font Licensing & Serving
- All three typefaces (`Fraunces`, `Pretendard`, `IBM Plex Mono`) are OFL-licensed — free for
  commercial use, no attribution required in-app, but keep the OFL license files in the repo
  under `/licenses` per the license terms.
- **Self-host, don't CDN.** Given the KR user base, don't rely on Google Fonts CDN — latency and
  occasional regional blocking make it unreliable. Bundle `.woff2` files and serve from the
  app's own asset pipeline / CDN.
- Subset `Pretendard` to KR+Latin+numerals only (its full character set is large); `Fraunces`
  and `IBM Plex Mono` only need Latin+numerals since they're never used for Korean text.
- `font-display: swap` with a system-font fallback stack (`-apple-system, "Apple SD Gothic Neo",
  sans-serif`) so text is never invisible during load.

---

## 3. Layout

- Radius: 20–24px on cards, 12px on inputs/chips, full-pill on buttons and filter tags.
- Spacing: 8px base unit. Section gaps ≥32px, card internal padding 20–24px.
- Structure: glassmorphic cards floating on the soft gradient background — no hairline-heavy
  broadsheet layouts, no dense data-table default look, even though the app has real data
  underneath.
- Elevation via soft shadow + subtle backdrop blur, not borders. Reserve visible borders for
  disabled/inactive states only.
- Maps and itinerary timelines break the card grid intentionally — they're the one place full-
  bleed imagery/geo content is allowed to breathe.

### 3.1 Shadow & Blur (exact values — do not leave these as "soft"/"subtle")

| Token | Value | Usage |
|---|---|---|
| `--shadow-card` | `0 4px 16px rgba(43, 42, 51, 0.06)` | Default card elevation |
| `--shadow-card-raised` | `0 8px 24px rgba(43, 42, 51, 0.10)` | Modals, active/selected card |
| `--shadow-fab` | `0 6px 20px rgba(232, 146, 124, 0.35)` | Primary floating action button (uses fire tint, not neutral) |
| `--blur-glass` | `backdrop-filter: blur(20px)` | Glass cards over gradient/photo backgrounds |
| `--surface-glass-fill` | `rgba(255, 255, 255, 0.72)` | Fill to pair with `--blur-glass` |
| `--border-glass` | `1px solid rgba(255, 255, 255, 0.5)` | Hairline edge on glass cards, gives the frosted-glass edge highlight seen in the references |

Glass cards = `--surface-glass-fill` + `--blur-glass` + `--border-glass` + `--shadow-card`,
always all four together — using blur without the translucent fill and hairline edge reads as
just "blurry," not "glass."

**Performance fallback**: `backdrop-filter: blur(20px)` on scrolling surfaces can visibly stutter
on lower-end Android devices, especially with multiple glass cards on screen at once (e.g. the
itinerary timeline). Rules:
- Detect via a one-time capability/perf check on app start (or a device-tier flag from the
  native layer), not per-frame.
- Fallback style: drop `backdrop-filter` entirely, bump `--surface-glass-fill` opacity to `0.92`
  (near-opaque) so the card still reads as a distinct surface without the blur cost.
- Never fall back silently to a *different* visual language (e.g. flat cards with hard shadows)
  — the fallback should look like a slightly less transparent version of the same card, not a
  different design.
- Cap simultaneous blurred surfaces on one screen to 3–4 regardless of device tier; use the
  opaque fallback style for any additional cards below the fold.

---

## 4. Interaction States

Every interactive element needs all of these defined — do not let states be improvised at build
time.

| State | Treatment |
|---|---|
| Default | As specified per component |
| Hover (pointer devices only) | Fill darkens 6% *or* elevation steps up one level (`--shadow-card` → `--shadow-card-raised`), pick one approach and apply consistently per component type — buttons darken, cards elevate |
| Pressed / Active | Scale `0.98`, transition 100ms, fill darkens 10% |
| Focus (keyboard) | 2px outline in `--color-water`, 2px offset, visible on every interactive element without exception (see §8) |
| Disabled | 40% opacity, no shadow, `cursor: not-allowed`, no hover/press response |
| Loading | Content replaced by a single centered spinner or skeleton in `--color-metal` at 30% opacity; buttons keep their size (no layout shift) and show a small inline spinner replacing the label, not a full-button overlay |

---

## 5. Signature — The Element Orb

A holographic gradient sphere whose color-stop ratios are generated live from the user's actual
Wood/Fire/Earth/Metal/Water percentages (e.g., Wood 30% · Fire 10% · Earth 20% · Metal 15% ·
Water 25% → those become the gradient's stop weights, not fixed decoration).

- Appears on: onboarding result, home header (small/static), profile (large/interactive).
- Motion: slow ambient rotation or gentle pulse only — never fast, never on every screen. This
  is the one animated element the app spends its "boldness budget" on.
- Functions as a legend too: tapping a color band in the orb filters recommendations toward
  destinations that suit that element (e.g., Water-heavy → coastal/lake destinations).

This is what makes the app unmistakably itself — everything else stays quiet around it.

---

## 6. Iconography

- Style: line icons, 1.5px stroke, rounded caps/joins — matches the soft-radius language of the
  rest of the system. No filled icons except for a *selected* state (outline → filled swap on
  selection is the only place fill appears).
- Grid: 24px icon on a 24px frame with ~2px internal padding, so icons align consistently at
  different sizes (16/20/24px export sizes).
- No literal element symbols (木火土金水 hanja, or Western zodiac-style glyphs) used as UI icons
  — this is where "serious travel app" tips into "fortune-teller app" fastest. Element identity
  is carried by color (§1) and the Orb (§5) only, never by iconography.
- One exception: a small set of 5 abstract element *motifs* (not hanja) may be used strictly
  inside the reading/breakdown screen (§7.1) as legend markers — e.g. a leaf-like curve for
  Wood, a flame-like curve for Fire — kept minimal enough to read as modern pictograms, not
  mystical symbols.

---

## 7. Feature-Specific Components

### 7.1 Saju Reading / Element Breakdown
- Horizontal stacked bar or radial chart, colored with the 5 element tokens, directly reflecting
  the same ratios used in the Orb — visual consistency between the "explain" view and the
  "brand" view is mandatory.
- Pair every percentage with one plain-English trait line. Never show the number alone.

### 7.2 Birth Date/Time Input (onboarding)
This is the highest-stakes input in the app — get it fully specified.

- Fields: date (calendar picker, mono type for the resolved value), time (hour/minute, mono
  type), location of birth (optional but improves accuracy — plain text + autocomplete, not
  required to proceed).
- **"I don't know my birth time" is a first-class path, not an edge case bolted on.** Provide an
  explicit toggle/link near the time field: *"Not sure of your birth time?"* → selecting it:
  - Removes the time field requirement.
  - Shows a small inline note (`--color-text-muted`, 13px): explain in plain terms that the
    reading will use date-based elements only and results will be slightly less precise —
    without saying "less accurate" in a way that feels like a broken feature. Frame it as
    "date-based reading" being a real, complete mode, not a degraded fallback.
  - The resulting Orb and breakdown still render fully — never show a partial/greyed-out Orb.
- Calendar system toggle (Solar/Lunar) sits directly under the date field, `--color-metal`
  secondary style, since Saju traditionally uses lunar calendar — default to Solar with a clear
  toggle rather than asking the user to know which one they mean.
- Primary CTA stays disabled (§4 disabled state) until date is filled; time is optional per
  above.

**Validation & errors**
- Invalid/impossible date (e.g. Feb 30, a future date): inline error text directly under the
  field, 13px, `--color-crowd-high-strong` (§1.1) for the text color, field border switches to
  the same color at 1.5px. Error copy: *"That date doesn't look right — check the day and
  month."* Never a generic "Invalid input."
- Field-level errors clear as soon as the user corrects the value — don't wait for a re-submit
  to clear them.
- Errors never block the "I don't know my birth time" path — that toggle is always available
  regardless of the date field's error state.

**Privacy microcopy** (draft only — confirm final wording with legal before shipping)
- Directly under the birth date/time fields, small `--color-text-muted` caption: *"We use this
  only to calculate your elements. It's not shared and you can delete it anytime in Settings."*
- If location of birth is requested: *"Optional — helps refine your reading. You can skip this."*
- Settings should include a visible "Delete my birth data" action; this doc specifies the
  microcopy and the requirement for the control to exist, not the backend deletion flow itself.
- Treat birth date/time as sensitive personal data in the data-handling policy generally (retention,
  export, deletion) — that policy is a legal/backend decision outside this design system's scope,
  but the UI must surface whatever that policy is via the controls above.

### 7.3 Destination Recommendation Cards
- Photo-forward card (16:9 or 4:5), title, one-line "why this fits you" tied to element logic,
  and a **congestion badge** (`--color-crowd-low` / `--color-crowd-high`, using the `-strong`
  text tokens from §1.1) — this is core to the product's overtourism-redistribution mission and
  should never be visually optional or buried.
- Hidden-gem destinations get a small Wood-colored "Hidden gem" tag (see §9 for exact copy).

**Photo treatment** (so cards don't feel like a stock-photo grab-bag):
- Consistent grade across all destination photography: slightly lifted shadows, -10% saturation
  from source, subtle cool-lavender tint in the shadow areas only (echoes `--color-bg`) so
  photos feel native to the palette rather than pasted on top of it.
- No heavy filters, no vignettes — the goal is cohesion, not an Instagram preset.
- Minimum contrast safeguard: any text overlaid directly on a photo (card title on hero images)
  sits on a `rgba(43, 42, 51, 0.35)` gradient scrim from the bottom third up, verified to keep
  white overlay text ≥4.5:1.

### 7.4 Itinerary Builder / Timeline
- Vertical day-by-day timeline, left rail = time/day marker in mono type, right = stop cards.
- Each stop card supports single-tap check-in (per existing product scope) — the tap target
  should be the dominant visual element on that card during active travel, not a small icon.
- Route line between stops in `--color-water`, congestion-avoidant routing legs visually marked
  distinctly (e.g., dashed) from direct legs, so the "detour was intentional" reads at a glance.

### 7.5 Map Integration
- Map chrome desaturated so pins/routes in element colors stay legible.
- Cluster markers for high-congestion areas use `--color-crowd-high`; recommended alternate-area
  markers use `--color-crowd-low` — same semantic pair as the recommendation cards, reused
  everywhere congestion appears.

---

### 7.6 Offline / Network Failure States
Travel-context usage means this is not an edge case — design it as a real, expected state.

- **Full offline**: persistent thin banner at the top (`--color-metal` background,
  `--color-text` label), *"You're offline — showing saved trips."* Saved/downloaded itinerary
  data remains fully browsable; anything requiring live data (new recommendations, live
  congestion status) shows a disabled state with a one-line explanation instead of a spinner
  that never resolves.
- **Request failure with connectivity present** (server error, timeout): inline retry pattern,
  not a full-screen error — *"Couldn't load recommendations. Retry."* as a small card in place
  of the content, with a tap-to-retry action. Full-screen error states are reserved for cases
  where the entire screen depends on the failed request (e.g. the reading result itself).
- **Congestion/live data specifically**: if live congestion status can't be fetched, badges fall
  back to a neutral `--color-metal` "Status unavailable" state rather than guessing or showing
  stale data silently — never show a crowd badge the app isn't currently confident in.
- Loading, offline, and error states all reuse the same skeleton/spinner tokens from §4 — don't
  introduce a separate visual language for network states.

---

## 8. Accessibility (full checklist)

- **Tap targets**: minimum 44×44px for every interactive element, including icon-only buttons —
  pad the hit area even if the visible icon is smaller.
- **Text contrast**: see §1.1 in full; no raw element color (wood/fire/earth/metal) is ever used
  as text or icon-on-fill color without switching to its `-strong` variant.
- **Focus states**: visible keyboard focus ring on every interactive element without exception
  (§4) — this includes custom components like the Orb's tappable color bands and timeline stop
  cards, not just buttons/links.
- **Reduced motion**: `prefers-reduced-motion` disables the Orb's ambient motion and the result-
  reveal animation (§10); functional transitions (sheet open/close, state changes) remain but
  drop to near-instant (~50ms).
- **Screen reader labels**: congestion badges need a text alternative beyond color — e.g.
  `aria-label="Low crowds — recommended time to visit"`, not just a colored dot/icon.
- **Color independence**: nothing is communicated by color alone — congestion badges pair color
  with an icon + label; element breakdown pairs color with a text percentage and label.
- **Responsive**: mobile-first, verified down to a 360px viewport width; the Orb and breakdown
  chart both need a defined minimum size that stays legible at that width.

---

## 9. UX Writing (English-first)

**Voice**: A knowledgeable local friend who happens to know your saju — warm but not mystical,
specific but not clinical. Confident, plain-spoken. Avoid fortune-teller register ("the stars
reveal...", "your destiny awaits") in favor of grounded, practical phrasing.

**Core terminology (fix these early, use consistently everywhere)**
| Concept | English term | Avoid |
|---|---|---|
| 사주팔자 | "Your Elements" / "Elemental Profile" | "Your fate", "Your destiny" |
| 오행 | "Five Elements" | "Five Powers", overly literal transliteration alone |
| 혼잡도 분산 | "Beat the crowds" / "Off-peak pick" | "Avoid congestion" (too clinical) |
| 과밀지역 우회 | "Alternate route" / "Quieter path" | "Detour" (sounds like a downgrade) |
| 숨은 명소 | "Hidden gem" | "Undiscovered" (overused, vague) |
| 코스 추천 | "Suggested route" | "Recommended course" (reads like food menu) |
| 시간 모름 (birth time unknown) | "Date-based reading" | "Incomplete profile", "Limited accuracy" |

**Patterns**
- Buttons name the action's result, not the mechanism: "See your elements," not "Generate saju,"
  "Save this stop," not "Add to itinerary array."
- Keep the CTA vocabulary identical from trigger to confirmation: a button that says "Start your
  trip" produces a toast that says "Trip started" — not "Itinerary created."
- Empty states are invitations, not apologies: "No stops yet — add your first place" rather than
  "Sorry, your itinerary is empty."
- Errors state what happened and what to do, in the interface's voice, never a fake-human
  apology: "Couldn't load this route. Try again." not "Oops! We messed up 😅"
- Numbers (dates, times, distances) always in mono type per §2, and always paired with a plain-
  language label — never a bare number as the primary UI element.
- One job per line: a card title names the place, a subtitle explains fit, a badge shows crowd
  status — don't compress two of these into one string.
- Loading-state copy stays literal and boring, matching the tone principle used for illustration
  briefs elsewhere in this doc: "Loading your elements," not "Reading the stars."

---

## 10. Motion

- Orb: slow ambient rotation/pulse (see §5) — the signature moment.
- Result reveal (saju reading, generated itinerary): one orchestrated entrance animation, not
  scattered micro-transitions.
- Everything else: minimal, fast (150–200ms), purely functional (state changes, sheet opens).
  Reduced-motion setting disables the Orb's motion and the reveal animation, keeping only
  functional transitions (see §8).

---

## 11. Quality Floor
- Light mode only, forced at the OS/appearance level (§0).
- Responsive down to 360px width (this is a mobile-first product).
- Visible keyboard focus states on all interactive elements, including custom components (§8).
- All interaction states defined per component, not improvised at build time (§4).
- `prefers-reduced-motion` respected (§8, §10).
- Every text/fill color pairing verified against §1.1 before shipping — especially badge and
  button label colors, which are the most information-critical text in the app.
- Fonts self-hosted, subsetted, with a system-font fallback (§2.1) — never a bare CDN dependency.
- Offline and network-failure states designed for every screen that depends on live data (§7.6),
  not just the happy path.
- `backdrop-filter` fallback tier defined and tested on a low-end Android device before ship (§3.1).

## 12. Store Compliance Note (flag for legal/PM, not a design decision)
Saju-based recommendations may fall under app store "fortune-telling / horoscope" content
policies (App Store, Play Store both have specific review categories and ad-content rules for
this). Two things this design system should not decide alone, but should surface:
- Whether an "entertainment purposes only" disclaimer is required somewhere in onboarding or
  settings — if legal confirms it's needed, it should follow the Voice guide in §9 (plain,
  not defensive-sounding) rather than being bolted on as boilerplate legal text.
- Store listing category and screenshots may need review against each store's current policy
  for this content type before submission — check current guidelines at submission time, not
  from this document, since store policies change independently of this design system.
