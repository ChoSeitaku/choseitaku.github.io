# CLAUDE.md — Choblog (Hexo + 安知鱼)

基于 Hexo 7.3.0 + 安知鱼主题的个人博客，部署在 GitHub Pages。

## 项目结构

```
source/_posts/          # 博客文章 (.md)
source/about/           # 关于页面
source/img/             # 图片资源
public/                 # 生成的静态站点 (gitignored)
_config.yml             # Hexo 主配置
_config.anzhiyu.yml     # 安知鱼主题配置
themes/anzhiyu/         # 主题文件
.deploy_git/            # hexo-deployer-git 临时目录
```

## 写新文章

1. 在 `source/_posts/` 下创建 `.md` 文件
2. Front-matter 格式：

```yaml
---
title: 文章标题
date: YYYY-MM-DD HH:mm:ss
tags:
  - 标签1
  - 标签2
categories:
  - 分类名
description: 文章描述
cover: /img/random01.png
---
```

3. 参考已有文章格式：`source/_posts/hello-world.md`
4. **必须指定 cover 且避免重复**：front-matter 中必须包含 `cover` 字段，否则安知鱼主题的 `random_cover.js` 会在每次渲染时随机抽图，导致主页封面和文章页背景图不一致。**新增文章时必须先检查现有文章已使用的封面，避免重复。** 可选封面图：`source/img/random01.png` ~ `random27.png`。

   当前封面占用情况：
   - random01: Java后端宏鼎汇中小厂面经电商供应链
   - random02: 从零搭建 Hexo + 安知鱼主题博客
   - random03: 你好，世界 — 我的博客开篇
   - random04: Java基础常见面试题精炼（一）：核心概念与基础语法
   - random05: Java基础常见面试题精炼（二）：面向对象与异常处理
   - random06: JavaWeb 基础面试题精炼
   - random07: Java基础常见面试题精炼（三）：集合框架与线程安全
   - random08: Java基础常见面试题精炼（四）：高级特性与网络编程
   - random11: Java 后端工程化面试题精炼（上）
   - random16: Java 后端工程化面试题精炼（下）
   - random21: Java 分布式项目面试题精炼

## 部署（关键！）

### ✅ 正确方式：用 hexo-deployer-git

```bash
npx hexo generate --deploy
```

或分两步：

```bash
npx hexo generate
npx hexo deploy
```

`_config.yml` 已配置好 deploy 参数：

```yaml
deploy:
  type: git
  repo: https://github.com/ChoSeitaku/choseitaku.github.io.git
  branch: gh-pages
```

### ❌ 严禁做的事

- **禁止用 `git subtree split` 或 `git subtree push` 操作 public 目录** — `public/` 是 gitignored 的，subtree 找不到任何 revision，会导致远程 gh-pages 分支被误删
- **禁止手动 checkout gh-pages 分支再复制 public 文件** — 容易搞乱工作区，且 node_modules 会被清掉
- **禁止用 git worktree 操作 gh-pages** — 不需要，hexo-deployer-git 全自动处理
- **禁止在 gh-pages 分支上做任何手动操作** — 该分支由 hexo-deployer-git 自动维护

### 工作原理

`hexo-deployer-git` 在 `.deploy_git/` 下维护一个独立的 git 仓库：
1. `hexo generate` 生成静态文件到 `public/`
2. `hexo deploy` 把 `public/` 内容复制到 `.deploy_git/`，自动 commit 并 push 到远程 gh-pages 分支
3. 全程不碰工作区、不切分支、不删 node_modules

## 本地预览

```bash
npx hexo server
```

默认 http://localhost:4000

## 网络问题

GitHub 在国内可能不稳定，push/deploy 失败时多试几次。`_config.yml` 中 deploy repo 使用 HTTPS 地址，如需 SSH 可改为 `git@github.com:ChoSeitaku/choseitaku.github.io.git`。
