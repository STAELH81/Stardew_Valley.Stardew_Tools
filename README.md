# Stardew Tools

Fan-made companion web app for [**Stardew Valley**](https://www.stardewvalley.net/). Not affiliated with ConcernedApe or Chucklefish.

Plan your farm, track quests, estimate crop profits — runs in the browser, no account, no install.

---

## Features

### Available tools

| Tool | Description |
|------|-------------|
| **Sprinkler planner** | Clickable grid, sprinkler range, material costs |
| **Quest manager** | Custom quests saved in the browser (`localStorage`) |
| **Profit calculator** | 37 crops, 4 quality tiers, agriculturist bonus (+10%) |

### Coming soon

- Season calendar
- Fish guide
- Community center bundles
- Villager gift preferences
- **Interactive valley map**

### App-wide

- **5 languages** — French, English, German, Spanish, Russian (top-right selector)
- **Light / dark theme** — sun/moon toggle (top-right), dark mode uses `main-background-dark.png`
- **Static hosting** — deploys to Netlify for free

---

## Local development

```bash
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview   # optional — test the dist/ output
```

---

## Deploy on Netlify

1. Push this repo to GitHub
2. [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Done — `netlify.toml` already sets:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

---

## Project structure

```
index.html
netlify.toml
public/assets/          # Sprites, backgrounds, tool icons
src/
  app.js                # Shell, routing, home screen
  theme.js              # Light / dark mode
  i18n/locales/         # fr, en, de, es, ru
  tools/                # One module per tool + registry.js
  data/                 # Game data (crops, etc.)
  styles/main.css
```

### Add a new tool

1. Create `src/tools/my-tool.js` exporting `renderMyTool()` → returns a DOM element
2. Add `tools.myTool.*` keys in every `src/i18n/locales/*.json`
3. Register in `src/tools/registry.js` with `available: true`

---

## Assets

All static files live in `public/assets/`.

| File | Purpose |
|------|---------|
| `main-background.png` | Light theme background |
| `main-background-dark.png` | Dark theme background |
| `main-logo.png` | Home screen logo |
| `dirt.png`, `irrigated-dirt.png` | Grid tiles |
| `*-sprinkler.png` | Sprinkler sprites on the grid |

### Custom tool icons (home menu)

If you want to replace the placeholder menu icons, drop PNGs in `public/assets/icons/`:

| Spec | Value |
|------|-------|
| **Display size** | 36×36 px |
| **Recommended source** | **64×64 px** (@2x for sharp screens) |
| **Format** | PNG, transparent background |
| **Style** | Pixel art, consistent palette across icons |

Suggested filenames (wired up when added):

```
public/assets/icons/grid.png
public/assets/icons/quests.png
public/assets/icons/profit.png
public/assets/icons/calendar.png
public/assets/icons/fish.png
public/assets/icons/bundles.png
public/assets/icons/gifts.png
public/assets/icons/map.png
```

---

## Stack

- [Vite](https://vitejs.dev/) — build & dev server
- Vanilla JS — no framework, no backend

---

## License & disclaimer

Personal / fan project. *Stardew Valley* © ConcernedApe. Do not use project assets commercially.

Contributions welcome — open an issue or PR.
