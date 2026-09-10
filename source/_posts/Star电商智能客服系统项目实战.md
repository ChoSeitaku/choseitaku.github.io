---
title: Star 电商智能客服系统：基于 LLM 的多轮对话架构设计与实战
date: 2026-08-22 10:00:00
tags:
  - LLM
  - 对话系统
  - FastAPI
categories:
  - 项目实战
description: 基于大语言模型的电商智能客服系统，涵盖YAML流程引擎、多轮对话状态持久化、槽位管理等核心设计
cover: /img/random25.png
---

# Star 电商智能客服系统：基于 LLM 的多轮对话架构设计与实战

> 本文记录了一个基于大语言模型的电商智能客服系统的完整设计与实现过程，涵盖对话引擎架构、YAML 流程配置、槽位管理、多轮对话状态持久化等核心内容。

## 项目概览

这是一个完整的电商智能客服示例项目，支持订单状态查询、物流查询、退款申请、商品推荐、闲聊寒暄等能力，并通过 YAML 流程配置驱动多轮对话。

### 功能演示

<table>
  <tr>
    <td align="center"><img src="/img/blog-post/打招呼.jpg" width="300"><br><b>欢迎引导</b></td>
    <td align="center"><img src="/img/blog-post/查询订单状态.jpg" width="300"><br><b>订单状态查询</b></td>
  </tr>
  <tr>
    <td align="center"><img src="/img/blog-post/商品咨询.jpg" width="300"><br><b>商品咨询</b></td>
    <td align="center"><img src="/img/blog-post/退款申请.jpg" width="300"><br><b>退款申请</b></td>
  </tr>
  <tr>
    <td align="center"><img src="/img/blog-post/闲聊.jpg" width="300"><br><b>闲聊寒暄</b></td>
  </tr>
</table>

### 技术栈

| 模块 | 技术 |
| --- | --- |
| 客服后端 | Python 3.11+、FastAPI、LangChain、SQLAlchemy、aiomysql、Jinja2、PyYAML |
| 电商服务 | FastAPI、SQLAlchemy、PyMySQL |
| 前端 | Vue 3、Vite |

## 系统架构设计

### 整体架构

系统采用前后端分离的微服务架构，分为三个独立服务：

```
┌──────────────────┐     ┌───────────────────┐     ┌──────────────────────────┐
│  Vue 3 前端       │────>│  客服后端           │────>│  电商模拟服务              │
│  (端口 5173)     │<────│  (端口 18082)      │<────│  (端口 18081)            │
│                  │     │  FastAPI           │     │  FastAPI                 │
│  - 文本消息       │     │  + LangChain      │     │  + SQLAlchemy            │
│  - 对象消息       │     │  + YAML Flow      │     │  - 订单/商品/物流/退款     │
│  - 订单/商品列表  │     │  + LLM            │     │  - MySQL (commerce DB)   │
└──────────────────┘     │  - MySQL          │     └──────────────────────────┘
                         │  (customer_service)│
                         └───────────────────┘
```

### 目录结构

```
ecommerce-customer-service/
├── customer-service-backend/    # 智能客服后端
│   ├── choseitaku/              # 核心业务包
│   │   ├── conf/                # 配置管理
│   │   ├── app/                 # FastAPI 应用层
│   │   ├── domain/              # 领域模型
│   │   ├── service/             # 业务服务层
│   │   ├── engine/              # 对话引擎
│   │   ├── plan/                # 意图识别
│   │   ├── task/                # 任务执行体系
│   │   ├── knowledge/           # 知识问答
│   │   ├── chitchat/            # 闲聊处理
│   │   ├── clarify/             # 澄清应答
│   │   ├── prompts/             # Prompt 模板
│   │   ├── clients/             # 客户端层
│   │   ├── repository/          # 持久化层
│   │   └── models/              # ORM 模型
│   ├── flow_config/             # 对话流程 YAML 配置
│   └── main.py                  # 服务入口
├── ecommerce-service-backend/   # 电商模拟服务
│   └── app/                     # API + ORM 模型
└── customer-service-frontend/   # 聊天前端
    └── src/                     # Vue 3 组件
```

## 核心设计：对话引擎

对话引擎是整个系统的核心，负责理解用户意图、调度任务执行、生成回复。

### 单轮对话处理流程

