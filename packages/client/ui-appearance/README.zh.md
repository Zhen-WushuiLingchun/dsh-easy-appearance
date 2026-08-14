# @deepseek-ai/dsh-client-ui-appearance

[English](README.md) | 中文

DeepSeek Harness WebUI 的外观设置插件。该插件提供「外观」设置页，用于配置深浅色配色、背景图、字体、VS Code 主题导入、自定义 CSS 与侧边栏控制。

## 行为

- 颜色覆盖包括强调色、前景、次要文字、基础背景和侧边栏，深色与浅色分别保存；当前生效的配色仍跟随 `ui-theme` 的 `light`／`dark`／`system` 偏好。
- 一个强调色会同时投影到 WebUI 的 brand、business-state 和 info-button 语义 token，因此发送按钮、链接、文件夹、选中标签、光标和焦点强调都使用配置的色相，不再回退到默认蓝色；禁用控件仍保留组件既有的低透明度状态。
- 背景图可以是 HTTP URL、预设 SVG data URL，或由 `FileReader` 转换为 data URL 的本地上传图片。
- 背景图透明度只在文档画布上应用一次。启用背景图时，嵌套应用表面使用透明的基础 token，避免多层背景反复叠加同一个透明度。
- VS Code 导入器把选定的 `colors` 字段映射到五项颜色覆盖。
- UI 字体、代码字体和自定义 CSS 通过插件自有的 style 元素实时应用。
- 侧边栏按钮调用 `ui-layout`；布局状态仍由该服务拥有，不写入外观 JSON。

## 持久化

Host 半依赖 settings 服务并注册 `ui-appearance`。浏览器异步加载该 namespace，应用已接受的 `config`，并把每次编辑写成一段 JSON 字符串。只有 Host 用户层回读到完全相同的字符串时，界面才会报告保存成功。使用默认文件提供方时，文档位于 `$DSH_HOME/settings.yaml`：

```yaml
ui-appearance:
  config: '{"colors": {"light": {}, "dark": {}}, "wallpaper": {"url": "data:image/..."}}'
```

实际 JSON 包含全部颜色、对比度、透明度、背景图、字体和自定义 CSS 字段。因此上传图片的 data URL 也属于同一个持久化值，会在页面刷新或 DSH 重启后恢复。远程非回环浏览器无法访问特权 settings API，配置仍只保留在内存中。

## 启用与禁用

在当前 web profile 的 `cordis.patch.yml` 中添加或移除 `ui-appearance` 配置项：

```yaml
- insert:
    - id: ui-appearance
      name: '@deepseek-ai/dsh-client-ui-appearance'
```

## 模型体验

无，因为外观配置只影响浏览器展示；这里没有任何内容会进入模型请求。

#### KV Cache 影响

无；该包既不组装也不发送提供方请求。

## 已知限制与暂缓事项

- 内联 data URL 会让 settings 文档随上传图片增大；该插件不维护独立的图片资产存储。
- VS Code 导入器只映射五个主字段；state 色、边框、layer 与 `tokenColors` 尚未映射。
- 背景图遮罩在深浅色下共用同一种深色 tint。
