---
title: 从零构建「星拓健康助手」：一个浏览器端 AI 体态检测与健康习惯管理应用
date: 2026-06-15 10:00:00
tags:
  - 项目
  - AI
categories:
  - 项目
description: 本文记录了「星拓健康助手」项目的完整技术方案与实现细节，涵盖 MediaPipe Pose 本地姿态分析、AI 代理架构设计、纯前端训练引擎等核心模块。
cover: /img/random13.png
---

# 从零构建「星拓健康助手」：一个浏览器端 AI 体态检测与健康习惯管理应用

> 本文记录了「星拓健康助手」项目的完整技术方案与实现细节，涵盖 MediaPipe Pose 本地姿态分析、AI 代理架构设计、纯前端训练引擎等核心模块，适合前端/全栈工程师技术参考。

## 项目概览

**星拓健康助手**是一个浏览器端健康习惯管理 Web 应用，核心亮点是 **MediaPipe Pose 本地体态检测**——摄像头画面全程在浏览器端分析，不上传服务器，兼顾隐私与实时性。

| 模块 | 说明 |
|------|------|
| AI 体态检测 | 实时识别头前伸、驼背、高低肩、身体歪斜、坐姿不稳、肩颈紧张 |
| 提肛/凯格尔训练 | 分阶段盆底肌训练，动画与语音引导 |
| 护眼训练 | 20-20-20 远眺、眼球运动、远近焦点切换 |
| 喝水记录 | 可视化水杯进度，快捷记录 + 提醒 |
| 颈椎放松 | 下巴后收、肩胛后缩、墙天使等动作 |
| 数据统计 | Recharts 折线图/柱状图/饼图/面积图 |
| AI 建议 | DeepSeek API 服务端代理，无 Key 时自动降级本地建议 |

**技术栈**：Next.js 16 (App Router) + TypeScript (strict) + MediaPipe Pose + Framer Motion + Recharts + Web Speech API

![仪表盘](/img/仪表盘.jpg)

---

## 一、架构设计：为什么选 Next.js App Router？

### 1.1 技术选型考量

| 方案 | 优势 | 劣势 |
|------|------|------|
| 纯 SPA (Vite) | 部署简单、无服务端依赖 | 无法安全代理 AI API Key |
| Next.js Pages Router | 成熟稳定 | 文件路由不够直观 |
| **Next.js App Router** | 文件系统路由、Server Components、Route Handlers | 学习曲线略陡 |

选择 App Router 的核心原因：

1. **API Route Handlers** 可以安全地在服务端代理 DeepSeek API，`DEEPSEEK_API_KEY` 永远不会暴露到客户端 bundle
2. **文件系统路由** 让 11 个页面的结构清晰直观
3. **Server Components** 减少客户端 JS 体积（虽然本项目以 Client Components 为主）

### 1.2 项目结构

```
app/
├── layout.tsx              # 根布局（AppShell 容器）
├── page.tsx                # 首页（功能卡片导航）
├── dashboard/page.tsx      # 今日汇总仪表盘
├── posture/page.tsx        # AI 体态检测
├── kegel/page.tsx          # 提肛训练
├── eye-care/page.tsx       # 护眼训练
├── water/page.tsx          # 喝水记录
├── neck/page.tsx           # 颈椎放松
├── records/page.tsx        # 训练记录
├── stats/page.tsx          # 数据统计
├── settings/page.tsx       # 用户设置
├── admin/page.tsx          # 本地后台管理
└── api/ai/posture-advice/
    └── route.ts            # AI 建议 API Route
```

---

## 二、核心难点：MediaPipe Pose 本地姿态分析

这是项目技术含量最高的模块，也是面试中可以深入展开的部分。

### 2.1 架构分层

```
┌─────────────────────────────────────────────┐
│            CameraPostureDetector.tsx          │  ← React 组件层（状态管理、UI 渲染）
├─────────────────────────────────────────────┤
│              posture-detector.ts             │  ← 算法封装层（MediaPipe + 启发式分析）
├─────────────────────────────────────────────┤
│           @mediapipe/pose (CDN)              │  ← 模型层（WASM + TensorFlow.js）
├─────────────────────────────────────────────┤
│        navigator.mediaDevices                │  ← 设备层（浏览器 WebRTC）
└─────────────────────────────────────────────┘
```

