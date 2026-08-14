import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { SettingsProvider, settingsNamespace, type SettingsNamespace } from '@deepseek-ai/dsh-settings'
import { APPEARANCE_SETTINGS_NAMESPACE, apply } from '@deepseek-ai/dsh-client-ui-appearance'

class MemorySettings extends SettingsProvider {
  readonly writable = true

  protected load(): Promise<Record<string, unknown>> {
    return Promise.resolve({})
  }

  protected persist(_ns: SettingsNamespace, _section: Record<string, unknown>): Promise<void> {
    return Promise.resolve()
  }
}

describe('ui-appearance host', () => {
  it('exposes a durable config field for the full fiber lifetime', async () => {
    const ctx = new Context()
    const fiber = ctx.plugin({ apply })
    await fiber.await()
    const settingsFiber = ctx.plugin(MemorySettings)
    await settingsFiber.await()
    const namespace = settingsNamespace(APPEARANCE_SETTINGS_NAMESPACE)

    expect(ctx.settings.get(namespace)).toEqual({ config: '' })
    await ctx.settings.update(namespace, { config: '{"wallpaper":"data:image/png;base64,AA=="}' })
    expect(ctx.settings.get(namespace)).toEqual({ config: '{"wallpaper":"data:image/png;base64,AA=="}' })
    await expect(ctx.settings.update(namespace, { config: 7 })).rejects.toThrow()

    await fiber.dispose()
    expect(ctx.settings.describe().map(section => section.ns)).not.toContain(namespace)
    await settingsFiber.dispose()
  })
})
