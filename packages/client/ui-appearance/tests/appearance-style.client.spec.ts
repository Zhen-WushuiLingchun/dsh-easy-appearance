import { describe, expect, it } from 'vitest'
import { decodeConfig, encodeConfig, DEFAULT_CONFIG } from '../src/settings.ts'
import { buildAppearanceCss, buildAppearanceTokens } from '../src/client/appearance-style.ts'

function config() {
  return decodeConfig(encodeConfig(DEFAULT_CONFIG))
}

describe('appearance style projection', () => {
  it('projects one accent choice across links, folders, tabs, and send controls', () => {
    const value = config()
    value.colors.light.accent = '#a080e0'
    value.colors.dark.accent = '#8ea2ee'

    const tokens = buildAppearanceTokens(value)
    const accent = { light: '#a080e0', dark: '#8ea2ee' }
    expect(tokens['--dsw-alias-brand-primary']).toEqual(accent)
    expect(tokens['--dsw-alias-brand-primary-new-colorprimary-new-color']).toEqual(accent)
    expect(tokens['--dsw-alias-state-business-primary']).toEqual(accent)
    expect(tokens['--dsw-alias-button-info-fill']).toEqual(accent)
    expect(tokens['--dsw-alias-button-info-hover']).toEqual({ light: '#b197e6', dark: '#7d8fd1' })
    expect(tokens['--dsw-alias-state-business-tertiary']).toEqual({
      light: 'rgba(160, 128, 224, 0.14)',
      dark: 'rgba(142, 162, 238, 0.22)',
    })
  })

  it('keeps the ordinary base opaque when no wallpaper is configured', () => {
    const value = config()
    value.surfaceOpacity = 0.2

    expect(buildAppearanceTokens(value)['--dsw-alias-bg-base']).toEqual({
      light: value.colors.light.background,
      dark: value.colors.dark.background,
    })
    expect(buildAppearanceCss(value)).not.toContain('background-image:')
  })

  it('uses one wallpaper canvas instead of compounding opacity through nested base surfaces', () => {
    const value = config()
    value.wallpaper = { url: 'data:image/png;base64,AA==', scrim: 0.25 }
    value.surfaceOpacity = 0.5
    value.customCss = '.custom-rule { opacity: 0.8; }'

    const tokens = buildAppearanceTokens(value)
    expect(tokens['--dsw-alias-bg-base']).toEqual({ light: 'transparent', dark: 'transparent' })
    expect(tokens['--dsw-specific-sidebar-fill']?.light).toContain(', 0.5)')

    const css = buildAppearanceCss(value)
    expect(css).toContain('body {')
    expect(css).toContain('body[data-ds-dark-theme]')
    expect(css).toContain('linear-gradient(rgba(255, 255, 255, 0.5)')
    expect(css).toContain('data:image/png;base64,AA==')
    expect(css.endsWith(value.customCss)).toBe(true)
  })
})
