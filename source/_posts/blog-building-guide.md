---
title: 从零搭建 Hexo + 安知鱼主题博客
date: 2026-05-13 12:00:00
tags:
  - Hexo
  - 建站
categories:
  - 技术
description: 记录搭建本博客的全过程，包括 Hexo 初始化、安知鱼主题配置、常见问题修复以及 GitHub Pages 部署方案。
cover: /img/random02.png
swiper_index: 2
top_group_index: 2
---

## 前言

一直想拥有一个完全属于自己的博客，而不是依赖第三方平台。Hexo 作为一款静态博客框架，以其轻量、高效、可定制的特点吸引了 me。而安知鱼主题丰富的功能和精致的 UI 设计，让博客从外观到体验都很出色。

这篇博客记录了从零搭建的全过程，希望能给同样想搭博客的朋友一些参考。

## 技术选型

| 组件 | 选择 | 说明 |
|------|------|------|
| 框架 | Hexo 7.3.0 | 高速生成静态文件 |
| 主题 | AnZhiYu | 功能丰富，UI 精致 |
| 部署 | GitHub Pages | 免费稳定，配合 Actions 自动部署 |
| 评论 | Twikoo（待配置） | 轻量无后端评论系统 |

## 初始化项目

```bash
npm init -y
npm install hexo@7.3.0 hexo-cli@4.3.2 hexo-server@3.0.0
npm install hexo-renderer-pug@3.0.0 hexo-renderer-stylus@3.0.1 hexo-renderer-marked
npm install hexo-generator-index@4.0.0
```

这里有个坑需要注意：**不要用 `hexo init` 脚手架**，因为安知鱼主题有自己的目录结构，手动初始化更容易控制。

## 配置主题

从 GitHub 克隆安知鱼主题到 `themes/anzhiyu` 目录，然后在 `_config.yml` 中设置：

```yaml
theme: anzhiyu
language: zh-CN
timezone: Asia/Shanghai
```

主题的配置集中在 `_config.anzhiyu.yml`，包括导航菜单、社交链接、首页布局等。安知鱼主题的配置项非常丰富，几乎覆盖了博客需要的所有功能。

## 踩坑记录

### 1. env.init 为 false 导致插件不加载

Hexo 7.3.0 的 `env.init` 检测机制有一个坑：如果 `package.json` 中没有 `"hexo": {}` 字段，`update_package` 会跳过执行，导致 `env.init` 保持 `false`，进而 `load_plugins` 被跳过。

```json
// package.json 中需要添加
{
  "hexo": {}
}
```

### 2. 首页 Cannot GET /

安装 `hexo-generator-index` 即可解决：

```bash
npm install hexo-generator-index@4.0.0
```

### 3. npm scripts 要直接使用 hexo CLI

```json
{
  "scripts": {
    "clean": "hexo clean",
    "build": "hexo generate",
    "server": "hexo server",
    "dev": "hexo server",
    "new": "hexo new",
    "deploy": "hexo deploy"
  }
}
```

## 部署方案

目前采用 GitHub Pages 的方式部署：

1. 源码托管在 GitHub 仓库
2. 通过 GitHub Actions 自动构建部署
3. 推送到 `gh-pages` 分支，GitHub Pages 自动托管

这样一来，每次写完文章只需 `git push`，剩下的事情交给 CI 自动完成。

## 已配置的功能

- **首页轮播图** — 精选文章自动展示
- **文章分类 & 标签** — 方便内容组织
- **关于页 & 友链页** — 完整的博客社交功能
- **PWA 支持** — 可安装为 PWA 应用
- **深色模式** — 自动跟随时间切换
- **网易云音乐** — 左侧导航栏内置播放器
- **字数统计 & 阅读时长** — 文章详情展示

## 后续计划

- [ ] 配置 Twikoo 评论系统
- [ ] 添加更多技术文章
- [ ] 配置自定义域名
- [ ] 添加追番、相册等个性化页面

## 结语

从决定搭博客到跑通整个流程，其实只花了一个下午。但看着自己的站点在浏览器里完美呈现，那种成就感是无与伦比的。

如果你也在折腾博客搭建，希望这篇文章能帮你少踩一些坑。有任何问题欢迎在评论区交流～
