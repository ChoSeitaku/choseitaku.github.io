---
title: Call of Code - AI 程序员闯关练兵场
date: 2026-06-30 10:00:00
tags:
  - 项目
  - AI
categories:
  - 项目
description: 一个基于大语言模型的交互式技术面试模拟平台，通过 AI 动态生成关卡、智能评分、薪资成长机制，帮助程序员在趣味闯关中提升需求分析与方案设计能力。
cover: /img/random17.png
---

# Call of Code - AI 程序员闯关练兵场

> 一个基于大语言模型的交互式技术面试模拟平台，通过 AI 动态生成关卡、智能评分、薪资成长机制，帮助程序员在趣味闯关中提升需求分析与方案设计能力。

---

## 项目亮点

- **AI 动态生成**：基于用户虚拟薪资，由通义千问（qwen-max）实时生成符合中国程序员招聘标准的技术关卡
- **智能评分系统**：AI 根据用户选择的答案、关卡标准答案、当前薪资，生成完整评分报告
- **拖拽交互**：使用 VueDraggable 实现流畅的拖拽答题体验
- **薪资成长机制**：答对加薪、答错减薪，模拟真实职场晋升路径
- **结构化输出**：LangChain4j 强制 AI 返回 JSON 格式，确保数据解析的可靠性

---

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (Vue 3 + TypeScript)              │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐ │
│  │ Pinia   │ │ VueDrag  │ │ Axios   │ │ Element Plus │ │
│  └─────────┘ └──────────┘ └─────────┘ └──────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ /api 代理
┌──────────────────────▼──────────────────────────────────┐
│                 后端 (Spring Boot 3.0.5)                 │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │
│  │ Controller  │ │   Service   │ │  AI Service      │  │
│  │ (REST API)  │ │  (业务逻辑)  │ │ (LangChain4j)   │  │
│  └─────────────┘ └─────────────┘ └──────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────────┐  │
│  │ MyBatis-Plus│ │   MySQL     │ │   DashScope      │  │
│  │   (ORM)     │ │  (数据存储)  │ │  (通义千问API)    │  │
│  └─────────────┘ └─────────────┘ └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 技术栈详情

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | Vue | 3.5 | Composition API + `<script setup>` |
| **类型系统** | TypeScript | 5.6 | 全量类型安全 |
| **构建工具** | Vite | 5.4 | 开发热更新 + /api 代理 |
| **UI 组件** | Element Plus | 2.9 | 企业级组件库 |
| **状态管理** | Pinia | 2.3 | 轻量级 Store |
| **拖拽交互** | vue-draggable-plus | 0.6 | 基于 Sortable.js |
| **后端框架** | Spring Boot | 3.0.5 | 自动配置 + 内嵌 Tomcat |
| **ORM** | MyBatis-Plus | 3.5.13 | 通用 CRUD + 分页 |
| **AI 框架** | LangChain4j | 1.4.0-beta | Java AI 应用开发框架 |
| **大模型** | DashScope | qwen-max | 阿里云百炼平台 |
| **API 文档** | Knife4j | 4.4.0 | OpenAPI 3.0 |

---

## 核心功能

### 1. AI 动态生成关卡

系统根据用户当前虚拟薪资，由 AI 实时生成技术面试关卡。薪资越高，生成的关卡难度越大。

**Prompt 设计要点**：
- System Prompt 定义 AI 角色为「程序员专家 + 产品经理」
- 要求生成真实企业需求场景（非理论题）
- 选项包含技术名词、实现方案、关键流程等（至少 10 个选项）
- 难度与薪资动态匹配

```java
@SystemMessage("""
    你是一位程序员专家和产品经理，你需要根据用户当前的薪资，生成关卡，
    目标是帮助程序员朋友们提高需求分析、方案设计能力、技术的广度...
    """)
@UserMessage("当前薪资：{{salary}} 元/月")
GenerateLevelResponse generateLevel(@V("salary") Integer salary);
```

### 2. 拖拽答题交互

用户从候选池中拖拽正确选项到答题区，支持多选和排序。

**技术实现**：
- 使用 `vue-draggable-plus` 封装 Sortable.js
- 候选池配置 `pull: 'clone'`（只克隆不移除）
- 答题区支持内部排序和批量清空

