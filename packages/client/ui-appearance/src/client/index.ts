/** Browser half: appearance settings section, theme overrides, and durable config. */

import { createElement as el, useEffect, useState } from 'react'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only Context merges: settingsScope + settings.section slot (ui-settings),
// ctx.theme (ui-theme), and ctx.layout (ui-layout).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import {
  APPEARANCE_SETTINGS_NAMESPACE, DEFAULT_CONFIG, decodeConfig, encodeConfig,
  type AppearanceColorSet, type AppearanceConfig, type AppearanceSettings,
} from '../settings.ts'
import { buildAppearanceCss, buildAppearanceTokens } from './appearance-style.ts'

export const inject = ['slots', 'settingsScope', 'theme', 'layout']

function normalizeHex(v: string): string {
  const s = v.trim()
  if (s[0] === '#' && (s.length === 7 || s.length === 9)) return s.slice(0, 7)
  return s
}

function pickColor(colors: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = colors[key]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return null
}

function gradientDataUri(c1: string, c2: string): string {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#g)"/></svg>'
  return 'data:image/svg+xml,' + encodeURIComponent(svg)
}

const PRESETS = [
  { id: 'violet', label: '暮色紫', url: gradientDataUri('#7c3aed', '#1e1b4b') },
  { id: 'ocean', label: '深海蓝', url: gradientDataUri('#0ea5e9', '#0b0d10') },
  { id: 'jade', label: '翡翠绿', url: gradientDataUri('#10b981', '#04211f') },
  { id: 'ember', label: '暖橙', url: gradientDataUri('#f97316', '#3b0a12') },
]

const WALLPAPER_INPUT_INLINE_LIMIT = 4096
const WALLPAPER_INPUT_PLACEHOLDER = 'https://… 或 data:image/…'

function wallpaperInputPresentation(url: string): { value: string; placeholder: string } {
  if (!url.startsWith('data:image/') || url.length <= WALLPAPER_INPUT_INLINE_LIMIT) {
    return { value: url, placeholder: WALLPAPER_INPUT_PLACEHOLDER }
  }

  const comma = url.indexOf(',')
  const payloadLength = comma >= 0 ? url.length - comma - 1 : url.length
  const estimatedBytes = url.slice(0, Math.max(comma, 0)).includes(';base64')
    ? Math.floor(payloadLength * 3 / 4)
    : payloadLength
  const size = estimatedBytes >= 1024 * 1024
    ? `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MiB`
    : `${Math.max(1, Math.round(estimatedBytes / 1024))} KiB`

  return {
    value: '',
    placeholder: `已加载内嵌背景图（约 ${size}），输入新 URL 可替换`,
  }
}

const TEMPLATE_CSS = [
  '/* ============================================================',
  '   dsh-appearance 自定义 CSS 模板',
  '   此处可写任意 CSS，实时注入 <style>；点“重置全部”可清除。',
  '   · 覆盖主题 token（内联注入）需写 body 选择器并加 !important：',
  '        body { --dsw-alias-brand-primary: #ff6b6b !important; }',
  '   · 深色专属选择器： body[data-ds-dark-theme]',
  '   · 常用变量：--dsw-alias-*  /  --dsw-specific-sidebar-fill',
  '              --dsw-font-family  /  --ds-font-family-code',
  '   ============================================================ */',
  '',
  '/* 示例：自定义强调色 */',
  '/* body { --dsw-alias-brand-primary: #ff6b6b !important; } */',
  '',
  '/* 示例：深色下更换背景 */',
  '/* body[data-ds-dark-theme] { --dsw-alias-bg-base: #101418 !important; } */',
  '',
].join('\n')

/** Insert a package-owned <style> element and return its disposer. */
function insertStyle(css: string): () => void {
  const tag = document.createElement('style')
  tag.setAttribute('data-plugin', 'ui-appearance')
  tag.textContent = css
  document.head.appendChild(tag)
  return () => { tag.remove() }
}

