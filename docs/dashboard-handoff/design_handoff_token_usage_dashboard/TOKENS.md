# OPUS-X Tokens used by Token Usage Dashboard

Two layers:

1. **Seed palette** — the raw color values. Same in both themes.
2. **Context tokens** — semantic aliases. **These are what every rule should reference.** They flip on `data-theme="dark"`.

Full source: [`design_reference/tokens.css`](./design_reference/tokens.css).

---

## Seed palette (unchanged between themes)

### Purple (primary brand)
| Token | Hex |
|---|---|
| `--purple-25` | `#FAFAFF` |
| `--purple-50` | `#F4F3FF` |
| `--purple-100` | `#EBE9FE` |
| `--purple-200` | `#D9D6FE` |
| `--purple-300` | `#BDB4FE` |
| `--purple-400` | `#9B8AFB` |
| `--purple-500` | `#7F56D9` *(accent — sparklines, chart lines)* |
| `--purple-600` | `#6941C6` *(primary base — buttons, links)* |
| `--purple-700` | `#53389E` *(primary hover)* |
| `--purple-800` | `#42307D` |
| `--purple-900` | `#2F1C6A` |

### Gray Modern (neutral)
| Token | Hex |
|---|---|
| `--gray-25` | `#FCFCFD` |
| `--gray-50` | `#F9FAFB` |
| `--gray-100` | `#F2F4F7` |
| `--gray-200` | `#EAECF0` *(divider)* |
| `--gray-300` | `#D0D5DD` |
| `--gray-400` | `#98A2B3` |
| `--gray-500` | `#667085` |
| `--gray-600` | `#475467` *(body text)* |
| `--gray-700` | `#344054` |
| `--gray-800` | `#1D2939` |
| `--gray-900` | `#101828` *(densest ink)* |

### Status palette
| Family | 500 | 600 | 700 | Tint (50) |
|---|---|---|---|---|
| Green (success) | `#12B76A` | `#039855` | `#027A48` | `#ECFDF3` |
| Red (error) | `#F04438` | `#D92D20` | `#B42318` | `#FEF3F2` |
| Yellow (warning) | `#EAAA08` | `#A15C07` | `#854A0E` | `#FEFBE8` |
| Blue (info) | `#2E90FA` | `#1570EF` | `#175CD3` | `#EFF8FF` |
| Teal (chart accent) | `#15B79E` | `#0E9384` | — | — |

---

## Context tokens — light theme (default)

### Foreground
| Token | Resolves to |
|---|---|
| `--fg-primary` | `--purple-600` `#6941C6` |
| `--fg-primary-hover` | `--purple-700` `#53389E` |
| `--fg-primary-accent` | `--purple-500` `#7F56D9` |
| `--fg-neutral` | `--gray-600` `#475467` |
| `--fg-neutral-hover` | `--gray-700` `#344054` |
| `--fg-secondary` | `--gray-500` `#667085` |
| `--fg-tertiary` | `--gray-400` `#98A2B3` |
| `--fg-success` | `--green-600` |
| `--fg-warning` | `--yellow-700` |
| `--fg-error` | `--red-600` |
| `--fg-info` | `--blue-600` |
| `--fg-on-primary` | `#fff` |

### Background
| Token | Resolves to | Used for |
|---|---|---|
| `--bg-base` | `#fff` | Cards, sticky topbar |
| `--bg-canvas` | `#F8F9FC` | Page surface |
| `--bg-subtle` | `--gray-50` `#F9FAFB` | Toolbar, table head, segmented track |
| `--bg-muted` | `--gray-100` `#F2F4F7` | Neutral pill backgrounds |
| `--bg-primary` | `--purple-600` | Primary button |
| `--bg-primary-tint` | `--purple-50` | Active chip / pager / kpi icon tint |
| `--bg-success-tint` | `--green-50` | Success badge / KPI delta-up |
| `--bg-warning-tint` | `--yellow-50` | Warning badge |
| `--bg-error-tint` | `--red-50` | Error badge / KPI delta-down |
| `--bg-info-tint` | `--blue-50` | Info badge / cumulative KPI icon |

### Border
| Token | Resolves to |
|---|---|
| `--border-subtle` | `--gray-200` `#EAECF0` |
| `--border-neutral` | `--gray-300` `#D0D5DD` |
| `--border-neutral-hover` | `--gray-400` |
| `--border-primary` | `--purple-600` |

---

## Context tokens — dark theme (`data-theme="dark"`)

Only these flip; the seed palette stays identical so chart colors look the same.