### 2.2 关键点提取与坐标归一化

MediaPipe Pose 返回 33 个 3D 关键点，坐标范围 `[0, 1]`（归一化到图像宽高）。我们定义了关键点索引映射：

```typescript
export const LANDMARK_INDEX = {
  nose: 0,
  left_eye: 2,      right_eye: 5,
  left_ear: 7,      right_ear: 8,
  left_shoulder: 11, right_shoulder: 12,
  left_hip: 23,     right_hip: 24,
  // ...
} as const
```

通过 `point()` 函数进行可见性过滤（`visibility > 0.35`才认为关键点有效），通过 `center()` 计算左右对称点的中点，消除单侧偏差。

### 2.3 启发式姿态分析算法

这不是医学诊断，而是基于 2D 几何关系的**习惯提醒**。每个检测函数独立计算一个指标值，超过阈值则标记为问题：

**头前伸检测**（`detectHeadForward`）：
```typescript
// 耳朵中点与肩膀中点的水平偏移量
function detectHeadForward(landmarks, rules) {
  const ear = center(point(landmarks, 7), point(landmarks, 8))      // 左右耳中点
  const shoulder = center(point(landmarks, 11), point(landmarks, 12)) // 左右肩中点
  if (!ear || !shoulder) return 0
  return Math.abs(ear.x - shoulder.x) > rules.headForwardThreshold
    ? Math.abs(ear.x - shoulder.x) : 0
}
```

**驼背检测**（`detectHunchback`）：
```typescript
// 耳朵-肩膀-髋部三点角度偏离 180° 的程度
function detectHunchback(landmarks, rules) {
  const ear = center(point(landmarks, 7), point(landmarks, 8))
  const shoulder = center(point(landmarks, 11), point(landmarks, 12))
  const hip = center(point(landmarks, 23), point(landmarks, 24))
  if (!ear || !shoulder || !hip) return 0
  const deviation = Math.abs(180 - angle(ear, shoulder, hip))
  return deviation > rules.spineAngleThreshold ? deviation : 0
}
```

**高低肩检测**（`detectShoulderTilt`）：
```typescript
// 左右肩的 Y 坐标差值
function detectShoulderTilt(landmarks, rules) {
  const left = point(landmarks, 11)
  const right = point(landmarks, 12)
  if (!left || !right) return 0
  const tilt = Math.abs(left.y - right.y)
  return tilt > rules.shoulderTiltThreshold ? tilt : 0
}
```

**坐姿稳定性**（`calculateStability`）：
```typescript
// 基于历史帧的指标变化率，24 帧滑动窗口
function calculateStability(metrics) {
  const prev = history.at(-1)
  history = [...history.slice(-24), metrics]
  if (!prev) return 0
  return Math.abs(prev.headForwardRatio - metrics.headForwardRatio)
       + Math.abs(prev.shoulderTilt - metrics.shoulderTilt)
       + Math.abs(prev.spineAngle - metrics.spineAngle) / 100
       + Math.abs(prev.bodyLean - metrics.bodyLean)
}
```

### 2.4 综合评分公式

所有指标通过加权惩罚公式合并为 0-100 分：

```typescript
function calculatePostureScore(metrics) {
  const penalty =
    metrics.headForwardRatio * 115 +   // 头前伸权重
    metrics.shoulderTilt * 160 +        // 高低肩权重（最高）
    metrics.spineAngle * 1.45 +         // 驼背角度权重
    Math.abs(metrics.bodyLean) * 145 +  // 身体歪斜权重
    metrics.stability * 95              // 坐姿不稳定权重
  return clamp(Math.round(100 - penalty), 0, 100)
}
```

阈值可由用户在后台页面调节，适配不同体型。

![体态检测](/img/体态.jpg)

---

## 三、AI 建议的优雅降级架构

### 3.1 服务端代理设计

```
浏览器                    Next.js Server                 DeepSeek API
  │                           │                            │
  │  POST /api/ai/            │                            │
  │  posture-advice           │                            │
  │  {score, issues, metrics} │                            │
  │ ─────────────────────────>│                            │
  │                           │  检查 DEEPSEEK_API_KEY     │
  │                           │─── 无 Key ────────────────>│ 返回 fallback 本地建议
  │                           │<───────────────────────────│
  │  {advice, severity,       │                            │
  │   actions, fallback:true} │                            │
  │<──────────────────────────│                            │
```

