/** Pure token and stylesheet projection for one appearance configuration. */
import type { AppearanceConfig } from '../settings.ts';
type AppearanceTokenOverrides = Record<string, {
    light: string;
    dark: string;
}>;
/**
 * Project appearance colors into the shared theme token layer.
 * @param config - appearance configuration to project.
 * @returns light/dark token values for the theme runtime.
 */
export declare function buildAppearanceTokens(config: AppearanceConfig): AppearanceTokenOverrides;
/**
 * Build the package-owned dynamic stylesheet for wallpaper, fonts, and custom CSS.
 * @param config - appearance configuration to project.
 * @returns complete stylesheet text for the current configuration.
 */
export declare function buildAppearanceCss(config: AppearanceConfig): string;
export {};
//# sourceMappingURL=appearance-style.d.ts.map