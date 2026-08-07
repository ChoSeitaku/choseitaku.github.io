---
title: 热点瞭望台 — 一个全栈 AI 热点监控系统的技术复盘
date: 2026-06-23 10:00:00
tags:
  - 项目
  - AI
categories:
  - 项目
description: 个人项目 · 全栈开发 · 从零到一。热点瞭望台是一个轻量级多源 AI 热点监控工具，涵盖搜索引擎并发抓取、AI判别真伪、Web面板展示、浏览器推送等功能。
cover: /img/random15.png
---

# 热点瞭望台 — 一个全栈 AI 热点监控系统的技术复盘

> 个人项目 · 全栈开发 · 从零到一

---

## 项目概述

**热点瞭望台 (Hotspot Monitor)** 是一个轻量级多源 AI 热点监控工具，核心链路为：

```
7+ 搜索引擎并发抓取 → 去重与公平轮询 → AI 判别真伪与置信度打分 → 科技风 Web 面板展示 → 浏览器推送 / 邮件通知
```

技术栈：**React 18 + Vite 5 + Tailwind CSS 3 + Express 4 + DeepSeek API**

![网站全貌](/img/website.jpg)

---

## 为什么做这个项目

信息过载时代，每天在 Bing、Bilibili、HackerNews、Twitter 等平台之间反复切换，依然会错过真正有价值的热点。我想做一个**自动化的「信息雷达」**：让它帮我盯着多个来源，用 AI 过滤噪音，只把真正重要的信息推送到面前。

同时，这个项目也是我对**全栈工程能力**的一次综合检验——从网络爬虫、并发调度、AI 集成，到前端可视化、推送通知、定时任务，每一个环节都值得深入思考。

---

## 核心技术亮点

### 1. 多源并发抓取架构

系统集成了 **7 个异构搜索源**，每个源有独立的抓取策略和容错机制：

| 搜索源 | 抓取方式 | 特殊处理 |
|--------|----------|----------|
| Bing | HTML 解析 (Cheerio) | 标准搜索结果 |
| Bing News | HTML 解析 | 提取新闻发布时间 |
| 搜狗 | HTML 解析 | URL 补全 |
| 搜狗微信 | HTML 解析 | 微信公众号文章 |
| Bilibili | WBI 签名 API | 动态密钥刷新 + MD5 签名 |
| HackerNews | Algolia REST API | 结构化 JSON |
| Twitter | TwitterAPI.io | 高级搜索 + 互动量过滤 |

**关键设计**：每个源独立 `setTimeout` 超时控制（12-15秒），单源失败不影响其他源。通过 `Promise.allSettled` 并发执行，保证最大限度的数据采集。

```javascript
// 每个源独立超时，互不干扰
const searches = await Promise.allSettled(candidatePromises);
const candidates = searches.flatMap(r => r.status === 'fulfilled' ? r.value : []);
```

### 2. Bilibili WBI 签名逆向

Bilibili 的搜索 API 需要 WBI 签名验证，这是整个抓取模块中技术难度最高的部分：

- **密钥获取**：先访问 B站首页拿到 `buvid3` cookie，再调用 nav 接口获取 `img_key` 和 `sub_key`
- **签名算法**：使用 64 位混淆表对参数进行重排，拼接密钥后计算 MD5
- **自动刷新**：密钥缓存 30 分钟，过期自动重新获取

```javascript
function signBilibili(params) {
  const orig = biliState.imgKey + biliState.subKey;
  const mixinKey = BILI_WBI_MIXIN_TAB.map(i => orig[i]).join('').slice(0, 32);
  const wts = Math.floor(Date.now() / 1000);
  const sorted = Object.keys({ ...params, wts }).sort().map(k => `${k}=${v}`).join('&');
  const wRid = createHash('md5').update(sorted + mixinKey).digest('hex');
  return `${sorted}&w_rid=${wRid}`;
}
```

### 3. 公平轮询算法 — 跨源 × 关键词双层调度

**问题**：Bing 等高产源每次搜索返回 10+ 条结果，而 HackerNews、Twitter 可能只有 2-3 条。如果直接合并，高产源会淹没小众源。

**解决方案**：设计了「来源 × 关键词」双层公平轮询算法：

```
第一层：每个来源内部，按关键词分组后轮询展平
  → Bing: [AI编程_1, 大模型_1, AI编程_2, 大模型_2, ...]

第二层：跨来源轮询，每源设置硬配额（max / 源数，不低于 minPerSource）
  → [Bing_1, HN_1, Twitter_1, Sogou_1, Bing_2, HN_2, ...]
```

这样保证了每个来源至少有 4 条候选进入 AI 审核，避免了信息来源单一化。

### 4. AI 判别引擎 — 双模型容错

采用 **DeepSeek 为主、OpenRouter (GPT-4o-mini) 兜底** 的双模型策略：

```javascript
let result = await callDeepSeek(prompt);      // 主力
if (!result) result = await callOpenRouter(prompt); // 兜底
```

AI 对每条候选输出结构化 JSON：
```json
{
  "isHot": true,
  "confidence": 0.85,
  "summary": "该视频标题提及GPT-Image2，属于AI图像生成工具...",
  "reason": "内容为实战用法合集，符合社区热门讨论定义，且来源可靠"
}
```

**置信度阈值**：`confidence >= 0.4` 才会被收录为热点，避免低质量内容干扰。

### 5. 去重策略

在数据量大的场景下，去重是关键环节。系统采用**三字段联合去重**：

```javascript
const key = `${item.source}::${normalizeUrl(item.url)}::${item.title}`;
```