```typescript
// 候选池 group：只克隆出去，不接受拖入
const candidateGroup = { name: 'options', pull: 'clone', put: false }
// 答题区 group：接受拖入，可内部排序
const answerGroup = { name: 'options', put: true }
```

### 3. AI 智能评分报告

提交答案后，AI 生成包含以下内容的完整报告：

| 字段 | 说明 |
|------|------|
| `score` | 作答分数（0-100） |
| `comment` | 幽默评价（如「升职加薪」「直接开除」） |
| `salaryChange` | 薪资调整金额（正数加薪/负数减薪） |
| `suggest` | 公司投递建议（化名，如「阿巴阿巴」「企鹅大王」） |
| `reason` | 评分原因解析 |
| `trueOptions` | 正确选项列表 |
| `standardAnswer` | 标准答案详解 |

### 4. 薪资成长系统

- 初始薪资：10,000 元/月
- 答对：根据评分等级加薪（最高 +5,000）
- 答错：根据失误程度减薪（最低 -3,000）
- 薪资下限：0 元

---

## 数据库设计

```sql
-- 用户表
CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- MD5(SALT + password)
    nickname VARCHAR(50),
    salary INT DEFAULT 10000,         -- 当前虚拟薪资
    isDelete TINYINT DEFAULT 0
);

-- 关卡表
CREATE TABLE level (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    levelName VARCHAR(200) NOT NULL,
    levelDesc TEXT NOT NULL,
    options TEXT NOT NULL,            -- JSON 格式选项
    difficulty VARCHAR(20),           -- 简单/中等/困难
    targetSalary INT,
    isDelete TINYINT DEFAULT 0
);

-- 用户闯关记录表
CREATE TABLE user_level (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userId BIGINT NOT NULL,
    levelId BIGINT NOT NULL,
    userOptions TEXT NOT NULL,        -- 用户选择的选项 JSON
    score INT DEFAULT 0,
    comment TEXT,
    salaryChange INT DEFAULT 0,
    suggest TEXT,
    reason TEXT,
    trueOptions TEXT,                 -- 正确选项 JSON
    standardAnswer TEXT,              -- 标准答案详解
    isDelete TINYINT DEFAULT 0
);
```

---

## 项目结构

```
call-of-code/
├── call-of-code/                    # 后端 Spring Boot
│   ├── sql/init.sql                 # 数据库建表脚本
│   ├── pom.xml
│   └── src/main/java/.../callofcode/
│       ├── controller/              # REST API 层
│       │   ├── UserController       # 注册/登录/登出
│       │   ├── LevelController      # 关卡管理 + AI 生成
│       │   └── UserLevelController  # 答题提交 + 记录
│       ├── service/
│       │   ├── ai/                  # AI 服务接口（LangChain4j）
│       │   │   ├── LevelAiService   # 关卡生成
│       │   │   └── GradeResultAiService  # 智能评分
│       │   └── impl/               # 业务实现
│       ├── model/
│       │   ├── ai/                  # AI 结构化响应 POJO
│       │   ├── dto/                 # 请求体
│       │   ├── entity/              # 数据库实体
│       │   └── vo/                  # 视图对象
│       ├── mapper/                  # MyBatis Mapper
│       ├── config/                  # AI Service 配置
│       └── common/                  # 通用类
│
└── call-of-code-frontend/           # 前端 Vue 3
    └── src/
        ├── api/                     # 接口封装（axios）
        ├── views/                   # 页面组件
        │   ├── LoginView            # 登录/注册
        │   ├── HomeView             # 主页（薪资+记录）
        │   ├── LevelDetailView      # 关卡详情+拖拽答题
        │   └── ReportView           # 结果报告
        ├── stores/                  # Pinia Store
        ├── router/                  # 路由+登录守卫
        └── types/                   # TypeScript 类型
```

---

## 界面展示

### 主页

展示用户当前虚拟薪资、闯关记录，支持一键生成新关卡。

![主页](/img/主页.jpg)

### 关卡详情 + 拖拽答题

左侧为 AI 生成的需求描述，右侧为候选选项池和答题区。用户将选项从左侧拖拽到右侧完成作答。

