# PWA install — manual QA checklist (Phase 5f)

Run against **production or preview** URL with HTTPS (`VITE_DEMO_MODE` any).

## Android Chrome

1. Open app URL in Chrome (not in-app browser).
2. Confirm install banner or menu → **Install app** / **Add to Home screen**.
3. Launch from home screen — opens **standalone** (no browser chrome).
4. TurfMate icon shows on launcher (green leaf on dark green).

## iOS Safari

1. Open app URL in **Safari** (not Chrome iOS for first test).
2. Tap **Share** → **Add to Home Screen**.
3. Confirm name **TurfMate** and icon preview.
4. Launch from home screen — status bar matches theme (`#14532D`).
5. In-app **Install** hint may show before first dismiss (Share → Add to Home Screen).

## Dev / local

```bash
npm run build && npm run preview
# optional: VITE_ENABLE_SW=true on preview to test SW registration
```

Chrome DevTools → **Application** → Manifest + Service Workers should show:
- Manifest with 192 + 512 PNG icons
- `sw.js` activated (production preview)

## Automated

```bash
npm run build
# Lighthouse PWA category on preview URL (target score ≥ 90)
```

## Pass criteria

- [ ] Manifest valid (icons 192 + 512, `display: standalone`, `theme_color`)
- [ ] Service worker registers on production build
- [ ] Add to Home Screen works on Android Chrome
- [ ] Add to Home Screen works on iOS Safari
- [ ] Standalone launch loads app (not offline error on first open)