/** Apply the browser half once the settings scope and slot runtime are present. */
export function apply(ctx: ClientContext): void {
  const theme = ctx.theme
  const layout = ctx.layout

  const host = ctx.settingsScope.bind<AppearanceSettings>({ namespace: APPEARANCE_SETTINGS_NAMESPACE })
  const state: AppearanceConfig = decodeConfig(host.getSnapshot().value?.config ?? '')

  let disposeTokens: (() => void) | null = null
  let disposeCss: (() => void) | null = null
  let pendingConfig: string | undefined
  let hasLocalChanges = false
  let persistenceMessage = '正在读取已保存的外观配置…'
  const appearanceListeners = new Set<() => void>()

  function notifyAppearance(): void {
    for (const listener of [...appearanceListeners]) listener()
  }

  function setPersistenceMessage(message: string): void {
    if (persistenceMessage === message) return
    persistenceMessage = message
    notifyAppearance()
  }

  function subscribeAppearance(listener: () => void): () => void {
    appearanceListeners.add(listener)
    return () => { appearanceListeners.delete(listener) }
  }

  function applyAll(): void {
    if (disposeTokens !== null) { disposeTokens(); disposeTokens = null }
    if (disposeCss !== null) { disposeCss(); disposeCss = null }
    disposeTokens = theme.overrideTokens('ui-appearance', buildAppearanceTokens(state))
    disposeCss = insertStyle(buildAppearanceCss(state))
  }

  function commit(): void {
    hasLocalChanges = true
    const serialized = encodeConfig(state)
    pendingConfig = serialized
    applyAll()
    notifyAppearance()
    setPersistenceMessage('正在保存到 DSH settings.yaml…')
    void Promise.resolve(host.set('config', serialized)).then(() => {
      if (pendingConfig !== serialized) return
      const snapshot = host.getSnapshot()
      const user = snapshot.user
      const stored = typeof user === 'object' && user !== null && !Array.isArray(user)
        ? (user as { config?: unknown }).config
        : undefined
      pendingConfig = undefined
      if (snapshot.status === 'ready'
        && snapshot.writable
        && snapshot.value?.config === serialized
        && stored === serialized) {
        hasLocalChanges = false
        setPersistenceMessage('已保存到 DSH settings.yaml')
        return
      }
      setPersistenceMessage('保存失败：Host 未接受 ui-appearance.config；当前仅在本页生效')
    }, () => {
      if (pendingConfig !== serialized) return
      pendingConfig = undefined
      setPersistenceMessage('保存失败：无法连接 DSH settings；当前仅在本页生效')
    })
  }

  function setWallpaper(url: string): void {
    state.wallpaper.url = url
    if (url && state.surfaceOpacity === 1) {
      state.surfaceOpacity = 0.5
      if (state.wallpaper.scrim === 0.45) state.wallpaper.scrim = 0.25
    }
    commit()
  }

  function resetAll(): void {
    Object.assign(state, decodeConfig(encodeConfig(DEFAULT_CONFIG)))
    commit()
  }

  function applyVsTheme(text: string): { ok: boolean; changed?: number; schemes?: string; error?: string } {
    let json: { colors?: Record<string, unknown>; type?: string }
    try { json = JSON.parse(text) as { colors?: Record<string, unknown>; type?: string } } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return { ok: false, error: `JSON 解析失败：${message}` }
    }
    const colors = json.colors
    if (!colors || typeof colors !== 'object') return { ok: false, error: '未找到 colors 字段（不是 VS Code 主题 JSON？）' }
    const type = (json.type ?? '').toLowerCase()
    const schemes: ('light' | 'dark')[] = type.includes('dark') ? ['dark'] : type.includes('light') ? ['light'] : ['light', 'dark']
    const MAP: Array<[keyof AppearanceColorSet, string[]]> = [
      ['accent', ['button.background', 'activityBarBadge.background', 'badge.background', 'progressBar.background', 'focusBorder']],
      ['background', ['editor.background', 'editorGroup.background', 'sideBar.background', 'panel.background']],
      ['foreground', ['editor.foreground', 'foreground']],
      ['secondary', ['editorLineNumber.foreground', 'descriptionForeground', 'input.placeholderForeground', 'editorHint.foreground']],
      ['sidebar', ['sideBar.background', 'activityBar.background']],
    ]
    let changed = 0
    for (const scheme of schemes) {
      for (const [field, keys] of MAP) {
        const value = pickColor(colors, keys)
        if (value !== null) {
          state.colors[scheme][field] = normalizeHex(value)
          changed++
        }
      }
    }
    if (changed === 0) return { ok: false, error: '未匹配到可用的颜色字段' }
    commit()
    return { ok: true, changed, schemes: schemes.join(', ') }
  }

  // Apply the immediate snapshot, then adopt the asynchronous Host load. A
  // local edit wins over a late initial read and is never silently discarded.
  applyAll()
  ctx.effect(() => {
    const adopt = (): void => {
      const snapshot = host.getSnapshot()
      if (snapshot.mode === 'memory') {
        setPersistenceMessage('远程浏览器仅保留本页配置，不写入 Host')
        return
      }
      if (snapshot.status === 'loading') {
        setPersistenceMessage('正在读取已保存的外观配置…')
        return
      }
      if (snapshot.status === 'unavailable') {
        setPersistenceMessage('持久化不可用：Host 未暴露 ui-appearance 命名空间')
        return
      }
      if (!snapshot.writable) {
        setPersistenceMessage('持久化不可用：DSH settings 当前为只读')
        return
      }
      const serialized = snapshot.value?.config ?? ''
      if (pendingConfig === undefined && !hasLocalChanges && serialized !== encodeConfig(state)) {
        Object.assign(state, decodeConfig(serialized))
        applyAll()
        notifyAppearance()
      }
      if (pendingConfig === undefined) setPersistenceMessage('已从 DSH settings.yaml 恢复配置')
    }
    const dispose = host.subscribe(adopt)
    adopt()
    return dispose
  }, 'ui-appearance: durable settings adoption')
  ctx.effect(() => () => {
    if (disposeTokens !== null) { disposeTokens(); disposeTokens = null }
    if (disposeCss !== null) { disposeCss(); disposeCss = null }
  }, 'ui-appearance: theme + style layers')

  const themeListeners = new Set<() => void>()
  ctx.on('theme/change', () => { for (const listener of Array.from(themeListeners)) listener() })
  const subscribeTheme = (listener: () => void): () => void => {
    themeListeners.add(listener)
    return () => { themeListeners.delete(listener) }
  }

  const S = {
    section: { display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 760, padding: '4px 2px 40px' },
    h2: { margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--dsw-alias-label-primary)' },
    intro: { margin: 0, fontSize: 13, lineHeight: '20px', color: 'var(--dsw-alias-label-secondary)' },
    group: { display: 'flex', flexDirection: 'column', gap: 10 },
    groupTitle: { fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--dsw-alias-label-secondary)' },
    row: { display: 'flex', alignItems: 'center', gap: 12, minHeight: 30 },
    label: { flex: '0 0 128px', fontSize: 13, color: 'var(--dsw-alias-label-secondary)' },
    value: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)', fontFamily: 'var(--ds-font-family-code)', minWidth: 44, textAlign: 'right' },
    textInput: { flex: 1, minWidth: 0, padding: '6px 8px', fontSize: 13, color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6 },
    colorInput: { width: 36, height: 28, padding: 0, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-1)' },
    range: { flex: 1, minWidth: 0 },
    btn: { padding: '6px 12px', fontSize: 13, color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, cursor: 'pointer' },
    btnActive: { borderColor: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-brand-primary)', boxShadow: 'inset 0 0 0 1px var(--dsw-alias-brand-primary)' },
    btnRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    note: { fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-secondary)' },
    textArea: { width: '100%', minHeight: 160, padding: 8, fontSize: 12, lineHeight: '18px', fontFamily: 'var(--ds-font-family-code)', color: 'var(--dsw-alias-label-primary)', background: 'var(--dsw-alias-bg-layer-1)', border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 6, resize: 'vertical' },
    fileInput: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
  } as const

  function Group(title: string, children: unknown): ReturnType<typeof el> {
    const kids = Array.isArray(children) ? children : [children]
    return el('div', { key: title, style: S.group }, [el('div', { key: 't', style: S.groupTitle }, title)].concat(kids))
  }

  function Row(key: string, children: unknown): ReturnType<typeof el> {
    return el('div', { key, style: S.row }, children as never)
  }

  function ColorField(label: string, value: string, onChange: (v: string) => void): ReturnType<typeof el> {
    return Row(`color-${label}`, [
      el('div', { key: 'l', style: S.label }, label),
      el('input', {
        key: 'c', type: 'color', value, style: S.colorInput,
        onChange: (event) => { onChange((event.target as HTMLInputElement).value) },
      }),
      el('input', {
        key: 't', type: 'text', value, style: S.textInput,
        onChange: (event) => { onChange((event.target as HTMLInputElement).value) },
      }),
    ])
  }

  function SliderField(
    label: string,
    min: number,
    max: number,
    step: number,
    value: number,
    onChange: (v: number) => void,
    fmt: (v: number) => string,
  ): ReturnType<typeof el> {
    return Row(`slider-${label}`, [
      el('div', { key: 'l', style: S.label }, label),
      el('input', {
        key: 'r', type: 'range', min, max, step, value, style: S.range,
        onChange: (event) => { onChange(Number((event.target as HTMLInputElement).value)) },
      }),
      el('div', { key: 'v', style: S.value }, fmt(value)),
    ])
  }

  function TextField(label: string, value: string, onChange: (v: string) => void, placeholder?: string): ReturnType<typeof el> {
    return Row(`text-${label}`, [
      el('div', { key: 'l', style: S.label }, label),
      el('input', {
        key: 'i', type: 'text', value, placeholder: placeholder ?? '', style: S.textInput,
        onChange: (event) => { onChange((event.target as HTMLInputElement).value) },
      }),
    ])
  }

  function FileField(label: string, accept: string, onFile: (file: File) => void): ReturnType<typeof el> {
    return Row(`file-${label}`, [
      el('div', { key: 'l', style: S.label }, label),
      el('input', { key: 'f', type: 'file', accept, style: S.fileInput, onChange: (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) onFile(f) } }),
    ])
  }

  interface ButtonItem {
    id: string
    label: string
    value?: string
    url?: string
  }

  function mkButtons(
    items: ButtonItem[],
    isActive: (item: ButtonItem) => boolean,
    onPick: (item: ButtonItem) => void,
  ): ReturnType<typeof el>[] {
    return items.map(it => el('button', {
      key: it.id,
      type: 'button',
      style: { ...S.btn, ...(isActive(it) ? S.btnActive : {}) },
      onClick: () => { onPick(it) },
    }, it.label))
  }

  function readFileAsDataUrl(file: File, cb: (url: string) => void): void {
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === 'string') cb(reader.result) }
    reader.readAsDataURL(file)
  }

  function readFileAsText(file: File, cb: (text: string) => void): void {
    const reader = new FileReader()
    reader.onload = () => { if (typeof reader.result === 'string') cb(reader.result) }
    reader.readAsText(file)
  }

  function AppearanceSection(): ReturnType<typeof el> {
    const [, bumpState] = useState(0)
    const bump = (): void => { bumpState(value => value + 1) }
    const [scheme, setScheme] = useState<'light' | 'dark'>(() => {
      const active = theme.getTheme().active.colorScheme
      return active === 'dark' ? 'dark' : 'light'
    })
    const [snap, setSnap] = useState(() => theme.getTheme())
    const [status, setStatus] = useState('')
    const [saveStatus, setSaveStatus] = useState(() => persistenceMessage)

    useEffect(() => subscribeTheme(() => { setSnap(theme.getTheme()) }), [])
    useEffect(() => subscribeAppearance(() => {
      setSaveStatus(persistenceMessage)
      bump()
    }), [])

    const pref = snap.preference
    const activeScheme = snap.active.colorScheme
    const colors = state.colors[scheme]
    const activeLabel = activeScheme === 'dark' ? '深色' : '浅色'
    const modeNote = (pref === 'system' ? '跟随系统' : pref === 'dark' ? '深色' : '浅色') + ' · 当前生效：' + activeLabel
    const wallpaperInput = wallpaperInputPresentation(state.wallpaper.url)

    const setColor = (key: keyof AppearanceColorSet, value: string): void => {
      state.colors[scheme][key] = value
      commit()
      bump()
    }

    const onImageFile = (file: File): void => {
      setStatus('正在读取图片…')
      readFileAsDataUrl(file, (url) => { setWallpaper(url); bump(); setStatus('已载入背景图（表面透明度已自动调低）') })
    }
    const onVsFile = (file: File): void => {
      setStatus('正在导入主题…')
      readFileAsText(file, (text) => {
        const r = applyVsTheme(text)
        bump()
        if (r.ok) {
          setStatus(`已导入 VS Code 主题：${r.changed ?? 0} 处（${r.schemes ?? ''}）`)
        } else {
          setStatus(r.error ?? '导入失败')
        }
      })
    }
    const onCssFile = (file: File): void => {
      setStatus('正在读取 CSS…')
      readFileAsText(file, (text) => { state.customCss = text; commit(); bump(); setStatus('已载入自定义 CSS') })
    }

    const modeButtons = mkButtons(
      [{ id: 'light', label: '浅色' }, { id: 'dark', label: '深色' }, { id: 'system', label: '跟随系统' }],
      it => pref === it.id,
      (it) => { theme.setTheme(it.id) },
    )
    const schemeButtons = mkButtons(
      [{ id: 'light', label: '浅色' }, { id: 'dark', label: '深色' }],
      it => scheme === it.id,
      (it) => { setScheme(it.id as 'light' | 'dark') },
    )
    const presetButtons = mkButtons(
      PRESETS,
      () => false,
      (it) => { if (it.url !== undefined) { setWallpaper(it.url); bump() } },
    )
    const uiFontPresets = mkButtons(
      [
        { id: 'inter', label: 'Inter', value: "'Inter', system-ui, sans-serif" },
        { id: 'yahei', label: '雅黑', value: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
        { id: 'default', label: '默认', value: '' },
      ],
      it => state.fonts.ui === (it.value ?? ''),
      (it) => { state.fonts.ui = it.value ?? ''; commit(); bump() },
    )
    const codeFontPresets = mkButtons(
      [
        { id: 'jbm', label: 'JetBrains Mono', value: "'JetBrains Mono', 'Fira Code', monospace" },
        { id: 'fira', label: 'Fira Code', value: "'Fira Code', monospace" },
        { id: 'sfm', label: 'SF Mono', value: "'SF Mono', Menlo, Consolas, monospace" },
        { id: 'default', label: '默认', value: '' },
      ],
      it => state.fonts.code === (it.value ?? ''),
      (it) => { state.fonts.code = it.value ?? ''; commit(); bump() },
    )

    return el('div', { style: S.section }, [
      el('h2', { key: 'h', style: S.h2 }, '外观'),
      el('p', { key: 'i', style: S.intro }, '配置 WebUI 的配色、背景、字体与布局。配置保存为 ui-appearance.config JSON，并在刷新或重启后自动恢复。'),

      Group('主题模式', [
        el('div', { key: 'modes', style: S.btnRow }, modeButtons),
        el('div', { key: 'modeNote', style: S.note }, modeNote),
      ]),

      Group('配色 · ' + (scheme === 'dark' ? '深色' : '浅色'), [
        el('div', { key: 'schemes', style: S.btnRow }, schemeButtons),
        ColorField('强调色', colors.accent, (v) =>{  setColor('accent', v) }),
        ColorField('前景文字', colors.foreground, (v) =>{  setColor('foreground', v) }),
        ColorField('次要文字', colors.secondary, (v) =>{  setColor('secondary', v) }),
        ColorField('背景', colors.background, (v) =>{  setColor('background', v) }),
        ColorField('侧边栏', colors.sidebar, (v) =>{  setColor('sidebar', v) }),
        SliderField('对比度', 0, 1, 0.05, state.contrast, (v) => {
          state.contrast = v; commit(); bump()
        }, v => `${Math.round(v * 100)}%`),
        SliderField('表面透明度', 0.2, 1, 0.05, state.surfaceOpacity, (v) => {
          state.surfaceOpacity = v; commit(); bump()
        }, v => `${Math.round(v * 100)}%`),
        el('div', { key: 'surfaceNote', style: S.note }, '表面透明度越低，背景图越明显（设图时自动调到 50%）；拉满 100% 则不显示背景图。'),
      ]),

      Group('背景图', [
        TextField('图片 URL', wallpaperInput.value, (v) => { setWallpaper(v); bump() }, wallpaperInput.placeholder),
        FileField('本地上传', 'image/*', onImageFile),
        el('div', { key: 'presets', style: S.btnRow }, presetButtons),
        SliderField('遮罩层透明度', 0, 1, 0.05, state.wallpaper.scrim, (v) => {
          state.wallpaper.scrim = v; commit(); bump()
        }, v => `${Math.round(v * 100)}%`),
        el('div', { key: 'scrimNote', style: S.note }, '遮罩层直接压在背景图上，保证前景文字可读。'),
      ]),

      Group('VS Code 主题', [
        FileField('主题 JSON 文件', '.json,application/json', onVsFile),
        el('div', { key: 'vsNote', style: S.note }, '导入 VS Code 主题的 colors 字段，自动映射强调色/背景/前景/次要文字/侧边栏；按 type（light/dark）分别套用。'),
      ]),

      Group('自定义 CSS', [
        el('div', { key: 'cssBtns', style: S.btnRow }, [
          el('button', { key: 'tmpl', type: 'button', style: S.btn, onClick: () => { state.customCss = TEMPLATE_CSS; commit(); bump(); setStatus('已填入模板（可编辑，实时生效）') } }, '填入模板'),
          el('button', { key: 'clear', type: 'button', style: S.btn, onClick: () => { state.customCss = ''; commit(); bump(); setStatus('已清除自定义 CSS') } }, '清除 CSS'),
        ]),
        el('textarea', { key: 'cssTa', value: state.customCss, rows: 10, style: S.textArea, placeholder: '粘贴或编辑自定义 CSS…', onChange: (e) => { state.customCss = (e.target as HTMLTextAreaElement).value; commit(); bump() } }),
        FileField('CSS 文件', '.css,text/css', onCssFile),
        el('div', { key: 'cssNote', style: S.note }, 'CSS 实时注入并生效；覆盖主题 token 需写 body 选择器并加 !important（模板里有示例）。'),
      ]),

      Group('字体', [
        TextField('UI 字体', state.fonts.ui, (v) => { state.fonts.ui = v; commit(); bump() }, "'Inter', system-ui"),
        el('div', { key: 'uiPresets', style: S.btnRow }, uiFontPresets),
        TextField('代码字体', state.fonts.code, (v) => { state.fonts.code = v; commit(); bump() }, "'JetBrains Mono', monospace"),
        el('div', { key: 'codePresets', style: S.btnRow }, codeFontPresets),
      ]),

      Group('侧边栏布局', [
        el('div', { key: 'layout', style: S.btnRow }, [
          el('button', {
            key: 'toggle', type: 'button', style: S.btn,
            onClick: () => { layout.toggleSidebar() },
          }, '折叠 / 展开侧边栏'),
          el('button', {
            key: 'openD', type: 'button', style: S.btn,
            onClick: () => { layout.openDetails() },
          }, '打开详情栏'),
          el('button', {
            key: 'closeD', type: 'button', style: S.btn,
            onClick: () => { layout.closeDetails() },
          }, '关闭详情栏'),
        ]),
        el('div', { key: 'layoutNote', style: S.note }, '侧边栏折叠后保留 56px 控制栏，再次点击展开。'),
      ]),

      el('div', { key: 'footer', style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }, [
        el('button', { key: 'reset', type: 'button', style: S.btn, onClick: resetAll }, '重置全部'),
        el('span', { key: 'status', style: S.note }, status),
        el('span', { key: 'saveStatus', style: S.note }, saveStatus),
      ]),
    ])
  }

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'appearance',
    order: 12,
    label: '外观',
  }, () => el(AppearanceSection)))
}
