---
title: x-article-ai-workflow：基于 AI 的全自动化内容创作流水线
date: 2026-06-12 10:00:00
tags:
  - 项目
  - AI
categories:
  - 项目
description: 一个从 AI 资讯发现到爆款验证的零人工干预系统，基于 Claude API 实现双风格内容自动生成。
cover: /img/random12.png
---

# x-article-ai-workflow：基于 AI 的全自动化内容创作流水线

> 一个从 AI 资讯发现到爆款验证的零人工干预系统，基于 Claude API 实现双风格内容自动生成。

🔗 **GitHub**: [x-article-ai-workflow](https://github.com/ChoSeitaku/x-article-ai-workflow)

## 项目概述

本项目由 [defou-workflow-agent](https://github.com/ChoSeitaku/defou-workflow-agent) 改造而来，核心更新：

- **项目重命名**：defou-workflow-agent → x-article-ai-workflow
- **信息源切换**：从 TopHub 全网热榜 → [AIbase 每日资讯](https://news.aibase.com/zh/daily)
- **领域聚焦**：从泛热点 → AI 领域前沿动态
- **内容定位**：更适合 AI/科技类自媒体、技术博客、产品经理等受众

在内容创作领域，从选题到成稿再到质量验证是一个耗时且高度依赖经验的过程。本项目旨在构建一条**全自动化的内容生产流水线**，将人工干预降至最低，同时保证内容质量。

### 核心指标

| 指标 | 数值 |
|------|------|
| 端到端耗时 | ~15 分钟（10 篇双风格文章） |
| 人工干预 | 0 步骤 |
| API 调用次数 | ~30 次（含重试） |
| 内容风格 | 2 种（Defou x Stanley + 睿智幽默） |
| 爆款验证维度 | 7 维度评分系统 |

---

## 技术架构

### 系统架构图

![系统架构图](/img/系统架构图.jpg)

### 主流程时序图

![主流程时序图](/img/主流程时序图.jpg)

### 技术选型

| 技术 | 用途 | 选型理由 |
|------|------|----------|
| TypeScript | 主语言 | 类型安全，IDE 支持好 |
| Anthropic SDK | LLM 调用 | 官方 SDK，稳定性高 |
| Cheerio | HTML 解析 | 轻量高效，jQuery 语法 |
| JSDOM + Readability | 网页正文提取 | Mozilla 算法，提取质量高 |
| Chokidar | 文件监听 | 跨平台，事件驱动 |
| p-limit | 并发控制 | 防止 API 限流 |

---

## 核心实现

### 1. 热榜抓取模块

**挑战**：需要从 AIbase 网站提取结构化的 AI 资讯数据。

**解决方案**：使用 Cheerio 解析 HTML，双重解析策略提高覆盖率。

```typescript
// src/tophubFetcher.ts - 已重命名为 AIbase 爬虫
export async function fetchHotList(): Promise<HotItem[]> {
  const response = await fetch(AIBASE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 ...' // 伪装浏览器
    }
  });
  
  const $ = cheerio.load(await response.text());
  const items: HotItem[] = [];
  
  // 双重解析：侧边栏热榜 + 主内容区日报
  $('a[target="_blank"]').each((i, element) => {
    const title = $(element).find('.truncate2').attr('title');
    if (title && !seenTitles.has(title)) {
      items.push({ rank, title, link, hot, source });
    }
  });
  
  return items;
}
```

**数据源对比**：

| 维度 | TopHub（原版） | AIbase（当前） |
|------|----------------|----------------|
| 覆盖领域 | 全网热点 | AI 领域垂直 |
| 更新频率 | 实时 | 每日 |
| 数据结构 | 多站点聚合 | 单站点日报 |
| 适用场景 | 泛内容创作 | AI/科技内容 |

**技术亮点**：
- 使用 `Set` 去重，避免重复抓取
- 双重解析策略提高覆盖率
- 请求头伪装绕过基础反爬

### 2. AI 话题筛选

![话题筛选流程](/img/话题筛选流程.jpg)

**挑战**：从 50+ 热点中筛选出适合深度创作的话题。

**解决方案**：设计专用 Prompt，让 AI 从 4 个维度评估话题潜力。

```typescript
// 筛选标准 Prompt
const selectionPrompt = `
评选标准：
1. 话题具有深度讨论空间（不是纯娱乐八卦）
2. 能引发思考或情绪共鸣
3. 适合 Defou x Stanley 风格（结构化分析 + 犀利洞察）
4. 有长期价值，不是纯时效性新闻
`;

// JSON 解析的健壮处理
function parseJSONResponse<T>(text: string): T {
  // 1) 从 ```json ``` 码块提取
  const blockMatch = text.match(/```json\s*\n?([\s\S]*?)\n?```/);
  
  // 2) 处理尾部逗号、未转义引号等常见问题
  let cleaned = jsonCandidate
    .replace(/,\s*([\]}])/g, '$1')
    .replace(/(['"])?([a-zA-Z_]\w*)(['"])?\s*:/g, '"$2":');
  
  // 3) 智能转义字符串值中的未转义双引号
  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = escapeQuotesInValues(cleaned);
    return JSON.parse(cleaned);
  }
}
```

**技术亮点**：
- 多层 JSON 解析容错机制
- 智能处理 AI 返回的格式问题
- 支持从码块和纯文本中提取 JSON

### 3. 双风格内容生成

![双风格生成流程](/img/双风格生成流程.jpg)

**风格对比**：

| 维度 | Defou x Stanley | 睿智幽默 |
|------|-----------------|----------|
| 目标 | 深度分析 + 病毒传播 | 一针见血 + 冷幽默 |
| 篇幅 | 1500-2000 字 | 200 字以内 |
| 语调 | 冷静克制 | 调侃讽刺 |
| 温度 | 0.7 | 0.8 |
| 结构 | 路由分析 → 多版本创作 | 直接观点 → 案例支撑 |

### 4. 爆款验证引擎

![爆款验证引擎](/img/爆款验证引擎.jpg)

**去 AI 味检测规则**：

### 5. 统一输出管理

**挑战**：多个模块产生输出，需要统一的文件命名和元数据管理。

**解决方案**：设计 OutputManager，提供一致的文件命名、元数据和目录结构。

```typescript
// 文件命名规则
const generateFilename = (title: string, date: Date) => {
  const safeTitle = title
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')  // 移除特殊字符
    .replace(/\s+/g, '_')                          // 空格转下划线
    .slice(0, 30);                                  // 截断到 30 字符
  
  const hash = crypto.createHash('md5')
    .update(title)
    .digest('hex')
    .slice(0, 6);  // 短哈希防冲突
  
  return `${dateStr}-${safeTitle}_${hash}.md`;
};

// 元数据格式
const METADATA_BLOCK = `
<!--============================================================
METADATA
============================================================
Source Type: tophub_trend
Generated At: 2026-08-03 15:30:00
Processed By: master-orchestrator
Source Title: AI 大模型价格战升级
============================================================
-->`;
```

**目录结构**：

![目录结构](/img/目录结构.jpg)

---

## 技术难点与解决方案

### 1. API 限流处理

![API限流处理](/img/api限流处理.jpg)

**问题**：高并发调用容易触发 API 限流。

**解决方案**：使用 p-limit 控制并发 + 指数退避重试。

```typescript
import pLimit from 'p-limit';

const limit = pLimit(2);  // 最多 2 个并发

// 并发执行
const results = await Promise.all(
  topics.map((topic, idx) =>
    limit(() => generateContent(topic, idx, topics.length))
  )
);

// 指数退避重试
while (attempt < maxRetries) {
  try {
    const msg = await anthropic.messages.create({...});
    return msg;
  } catch (error) {
    if (error.status === 429 || error.status >= 500) {
      const delay = 1000 * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay));
      attempt++;
    } else {
      throw error;
    }
  }
}
```

### 2. JSON 解析容错

![JSON解析容错](/img/JSON解析容错.jpg)

**问题**：AI 返回的 JSON 经常有格式问题（尾部逗号、未转义引号等）。

**解决方案**：多层解析 + 智能修复。

```typescript
function parseJSONResponse<T>(text: string): T {
  // 1) 提取 JSON
  const jsonCandidate = extractJSON(text);
  
  // 2) 基础清理
  let cleaned = jsonCandidate
    .replace(/,\s*([\]}])/g, '$1')           // 移除尾部逗号
    .replace(/(['"])?([a-zA-Z_]\w*)(['"])?\s*:/g, '"$2":'); // 确保 key 用双引号
  
  // 3) 尝试解析
  try {
    return JSON.parse(cleaned);
  } catch {
    // 4) 智能转义字符串值中的双引号
    cleaned = escapeQuotesInValues(cleaned);
    return JSON.parse(cleaned);
  }
}
```

### 3. 去 AI 味实现

![去AI味实现](/img/去AI味实现.jpg)

**问题**：AI 生成的内容有明显的"AI 味"，读起来像模板。

**解决方案**：设计禁止句式列表 + 替代原则。

```typescript
// 替代原则
const REPLACEMENT_PRINCIPLES = {
  // 用直接陈述代替铺垫
  bad: "事实上，这个问题很重要",
  good: "这个问题很重要",
  
  // 用具体场景代替概括
  bad: "很多人都有这个问题",
  good: "我身边 3 个朋友都遇到过",
  
  // 用口语化代替书面腔
  bad: "简而言之",
  good: "说白了",
  
  // 用断句留白制造节奏
  bad: "首先……其次……最后……",
  good: "第一点。\n\n第二点。\n\n第三点。"
};
```

---

## 项目成果

### 性能指标

![性能耗时分析](/img/性能耗时分析.jpg)

| 阶段 | 耗时 | API 调用 |
|------|------|----------|
| 热榜抓取 | ~2 秒 | 0 |
| Top 10 筛选 | ~10 秒 | 1 |
| 单篇双风格生成 | ~60 秒 | 2 |
| 单篇爆款验证 | ~30 秒 | 1 |
| **完整流程（10 篇）** | **~15 分钟** | **~30** |

### 内容质量

![爆款验证分数分布](/img/爆款验证分数分布.jpg)

- 爆款验证平均分：72/100（满分 70 + 10 去 AI 味）
- 去 AI 味检测通过率：95%+
- 双风格差异度：明显可区分

### 技术亮点总结

![技术亮点思维导图](/img/技术亮点思维导图.jpg)

1. **全自动化**：从热点到成品，零人工干预
2. **双风格生成**：同一话题，两种风格，满足不同场景
3. **7 维度验证**：量化内容质量，自动优化
4. **去 AI 味**：40+ 种句式检测，保证内容自然度
5. **健壮容错**：JSON 解析、API 重试、并发控制

---

## 未来优化方向

![优化路线图](/img/优化路线图.jpg)

1. **多模型支持**：接入 GPT-4、Gemini 等，对比不同模型效果
2. **A/B 测试**：自动测试不同标题的点击率
3. **数据反馈**：接入发布平台数据，优化生成策略
4. **多语言支持**：扩展到英文、日文内容生成
5. **可视化面板**：实时监控流水线状态和产出

---

## 总结

本项目展示了一个完整的 AI 应用工程化实践，从需求分析、架构设计到核心实现，涵盖了：

- **系统设计**：模块化架构，职责清晰
- **工程实践**：错误处理、容错机制、性能优化
- **AI 应用**：Prompt 工程、输出解析、质量验证
- **内容创作**：风格定义、爆款验证、去 AI 味

通过这个项目，我深入理解了如何将 AI 能力转化为实际生产力，同时也积累了处理 AI 输出不确定性、保证系统稳定性的宝贵经验。

---

## 附录：快速开始

### 环境要求

- Node.js >= 16
- Anthropic API Key

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/ChoSeitaku/x-article-ai-workflow.git
cd x-article-ai-workflow

# 安装依赖
npm install

# 配置环境变量
echo "ANTHROPIC_API_KEY=your-api-key" > .env
echo "ANTHROPIC_BASE_URL=https://your-api-base-url" >> .env
# 可选：自定义 AIbase URL（默认使用官方地址）
# echo "TOPHUB_URL=https://news.aibase.com/zh/daily" >> .env

# 运行全自动生成
npm run skill:master
```

### 可用命令

| 命令 | 功能 |
|------|------|
| `npm run skill:master` | 全自动 AI 资讯内容生成（推荐） |
| `npm run skill:witty` | 独立睿智幽默风格生成 |
| `npm run skill:list` | 批量处理文章链接 |
| `npm run skill:local` | 批量重写本地文章 |
| `npm run skill:tophub` | AI 资讯热点分析 |

---

**技术栈**：TypeScript · Anthropic Claude API · Cheerio · JSDOM · Chokidar

**项目状态**：生产就绪 · 持续迭代中

**GitHub**：[x-article-ai-workflow](https://github.com/ChoSeitaku/x-article-ai-workflow)