---
title: 从零构建「装了吗」—— 一个 AI 驱动的开发者工具安装助手
date: 2026-08-17 10:00:00
tags:
  - AI
  - Python
  - FastAPI
  - Electron
  - 开发工具
categories:
  - 项目
description: 用 AI 自动化开发工具安装配置，支持 100+ 常用软件，一键生成安装方案。
cover: /img/random10.png
---

# 从零构建「装了吗」—— 一个 AI 驱动的开发者工具安装助手

> 今天你装了吗？

## 前言

作为开发者，我们经常需要在新环境中配置各种开发工具。Node.js、Python、Git、Docker... 每个工具的安装方式各不相同，Windows/macOS/Linux 的命令又有差异。每次重装系统都要花半天时间搜索安装教程。

于是我做了一个决定：**用 AI 来自动化这件事**。

「装了吗」是一个智能软件安装助手，支持 100+ 常用开发软件，AI 自动生成包含环境检测、安装步骤、验证命令的中文方案，一键复制脚本执行。

![网页端首页](/img/install-helper-website.jpg)

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      用户层                              │
├──────────────┬──────────────┬───────────────────────────┤
│   Web 前端   │  桌面应用    │       管理后台            │
│  (SPA/HTML)  │ (Electron)   │    (React + TS)           │
└──────────────┴──────────────┴───────────────────────────┘
                       │
               ┌───────▼───────┐
               │   FastAPI     │
               │   服务端      │
               └───────┬───────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐   ┌─────▼─────┐  ┌────▼────┐
   │ SQLite  │   │  AI API   │  │ 版本源  │
   │ 数据库  │   │(DeepSeek) │  │ (npm等) │
   └─────────┘   └───────────┘  └─────────┘
```

### 技术栈选型

| 层级 | 技术 | 选型理由 |
|------|------|----------|
| 后端 | Python FastAPI | 异步高性能，自带 OpenAPI 文档 |
| 数据库 | SQLite | 零配置，单文件部署，适合工具类应用 |
| 前端 | Vanilla JS + Tailwind | 零依赖，首屏极速，单文件 SPA |
| 桌面端 | Electron | 跨平台，Web 技术栈复用 |
| AI | DeepSeek / OpenAI | 中文理解能力强，API 兼容 |

## 核心功能实现

### 1. 智能版本拉取

不同软件的版本信息来源各异：npm 包、PyPI、GitHub Releases、官方 API... 我设计了统一的版本拉取接口：

```python
async def fetch_versions(software_id: int):
    """根据 source_type 自动从对应源拉取版本"""
    source_map = {
        "npm": fetch_npm_versions,
        "pypi": fetch_pypi_versions,
        "github": fetch_github_versions,
        "official": fetch_official_versions,
    }
    # ...
```

支持 6 种版本源类型，自动缓存到数据库，避免重复请求。

### 2. AI 安装方案生成

这是项目的核心亮点。我设计了一套精心构造的 Prompt，让 AI 生成结构化的安装方案：

```python
system_prompt = """你是一个软件安装助手。根据用户选择的软件和平台，生成安装方案。
要求：
1. 包含环境检测脚本（检测是否已安装）
2. 提供 PowerShell 和 Bash 双版本
3. 包含验证命令确认安装成功
4. 用中文注释说明每一步"""
```

生成的方案包含：
- **环境检测**：自动检测是否已安装，避免重复安装
- **安装脚本**：PowerShell / Bash 双版本，适配不同终端
- **验证命令**：确认安装成功，输出版本信息

![生成安装方案](/img/install-helper-plan.jpg)

### 3. 方案缓存机制

AI 调用有成本，相同的软件+平台组合不需要重复生成：

```python
# 查询缓存
cached = db.query(
    "SELECT * FROM install_plans WHERE software_id=? AND platform=?",
    (software_id, platform)
)
if cached:
    return cached  # 缓存命中，秒出

