// dsh-appearance — 动态 Cordis 插件（Host 侧）：文件读取 RPC
// 提供：dsappearance.info / readText / readImage
// 说明：客户端受限环境无 FileReader，故文件内容由 Host 的 fs 读取后回传。
return {
  apply(ctx) {
    const fs = ctx.get('fs')

    function workspaceRoot() {
      const sp = ctx.get('sandboxPolicy')
      return sp && typeof sp.workspaceRoot === 'string' ? sp.workspaceRoot : ''
    }

    function bytesToBase64(bytes) {
      const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
      let out = ''
      const len = bytes.length
      for (let i = 0; i < len; i += 3) {
        const b0 = bytes[i]
        const b1 = i + 1 < len ? bytes[i + 1] : undefined
        const b2 = i + 2 < len ? bytes[i + 2] : undefined
        out += CHARS[b0 >> 2]
        out += CHARS[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)]
        out += b1 === undefined ? '=' : CHARS[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)]
        out += b2 === undefined ? '=' : CHARS[b2 & 63]
      }
      return out
    }

    function mimeFromPath(path) {
      const m = String(path).toLowerCase().match(/\.([a-z0-9]+)$/)
      const ext = m ? m[1] : ''
      const map = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', bmp: 'image/bmp', avif: 'image/avif', ico: 'image/x-icon' }
      return map[ext] || 'image/png'
    }

    harness.handle('dsappearance.info', async () => ({ ok: true, workspaceRoot: workspaceRoot() }))

    harness.handle('dsappearance.readText', async (args) => {
      if (fs === undefined) return { ok: false, error: 'fs 服务不可用' }
      try {
        const path = String((args && args.path) || '')
        if (!path) return { ok: false, error: '路径为空' }
        const opts = {}
        const root = workspaceRoot()
        if (root) opts.cwd = root
        const target = await fs.resolve(path, opts)
        const text = await fs.readText(target)
        return { ok: true, text: text }
      } catch (e) {
        return { ok: false, error: (e && e.message) ? e.message : String(e) }
      }
    })

    harness.handle('dsappearance.readImage', async (args) => {
      if (fs === undefined) return { ok: false, error: 'fs 服务不可用' }
      try {
        const path = String((args && args.path) || '')
        if (!path) return { ok: false, error: '路径为空' }
        const opts = {}
        const root = workspaceRoot()
        if (root) opts.cwd = root
        const target = await fs.resolve(path, opts)
        const bytes = await fs.readBytes(target, undefined, 10 * 1024 * 1024)
        return { ok: true, dataUrl: 'data:' + mimeFromPath(path) + ';base64,' + bytesToBase64(bytes) }
      } catch (e) {
        return { ok: false, error: (e && e.message) ? e.message : String(e) }
      }
    })
  },
}
