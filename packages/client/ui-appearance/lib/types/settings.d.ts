/** Durable appearance settings shared by the Host schema and the browser scope. */
import z from '@deepseek-ai/schemastery';
/** Settings namespace owned by the appearance plugin. */
export declare const APPEARANCE_SETTINGS_NAMESPACE = "ui-appearance";
/** One color set (a single scheme). */
export interface AppearanceColorSet {
    accent: string;
    background: string;
    foreground: string;
    secondary: string;
    sidebar: string;
}
/** The full appearance configuration, persisted as one JSON document. */
export interface AppearanceConfig {
    colors: {
        light: AppearanceColorSet;
        dark: AppearanceColorSet;
    };
    contrast: number;
    surfaceOpacity: number;
    wallpaper: {
        url: string;
        scrim: number;
    };
    fonts: {
        ui: string;
        code: string;
    };
    customCss: string;
}
/** Settings section persisted in the Host user-settings document. */
export interface AppearanceSettings {
    /** JSON-encoded {@link AppearanceConfig}. */
    config: string;
}
/** Durable schema; the config rides one string field so the shape stays the plugin's own. */
export declare const AppearanceSettingsSchema: z<AppearanceSettings>;
/** Default config applied when no persisted document exists. */
export declare const DEFAULT_CONFIG: AppearanceConfig;
/**
 * Serialize the config for the settings document.
 * @param config - appearance configuration to serialize.
 * @returns one JSON string suitable for `ui-appearance.config`.
 */
export declare function encodeConfig(config: AppearanceConfig): string;
/**
 * Parse a persisted config, merging partial documents over the defaults.
 * @param raw - JSON string read from `ui-appearance.config`.
 * @returns a complete appearance configuration.
 */
export declare function decodeConfig(raw: string): AppearanceConfig;
//# sourceMappingURL=settings.d.ts.map