```
用户输入 (文本/对象)
    │
    ▼
[1] chat_router.chat()
    │   将 ChatRequest 转换为 UserMessage
    │
    ▼
[2] DialogueService.process_message()
    │   (a) 从 MySQL 加载 DialogueState
    │   (b) 调用 DialogueEngine
    │   (c) 将修改后的 DialogueState 存回 MySQL
    │
    ▼
[3] DialogueEngine.process_message()
    │   (a) 准备 session（新建/续接/过期）
    │   (b) 创建 Turn 对象
    │   (c) 分发到文本/对象消息处理
    │
    ▼ (文本消息路径)
[4] TurnPlanner.predict() -- 意图识别
    │   调用 LLM -> 输出 TurnPlan JSON
    │
    ▼
[5] TurnPlanValidator.validate() -- 计划校验
    │
    ▼
[6] 三路分发:
    ├─ task 轨道 -> TaskHandler (流程执行)
    ├─ knowledge 轨道 -> KnowledgeHandler (知识问答)
    └─ chitchat 轨道 -> ChitchatHandler (闲聊)
```

### 数据结构设计

对话状态采用分层设计，支持多会话、多任务并行：

```
DialogueState
├── shared: SharedState
│   ├── focused_object: FocusedObject (type, id, title, attributes)
│   └── sessions: list[Session]
│       └── Session
│           ├── session_id, started_at, last_activity_at
│           └── turns: list[Turn]
│               └── Turn
│                   ├── user_message: UserMessage
│                   └── bot_messages: list[BotMessage]
└── tasks: TaskState
    ├── active: TaskInstance (flow_id, step_id, slots, task_id)
    └── paused: list[TaskInstance]
```

### 会话状态持久化

- 对话状态以 JSON 形式存储在 MySQL `customer_service` 数据库
- 使用 `INSERT ... ON DUPLICATE KEY UPDATE` 实现 upsert
- Session 最后活动时间超过 1 小时自动过期

## YAML 流程引擎设计

流程引擎是本项目的亮点设计，通过 YAML 配置定义对话流程，实现业务逻辑与代码解耦。

### 流程步骤类型

| 步骤类型 | 说明 | 行为 |
|---------|------|------|
| `start` | 流程开始 | 直接推进到下一步 |
| `collect` | 收集槽位 | 检查槽位是否已填充，未填充则提示用户输入 |
| `action` | 执行动作 | 调用注册的 Action（如查订单），将返回值写入 slots |
| `response` | 生成回复 | 三种模式: static / rephrase / generate |
| `end` | 流程结束 | 清除活跃任务 |

### 步骤间连接

- **StaticLink**: 固定跳转到指定步骤
- **ConditionalLink**: 条件表达式为 true 时跳转
- **FallbackLink**: 条件不满足时的默认跳转

### 核心业务流程

#### 1. 订单状态查询

```yaml
order_status_query:
  steps:
    - id: start
      next: collect_order_number
    - id: collect_order_number
      type: collect
      slot: order_number
      prompt: "请提供您的订单号"
      validation:
        not_empty: true
      next: action_lookup
    - id: action_lookup
      type: action
      action: action_lookup_order_status
      params:
        include_summary: true
      next: response_rephrase
    - id: response_rephrase
      type: response
      mode: rephrase
      template: "订单 {{ order_number }} 的状态为：{{ order_status }}。{{ order_summary }}"
      next: end
    - id: end
      type: end
```

#### 2. 退款申请

```yaml
refund_request:
  steps:
    - id: start
      next: collect_order_number
    - id: collect_order_number
      type: collect
      slot: order_number
      prompt: "请提供需要退款的订单号"
      next: collect_refund_reason
    - id: collect_refund_reason
      type: collect
      slot: refund_reason
      prompt: "请说明退款原因"
      next: response_submit
    - id: response_submit
      type: response
      mode: static
      template: "已为您提交退款申请，订单号：{{ order_number }}，原因：{{ refund_reason }}。工作人员将尽快处理。"
      next: end
    - id: end
      type: end
```

#### 3. 物流查询

```yaml
logistics_tracking:
  steps:
    - id: start
      next: collect_order_number
    - id: collect_order_number
      type: collect
      slot: order_number
      prompt: "请提供需要查询物流的订单号"
      next: action_lookup
    - id: action_lookup
      type: action
      action: action_lookup_logistics
      next: response_static
    - id: response_static
      type: response
      mode: static
      template: |
        物流公司：{{ logistics_company }}
        运单号：{{ tracking_number }}
        当前状态：{{ logistics_status }}
      next: end
    - id: end
      type: end
```

### 所有流程总览