| Token | Light → Dark value |
|---|---|
| `--bg-base` | `#fff` → **`#161A24`** *(card)* |
| `--bg-canvas` | `#F8F9FC` → **`#0F1117`** *(page)* |
| `--bg-subtle` | `--gray-50` → **`#1C2030`** |
| `--bg-muted` | `--gray-100` → **`#232838`** |
| `--bg-invert` | `--gray-900` → `#fff` |
| `--bg-primary` | `--purple-600` → `--purple-500` |
| `--bg-primary-hover` | `--purple-700` → `--purple-400` |
| `--bg-primary-tint` | `--purple-50` → `rgba(127,86,217,.16)` |
| `--bg-primary-tint-hover` | `--purple-100` → `rgba(127,86,217,.28)` |
| `--bg-success-tint` | `--green-50` → `rgba(18,183,106,.14)` |
| `--bg-warning-tint` | `--yellow-50` → `rgba(247,144,9,.14)` |
| `--bg-error-tint` | `--red-50` → `rgba(240,68,56,.14)` |
| `--bg-info-tint` | `--blue-50` → `rgba(46,144,250,.14)` |
| `--fg-primary` | `--purple-600` → `--purple-300` |
| `--fg-primary-hover` | `--purple-700` → `--purple-200` |
| `--fg-primary-accent` | `--purple-500` → `--purple-400` |
| `--fg-neutral` | `--gray-600` → `#D6DAE3` |
| `--fg-neutral-hover` | `--gray-700` → `#EAECF0` |
| `--fg-secondary` | `--gray-500` → `#98A2B3` |
| `--fg-tertiary` | `--gray-400` → `#667085` |
| `--fg-success` | `--green-600` → `--green-400` |
| `--fg-warning` | `--yellow-700` → `--yellow-300` |
| `--fg-error` | `--red-600` → `--red-400` |
| `--fg-info` | `--blue-600` → `--blue-300` |
| `--border-subtle` | `--gray-200` → `#222838` |
| `--border-neutral` | `--gray-300` → `#2A3142` |
| `--border-neutral-hover` | `--gray-400` → `#3A4258` |
| `--border-primary` | `--purple-600` → `--purple-400` |
| `--shadow-xs` | `0 1px 2px rgba(16,24,40,.05)` → `0 1px 2px rgba(0,0,0,.4)` |
| `--shadow-sm` | (light spec) → `0 1px 3px rgba(0,0,0,.55), 0 1px 2px rgba(0,0,0,.4)` |
| `--shadow-md` | (light spec) → `0 4px 8px -2px rgba(0,0,0,.55), 0 2px 4px -2px rgba(0,0,0,.35)` |
| `--shadow-lg` | (light spec) → `0 12px 16px -4px rgba(0,0,0,.5), 0 4px 6px -2px rgba(0,0,0,.3)` |

---

## Type tokens

| Token | Value | Stack / family |
|---|---|---|
| `--font-sans` | — | `"Noto Sans KR", "Noto Sans", "Malgun Gothic", -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", Arial, sans-serif` |
| `--font-mono` | — | `"Roboto Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |
| `--font-display` | — | `"Sora", "Samsung Sharp Sans", "Noto Sans", -apple-system, BlinkMacSystemFont, sans-serif` |

### Scale
| Token (size / line-height) | Used for |
|---|---|
| `--fs-h1 38 / --lh-h1 48` | Hero title (not used in this dashboard) |
| `--fs-h2 30 / --lh-h2 40` | Page title `Token Usage Dashboard` |
| `--fs-h3 24 / --lh-h3 32` | Gate title |
| `--fs-h4 20 / --lh-h4 24` | KPI value (override to 36/44, tabular) |
| `--fs-h5 16 / --lh-h5 20` | Card titles |
| `--fs-md 14 / --lh-md 20` | Default body / UI |
| `--fs-sm 12 / --lh-sm 16` | Card sub, badge, mono |
| `--fs-xs 10 / --lh-xs 16` | Footnote-level |

### Weights
| Token | Value | Used for |
|---|---|---|
| `--fw-regular` | 400 | Body |
| `--fw-medium` | 500 | UI labels, titles, button text |
| `--fw-bold` | 700 | Headings, KPI values, keywords |

---

## Spacing (4-pt grid)

| Token | Px |
|---|---|
| `--space-0` | 0 |
| `--space-2xs` | 2 |
| `--space-xs` | 4 |
| `--space-sm` | 8 |
| `--space-md` | 12 |
| `--space-lg` | 16 |
| `--space-xl` | 24 |
| `--space-2xl` | 32 |
| `--space-3xl` | 40 |
| `--space-4xl` | 48 |
| `--space-5xl` | 64 |
| `--space-6xl` | 80 |
| `--space-7xl` | 96 |

## Radius
| Token | Px |
|---|---|
| `--radius-xs` | 2 |
| `--radius-sm` | 4 |
| `--radius-md` | 6 *(default chip / input / button)* |
| `--radius-lg` | 8 *(large button)* |
| `--radius-xl` | 12 *(card)* |
| `--radius-2xl` | 16 *(gate card)* |
| `--radius-full` | 1000 *(badge pill)* |

## Shadow (light theme)
| Token | Value |
|---|---|
| `--shadow-xs` | `0 1px 2px 0 rgba(16,24,40,.05)` |
| `--shadow-sm` | `0 1px 3px 0 rgba(16,24,40,.10), 0 1px 2px 0 rgba(16,24,40,.06)` |
| `--shadow-md` | `0 4px 8px -2px rgba(16,24,40,.10), 0 2px 4px -2px rgba(16,24,40,.06)` |
| `--shadow-lg` | `0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03)` |
| `--shadow-xl` | `0 20px 24px -4px rgba(16,24,40,.08), 0 8px 8px -4px rgba(16,24,40,.03)` |

## Focus rings
| Token | Value |
|---|---|
| `--ring-primary` | `0 0 0 4px rgba(127,86,217,.24)` |
| `--ring-error` | `0 0 0 4px rgba(240,68,56,.24)` |

## Motion
| Token | Value |
|---|---|
| `--duration-fast` | 120ms *(hover, chip toggles)* |
| `--duration-medium` | 200ms *(theme switch, tooltip fade)* |
| `--duration-slow` | 320ms |
| `--ease-standard` | `cubic-bezier(.2, 0, 0, 1)` |
| `--ease-decelerate` | `cubic-bezier(0, 0, 0, 1)` |
| `--ease-accelerate` | `cubic-bezier(.3, 0, 1, 1)` |
