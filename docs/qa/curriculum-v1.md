# Program detail carousel — 2026-10-18

## Design and scope

The approved desktop/mobile curriculum mockups govern this targeted section update; no new direction was drawn. The three existing program introductions remain in order, above a shared ivory detail panel. Each exercise photograph explains a real named part of the program. 17 previously generated concept images are optimized as WebP (2.6 MB total), with a visible AI disclosure. No new generated images, pricing, outcomes or facility claims were added.

The panel provides verified class times, manual scroll-snap navigation, exercise selectors, a real slide counter and the existing Kakao booking link. It closes with its button or Escape and returns focus to the originating introduction. All detail images are absent until the panel opens. Reduced-motion preferences suppress the staggered entrance and smooth scrolling. No autoplay.

## Verification

- `npm test`: 18 passing (including asset validity/size and timetable consistency).
- `npm run build` and `npm run test:build`: successful, 5 built-site checks passing.
- Real browser inspected at 1920, 1440, 768 and 390 px: no document horizontal overflow; desktop side-by-side panel becomes a stacked tablet/phone composition; visible controls at least 44 px tall.
- All 17 exercise selections tested in-browser. Captions/counts changed correctly; all images loaded; last-slide next control disabled. Home, ArrowRight, Enter and Escape tested; close restores focus. No console errors.
- Initial page contains zero curriculum images. Program introductions remain mounted when selecting and closing details.
- Existing club, Firebase/auth scripts, booking and install assets verified byte-for-byte by existing regression/build tests. Domain, DNS and deployment configuration unchanged.

## Look-and-fix

First browser pass exposed an observer interrupting multi-slide smooth scroll. Observer now only reacts to actual viewport width changes. Second pass confirms direct selection of the last exercise and keyboard navigation. Desktop title/menu spacing tightened to match the approved mockup. Subject photos preserve their full composition instead of cropping bodies.

Design-taste source lint was run. Its whole-project warnings include pre-existing eyebrows, dividers, scrims, icons and club UI styles; those are outside this approved section change and intentionally preserved. New exercise selectors are real interface controls. Real-browser visual/overflow/focus checks used the available CUA browser rather than launching a separate inspector browser. Self-review: composition 8/10, typography 8/10, responsive usability 9/10. AI scenes remain illustrative; they are not evidence of actual facilities or members. Touch-device hardware testing is not claimed.
