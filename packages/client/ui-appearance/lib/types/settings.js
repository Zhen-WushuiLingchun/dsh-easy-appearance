/** Durable appearance settings shared by the Host schema and the browser scope. */
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the appearance plugin. */
export const APPEARANCE_SETTINGS_NAMESPACE = 'ui-appearance';
/** Durable schema; the config rides one string field so the shape stays the plugin's own. */
export const AppearanceSettingsSchema = z.object({
    config: z.string().default(''),
});
/** Default config applied when no persisted document exists. */
export const DEFAULT_CONFIG = {
    colors: {
        light: { accent: '#3964fe', background: '#ffffff', foreground: '#0f1115', secondary: '#61666b', sidebar: '#f5f6f7' },
        dark: { accent: '#6e8bff', background: '#0b0d10', foreground: '#e7e9ec', secondary: '#9ba1a8', sidebar: '#101317' },
    },
    contrast: 0,
    surfaceOpacity: 1,
    wallpaper: { url: '', scrim: 0.45 },
    fonts: { ui: '', code: '' },
    customCss: '',
};
/**
 * Serialize the config for the settings document.
 * @param config - appearance configuration to serialize.
 * @returns one JSON string suitable for `ui-appearance.config`.
 */
export function encodeConfig(config) {
    return JSON.stringify(config);
}
/**
 * Parse a persisted config, merging partial documents over the defaults.
 * @param raw - JSON string read from `ui-appearance.config`.
 * @returns a complete appearance configuration.
 */
export function decodeConfig(raw) {
    try {
        const parsed = JSON.parse(raw);
        return {
            colors: {
                light: { ...DEFAULT_CONFIG.colors.light, ...(parsed.colors?.light ?? {}) },
                dark: { ...DEFAULT_CONFIG.colors.dark, ...(parsed.colors?.dark ?? {}) },
            },
            contrast: typeof parsed.contrast === 'number' ? parsed.contrast : DEFAULT_CONFIG.contrast,
            surfaceOpacity: typeof parsed.surfaceOpacity === 'number' ? parsed.surfaceOpacity : DEFAULT_CONFIG.surfaceOpacity,
            wallpaper: { ...DEFAULT_CONFIG.wallpaper, ...(parsed.wallpaper ?? {}) },
            fonts: { ...DEFAULT_CONFIG.fonts, ...(parsed.fonts ?? {}) },
            customCss: typeof parsed.customCss === 'string' ? parsed.customCss : DEFAULT_CONFIG.customCss,
        };
    }
    catch {
        return {
            ...DEFAULT_CONFIG,
            colors: {
                light: { ...DEFAULT_CONFIG.colors.light },
                dark: { ...DEFAULT_CONFIG.colors.dark },
            },
        };
    }
}
//# sourceMappingURL=settings.js.map