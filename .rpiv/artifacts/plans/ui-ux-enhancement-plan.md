# UI/UX Enhancement Plan — Antler Coder

## Design Direction
- **Style**: Modern minimalist (Zed/Lapce-like) — clean, muted, workspace-focused
- **UX Priorities**: Layout/window management + Visual polish/micro-interactions
- **Performance**: Hard cap — bundle <500KB, 60fps, startup <2s

---

## Phase Summary

| # | Phase | Files | Risk | Effort | Impact |
|---|-------|-------|------|--------|--------|
| 0 | Baseline Performance Measurement | 0 | None | Low | Foundation |
| 1 | CSS Variable Migration → Tailwind Classes | 19 | Low | Med | High |
| 2 | Resizable Panels with Persistence | 5 | Med | Med-High | **Highest** |
| 3 | Micro-interactions & Entrance Animations | 12-14 | Low | Med | Med-High |
| 4 | Re-render Optimization (Zustand selectors) | 5-6 | Low-Med | Med | Medium |
| 5 | Color Palette & Typography Refinement | 3 | Low | Low-Med | Med-High |
| 6 | Polish Pass — Edge Cases, Aria, Empty States | 8-10 | Low | Med | Medium |

## Phase Details

### Phase 0: Baseline Performance
Measure bundle size, startup TTI, DOM node count, re-render counts, FPS during tab switching. Document in `.rpiv/artifacts/metrics/baseline.md`.

### Phase 1A: Fix CSS Variable Format (Foundation Phase)
**Critical prerequisite discovered during review.** `applyTheme()` sets CSS variables as hex strings (e.g. `--background: #0a0a0a`), but the Tailwind config maps them as `hsl(var(--background))` — `hsl(#0a0a0a)` is invalid CSS. This is why all 200+ components use inline `tokens.*` instead of Tailwind classes.

**Fix:** Add a hex-to-HSL converter in `applyTheme.ts`, so it stores HSL triplets (e.g. `0 0% 4%`) that Tailwind's `hsl(var(--...))` can consume. Token files (`neon-dark.ts`) keep hex values — conversion happens at the CSS variable injection layer.

### Phase 1B: Inline Style → Tailwind Class Migration (19-23 files, ~200 references)
Replace all inline `style={{ backgroundColor: tokens.*, color: tokens.*, borderColor: tokens.* }}` with Tailwind semantic classes like `bg-background`, `text-foreground`, `border-border`. This phase covers all components and is the foundation for all subsequent visual work.

**Note:** `borderColor`, `boxShadow`, `borderBottom`, `borderTop` references need case-by-case Tailwind equivalents or custom utilities. Some inline styles must remain for xterm.js theme objects and fully dynamic values.

### Phase 2: Resizable Panels
Replace hardcoded `w-56` (sidebar) and `h-48` (terminal) with draggable splitters. Create lightweight `usePanelSize` hook + `PanelSplitter` component. Persist sizes to localStorage. No libraries needed — pure React + mouse events.

### Phase 3: Micro-interactions
Use existing `animate-fade-in` and `animate-slide-up` keyframes (already in tailwind.config.js but unused) for modal/overlay entrances. Add loading skeletons, staggered search results, tree expand animations. CSS-only — no Framer Motion.

### Phase 4: Re-render Optimization
Fix Zustand object-destructured selectors that cause unnecessary re-renders. Apply `React.memo` to leaf components in lists (TreeRow, tab buttons). Memoize callbacks.

### Phase 5: Color Palette Refinement
Tone down neon colors to muted zinc/teal palette. Add Zinc Dark theme. Refine typography hierarchy (sans-serif UI labels, monospace code). Ensure WCAG AA contrast.

### Phase 6: Polish Pass
Add empty states, error states, ARIA roles/attributes, focus-visible indicators, auto-collapse for narrow windows, scrollbar refinement.

---

## Constraints
- **No animation libraries** — CSS + Tailwind only
- **No new heavyweight dependencies** — all additions are <100 lines of custom code
- **Each phase independently shippable** — can stop after any phase
- **Phase 1A must come first** (critical foundation), Phase 1B next, Phases 2-6 are orderable after
- **Performance verified after every phase** against Phase 0 baseline