![答题页面](/img/答题页面.jpg)

![拖拽选项答题](/img/拖拽选项答题.jpg)

### AI 评分报告

提交答案后，AI 生成完整的评分报告，包含分数、幽默评价、薪资调整、公司投递建议等。

![查看报告](/img/查看报告.jpg)

![报告和答案](/img/报告和答案.jpg)

### 标准答案解析

AI 提供详细的标准答案解读，包括企业中的实现方案和各选项的作用。

![标准答案解析](/img/标准答案解析.jpg)

### 闯关记录

每次闯关后薪资实时更新，记录历史闯关成绩。

![闯关记录](/img/闯关记录+1.jpg)

---

## 快速开始

### 环境要求

- JDK 17+
- Node.js 18+
- MySQL 8.x
- 阿里云百炼平台 API Key

### 启动步骤

```bash
# 1. 初始化数据库
mysql -u root -p < sql/init.sql

# 2. 配置 AI API Key
# 在 src/main/resources/ 下创建 application-local.yml
langchain4j:
  community:
    dashscope:
      chat-model:
        api-key: sk-xxxxxxxx
        model-name: qwen-max

# 3. 启动后端
cd call-of-code
mvn spring-boot:run
# 后端运行在 http://localhost:8123/api
# API 文档 http://localhost:8123/doc.html

# 4. 启动前端
cd call-of-code-frontend
npm install
npm run dev
# 前端运行在 http://localhost:5173
```

### 测试账号

| 用户名 | 密码 |
|--------|------|
| `testuser` | `123456` |

---

## AI 工作流

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  用户请求    │───▶│ LangChain4j  │───▶│ DashScope   │
│ (薪资参数)  │    │ (Prompt管理) │    │ (qwen-max)  │
└─────────────┘    └──────────────┘    └─────────────┘
                          │                    │
                          ▼                    ▼
                   ┌──────────────┐    ┌─────────────┐
                   │ 结构化响应    │◀───│ JSON 输出   │
                   │ (POJO映射)   │    │ (强制格式)  │
                   └──────────────┘    └─────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  入库保存     │
                   │  (MySQL)     │
                   └──────────────┘
```

**Prompt 工程要点**：
1. System Prompt 明确 AI 角色和输出格式
2. 使用 `@V` 注解进行变量注入
3. 返回值类型为 POJO，LangChain4j 自动解析 JSON
4. Few-Shot 示例引导输出格式

---

## 技术难点与解决方案

### 1. AI 输出格式不稳定

**问题**：直接调用 LLM 返回的 JSON 格式可能不一致

**解决**：使用 LangChain4j 的结构化输出功能，通过定义 POJO 类 + `@SystemMessage` 约束输出格式，框架自动完成 JSON 解析和类型转换

### 2. 拖拽交互状态管理

**问题**：拖拽后需要同步更新候选池和答题区的状态

**解决**：使用 `vue-draggable-plus` 的 `v-model` 双向绑定，配合 `group` 配置实现跨容器拖拽

### 3. Session 登录态

**问题**：前后端分离架构下的用户认证

**解决**：使用 Spring Session + Cookie（`withCredentials: true`），前端 axios 拦截器统一处理

---

## 面试要点

**Q: 为什么选择 LangChain4j 而不是直接调用 DashScope SDK？**

A: LangChain4j 提供了声明式的 AI 服务接口（类似 MyBatis Mapper），通过注解即可完成 Prompt 管理、变量注入、结构化输出，大幅降低 AI 应用开发复杂度。同时支持多种 LLM 提供商的无缝切换。

**Q: 如何保证 AI 输出的 JSON 格式可靠性？**

A: 通过定义强类型 POJO 作为返回值，LangChain4j 会在 Prompt 中添加 JSON Schema 约束，并在响应解析时进行类型校验。如果格式不匹配会抛出异常，可以配合重试机制使用。

**Q: 项目中用了什么设计模式？**

A: 
- **策略模式**：AI 服务接口（LevelAiService、GradeResultAiService）可替换不同 LLM 实现
- **模板方法**：ServiceImpl 基类封装通用 CRUD，子类实现业务逻辑
- **Builder 模式**：QueryWrapper 链式构建查询条件

---

## License

MIT