关键代码（`app/api/ai/posture-advice/route.ts`）：

```typescript
export async function POST(request: Request) {
  // 1. 参数校验
  const body = await request.json()
  if (typeof body.postureScore !== 'number' || !Array.isArray(body.issues)) {
    return NextResponse.json({ error: { code: 'INVALID_POSTURE_PAYLOAD' } }, { status: 400 })
  }

  // 2. 无 Key 时直接返回本地建议
  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(fallbackAdvice(body))
  }

  // 3. 调用 DeepSeek API
  try {
    const client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    })
    const completion = await client.chat.completions.create({
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是健康姿态训练助手...' },
        { role: 'user', content: JSON.stringify(body) }
      ],
      temperature: 0.3,
      max_tokens: 220
    })
    // 4. 容错解析（AI 返回可能包含非 JSON 文本）
    const parsed = safeParseJson(completion.choices[0]?.message?.content)
    if (!parsed?.advice) return NextResponse.json(fallbackAdvice(body))
    return NextResponse.json({ advice: parsed.advice, severity: parsed.severity, actions: parsed.actions })
  } catch {
    // 5. 任何异常都降级为本地建议
    return NextResponse.json(fallbackAdvice(body))
  }
}
```

### 3.2 安全约束

| 约束 | 实现方式 |
|------|----------|
| API Key 不暴露给客户端 | 仅在 `process.env` 中读取，Next.js 不会打包到客户端 JS |
| 不传输图像/视频 | 请求体只包含 `{score, issues, metrics}` 数值 |
| 隐私保护 | 摄像头画面仅在 `<video>` + `<canvas>` 本地处理 |

---

## 四、通用训练引擎设计

### 4.1 阶段状态机

`TrainingTimer` 是一个可复用的训练引擎，支持任意课程配置：

```
课程 (TrainingCourse)
  └── 动作列表 (TrainingAction[])
        ├── name: 动作名称
        ├── instruction: 动作说明
        ├── durationSeconds: 持续时间
        ├── restSeconds: 休息时间
        ├── repeat: 重复次数
        └── voiceText: 语音播报文本
```

`buildPhases()` 将课程展开为线性阶段序列：

```typescript
function buildPhases(course: TrainingCourse): Phase[] {
  const phases: Phase[] = []
  course.actions.forEach((action, idx) => {
    for (let i = 0; i < action.repeat; i++) {
      phases.push({ action, kind: 'action', seconds: action.durationSeconds })
      if (action.restSeconds > 0) {
        phases.push({ action, kind: 'rest', seconds: action.restSeconds })
      }
    }
  })
  return phases
}
```

### 4.2 语音引导

通过 Web Speech API 实现中文语音播报，支持调节语速和音量：

```typescript
function speak(text: string, options?: { rate?: number; volume?: number }) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-CN'
  utterance.rate = options?.rate ?? 1
  utterance.volume = options?.volume ?? 0.9
  speechSynthesis.speak(utterance)
}
```

浏览器不支持 `speechSynthesis` 时训练正常运行，仅语音静默。

![提肛训练](/img/提肛.jpg)
![护眼训练](/img/护眼.jpg)

---

## 五、纯前端数据持久化方案

### 5.1 localStorage 架构

所有数据存储在浏览器 localStorage，6 个 key：

```typescript
export const STORAGE_KEYS = {
  SETTINGS:     'tgang_settings',      // 用户设置
  HABITS:       'tgang_habits',        // 习惯列表
  COURSES:      'tgang_courses',       // 训练课程
  RECORDS:      'tgang_records',       // 训练记录
  POSTURE_RULES:'tgang_posture_rules', // 体态检测阈值
  REMINDERS:    'tgang_reminders'      // 提醒设置
} as const
```

### 5.2 类型安全的读写封装

```typescript
function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const value = window.localStorage.getItem(key)
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
```

### 5.3 数据导入导出

支持 JSON 文件导出/导入，方便跨设备迁移：

```typescript
export function exportData(): StorageData {
  return {
    settings: getSettings(),
    habits: getHabits(),
    courses: getCourses(),
    records: getRecords(),
    postureRules: getPostureRules(),
    reminders: getReminders()
  }
}

export function importData(value: string | StorageData) {
  const data = typeof value === 'string' ? JSON.parse(value) : value
  if (data.settings) saveSettings({ ...defaultSettings, ...data.settings })
  if (Array.isArray(data.habits)) saveHabits(data.habits)
  // ...
}
```