# 缓存未命中，调用 AI 生成
plan = await generate_plan(software, platform)
db.execute("INSERT INTO install_plans ...", plan)
```

### 4. 桌面端一键执行

Electron 桌面端不只是套壳，我实现了真正的脚本执行能力：

```javascript
// preload.js - IPC 桥接
ipcMain.handle('run-script', async (event, script) => {
    const { stdout, stderr } = await exec(script);
    return { stdout, stderr };
});
```

用户点击「一键安装」，脚本直接在系统终端执行，无需手动复制粘贴。

![桌面端生成安装方案](/img/install-helper-desktop-plan.jpg)

## 技术难点与解决方案

### 难点 1：跨平台脚本兼容

**问题**：Windows 用 PowerShell，macOS/Linux 用 Bash，语法完全不同。

**方案**：AI 生成时同时输出两个版本，前端根据平台自动切换：

```javascript
const script = platform === 'win32' 
    ? plan.script_powershell 
    : plan.script_bash;
```

### 难点 2：100+ 软件的分类管理

**问题**：软件数量多，分类混乱。

**方案**：设计 14 个类别，支持模糊搜索：

```
runtime | editor | tools | browser | database | 
server | devops | cloud | package | build | 
multimedia | ai | security | office | api-tools
```

### 难点 3：网络环境适配

**问题**：国内访问 GitHub、npm 等源可能超时。

**方案**：
- npm 使用淘宝镜像
- GitHub Releases 提供镜像下载链接
- AI API 支持自定义 Base URL

## 项目亮点

### 1. 零配置启动

```bash
# 克隆即用
git clone https://github.com/xxx/xxx.git
cd server && pip install -r requirements.txt
python main.py  # 完事
```

SQLite 零配置，无需安装数据库。`.env` 一个文件搞定所有配置。

### 2. AI 原生设计

不是简单套壳 ChatGPT，而是深度集成：
- Prompt 工程精心设计，输出结构化方案
- 方案入库缓存，降低成本
- 支持用户反馈，持续优化方案质量

### 3. 多端统一

Web、桌面、管理后台共用同一套 API，数据实时同步。

### 4. 面向开发者的设计

- 脚本语法高亮 + 一键复制
- 环境检测避免重复安装
- 验证命令确认安装成功
- PowerShell / Bash 双版本支持

## 数据库设计

```sql
-- 软件表
CREATE TABLE software (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE,          -- 标识符
    display_name TEXT,         -- 显示名称
    category TEXT,             -- 分类
    source_type TEXT           -- 版本源类型
);

-- 版本表
CREATE TABLE versions (
    software_id INTEGER,
    version TEXT,
    platform TEXT DEFAULT 'all'
);

-- 安装方案表（AI 生成）
CREATE TABLE install_plans (
    software_id INTEGER,
    platform TEXT,
    plan_content TEXT,         -- Markdown 方案
    script_powershell TEXT,    -- PS 脚本
    script_bash TEXT           -- Bash 脚本
);

-- 用户反馈表
CREATE TABLE feedback (
    software_id INTEGER,
    is_valid BOOLEAN,          -- 方案是否有效
    comment TEXT
);
```

## 未来规划

1. **方案评分系统**：基于用户反馈自动优化方案质量
2. **社区贡献**：允许用户提交自定义安装脚本
3. **批量安装**：一键安装开发环境（如 "Python 全栈环境"）
4. **离线模式**：缓存常用安装包，支持离线安装
5. **VS Code 插件**：在编辑器内直接安装工具

## 总结

「装了吗」不只是一个工具，更是我对「AI + 开发效率」的一次探索。

通过这个项目，我实践了：
- **全栈开发**：从数据库设计到前端交互，从 API 设计到桌面应用
- **AI 工程化**：Prompt 设计、方案缓存、成本控制
- **用户体验**：一键操作、多端适配、离线可用
- **工程质量**：SQLite 零配置、单文件部署、跨平台兼容

代码是程序员最好的简历。与其说十句「我熟悉 XX 技术」，不如展示一个完整的作品。

---

**项目地址**：https://github.com/ChoSeitaku/sei-install-helper

**技术栈**：Python FastAPI / SQLite / Vanilla JS / Tailwind CSS / Electron / React

**支持平台**：Windows / macOS / Linux
