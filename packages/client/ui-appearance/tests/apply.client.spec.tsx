// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { createElement } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SlotRegistry } from '@deepseek-ai/dsh-client-runtime/client'
import { stubSettingsScope } from '@deepseek-ai/dsh-client-test-runtime'
import type { AppearanceSettings } from '../src/settings.ts'
import { decodeConfig, encodeConfig, DEFAULT_CONFIG } from '../src/settings.ts'
import { apply, inject } from '../src/client/index.ts'

afterEach(() => {
  cleanup()
  document.head.querySelectorAll('[data-plugin="ui-appearance"]').forEach((node) => { node.remove() })
})

async function bench() {
  const ctx = new Context()
  await ctx.plugin(SlotRegistry).await()
  const slots = ctx.get('slots') as SlotRegistry
  slots.register({
    name: 'root',
    children: { 'settings.section': { kind: 'list', scope: 'root' } },
  } as never, () => null)
  const host = stubSettingsScope<AppearanceSettings>()
  const overrideTokens = vi.fn(() => vi.fn())
  const theme = {
    getTheme: () => ({
      preference: 'system',
      active: { id: 'light', label: 'Light', colorScheme: 'light', tokens: {} },
      themes: [],
      revision: 0,
    }),
    setTheme: vi.fn(),
    overrideTokens,
  }
  const layout = {
    toggleSidebar: vi.fn(), openDetails: vi.fn(), closeDetails: vi.fn(),
  }
  ctx.provide('settingsScope', { bind: () => host.scope } as never)
  ctx.provide('theme', theme as never)
  ctx.provide('layout', layout as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { ctx, fiber, host, overrideTokens, slots }
}

function renderSection(slots: SlotRegistry): void {
  const entry = slots.entries('settings.section').find(candidate => candidate.options.id === 'appearance')
  if (entry === undefined) throw new Error('appearance settings section was not registered')
  render(createElement(entry.component as never))
}

describe('ui-appearance browser apply', () => {
  it('adopts the asynchronous Host config and applies its wallpaper without writing it back', async () => {
    expect(inject).toEqual(['slots', 'settingsScope', 'theme', 'layout'])
    const test = await bench()
    const saved = decodeConfig(encodeConfig(DEFAULT_CONFIG))
    saved.wallpaper = { url: 'data:image/png;base64,U0FWRUQ=', scrim: 0.2 }
    saved.surfaceOpacity = 0.4
    test.host.publish({
      status: 'ready', writable: true, revision: 3,
      value: { config: encodeConfig(saved) },
      user: { config: encodeConfig(saved) },
    })
    renderSection(test.slots)

    expect(screen.getByPlaceholderText<HTMLInputElement>('https://… 或 data:image/…').value)
      .toBe(saved.wallpaper.url)
    expect(document.head.querySelector('[data-plugin="ui-appearance"]')?.textContent)
      .toContain(saved.wallpaper.url)
    expect(test.host.set).not.toHaveBeenCalled()

    await test.fiber.dispose()
    expect(test.host.listenerCount()).toBe(0)
    expect(document.head.querySelector('[data-plugin="ui-appearance"]')).toBeNull()
  })

  it('does not bind a large embedded wallpaper to the URL input', async () => {
    const test = await bench()
    const saved = decodeConfig(encodeConfig(DEFAULT_CONFIG))
    saved.wallpaper.url = `data:image/jpeg;base64,${'A'.repeat(8192)}`
    const serialized = encodeConfig(saved)
    test.host.publish({
      status: 'ready', writable: true, revision: 4,
      value: { config: serialized }, user: { config: serialized },
    })
    renderSection(test.slots)

    const input = screen.getByPlaceholderText<HTMLInputElement>(/已加载内嵌背景图/)
    expect(input.value).toBe('')
    expect(input.placeholder).toContain('KiB')
    expect(document.head.querySelector('[data-plugin="ui-appearance"]')?.textContent)
      .toContain(saved.wallpaper.url)
    expect(test.host.set).not.toHaveBeenCalled()

    await test.fiber.dispose()
  })

  it('reports success only after the exact config appears in the Host user layer', async () => {
    const test = await bench()
    const initial = { config: encodeConfig(DEFAULT_CONFIG) }
    let acceptedConfig: string | undefined
    test.host.publish({ status: 'ready', writable: true, revision: 1, value: initial, user: initial })
    test.host.set.mockImplementation((_field: string, value: string) => {
      acceptedConfig = value
      test.host.publish({
        status: 'ready', writable: true, revision: 2,
        value: { config: value }, user: { config: value },
      })
    })
    renderSection(test.slots)

    fireEvent.click(screen.getByRole('button', { name: '暮色紫' }))
    await waitFor(() => { expect(test.host.set).toHaveBeenCalledOnce() })
    if (acceptedConfig === undefined) throw new Error('Host did not accept appearance config')
    expect(decodeConfig(acceptedConfig).wallpaper.url).toContain('data:image/svg+xml,')
    await screen.findByText('已保存到 DSH settings.yaml')
  })

  it('does not claim persistence when the Host leaves the previous config active', async () => {
    const test = await bench()
    const initial = { config: encodeConfig(DEFAULT_CONFIG) }
    test.host.publish({ status: 'ready', writable: true, revision: 1, value: initial, user: initial })
    renderSection(test.slots)

    fireEvent.click(screen.getByRole('button', { name: '深海蓝' }))
    await screen.findByText('保存失败：Host 未接受 ui-appearance.config；当前仅在本页生效')
  })
})
