/** Pure token and stylesheet projection for one appearance configuration. */
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
function clamp255(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}
function twoDigitHex(value) {
    return clamp255(value).toString(16).padStart(2, '0');
}
function rgbToHex(red, green, blue) {
    return `#${twoDigitHex(red)}${twoDigitHex(green)}${twoDigitHex(blue)}`;
}
function hexToRgb(hex) {
    let normalized = hex.trim().replace(/^#/, '');
    if (normalized.length === 3) {
        normalized = normalized.split('').map(part => part + part).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(normalized))
        return undefined;
    return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16),
    };
}
function lerpHex(from, to, amount) {
    const start = hexToRgb(from);
    const end = hexToRgb(to);
    if (start === undefined || end === undefined)
        return from;
    return rgbToHex(start.r + (end.r - start.r) * amount, start.g + (end.g - start.g) * amount, start.b + (end.b - start.b) * amount);
}
function hexToRgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    if (rgb === undefined)
        return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp01(alpha)})`;
}
function cssUrl(raw) {
    return `url(${JSON.stringify(raw)})`;
}
function wallpaperRule(selector, background, opacity, scrim, wallpaper) {
    const tint = hexToRgba(background, opacity);
    const shade = `rgba(0, 0, 0, ${clamp01(scrim)})`;
    return `${selector} { background-color: ${background} !important; background-image: linear-gradient(${tint}, ${tint}), linear-gradient(${shade}, ${shade}), ${cssUrl(wallpaper)} !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important; background-attachment: fixed !important; }`;
}
/**
 * Project appearance colors into the shared theme token layer.
 * @param config - appearance configuration to project.
 * @returns light/dark token values for the theme runtime.
 */
export function buildAppearanceTokens(config) {
    const light = config.colors.light;
    const dark = config.colors.dark;
    const contrastTarget = { light: '#000000', dark: '#ffffff' };
    const hasWallpaper = config.wallpaper.url.length > 0;
    const surfaceAlpha = hasWallpaper ? config.surfaceOpacity : 1;
    return {
        '--dsw-alias-brand-primary': { light: light.accent, dark: dark.accent },
        '--dsw-alias-label-primary': {
            light: lerpHex(light.foreground, contrastTarget.light, config.contrast),
            dark: lerpHex(dark.foreground, contrastTarget.dark, config.contrast),
        },
        '--dsw-alias-label-secondary': {
            light: lerpHex(light.secondary, contrastTarget.light, config.contrast),
            dark: lerpHex(dark.secondary, contrastTarget.dark, config.contrast),
        },
        // The wallpaper owns one canvas tint. Keeping this token transparent avoids
        // compounding the requested opacity at body/AppRoot/AppFrame/conversation.
        '--dsw-alias-bg-base': {
            light: hasWallpaper ? 'transparent' : light.background,
            dark: hasWallpaper ? 'transparent' : dark.background,
        },
        '--dsw-specific-sidebar-fill': {
            light: hexToRgba(light.sidebar, surfaceAlpha),
            dark: hexToRgba(dark.sidebar, surfaceAlpha),
        },
    };
}
/**
 * Build the package-owned dynamic stylesheet for wallpaper, fonts, and custom CSS.
 * @param config - appearance configuration to project.
 * @returns complete stylesheet text for the current configuration.
 */
export function buildAppearanceCss(config) {
    const rules = [];
    if (config.fonts.ui.length > 0) {
        rules.push(`:root { --dsw-font-family: ${config.fonts.ui} !important; }`);
    }
    if (config.fonts.code.length > 0) {
        rules.push(`:root { --ds-font-family-code: ${config.fonts.code} !important; }`);
    }
    if (config.wallpaper.url.length > 0) {
        rules.push(wallpaperRule('body', config.colors.light.background, config.surfaceOpacity, config.wallpaper.scrim, config.wallpaper.url));
        rules.push(wallpaperRule('body[data-ds-dark-theme]', config.colors.dark.background, config.surfaceOpacity, config.wallpaper.scrim, config.wallpaper.url));
    }
    if (config.customCss.length > 0)
        rules.push(config.customCss);
    return rules.join('\n');
}
//# sourceMappingURL=appearance-style.js.map