其中 `normalizeUrl` 会去除查询参数和 hash 片段，避免同一内容因 URL 参数不同而被重复收录。

---

## 前端架构与交互设计

### Bento Grid 布局

采用 Bento Grid（便当盒布局）设计，将监控配置、快速操作、热点列表、通知中心四大模块有机组合：

![热点列表与通知面板](/img/热点通知.jpg)

### 热点卡片交互

每张热点卡片支持展开/折叠，展示完整信息：

![卡片展开详情](/img/详细信息展开.jpg)

展开后展示：
- **AI 判定理由** — 为什么这条内容被判定为热点
- **详细信息** — 收录时间、发布时间、触发方式、置信度精确值
- **原文链接** — 一键复制 / 新标签打开

### 排序与筛选系统

支持 4 种排序维度：

| 排序方式 | 逻辑 |
|----------|------|
| 相关性 | 有搜索词时按匹配度评分（标题 +5，摘要 +2，query 完全匹配 +8），否则按时间 |
| 热度 | 按 AI 置信度降序 |
| 收录 | 按扫描发现时间降序 |
| 发布 | 按信息源的原始发布时间降序 |

加上来源筛选（按来源 chip 过滤）和关键词搜索（多 token 匹配），形成完整的数据探索能力。

### 动画与视觉

- **WavyBackground**：Canvas 绘制的多层正弦波浪动画，支持颜色、速度、透明度配置
- **FloatingParticles**：浮动粒子背景，增加科技感
- **Sparkles**：按钮 sparkle 效果，增强交互反馈
- **Framer Motion**：卡片进入动画、折叠展开过渡、分页切换

---

## 后端架构

### API 设计

RESTful 风格，8 个核心端点：

```
GET  /api/config        — 获取关键词与监控范围
POST /api/keywords      — 添加关键词
DEL  /api/keywords/:kw  — 删除关键词
POST /api/scope         — 更新监控范围
POST /api/scan          — 手动触发扫描
GET  /api/hotspots      — 获取热点列表
GET  /api/notifications — 获取通知记录
POST /api/subscribe     — 浏览器推送订阅
GET  /api/health        — 服务健康状态
```

### 定时任务

使用 `node-cron` 每 30 分钟自动执行扫描：

```javascript
cron.schedule('*/30 * * * *', async () => {
  await scanHotspots('automatic');
});
```

### 数据持久化

采用 JSON 文件存储（`data/` 目录），适合轻量级部署，无需数据库依赖：
- `keywords.json` — 关键词配置 + 通知记录
- `hotspots.json` — 热点列表（最多保留 120 条）
- `subscriptions.json` — 浏览器推送订阅

### 通知系统

**双通道通知**：
1. **浏览器 Web Push** — 基于 VAPID 协议，通过 Service Worker 推送
2. **邮件通知** — 基于 nodemailer + SMTP，自动清理无效订阅

---

## 工程实践

### 容错设计

- 每个抓取源独立超时，单源崩溃不影响全局
- AI 调用双模型容错，DeepSeek 失败自动切换 OpenRouter
- 通知发送失败静默处理，不阻断主流程

### 性能优化

- 抓取节流：关键词间 800ms 延迟，避免触发反爬
- 前端分页：每页 10 条，避免大列表渲染压力
- Canvas 动画：requestAnimationFrame + DPR 适配，保证 60fps 流畅

### 部署方案

```bash
# 开发模式（前后端分离）
npm start          # 后端 :4000
npm run dev        # 前端 :5173，自动代理 /api

# 生产模式（单端口托管）
npm run build      # Vite 构建 dist/
npm run start:prod # Express 托管前端 + API
```

---

## 项目数据

经过一段时间的运行积累：

- **信息源**：7 个
- **已发现热点**：100+ 条
- **通知记录**：50+ 条
- **覆盖平台**：Bilibili、HackerNews、Twitter、Bing、搜狗、微信公众号

---

## 技术栈总结

| 层 | 技术 | 选型理由 |
|----|------|----------|
| 前端框架 | React 18 | 生态成熟，组件化开发效率高 |
| 构建工具 | Vite 5 | 极速 HMR，开发体验优秀 |
| 样式方案 | Tailwind CSS 3 | 原子化 CSS，快速迭代 UI |
| 动画 | Framer Motion | 声明式动画 API，与 React 深度集成 |
| 后端框架 | Express 4 | 轻量灵活，适合 API 服务 |
| AI 引擎 | DeepSeek API | 性价比高，中文理解能力强 |
| 定时任务 | node-cron | Cron 语法，零配置 |
| 网页解析 | Cheerio | 服务端 jQuery，高效 HTML 解析 |

---

## 后续规划

1. **数据可视化** — 添加热点趋势图表，展示各来源的数据分布
2. **多主题支持** — 支持多套关键词配置，一键切换监控主题
3. **向量搜索** — 引入 embedding 做语义去重，提升去重精度
4. **Chrome 插件** — 浏览器扩展，实时查看最新热点
5. **自动化部署** — GitHub Actions CI/CD，自动构建部署

---

## 写在最后

这个项目让我完整经历了一个全栈产品从需求分析、架构设计、核心算法实现到部署上线的全过程。其中最有收获的几个点：

- **并发调度**：`Promise.allSettled` + 独立超时的容错模式
- **公平轮询算法**：双层轮询 + 硬配额的设计思路
- **AI 集成**：结构化 prompt + 双模型容错的工程实践
- **前端体验**：Bento 布局 + 卡片展开折叠 + 多维排序筛选

项目已开源，欢迎交流。

GitHub: [github.com/ChoSeitaku/sei-hot-monitor](https://github.com/ChoSeitaku/sei-hot-monitor)