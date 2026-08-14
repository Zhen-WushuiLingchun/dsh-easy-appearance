# @deepseek-ai/dsh-client-ui-appearance

English | [中文](README.zh.md)

Appearance settings for the DeepSeek Harness WebUI. The plugin contributes an "外观" settings section for light/dark colors, wallpaper, fonts, VS Code theme import, custom CSS, and sidebar controls.

## Behavior

- Color overrides cover accent, foreground, secondary text, base background, and sidebar for both light and dark schemes; the active scheme continues to follow `ui-theme`'s `light`/`dark`/`system` preference.
- One accent choice is projected across the WebUI's brand, business-state, and info-button tokens, so send controls, links, folders, selected tabs, carets, and focus accents use the configured hue instead of the stock blue. Disabled controls still use the component's normal reduced opacity.
- A wallpaper may be an HTTP URL, a preset SVG data URL, or an uploaded image converted by `FileReader` to a data URL.
- Embedded image data over 4 KiB remains durable but is represented by an estimated-size placeholder in the URL field, avoiding multi-megabyte controlled-input painting issues in Electron.
- Wallpaper opacity is applied once on the document canvas. Nested application surfaces use a transparent base token while a wallpaper is active, so their backgrounds do not compound the requested opacity.
- The VS Code importer maps selected `colors` fields into the five color overrides.
- UI and code fonts, plus custom CSS, are applied live through a package-owned style element.
- Sidebar buttons call `ui-layout`; layout state itself remains owned by that service and is not stored in the appearance JSON.

## Persistence

The Host half requires the settings service and registers `ui-appearance`. The browser loads that namespace asynchronously, applies the accepted `config`, and writes each edit as one JSON string. A save is reported as successful only after the Host user layer returns the exact string that was written. With the default file provider, the resulting document lives at `$DSH_HOME/settings.yaml`:

```yaml
ui-appearance:
  config: '{"colors": {"light": {}, "dark": {}}, "wallpaper": {"url": "data:image/..."}}'
```

The real JSON contains all color, contrast, opacity, wallpaper, font, and custom-CSS fields. An uploaded wallpaper's data URL is therefore part of the same durable value and returns after a page refresh or DSH restart. A remote, non-loopback browser remains memory-only because the privileged settings API is not exposed to it.

## Enabling and disabling

Add or remove the `ui-appearance` row in the active web profile's `cordis.patch.yml`:

```yaml
- insert:
    - id: ui-appearance
      name: '@deepseek-ai/dsh-client-ui-appearance'
```

## Model Experience

None, as appearance configuration affects only browser presentation; nothing here reaches a model request.

#### KV Cache effect

None; this package neither assembles nor sends a provider request.

## Known Limitations and Deferred Work

- Inline data URLs make the settings document grow with the uploaded image; the plugin does not maintain a separate image asset store. The settings UI summarizes large values rather than placing the complete Base64 string in a text input.
- The VS Code importer maps five main fields; state colors, borders, layers, and `tokenColors` are not mapped.
- The wallpaper scrim uses one dark tint for both schemes.
