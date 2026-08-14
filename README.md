# dsh-appearance — DeepSeek Harness 外观配置插件

为 DeepSeek Harness WebUI 提供一套完整的「外观」配置：在设置面板里新增独立的「外观」栏（与 通用 / 模型 / 插件 并列），用 GUI 配置配色、主题、背景图、字体与侧边栏布局。

## 功能

- **独立设置栏**：注册到 `settings.section`（order 12，介于「模型」与「插件」之间）
- **主题模式**：浅色 / 深色 / 跟随系统（`theme.setTheme('light'|'dark'|'system')`）
- **配色**：强调色、前景文字、次要文字、背景、侧边栏背景，按深色/浅色分别设置
- **对比度**：文本向极端色插值，提高可读性
- **背景图**：URL / data URI / 预设渐变 + 遮罩层透明度（压在图上保证可读）+ 表面透明度（让图透出）
- **字体**：UI 字体（`--dsw-font-family`）、代码字体（`--ds-font-family-code`）
- **侧边栏布局**：折叠/展开、详情栏开合

## 能力映射（harness 扩展点）

| 功能 | 落点 |
| --- | --- |
| 设置栏 | `settings.section` Slot（list，`{id, order, label}`） |
| 配色 / 对比度 | `theme.overrideTokens(source, { token: { light, dark } })` |
| 跟随系统 | `theme.setTheme('system')` + `theme/change` + `getTheme().active.colorScheme` |
| 背景图 / 遮罩 | `styles.insert(css)` 给 `html` 注入 `background-image`（遮罩 gradient + 图） |
| 表面透明度 | 把 `--dsw-alias-bg-base` / `--dsw-specific-sidebar-fill` 设为 rgba |
| 字体 | `styles.insert` 覆盖 `--dsw-font-family` / `--ds-font-family-code` |
| 侧边栏 | `layout.toggleSidebar()` / `openDetails()` / `closeDetails()` |

## 现状

- **原型**：动态 Cordis 插件 `appear-3`（仅 Client 侧），本会话内可运行验证 UX。
- 配置仅存内存，重启即失效（动态插件按规矩不做持久化）。

## 路线图（固化为正式包）

1. 原型验证 UX（当前阶段）
2. 落成 `packages/client/ui-appearance`（monorepo 包）
3. 接入 web 组合 + 构建；配置持久化到 settings scope
4. 补本地图片上传（Host 侧读文件 / data URI）
5. 补本地化字典（zh/en）

## 已知限制（原型）

- 无本地上传（动态客户端受限环境无 `FileReader`）；用 URL / data URI
- 无持久化
- 遮罩为单一黑色，未按深浅色分开
