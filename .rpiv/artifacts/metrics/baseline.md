# Baseline Performance Metrics

> Measured: 2026-05-22
> Branch: main (73ee21f)
> Build: `pnpm build` (production)

---

## Bundle Size

| Asset | Raw | Gzipped |
|-------|-----|---------|
| `dist/` (total) | 1.4 MB | — |
| JS total (9 chunks) | 1,309,554 bytes | — |
| `main-qLLexKqV.js` | 505.76 kB | 159.57 kB |
| `globals-DQS8vzfu.js` | 451.87 kB | 124.61 kB |
| `index-CkuZGj4m.js` | 99.67 kB | 38.28 kB |
| `index-BKzJb73I.js` | 87.03 kB | 34.53 kB |
| `index-BUAg8cYE.js` | 70.83 kB | 25.86 kB |
| `index-ptlw-eex.js` | 45.16 kB | 19.18 kB |
| `index-BwmAzaW3.js` | 26.49 kB | 8.79 kB |
| `settings-DG8fd5E4.js` | 13.98 kB | 3.32 kB |
| `index-DyNI2-E2.js` | 8.32 kB | 3.59 kB |
| `globals-Dy7HUlUQ.css` | 18.54 kB | 5.33 kB |

**Main concern:** `main.js` (505 kB) exceeds the 500 kB hard cap already. This is the CodeMirror + xterm.js + all React bundle. Needs code-splitting or dynamic imports.

---

## Component & Style Metrics

| Metric | Value |
|--------|-------|
| React components (exported) | 15 |
| `useTheme` import usage | 32 instances across 15 files |
| `tokens.*` references (total) | 260 |
| Inline `style={{ tokens.* }}` refs | 117 |
| Non-style `tokens.*` refs (xterm theme, conditionals) | ~143 |
| Files with inline token styles | 15 |

### Files needing Phase 1B migration (15 files):
1. `src/app/App.tsx`
2. `src/app/WindowChrome.tsx`
3. `src/modules/agent-shell/components/AgentPopup.tsx`
4. `src/modules/agent-shell/components/AgentPicker.tsx`
5. `src/modules/agent-shell/components/AgentTabBar.tsx`
6. `src/modules/search/SearchPanel.tsx`
7. `src/modules/workspace/components/WorkspacePicker.tsx`
8. `src/modules/onboarding/OnboardingWizard.tsx`
9. `src/settings/SettingsApp.tsx`
10. `src/settings/sections/GeneralSection.tsx`
11. `src/settings/sections/ModelsSection.tsx`
12. `src/settings/sections/AgentsSection.tsx`
13. `src/settings/sections/ShortcutsSection.tsx`
14. `src/settings/sections/ThemesSection.tsx`
15. `src/settings/sections/AboutSection.tsx`

### Files with non-migratable tokens (xterm theme object only):
- `src/modules/agent-shell/components/AgentTerminal.tsx` — xterm.js theme uses hex values, exempt

---

## Zustand Selector Performance

| Pattern | Count |
|---------|-------|
| Fine-grained selectors | 3 (EditorPane only) |
| Object-destructured (re-render risk) | 9 |
| Inline arrow functions in render (re-render risk) | 26 |

---

## CSS Variable Format

`applyTheme.ts` stores hex strings (e.g. `--background: #0a0a0a`)
`tailwind.config.js` maps as `hsl(var(--background))`
**Result:** `hsl(#0a0a0a)` is invalid CSS. Tailwind theme classes (`bg-background`, etc.) do NOT render. All 260 `tokens.*` references are necessary workarounds.

---

## Animation Infrastructure

| Animation | Defined in tailwind.config.js | Used in src/ |
|-----------|------------------------------|--------------|
| `animate-fade-in` | ✅ 0.15s ease-out | ❌ 0 uses |
| `animate-slide-up` | ✅ 0.2s ease-out | ❌ 0 uses |
| `animate-pulse` | ✅ Tailwind built-in | ✅ 1 use (OnboardingWizard) |
| `accordion-down/up` | ✅ Radix accordion | ❌ 0 uses |

---

## Targets

| Metric | Current | Target (Hard Cap) |
|--------|---------|-------------------|
| Main JS bundle | 505 kB | <500 kB |
| All JS total | 1,280 kB | <1,000 kB |
| Inline token styles | 117 | 0 |
| Object-destructured selectors | 9 | 0 |
| Unused animation keyframes | 4 | 0 (all used) |
