# dsh-appearance — DeepSeek Harness 外观配置插件

为 DeepSeek Harness WebUI 提供一套完整的「外观」配置：在设置面板里新增独立的「外观」栏（与 通用 / 模型 / 插件 并列），用 GUI 配置配色、主题、背景图、字体与侧边栏布局。

> [!IMPORTANT]
> 本目录保留的是早期动态 Cordis 原型，不是当前正式安装源。正式、可持久化的实现位于 [`../packages/client/ui-appearance`](../packages/client/ui-appearance)。请勿重新导入这里的动态原型替换正式包，否则动态原型的配置仍只在当前页面内存中有效。

## 功能

- **独立设置栏**：注册到 `settings.section`（order 12，介于「模型」与「插件」之间）
- **主题模式**：浅色 / 深色 / 跟随系统（`theme.setTheme('light'|'dark'|'system')`）
- **配色**：强调色、前景文字、次要文字、背景、侧边栏背景，按深色/浅色分别设置
- **统一强调色**：链接、文件夹、对话选中态与发送按钮使用同一配置色相
- **对比度**：文本向极端色插值，提高可读性
- **背景图**：URL / data URI / 预设渐变 / **本地图片上传**（路径 → Host 读文件 → data URL）+ 遮罩层透明度 + 表面透明度
- **VS Code 主题导入**：上传 VS Code 主题 JSON，自动映射 `colors` 字段到配色
- **自定义 CSS**：内置模板 + 内联编辑实时生效 + 从文件读取
- **字体**：UI 字体（`--dsw-font-family`）、代码字体（`--ds-font-family-code`）
- **侧边栏布局**：折叠/展开、详情栏开合

## 能力映射（harness 扩展点）

| 功能 | 落点 |
| --- | --- |
| 设置栏 | `settings.section` Slot（list，`{id, order, label}`） |
| 配色 / 对比度 | `theme.overrideTokens(source, { token: { light, dark } })` |
| 跟随系统 | `theme.setTheme('system')` + `theme/change` + `getTheme().active.colorScheme` |
| 背景图 / 遮罩 | `styles.insert(css)` 在 `body` 绘制唯一背景画布（主题色 tint + 遮罩 gradient + 图） |
| 表面透明度 | 有背景图时让 `--dsw-alias-bg-base` 透明，只保留单层 tint；侧边栏单独使用 rgba |
| 字体 / 自定义 CSS | `styles.insert` 覆盖 `--dsw-font-family` / `--ds-font-family-code` + 注入原始 CSS |
| 文件上传 | Host `fs.readBytes`/`readText` + `harness.handle` + 客户端 `host.call`（纯 JS base64） |
| VS Code 主题映射 | JSON `colors` 字段 → `--dsw-alias-*`（按 `type` 分 light/dark） |
| 侧边栏 | `layout.toggleSidebar()` / `openDetails()` / `closeDetails()` |

## 结构

- `host.js` — Host 侧：`dsappearance.info` / `readText` / `readImage` RPC
- `prototype.client.js` — Client 侧：设置面板 UI + 配色/背景/CSS/字体/布局逻辑

## 现状

- **正式包已完成**：[`../packages/client/ui-appearance`](../packages/client/ui-appearance)。
- 正式包将完整主题作为 `ui-appearance.config` 写入 DSH 的 `settings.yaml`；颜色、透明度、字体、自定义 CSS，以及上传后转成 data URL 的图片都会随刷新和 DSH 重启恢复。
- **本目录仍是历史原型**：动态 Cordis 插件（Host + Client），配置只存页面内存，重启即失效。原型仅同步了单层背景画布修复，便于对照和维护。

## 正式包迁移状态

1. [x] 原型验证 UX
2. [x] 落成 `packages/client/ui-appearance`（monorepo 包）
3. [x] 接入 Web 组合与 Host settings scope
4. [x] 完整配置 JSON 持久化、刷新与重启恢复
5. [x] 背景改为单层画布，避免多层 50% 叠加后几乎不透明
6. [ ] VS Code 主题映射继续补全 state / border / layer / tokenColors

## 已知限制（原型）

- 上传走「路径 → Host 读文件」，非浏览器拖拽（动态客户端受限环境无 `FileReader`）
- 本目录原型无持久化；正式包已有持久化
- 遮罩为单一黑色，未按深浅色分开
- VS Code 映射覆盖 5 个主字段，state/border/layer 待补全
