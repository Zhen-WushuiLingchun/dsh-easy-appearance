<div align="center">
  <img src="assets/dsh-easy-appearance-icon.png" alt="dsh-easy-appearance 图标" width="150">

# dsh-easy-appearance

DeepSeek Harness WebUI 的持久化外观插件

[English](README.en.md) · [安装](#安装到匹配的-dsh-源码树) · [配置说明](#配置说明) · [故障排查](#故障排查)

[![MIT License](https://img.shields.io/badge/license-MIT-8EA2EE.svg)](LICENSE)
[![Tested with DSH](https://img.shields.io/badge/DSH-tested-14b8a6.svg)](#已验证快照)
[![Release](https://img.shields.io/github/v/release/Zhen-WushuiLingchun/dsh-easy-appearance?include_prereleases)](https://github.com/Zhen-WushuiLingchun/dsh-easy-appearance/releases)
</div>

社区维护的 DeepSeek Harness WebUI 外观扩展。它把浅色/深色配色、背景图、透明度、字体、VS Code 主题映射和自定义 CSS 集成进 DSH 原生“设置 → 外观”页面，并通过 Host settings 服务持久化完整配置。

> [!IMPORTANT]
> 本仓库发布的是已经在 DSH 源码树中完成构建、测试和重启恢复验证的正式包快照，不是早期的内存态动态原型。本项目不是 DeepSeek 官方发行物。

![壁纸与统一强调色展示](assets/appearance-showcase.png)

> 展示图和配置图已去除真实工作区、路径与会话内容；其作用是演示插件外观，实际控件以当前 DSH 版本为准。

## 功能一览

| 能力 | 行为 |
| --- | --- |
| 浅色 / 深色 / 跟随系统 | 继续使用 DSH `ui-theme` 的模式选择，并分别维护浅色与深色配色 |
| 统一强调色 | 同时映射品牌色、业务状态色和信息按钮 token，使对话标签、文件夹、链接、焦点、光标与发送按钮保持一致 |
| 背景图 | 支持 HTTP(S) URL、本地图片上传和四个内置渐变预设 |
| 透明度与遮罩 | 表面透明度控制内容层可见度；独立遮罩保证文字可读 |
| 字体 | 可设置 UI 字体和代码字体，并提供常用预设 |
| VS Code 主题导入 | 从主题 JSON 的 `colors` 字段映射五类核心颜色 |
| 自定义 CSS | 文本或 `.css` 文件实时注入，并随配置持久化 |
| 布局快捷操作 | 折叠/展开侧边栏，打开/关闭详情栏 |
| Host 持久化 | 刷新、卸载/重载插件或重启 DSH 后恢复；写入后会从 Host user layer 精确回读确认 |

## 展示

### 配置页面

![外观配置页面](assets/appearance-settings.png)

设置页直接嵌入 DSH 原有设置面板，不建立第二套配置程序。浅色和深色各自保存一套强调色、文字、背景与侧边栏颜色；切换方案只编辑目标方案，不会覆盖另一套颜色。

### 一处配色，覆盖主要交互状态

![强调色 token 覆盖示意](assets/accent-token-coverage.png)

早期版本只覆盖 `brand-primary`，因此发送按钮、文件夹、链接和当前对话标签仍可能保留 WebUI 默认蓝色。正式版把同一个强调色投射到这些语义 token：

```text
--dsw-alias-brand-primary
--dsw-alias-brand-primary-new-colorprimary-new-color
--dsw-alias-state-business-primary
--dsw-alias-state-business-tertiary
--dsw-alias-button-info-fill
--dsw-alias-button-info-hover
```

禁用按钮仍保留组件自身的降透明度规则；只有可交互/激活状态使用配置的强调色。

## 已验证快照

| 项目 | 值 |
| --- | --- |
| 插件包 | `@deepseek-ai/dsh-client-ui-appearance` `0.1.0-rc.5` |
| DSH 基线提交 | `47f943859bef60e4160492346772ded9b24f765a` |
| 验证日期 | 2026-08-14 |
| 正式源码与构建产物 | `packages/client/ui-appearance/` |
| 最小集成补丁 | `integration/deepseek-harness-0.1.0-rc.5.patch` |
| 文件树摘要 | `82bde6c5f87a3270f6be4f62ddf154e35f57f4b6c4f780bdac43f6a502d06787` |

发布目录中的正式包与本机在线验证的包逐字节一致：39 个文件，摘要和来源记录见 [`integration/tested-snapshot.json`](integration/tested-snapshot.json)。

旧版 `host.js` / `prototype.client.js` 已移入 [`legacy-prototype/`](legacy-prototype/README.md)，仅用于历史参考。它只在浏览器内存中保存配置，不是推荐安装方式。

## 安装到匹配的 DSH 源码树

### 前提

- Windows PowerShell 5.1 或 PowerShell 7+
- Git
- 与快照兼容的 DeepSeek Harness 源码树
- DSH 使用的 Node.js 与 pnpm 环境
- 目标工作树应干净，或至少已经备份自己的修改

### 自动安装

```powershell
git clone https://github.com/Zhen-WushuiLingchun/dsh-easy-appearance.git
cd dsh-easy-appearance

./scripts/install-into-dsh.ps1 -HarnessPath D:\path\to\deepseek-harness

cd D:\path\to\deepseek-harness
pnpm install
pnpm --filter @deepseek-ai/dsh-client-ui-appearance bundle
pnpm run build:web
```

安装脚本会：

1. 验证目标确实是 DSH Git 工作树；
2. 先执行 `git apply --check`；
3. 复制已经验证的正式包；
4. 应用 Web bundle、API proxy 与 TypeScript 引用所需的最小补丁；
5. 在目标插件目录已存在时停止，绝不静默覆盖。

可以先预览，不写入：

```powershell
./scripts/install-into-dsh.ps1 -HarnessPath D:\path\to\deepseek-harness -WhatIf
```

> [!NOTE]
> 集成补丁以表格中的 DSH 基线提交制作。若 `git apply --check` 失败，说明目标版本已有结构变化；请根据补丁逐处迁移，不要强行应用。

### 启用插件

活动 Web profile 的 `.dsh-home/profiles/web/cordis.patch.yml` 应包含：

```yaml
- insert:
    - id: ui-appearance
      name: '@deepseek-ai/dsh-client-ui-appearance'
```

安装脚本会把默认启用行纳入最小补丁。重新构建并启动 DSH 后，在“设置”里应看到“外观”。

## 配置说明

### 主题与配色

- **主题模式**：浅色、深色或跟随系统；模式选择仍由 DSH `ui-theme` 管理。
- **配色目标**：可以先选“配色 · 浅色/深色”，再编辑对应方案。
- **强调色**：对话标签、文件夹、链接、发送按钮、选中状态和焦点状态。
- **前景/次要文字**：主要正文与辅助信息。
- **背景/侧边栏**：基础 WebUI 表面；启用壁纸时基础背景 token 会透明化。
- **对比度**：对表面明暗做统一调整。
- **表面透明度**：越低越能看到壁纸；选择图片时自动调到 50%，100% 时壁纸被不透明表面遮住。

### 背景图

- 在“图片 URL”中填写 `https://...` 或 `data:image/...`；
- 通过“本地上传”选择图片，浏览器会使用 `FileReader` 转为 data URL；
- 使用“暮色紫、深海蓝、翡翠绿、暖橙”内置预设；
- 调整遮罩透明度，在壁纸可见度和文字对比度之间取平衡。

壁纸只绘制在一个 `body` 画布上。启用后，共享基础背景 token 变为透明，避免多个嵌套容器重复叠加 50% 透明度而把图片盖住。

### VS Code 主题

选择 VS Code 主题 JSON 后，插件读取顶层 `type` 与 `colors`，并把可用字段映射到强调色、背景、前景、次要文字和侧边栏。`tokenColors`、全部边框和复杂状态色暂不映射。

### 字体与自定义 CSS

- UI 字体：支持任意 CSS `font-family`，并提供 Inter、微软雅黑与默认值；
- 代码字体：提供 JetBrains Mono、Fira Code、SF Mono 与默认值；
- 自定义 CSS：支持直接编辑或载入 `.css` 文件，实时写入插件自己的 `<style>`；
- 覆盖主题 token 时，通常需要 `body` 选择器与 `!important`，设置页内置模板可作为起点。

## 持久化原理

Host 端注册 `ui-appearance` settings namespace。浏览器端把完整 `AppearanceConfig` 序列化为一个 `ui-appearance.config` JSON 字符串；每次保存后，再从 Host user layer 读回并比较完整字符串。默认文件 provider 写入：

```text
$DSH_HOME/settings.yaml
```

文件结构类似：

```yaml
ui-appearance:
  config: '{"colors":{"light":{},"dark":{}},"wallpaper":{"url":"data:image/..."}}'
```

实际 JSON 同时包含：

```text
colors.light / colors.dark
contrast
surfaceOpacity
wallpaper.url / wallpaper.scrim
fonts.ui / fonts.code
customCss
```

因此颜色、透明度、字体、自定义 CSS 和上传后的背景图都会在刷新及 DSH 重启后恢复。上传图片的 data URL 也在同一个持久值内，所以大图会显著增大 `settings.yaml`；本版本尚未建立单独的图片资产库。

远程且非 loopback 的浏览器不会获得高权限 settings API，此时插件只能保持当前页面内存状态。这是安全边界，不是持久化故障。

## 验证与开发

### 校验发布快照

```powershell
./scripts/verify-tested-snapshot.ps1

# 可选：和现存 DSH 中的插件包逐文件比较
./scripts/verify-tested-snapshot.ps1 `
  -ReferencePath D:\deepseek-harness\packages\client\ui-appearance
```

### 在 DSH 仓库运行测试

```powershell
pnpm exec vitest run `
  packages/client/ui-appearance/tests `
  packages/host/apiproxy/tests/api-proxy-config.spec.ts

pnpm run verify-cordis-config
pnpm run build:web
```

本快照的本机验证结果：

- 插件与 API proxy：4 个测试文件、37 项通过；
- 完整 GUI：275 个测试文件、3764 项通过、1 项跳过；
- Cordis：120 个配置全部通过；
- 生产 Web bundle 与插件 bundle 构建完成；
- 已验证背景配置在页面刷新和 DSH 进程重启后恢复；
- 已验证发布包和在线测试包 39 个文件逐字节相同。

GitHub Actions 会在提交和拉取请求上重复执行快照检查、补丁安装、依赖安装、聚焦测试和 bundle 构建。

## 故障排查

### 设置中没有“外观”

确认以下三处同时存在：插件包、Web bundle 的 Cordis 注册/依赖、活动 profile 的 `ui-appearance` insert 行。随后重新运行 `pnpm install`、插件 bundle 和 `pnpm run build:web`。

### 图片已经配置，但页面看不到

1. 确认“表面透明度”低于 100%；
2. 暂时减小遮罩层透明度；
3. 检查 `settings.yaml` 的 `ui-appearance.config` 是否仍包含 `wallpaper.url`；
4. 强制刷新页面以加载最新 Web bundle；
5. 若使用远程 URL，确认浏览器可以直接访问该图片。

### 发送按钮、文件夹或链接仍是默认蓝色

确认使用的是本仓库正式包，而不是 `legacy-prototype`，并重新生成插件及 Web bundle。浏览器可能仍缓存旧 bundle，刷新后再检查。

### 重启后配置丢失

查看设置页底部保存状态，并确认当前浏览器通过 loopback 地址访问 DSH。不要只检查浏览器 `localStorage`；正式版的权威数据在 Host user settings 中。

## 更新与移除

升级前备份 `$DSH_HOME/settings.yaml`。只替换 `packages/client/ui-appearance/` 不会删除 `ui-appearance` namespace，因此配置仍会保留。

如需停用而保留配置，只删除活动 profile 中的 `ui-appearance` insert 行并重建。若要完全移除，再撤销集成补丁和插件目录；是否删除 `settings.yaml` 中的 `ui-appearance` 应由用户单独决定。

## 隐私与安全边界

- 不要把 `$DSH_HOME/settings.yaml` 提交到公共仓库；
- 本地上传图片以内联 data URL 保存，可能包含私人图片且体积很大；
- 本仓库忽略常见 DSH home、凭据、会话与本地设置路径；
- 自定义 CSS 能改变当前 WebUI 的显示，请只导入自己信任的 CSS；
- 文档展示图经过隐私化处理，不包含原始工作区和对话数据。

## 仓库结构

```text
assets/                              README 图片与项目图标
packages/client/ui-appearance/       与测试环境一致的正式插件包
integration/                         DSH 最小补丁与快照清单
scripts/                             安装与一致性校验脚本
legacy-prototype/                    旧内存态原型，仅供参考
.github/workflows/verify.yml         持续集成验证
```

## 贡献

Issue 和 Pull Request 欢迎围绕当前已验证基线提交。涉及新版 DSH 的兼容修改，请同时更新最小集成补丁、测试快照记录和验证证据；不要提交个人 `settings.yaml`、会话数据或私有壁纸。

## 许可证

[MIT License](LICENSE)。社区维护和商标说明见 [NOTICE](NOTICE.md)。
