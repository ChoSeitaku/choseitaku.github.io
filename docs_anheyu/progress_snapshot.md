# 项目配置进度快照

生成时间: 2026-05-13 11:30

## 已完成

### 项目初始化
- [x] `npm init` 创建 package.json
- [x] 安装依赖: hexo@7.3.0, hexo-cli@4.3.2, hexo-server@3.0.0
- [x] 安装渲染器: hexo-renderer-pug@3.0.0, hexo-renderer-stylus@3.0.1, hexo-renderer-marked
- [x] 安装首页生成器: hexo-generator-index@4.0.0
- [x] 本地化 npm scripts（使用 hexo CLI 而非 hexo-run.js）

### npm scripts（package.json）
| 命令 | 作用 |
|------|------|
| `npm run clean` | 清除缓存 |
| `npm run build` | 生成静态文件 |
| `npm run server` | 启动开发服务器 |
| `npm run dev` | 启动开发服务器（同 server） |
| `npm run new` | 创建新文章 |
| `npm run deploy` | 部署 |

### 站点配置 (_config.yml)
- [x] title: 长星拓的博客
- [x] author: 长星拓
- [x] language: zh-CN
- [x] timezone: Asia/Shanghai
- [x] url: https://choseitaku.github.io
- [x] theme: anzhiyu

### 主题配置 (_config.anzhiyu.yml)
- [x] GitHub 社交链接已配置
- [x] 导航菜单已修改（指向自己的 GitHub）
- [x] 作者技能简介已简化

### 页面创建
- [x] source/tags/index.md — 标签页 (type: "tags")
- [x] source/categories/index.md — 分类页 (type: "categories")
- [x] source/about/index.md — 关于页 (type: "about")
- [x] source/link/index.md — 友链页 (type: "links")
- [x] source/comments/index.md — 留言板 (type: "message")
- [x] source/_posts/hello-world.md — 第一篇博客文章
- [x] source/_posts/blog-building-guide.md — 建站技术文章

### 首页轮播图
- [x] 轮播图功能已启用（swiper.enable: true）
- [x] 两篇文章已设置 swiper_index，在轮播图中展示
- [x] 封面图使用 random01/random02

### 构建修复
- [x] package.json 添加 `"hexo": {}` 字段 — 修复 hexo 7.3.0 env.init 为 false 导致插件不加载的问题
- [x] npm scripts 已改为直接使用 `hexo` CLI 命令
- [x] 验证 `hexo clean` / `hexo generate` / `hexo server` 全部正常工作
- [x] dev server (http://localhost:4000) 所有页面返回 200
- [x] v1.0.0 tag 已创建（网络通畅后 push）

### 部署方案
- [x] 确定采用方案 B：本地构建后推送 gh-pages 分支
- [x] GitHub Actions 部署不可用（runner_id=0，疑似 <username>.github.io 仓库限制）

## 已知问题（已解决）

1. ~~Hexo 7.3.0 + env.init 不兼容 — package.json 缺少 `"hexo": {}` 字段导致 `update_package` 跳过，`env.init` 保持 false，`load_plugins` 被跳过~~
   - **修复**: 在 package.json 中添加 `"hexo": {}` 字段
   
2. ~~首页 Cannot GET / — 缺少 hexo-generator-index 插件~~
   - **修复**: 安装 `hexo-generator-index@4.0.0`

## 待办（下次继续）

### 优先级高
1. [ ] 方案 B 部署：本地构建并推送 gh-pages（网络通畅时）
2. [ ] 推送 v1.0.0 tag（网络通畅时）
3. [ ] 配置评论区 (twikoo/valine 等)

### 优先级中
4. [ ] 添加更多博客文章
5. [ ] 配置 _config.anzhiyu.yml 个性化设置
6. [ ] 配置导航菜单（启用主题菜单项）

### 优先级低
7. [ ] 音乐馆页面
8. [ ] 追番页面
9. [ ] 相册页面
10. [ ] 朋友圈页面
11. [ ] 即刻说说页面
12. [ ] 自定义域名

## 项目结构
```
F:\choblog\choblog\
├── _config.yml              # Hexo 站点配置
├── _config.anzhiyu.yml      # 主题配置（高优先级覆盖）
├── package.json             # 依赖管理（已修复 hexo 字段）
├── .gitignore
├── docs_anheyu/             # 安知鱼文档备份
├── source/
│   ├── _posts/
│   │   ├── hello-world.md           # 第一篇博客（swiper_index: 1）
│   │   └── blog-building-guide.md   # 建站技术文章（swiper_index: 2）
│   ├── tags/index.md
│   ├── categories/index.md
│   ├── about/index.md
│   ├── link/index.md
│   └── comments/index.md
├── themes/anzhiyu/          # 安知鱼主题源码
├── scaffolds/               # Hexo 脚手架模板
├── public/                  # 生成输出目录（91个文件）
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions（不可用，转方案B）
└── node_modules/
```
