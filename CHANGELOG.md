# Changelog

## 0.1.0-rc.5 - 2026-08-14

- Publish the formal Host + browser package used by the tested DSH installation.
- Persist the complete appearance document under `ui-appearance.config`.
- Adopt delayed Host settings without overwriting edits made during initial loading.
- Confirm saves against the exact Host user-layer value instead of treating a recovered write as durable.
- Expose `ui-appearance` through the loopback Web settings API.
- Paint wallpaper opacity once on the document canvas and keep nested base surfaces transparent.
- Preserve uploaded images as data URLs across refresh and DSH restart.
- Project the configured accent across brand, business-state, and info-button tokens so send controls, links, folders, tabs, and carets share one hue.
