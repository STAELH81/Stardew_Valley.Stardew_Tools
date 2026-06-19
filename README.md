# Stardew Tools

Fan-made companion web app for [**Stardew Valley**](https://www.stardewvalley.net/). Not affiliated with ConcernedApe or Chucklefish.

Plan your farm, track quests, estimate crop profits — runs in the browser, no account, no install.

---

## Features

### Available tools

| Tool | Description |
|------|-------------|
| **Sprinkler planner** | Clickable grid, sprinkler range, material costs, save/export/import layout |
| **Quest manager** | Custom quests saved in the browser (`localStorage`), categories, deadlines, export |
| **Profit calculator** | 37 crops, 4 quality tiers, multi-harvest, agriculturist bonus (+10%) |
| **Season calendar** | Crops by season with grow days, regrow, and seed cost |
| **Villager gifts** | Loved/liked/disliked/hated gifts for 20 NPCs, search by item |

### Coming soon

- Fish guide
- Community center bundles
- **Interactive valley map**

### App-wide

- **5 languages** — French, English, German, Spanish, Russian (top-right selector)
- **Light / dark theme** — sun/moon chip (top-right), dark mode uses `main-background-dark.png`
- **Language picker** — full language names (Français, English, …) in the top bar
- **Version badge** — synced from `package.json` (e.g. `v2.1.0`)
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
| `sprinklers/*-sprinkler.png` | Sprinkler sprites on the grid (with tile background) |
| `sprinklers/*-sprinkler-nb.png` | Transparent sprites for toolbar buttons |

### Custom tool icons (home menu)

Drop your PNGs in `public/assets/icons/` (displayed at **36×36 px**, scaled from your source file):

| Spec | Value |
|------|-------|
| **Your source file** | **128×128 px** |
| **On-screen size** | 36×36 px (auto-scaled) |
| **Format** | PNG, transparent background |
| **Style** | Pixel art, consistent across icons |

Filenames:

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

Until icons are added, the menu falls back to placeholder sprites.

### Sprinkler sprites

All sprinkler images live in `public/assets/sprinklers/`:

| File | Use |
|------|-----|
| `basic-sprinkler.png` | Grid tile (with dirt background) |
| `quality-sprinkler.png` | Grid tile |
| `iridium-sprinkler.png` | Grid tile |
| `basic-sprinkler-nb.png` | Toolbar button (no background) |
| `quality-sprinkler-nb.png` | Toolbar button |
| `iridium-sprinkler-nb.png` | Toolbar button |

---

## Stack

- [Vite](https://vitejs.dev/) — build & dev server
- Vanilla JS — no framework, no backend

---

## License & disclaimer

Personal / fan project. *Stardew Valley* © ConcernedApe. Do not use project assets commercially.

Contributions welcome — open an issue or PR.
