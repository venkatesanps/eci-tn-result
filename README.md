# Tamil Nadu Election Results Dashboard

A free interactive election analytics website for Tamil Nadu Assembly elections.

## What this project includes

- React + Next.js static export site
- Live results summary, prediction panels, and historical analytics
- Sample JSON data under `public/data`
- GitHub Actions workflows for periodic refresh and GitHub Pages deployment

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build the static export site:

```bash
npm run build
```

Because `next.config.mjs` uses `output: 'export'`, `next build` generates the static `out/` folder automatically.

## Deployment

This project is designed to deploy as a static export. GitHub Pages or another static host can serve the generated `out/` folder.

- Set `NEXT_PUBLIC_BASE_PATH=/eci-tn-result` when using GitHub Pages for a repo named `eci-tn-result`.

## Live ECI data integration

The fetch script in `scripts/fetch-eci-data.js` can load real ECI JSON when `ECI_LIVE_API` is configured.

- Create a repository secret named `ECI_LIVE_API` with your official ECI JSON endpoint.
- The refresh workflow will attempt the configured source and update `public/data/live-summary.json` and `public/data/constituencies.json`.

If no live source is reachable, the dashboard continues to use sample data.

## Data refresh

A simple data fetch script lives in `scripts/fetch-eci-data.js`. The site consumes JSON under `public/data/`.

## Next steps

- Connect a real ECI data source or public election API
- Extend analytics with constituency heatmaps and party-level trends
- Add GitHub Actions for live refresh and deployment
