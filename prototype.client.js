// dsh-appearance — 动态 Cordis 插件原型（Client 侧）
// 用法：把本文件的函数体作为 cordis_define 的 code.client；配 host.js 作 code.host。
// 说明：文件读取走 Host 侧 host.js 的 RPC；本侧负责设置面板 UI 与配色/背景/CSS/字体/布局。
return {
  apply(ctx) {
    const theme = ctx.get('theme')
    const layout = ctx.get('layout')
    const slots = ctx.get('slots')
    if (slots === undefined) return

    const BASELINE = {
      light: { accent: '#3964fe', background: '#ffffff', foreground: '#0f1115', secondary: '#61666b', sidebar: '#f5f6f7' },
      dark: { accent: '#6e8bff', background: '#0b0d10', foreground: '#e7e9ec', secondary: '#9ba1a8', sidebar: '#101317' },
    }

    const config = {
      colors: JSON.parse(JSON.stringify(BASELINE)),
      dirty: { accent: false, background: false, foreground: false, secondary: false, sidebar: false },
      contrast: 0,
      contrastDirty: false,
      surfaceOpacity: 1,
      surfaceDirty: false,
      wallpaper: { url: '', scrim: 0.45 },
      fonts: { ui: '', code: '' },
      customCss: '',
    }

    function clamp01(n) { return Math.max(0, Math.min(1, n)) }
    function hexToRgb(hex) {
      if (typeof hex !== 'string') return null
      let h = hex.trim().replace(/^#/, '')
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
      if (!/^[0-9a-fA-F]{6}$/.test(h)) return null
      return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }
    }
    function clamp255(n) { return Math.max(0, Math.min(255, Math.round(n))) }
    function to2(n) { const s = clamp255(n).toString(16); return s.length === 1 ? '0' + s : s }
    function rgbToHex(r, g, b) { return '#' + to2(r) + to2(g) + to2(b) }
    function lerpHex(a, b, t) {
      const A = hexToRgb(a)
      const B = hexToRgb(b)
      if (A === null || B === null) return a
      return rgbToHex(A.r + (B.r - A.r) * t, A.g + (B.g - A.g) * t, A.b + (B.b - A.b) * t)
    }
    function hexToRgba(hex, alpha) {
      const rgb = hexToRgb(hex)
      if (rgb === null) return hex
      return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + clamp01(alpha) + ')'
    }

    let disposeTokens = null
    function buildTokens() {
      const out = {}
      const L = config.colors.light
      const D = config.colors.dark
      const t = config.contrast
      const a = config.surfaceOpacity
      const extreme = { light: '#000000', dark: '#ffffff' }
      if (config.dirty.accent) out['--dsw-alias-brand-primary'] = { light: L.accent, dark: D.accent }
      if (config.dirty.foreground || config.contrastDirty) out['--dsw-alias-label-primary'] = { light: lerpHex(L.foreground, extreme.light, t), dark: lerpHex(D.foreground, extreme.dark, t) }
      if (config.dirty.secondary || config.contrastDirty) out['--dsw-alias-label-secondary'] = { light: lerpHex(L.secondary, extreme.light, t), dark: lerpHex(D.secondary, extreme.dark, t) }
      if (config.dirty.background || config.surfaceDirty) out['--dsw-alias-bg-base'] = { light: hexToRgba(L.background, a), dark: hexToRgba(D.background, a) }
      if (config.dirty.sidebar || config.surfaceDirty) out['--dsw-specific-sidebar-fill'] = { light: hexToRgba(L.sidebar, a), dark: hexToRgba(D.sidebar, a) }
      return out
    }
    function applyTokens() {
      if (disposeTokens !== null) { disposeTokens(); disposeTokens = null }
      if (theme === undefined) return
      const tokens = buildTokens()
      if (Object.keys(tokens).length > 0) disposeTokens = theme.overrideTokens('ds-appearance', tokens)
    }

    let disposeCss = null
    function urlOf(raw) {
      if (raw.indexOf('data:') === 0) return 'url(' + JSON.stringify(raw) + ')'
      return 'url("' + raw + '")'
    }
    function buildCss() {
      const parts = []
      if (config.fonts.ui) parts.push(':root { --dsw-font-family: ' + config.fonts.ui + ' !important; }')
      if (config.fonts.code) parts.push(':root { --ds-font-family-code: ' + config.fonts.code + ' !important; }')
      if (config.wallpaper.url) {
        const s = config.wallpaper.scrim
        parts.push('html { background-color: #000; background-image: linear-gradient(rgba(0,0,0,' + s + '), rgba(0,0,0,' + s + ')), ' + urlOf(config.wallpaper.url) + '; background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed; }')
      } else {
        parts.push('html { background-color: transparent; background-image: none; }')
      }
      if (config.customCss) parts.push(config.customCss)
      return parts.join('\n')
    }
    function applyCss() {
      if (disposeCss !== null) { disposeCss(); disposeCss = null }
      disposeCss = styles.insert(buildCss())
    }

    function commit() { applyTokens(); applyCss() }

    const themeListeners = new Set()
    if (theme !== undefined) {
      ctx.on('theme/change', () => { for (const fn of Array.from(themeListeners)) fn() })
    }
    const subscribeTheme = (fn) => { themeListeners.add(fn); return () => { themeListeners.delete(fn) } }

    function resetAll() {
      config.colors = JSON.parse(JSON.stringify(BASELINE))
      config.dirty = { accent: false, background: false, foreground: false, secondary: false, sidebar: false }
      config.contrast = 0
      config.contrastDirty = false
      config.surfaceOpacity = 1
      config.surfaceDirty = false
      config.wallpaper = { url: '', scrim: 0.45 }
      config.fonts = { ui: '', code: '' }
      config.customCss = ''
      commit()
    }

    function gradientDataUri(c1, c2) {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs><rect width="1600" height="1000" fill="url(#g)"/></svg>'
      return 'data:image/svg+xml,' + encodeURIComponent(svg)
    }
    const PRESETS = [
      { id: 'violet', label: '暮色紫', url: gradientDataUri('#7c3aed', '#1e1b4b') },
      { id: 'ocean', label: '深海蓝', url: gradientDataUri('#0ea5e9', '#0b0d10') },
      { id: 'jade', label: '翡翠绿', url: gradientDataUri('#10b981', '#04211f') },
      { id: 'ember', label: '暖橙', url: gradientDataUri('#f97316', '#3b0a12') },
    ]

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

    function normalizeHex(v) {
      const s = String(v).trim()
      if (s[0] === '#' && (s.length === 7 || s.length === 9)) return s.slice(0, 7)
      return s
    }

    function pickColor(colors, keys) {
      for (let i = 0; i < keys.length; i++) {
        const v = colors[keys[i]]
        if (typeof v === 'string' && v.length > 0) return v
      }
      return null
    }

    function applyVsTheme(text) {
      let json
      try { json = JSON.parse(text) } catch (e) { return { ok: false, error: 'JSON 解析失败：' + ((e && e.message) || e) } }
      const colors = json && json.colors
      if (!colors || typeof colors !== 'object') return { ok: false, error: '未找到 colors 字段（不是 VS Code 主题 JSON？）' }
      const type = String(json.type || '').toLowerCase()
      const schemes = []
      if (type.indexOf('dark') >= 0) schemes.push('dark')
      else if (type.indexOf('light') >= 0) schemes.push('light')
      else schemes.push('light', 'dark')
      const MAP = [
        ['accent', ['button.background', 'activityBarBadge.background', 'badge.background', 'progressBar.background', 'focusBorder']],
        ['background', ['editor.background', 'editorGroup.background', 'sideBar.background', 'panel.background']],
        ['foreground', ['editor.foreground', 'foreground']],
        ['secondary', ['editorLineNumber.foreground', 'descriptionForeground', 'input.placeholderForeground', 'editorHint.foreground']],
        ['sidebar', ['sideBar.background', 'activityBar.background']],
      ]
      let changed = 0
      for (let s = 0; s < schemes.length; s++) {
        const scheme = schemes[s]
        for (let m = 0; m < MAP.length; m++) {
          const field = MAP[m][0]
          const keys = MAP[m][1]
          const v = pickColor(colors, keys)
          if (v !== null) {
            config.colors[scheme][field] = normalizeHex(v)
            config.dirty[field] = true
            changed++
          }
        }
      }
      if (changed === 0) return { ok: false, error: '未匹配到可用的颜色字段' }
      commit()
      return { ok: true, changed: changed, schemes: schemes.join(', ') }
    }

    const el = React.createElement
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
    }

    function Group(title, children) {
      const kids = Array.isArray(children) ? children : [children]
      return el('div', { style: S.group }, [el('div', { key: 't', style: S.groupTitle }, title)].concat(kids))
    }

    function Row(children) { return el('div', { style: S.row }, children) }

    function ColorField(label, value, onChange) {
      return Row([
        el('div', { key: 'l', style: S.label }, label),
        el('input', { key: 'c', type: 'color', value: value, style: S.colorInput, onChange: (e) => onChange(e.target.value) }),
        el('input', { key: 't', type: 'text', value: value, style: S.textInput, onChange: (e) => onChange(e.target.value) }),
      ])
    }

    function SliderField(label, min, max, step, value, onChange, fmt) {
      return Row([
        el('div', { key: 'l', style: S.label }, label),
        el('input', { key: 'r', type: 'range', min: min, max: max, step: step, value: value, style: S.range, onChange: (e) => onChange(Number(e.target.value)) }),
        el('div', { key: 'v', style: S.value }, fmt(value)),
      ])
    }

    function TextField(label, value, onChange, placeholder) {
      return Row([
        el('div', { key: 'l', style: S.label }, label),
        el('input', { key: 'i', type: 'text', value: value, placeholder: placeholder || '', style: S.textInput, onChange: (e) => onChange(e.target.value) }),
      ])
    }

    function PathRow(label, value, onChange, onAction, actionLabel) {
      return Row([
        el('div', { key: 'l', style: S.label }, label),
        el('input', { key: 'i', type: 'text', value: value, placeholder: '绝对路径或相对工作区路径', style: S.textInput, onChange: (e) => onChange(e.target.value) }),
        el('button', { key: 'b', type: 'button', style: S.btn, onClick: onAction }, actionLabel),
      ])
    }

    function mkButtons(items, isActive, onPick) {
      return items.map((it) => el('button', {
        key: it.id,
        type: 'button',
        style: Object.assign({}, S.btn, isActive(it) ? S.btnActive : {}),
        onClick: () => onPick(it),
      }, it.label))
    }

    function AppearanceSection() {
      const [, bumpState] = React.useState(0)
      const bump = () => bumpState((n) => n + 1)
      const [scheme, setScheme] = React.useState(() => {
        if (theme === undefined) return 'light'
        return theme.getTheme().active.colorScheme === 'dark' ? 'dark' : 'light'
      })
      const [snap, setSnap] = React.useState(() => (theme !== undefined ? theme.getTheme() : null))
      const [imgPath, setImgPath] = React.useState('')
      const [vsPath, setVsPath] = React.useState('')
      const [cssPath, setCssPath] = React.useState('')
      const [status, setStatus] = React.useState('')
      const [workspaceRoot, setWorkspaceRoot] = React.useState('')

      React.useEffect(() => {
        if (theme === undefined) return undefined
        return subscribeTheme(() => setSnap(theme.getTheme()))
      }, [])

      React.useEffect(() => {
        let alive = true
        host.call('dsappearance.info').then((res) => {
          if (alive && res && res.ok) setWorkspaceRoot(res.workspaceRoot || '')
        }).catch(() => {})
        return () => { alive = false }
      }, [])

      const pref = snap !== null ? snap.preference : 'system'
      const activeScheme = snap !== null ? snap.active.colorScheme : 'light'
      const c = config.colors[scheme]
      const activeLabel = activeScheme === 'dark' ? '深色' : '浅色'
      const modeNote = (pref === 'system' ? '跟随系统' : pref === 'dark' ? '深色' : '浅色') + ' · 当前生效：' + activeLabel

      const setColor = (key, value) => {
        config.colors[scheme][key] = value
        config.dirty[key] = true
        commit()
        bump()
      }

      const readImage = () => {
        setStatus('正在读取图片…')
        host.call('dsappearance.readImage', { path: imgPath }).then((res) => {
          if (res && res.ok) {
            config.wallpaper.url = res.dataUrl
            commit()
            bump()
            setStatus('已载入背景图')
          } else {
            setStatus((res && res.error) || '读取失败')
          }
        }).catch((e) => setStatus('读取失败：' + ((e && e.message) || e)))
      }

      const importVs = () => {
        setStatus('正在导入主题…')
        host.call('dsappearance.readText', { path: vsPath }).then((res) => {
          if (!res || !res.ok) { setStatus((res && res.error) || '读取失败'); return }
          const r = applyVsTheme(res.text)
          bump()
          setStatus(r.ok ? ('已导入 VS Code 主题：' + r.changed + ' 处（' + r.schemes + '）') : r.error)
        }).catch((e) => setStatus('导入失败：' + ((e && e.message) || e)))
      }

      const loadCss = () => {
        setStatus('正在读取 CSS…')
        host.call('dsappearance.readText', { path: cssPath }).then((res) => {
          if (res && res.ok) {
            config.customCss = res.text
            commit()
            bump()
            setStatus('已载入自定义 CSS')
          } else {
            setStatus((res && res.error) || '读取失败')
          }
        }).catch((e) => setStatus('读取失败：' + ((e && e.message) || e)))
      }

      const fillTemplate = () => {
        config.customCss = TEMPLATE_CSS
        commit()
        bump()
        setStatus('已填入模板（可编辑，实时生效）')
      }

      const modeButtons = mkButtons(
        [{ id: 'light', label: '浅色' }, { id: 'dark', label: '深色' }, { id: 'system', label: '跟随系统' }],
        (it) => pref === it.id,
        (it) => { if (theme !== undefined) theme.setTheme(it.id) },
      )

      const schemeButtons = mkButtons(
        [{ id: 'light', label: '浅色' }, { id: 'dark', label: '深色' }],
        (it) => scheme === it.id,
        (it) => setScheme(it.id),
      )

      const presetButtons = mkButtons(
        PRESETS,
        () => false,
        (it) => { config.wallpaper.url = it.url; commit(); bump() },
      )

      const uiFontPresets = mkButtons(
        [
          { id: 'inter', label: 'Inter', value: "'Inter', system-ui, sans-serif" },
          { id: 'yahei', label: '雅黑', value: "'Microsoft YaHei', 'PingFang SC', sans-serif" },
          { id: 'default', label: '默认', value: '' },
        ],
        (it) => config.fonts.ui === it.value,
        (it) => { config.fonts.ui = it.value; commit(); bump() },
      )

      const codeFontPresets = mkButtons(
        [
          { id: 'jbm', label: 'JetBrains Mono', value: "'JetBrains Mono', 'Fira Code', monospace" },
          { id: 'fira', label: 'Fira Code', value: "'Fira Code', monospace" },
          { id: 'sfm', label: 'SF Mono', value: "'SF Mono', Menlo, Consolas, monospace" },
          { id: 'default', label: '默认', value: '' },
        ],
        (it) => config.fonts.code === it.value,
        (it) => { config.fonts.code = it.value; commit(); bump() },
      )

      const statusText = status !== '' ? status : (workspaceRoot !== '' ? '工作区：' + workspaceRoot : '')

      return el('div', { style: S.section }, [
        el('h2', { key: 'h', style: S.h2 }, '外观'),
        el('p', { key: 'i', style: S.intro }, '配置 WebUI 的配色、背景、字体与布局。配色按深色/浅色分别生效，并与“跟随系统”联动。'),

        Group('主题模式', [
          el('div', { key: 'modes', style: S.btnRow }, modeButtons),
          el('div', { key: 'modeNote', style: S.note }, modeNote),
        ]),

        Group('配色 · ' + (scheme === 'dark' ? '深色' : '浅色'), [
          el('div', { key: 'schemes', style: S.btnRow }, schemeButtons),
          ColorField('强调色', c.accent, (v) => setColor('accent', v)),
          ColorField('前景文字', c.foreground, (v) => setColor('foreground', v)),
          ColorField('次要文字', c.secondary, (v) => setColor('secondary', v)),
          ColorField('背景', c.background, (v) => setColor('background', v)),
          ColorField('侧边栏', c.sidebar, (v) => setColor('sidebar', v)),
          SliderField('对比度', 0, 1, 0.05, config.contrast, (v) => { config.contrast = v; config.contrastDirty = true; commit(); bump() }, (v) => Math.round(v * 100) + '%'),
          SliderField('表面透明度', 0.3, 1, 0.05, config.surfaceOpacity, (v) => { config.surfaceOpacity = v; config.surfaceDirty = true; commit(); bump() }, (v) => Math.round(v * 100) + '%'),
          el('div', { key: 'surfaceNote', style: S.note }, '表面透明度调低后，背景图会透过页面与侧边栏显示。'),
        ]),

        Group('背景图', [
          TextField('图片 URL', config.wallpaper.url, (v) => { config.wallpaper.url = v; commit(); bump() }, 'https://… 或 data:image/…'),
          PathRow('图片路径', imgPath, setImgPath, readImage, '读取图片'),
          el('div', { key: 'presets', style: S.btnRow }, presetButtons),
          SliderField('遮罩层透明度', 0, 1, 0.05, config.wallpaper.scrim, (v) => { config.wallpaper.scrim = v; commit(); bump() }, (v) => Math.round(v * 100) + '%'),
          el('div', { key: 'scrimNote', style: S.note }, '遮罩层直接压在背景图上，保证前景文字可读。图片路径会经 Host 读取为 data URL。'),
        ]),

        Group('VS Code 主题', [
          PathRow('主题 JSON 路径', vsPath, setVsPath, importVs, '导入主题'),
          el('div', { key: 'vsNote', style: S.note }, '导入 VS Code 主题的 colors 字段，自动映射强调色/背景/前景/次要文字/侧边栏；按 type（light/dark）分别套用。'),
        ]),

        Group('自定义 CSS', [
          el('div', { key: 'cssBtns', style: S.btnRow }, [
            el('button', { key: 'tmpl', type: 'button', style: S.btn, onClick: fillTemplate }, '填入模板'),
            el('button', { key: 'clear', type: 'button', style: S.btn, onClick: () => { config.customCss = ''; commit(); bump(); setStatus('已清除自定义 CSS') } }, '清除 CSS'),
          ]),
          el('textarea', { key: 'cssTa', value: config.customCss, rows: 10, style: S.textArea, placeholder: '粘贴或编辑自定义 CSS…', onChange: (e) => { config.customCss = e.target.value; commit(); bump() } }),
          PathRow('CSS 文件路径', cssPath, setCssPath, loadCss, '读取 CSS'),
          el('div', { key: 'cssNote', style: S.note }, 'CSS 实时注入并生效；覆盖主题 token 需写 body 选择器并加 !important（模板里有示例）。'),
        ]),

        Group('字体', [
          TextField('UI 字体', config.fonts.ui, (v) => { config.fonts.ui = v; commit(); bump() }, "'Inter', system-ui"),
          el('div', { key: 'uiPresets', style: S.btnRow }, uiFontPresets),
          TextField('代码字体', config.fonts.code, (v) => { config.fonts.code = v; commit(); bump() }, "'JetBrains Mono', monospace"),
          el('div', { key: 'codePresets', style: S.btnRow }, codeFontPresets),
        ]),

        Group('侧边栏布局', [
          el('div', { key: 'layout', style: S.btnRow }, [
            el('button', { key: 'toggle', type: 'button', style: S.btn, onClick: () => { if (layout !== undefined) layout.toggleSidebar() } }, '折叠 / 展开侧边栏'),
            el('button', { key: 'openD', type: 'button', style: S.btn, onClick: () => { if (layout !== undefined) layout.openDetails() } }, '打开详情栏'),
            el('button', { key: 'closeD', type: 'button', style: S.btn, onClick: () => { if (layout !== undefined) layout.closeDetails() } }, '关闭详情栏'),
          ]),
          el('div', { key: 'layoutNote', style: S.note }, '侧边栏折叠后保留 56px 控制栏，再次点击展开。'),
        ]),

        el('div', { key: 'footer', style: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' } }, [
          el('button', { key: 'reset', type: 'button', style: S.btn, onClick: resetAll }, '重置全部'),
          el('span', { key: 'status', style: S.note }, statusText),
        ]),
      ])
    }

    slots.inject('settings.section', () => slots.register({
      name: 'settings.section',
      id: 'appearance',
      order: 12,
      label: '外观',
    }, () => el(AppearanceSection)))
  },
}