| Flow ID | 名称 | 步骤链 |
|---------|------|--------|
| `onboarding` | 欢迎引导 | start -> respond(generate) -> end |
| `order_status_query` | 订单状态查询 | start -> collect -> action -> response(rephrase) -> end |
| `logistics_tracking` | 物流查询 | start -> collect -> action -> response(static) -> end |
| `refund_request` | 退款申请 | start -> collect -> collect -> response(static) -> end |
| `similar_product_recommendation` | 相似商品推荐 | start -> 条件判断 -> action -> response -> end |
| `human_handoff` | 人工客服 | start -> respond("转接人工") -> end |

## 意图识别与 Prompt 工程

### 意图识别

系统通过 LLM 进行意图识别，输出结构化的 TurnPlan JSON：

```json
{
  "task": {
    "commands": [
      {"type": "start_flow", "flow_id": "order_status_query"}
    ]
  }
}
```

TurnPlan 三选一：
- **task**: 任务轨道（流程执行）
- **knowledge**: 知识问答轨道
- **chitchat**: 闲聊轨道

### Prompt 模板设计

系统使用 Jinja2 模板管理 Prompt，支持动态注入上下文：

```jinja2
你的任务是分析当前对话上下文，并生成一个 TurnPlan JSON。
TurnPlan 顶层只允许以下三个字段：task / knowledge / chitchat

可用 flows：{{ available_flows_json }}
允许的 intent：{{ knowledge_intents_json }}
Active Task：{{ active_task_json }}
对话历史：{{ current_conversation }}
用户最后一句："""{{ user_message }}"""
```

### 回复生成模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `static` | Jinja2 模板渲染 | 结构化数据展示 |
| `rephrase` | 模板渲染 + LLM 改写 | 需要自然语言表达 |
| `generate` | 纯 LLM 生成 | 闲聊、开放性问题 |

## 电商服务设计

### 数据模型

电商服务包含 8 张核心表：

```
User (用户)
├── orders -> Order (订单)
│   ├── items -> OrderItem (订单明细)
│   ├── logistics_records -> LogisticsRecord (物流记录)
│   │   └── traces -> LogisticsTrace (物流轨迹)
│   ├── refund_requests -> RefundRequest (退款申请)
│   └── shipping_urges -> ShippingUrgeRequest (发货提醒)
└── products -> Product (商品)
```

### API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/users/{user_id}/orders` | 用户订单列表 |
| GET | `/users/{user_id}/products` | 用户商品列表 |
| GET | `/orders/{order_id}` | 订单详情 |
| GET | `/orders/{order_id}/status` | 订单状态 |
| GET | `/orders/{order_id}/logistics` | 物流信息 |
| GET | `/products/{product_id}` | 商品详情 |
| POST | `/orders/{order_id}/refund-applications` | 创建退款申请 |

## 前端设计

前端采用 Vue 3 + Vite，实现了一个简洁的聊天界面：

- **左侧聊天区**: 支持文本消息和对象消息（订单/商品卡片）
- **右侧边栏**: Tab 切换显示用户订单列表和商品列表
- **代理配置**: `/api` 代理到客服后端，`/commerce` 代理到电商服务

## 关键设计决策与思考

### 1. 为什么选择 YAML 配置驱动对话流程？

- **业务与代码解耦**: 产品经理可以直接修改 YAML 配置，无需改动代码
- **可视化流程**: YAML 结构清晰，易于理解和维护
- **快速迭代**: 新增业务流程只需添加 YAML 配置和 Action 实现

### 2. 三轨道分发设计

将用户意图分为 task / knowledge / chitchat 三个轨道，各有独立的处理逻辑：

- **task 轨道**: 处理结构化业务流程（需要多轮收集信息）
- **knowledge 轨道**: 处理知识问答（单轮查询）
- **chitchat 轨道**: 处理闲聊寒暄

### 3. 槽位管理与对象消息

支持用户通过点击按钮发送订单/商品对象，自动填充对应槽位，提升交互体验。

### 4. 会话状态持久化

将对话状态存储在 MySQL，支持：
- 多设备接入同一会话
- 会话历史追溯
- 会话过期自动清理

## 总结

这个项目展示了如何将 LLM 与传统业务系统结合，构建一个可扩展、可维护的智能客服系统。核心设计亮点包括：

1. **YAML 流程引擎**: 实现业务逻辑配置化
2. **三轨道分发**: 灵活处理不同类型的用户意图
3. **槽位管理**: 支持多轮对话信息收集
4. **状态持久化**: 保证对话上下文连续性

项目代码已开源，欢迎交流学习。
