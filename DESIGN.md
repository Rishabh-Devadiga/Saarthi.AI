# Design: Saarthi.AI

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.
Genre: atmospheric. Shape of the first page: sign-up anatomy (the conversion page laid out the way the product opens). Theme: Lumen. Locking this as the project's system.

## System
- Genre: atmospheric
- Shape of the first page: sign-up anatomy (`/` conversion page; `/onboarding` is the app screen of the same anatomy)
- Theme: Lumen (catalog; deal 1/3, seed `redesign-saarthi-onboarding-flow-69e5·7edd8ee7·2026-11-07·r0`)
- Axes: dark/roman-serif/warm · posture: restrained
- Signature: the five-answer path (goal, level, time, deadline, preferences), ruled in brass

## Tokens
`tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(12.5% 0.027 290);  --color-paper-2: oklch(16% 0.03 290);  --color-paper-3: oklch(20% 0.032 290);
  --color-ink: oklch(96% 0.01 300);  --color-ink-2: oklch(85% 0.017 298);  --color-muted: oklch(69% 0.026 295);  --color-rule: oklch(27% 0.034 290);  --color-rule-2: oklch(36% 0.04 292);
  --color-accent: oklch(80% 0.15 62);  --color-accent-2: oklch(72% 0.15 12);  --color-accent-ink: oklch(14% 0.028 290);  --color-focus: oklch(80% 0.15 62);
  --color-error: oklch(72% 0.15 27);  --color-success: oklch(76% 0.13 150);  --color-live: oklch(80% 0.13 155);
  --font-display: "Instrument Serif", ui-serif, Georgia, serif;  --font-body: "Geist", ui-sans-serif, system-ui, sans-serif;  --font-outlier: "Geist Mono", ui-monospace, monospace;
  --radius-card: 10px;  --radius-pill: 999px;  --rule-hair: 1px;  --shadow-card: 0 28px 64px -30px oklch(4% 0.02 290 / 0.8);
}
```
The spacing scale, the type scale, the easings and the durations are the scaffold's and live in `tokens.css`.

## Controls
- Primary: `--color-accent` fill, `--color-accent-ink` text · pill radius · 44 to 52px height
- Secondary: hairline `--color-rule-2` outline on paper · same pill radius and height
- Fields: `--color-paper` fill with a `--color-muted` hairline edge (3:1 against its fill); errors speak in `--color-error`
- The system is scoped to `.lumen` shells; pages outside keep the project's own legacy base

## Motion
- Character: still; the word-mark's one accented verb draws its underline once; the wizard step turns once (420ms); five-answer read-backs tick in place; under reduced motion everything ends at once.

## Exports
`tokens.css` in this project. Tailwind, DTCG or shadcn blocks are added here on request, per `export-formats.md`.