![设置](/img/设置.jpg)
![后台管理](/img/后台.jpg)

---

## 六、可视化与交互

### 6.1 水杯进度动画

喝水记录页面使用 CSS 实现水杯波纹效果，配合 Framer Motion 的 `AnimatePresence` 做页面过渡。

### 6.2 Recharts 数据可视化

统计页面使用 Recharts 的 4 种图表类型展示 7/30 天趋势：

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <XAxis dataKey="label" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

### 6.3 骨架姿态动画

`PostureSkeleton` 组件使用 SVG 绘制简化骨架，配合 CSS 动画展示正确/错误姿态对比。

![喝水记录](/img/喝水.jpg)
![数据统计](/img/统计.jpg)

---

## 七、隐私设计亮点

这是项目在面试中最有差异化竞争力的部分：

| 隐私措施 | 实现细节 |
|----------|----------|
| 摄像头画面不上服务器 | `getUserMedia` 获取的 `MediaStream` 仅绑定到本地 `<video>` 元素 |
| 姿态数据不上服务器（默认） | 前端直接调用 `analyzePose()`，结果仅在浏览器内展示 |
| AI 只接收数值 | 发送给 API 的是 `{score, issues, metrics}`，不包含任何图像 |
| API Key 不泄露 | 服务端 Route Handler 读取 `process.env`，Next.js 不打包到客户端 |
| 数据完全本地 | localStorage 存储，无服务端数据库依赖 |
| 可选 AI 功能 | 无 `DEEPSEEK_API_KEY` 时自动降级为本地建议，所有核心功能可用 |

**验证方式**：打开浏览器 DevTools → Network 面板，进行体态检测时不会有任何图像/视频上传请求。

---

## 八、性能优化策略

### 8.1 MediaPipe 动态加载

```typescript
poseModule = await import('@mediapipe/pose') as unknown as MediapipePoseModule
```

MediaPipe WASM 模型通过 CDN 动态加载，不打包进应用 bundle，首次加载约 3MB 但可被浏览器缓存。

### 8.2 关键点可见性过滤

```typescript
function point(landmarks: Landmark[], index: number) {
  const value = landmarks[index]
  return value && (value.visibility ?? 1) > 0.35 ? value : undefined
}
```

只有 `visibility > 0.35` 的关键点才参与计算，避免被遮挡的关键点导致误判。

### 8.3 滑动窗口历史

坐姿稳定性检测使用 24 帧滑动窗口，避免无限增长的内存占用：

```typescript
history = [...history.slice(-24), metrics]
```

---

## 九、部署方案

### Vercel（推荐）

```bash
vercel
# 在 Vercel Dashboard 设置环境变量：
# DEEPSEEK_API_KEY=your_key
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

![训练记录](/img/记录.jpg)
![颈椎放松](/img/颈椎.jpg)

---

## 十、技术复盘与改进方向

### 已实现的亮点

1. **隐私优先架构**：摄像头画面全程本地处理，零上传
2. **优雅降级**：AI 功能无 Key 时自动 fallback，不影响核心体验
3. **可配置阈值**：体态检测参数可在后台调节，适配不同体型
4. **通用训练引擎**：一套 `TrainingTimer` 支持凯格尔/护眼/颈椎所有训练课程
5. **语音引导**：Web Speech API 中文播报，支持语速/音量调节

### 未来改进方向

1. **3D 姿态分析**：引入 Z 轴信息提升驼背检测精度
2. **历史趋势**：体态评分的长期趋势图表
3. **PWA 支持**：Service Worker 离线缓存 + 桌面安装
4. **多语言**：英文/日文支持
5. **WebSocket 实时推送**：多人同步训练

---

## 项目地址

GitHub: [Sei-Health-Helper](https://github.com/ChoSeitaku/Sei-Health-Helper)

## 技术栈速览

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + TypeScript (strict) |
| 姿态检测 | MediaPipe Pose（纯浏览器本地分析） |
| 动画 | Framer Motion + CSS keyframes |
| 图表 | Recharts |
| 语音 | Web Speech API |
| AI | DeepSeek API（服务端代理） |
| 持久化 | localStorage |
| 图标 | Lucide React |