# Clothes-New — Wardrobe Management (لوحة إدارة الملابس)

A standalone web app for managing a shop's clothing items: add, edit and delete garments,
upload front/back photos (from the device or the camera), enter garment measurements per
size, preview each item in 3D, and export an item to the fitting room as JSON.

This repository contains **only** the Wardrobe Management part, extracted from the
`feature/wardrobe-management` branch of the FrontAvatar project. The avatar creator and
fitting-room page are not included.

## Requirements

- Node.js 20 or newer (tested with Node 24)
- npm

## Install and run

```bash
npm ci              # install the exact versions from package-lock.json
npm run dev         # http://localhost:5180
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server on port 5180 |
| `npm run build` | Type-check and build the production bundle into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run typecheck` | TypeScript check only |
| `npm run test:wardrobe` | Logic tests (validation, outlines, export payload, image/camera helpers) |

## Project structure

| Path | Role |
| --- | --- |
| `src/features/wardrobe/` | The wardrobe dashboard: data types, validation, storage, forms, 3D viewer |
| `src/integration/fittingRoom/` | Integration contract with the fitting room (payload schema and handoff helpers) |
| `src/components/clothing/` | Shared size table used for the bundled project models |
| `src/components/common/ErrorBoundary.tsx` | Keeps a crash inside one area of the page |
| `src/lib/idb.ts` | Small IndexedDB key–value store |
| `public/models/shirt_*.glb` | 3D models offered as "project models" in the form |
| `scripts/test-wardrobe.mjs` | Logic tests (run through Vite, no extra test framework) |
| `docs/wardrobe-integration.md` | Integration guide (Arabic) |

## Notes and limits

- **Storage:** there is no backend yet. Items are stored in the browser's **IndexedDB**, so
  they stay on that browser and device only. Images are resized to 1200 px WebP; uploaded
  GLB models (up to 25 MB) are stored as data URLs. To use a real API, replace the
  functions in `src/features/wardrobe/productRepository.ts`.
- **Camera:** taking a photo with the camera needs a secure context (`https://` or
  `localhost`). Where the live camera is not available, the app falls back to the device's
  file/camera picker.
- **Fitting room:** "Export to fitting room" saves the item (schema
  `palestine-tryon/garment@1`) in IndexedDB and notifies other tabs. The fitting-room page
  itself lives in the main FrontAvatar project, so the "open fitting room" link in the
  success message does not lead anywhere in this standalone app.
- `public/models/shirt_*.glb` all contain the same dress model (see
  `docs/wardrobe-integration.md`).
- There is no automatic photo-to-3D conversion; without a model the viewer shows an
  approximate flat preview built from the garment type and measurements.
