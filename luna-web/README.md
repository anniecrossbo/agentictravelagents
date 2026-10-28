# Luna web app

Working web build of the "🟢 Final Design" Figma page (Vite + React + Tailwind v4, React Router, react-i18next).

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # typecheck + production build
    node scripts/check-i18n.mjs   # lists t('key') usages missing from src/i18n/en.json

Rules (from the project CLAUDE.md): copy lives in `src/i18n/en.json`, colours only in `src/theme/tokens.ts`,
data comes through `LunaApi` (`src/contracts`) with the mock in `src/mocks`, shortcuts are marked `PROTO:`.
Popups are URL-driven (`?o=agent:sales:omar`), so every popup state is linkable.
