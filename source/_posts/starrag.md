---
title: StarRAG - 商品资料知识库问答系统
date: 2026-08-12 10:00:00
tags:
  - 项目
  - AI
categories:
  - 项目
description: 面向客服、运营和业务人员的 RAG 知识库系统，解决产品手册查询效率低、资料分散、人工翻文档成本高的问题。
cover: /img/random18.png
---

# StarRAG - 商品资料知识库问答系统

> 面向客服、运营和业务人员的 RAG 知识库系统，解决产品手册查询效率低、资料分散、人工翻文档成本高的问题。

## 项目概述

StarRAG 是一个基于 LangGraph 的 RAG 知识库问答系统，主要解决企业产品资料多、格式复杂、人工查找效率低、客服回答不稳定的问题。系统会把 PDF、Markdown、图片、表格这些非结构化资料统一导入知识库，用户后续直接用自然语言提问，就能从知识库里召回相关资料，并生成有依据的答案。

### 核心能力

- **文档自动导入**：支持 PDF、Word、Markdown 格式，自动解析、切片、向量化
- **智能问答**：多路召回 + RRF 融合 + Rerank 精排，精准匹配用户问题
- **流式响应**：SSE 实时推送答案，提升用户体验
- **多轮对话**：支持上下文理解，自动识别商品名

### 技术栈

| 模块 | 技术选型 |
|:---|:---|
| Web 框架 | FastAPI |
| 流程编排 | LangGraph |
| 向量数据库 | Milvus |
| 对象存储 | MinIO |
| 历史存储 | MongoDB |
| Embedding | BGE-M3 |
| Reranker | BGE-reranker-large |
| LLM | 千问 Flash |
| VLM | 图片摘要（兼容 OpenAI/DashScope） |

---

## 系统架构

![项目架构图](/img/检索核心业务流程.drawio.png)

---

## 存储流程

存储流程可以理解为"**文档导入、内容结构化、向量入库**"三步。

![导入数据流程图](/img/导入数据-所有7个节点流程图.png)

### 1. 文档上传

用户在前端选择 PDF、Word 或 Markdown 文档后：

1. FastAPI 导入接口创建 `task_id`
2. `ImportFileService` 把原文件保存到本地任务目录，再归档到 MinIO
3. `TaskService` 记录上传、处理中、完成、失败等任务状态
4. 前端通过任务状态看到导入进度

![文件导入](/img/文件导入.jpg)

![文件上传到 MinIO](/img/文件上传到minio.jpg)

### 2. 文档解析

导入任务启动后：

1. `task_id`、`file_dir`、`import_file_path` 放进 LangGraph 的 `ImportGraphState`
2. 入口节点判断文档类型
3. PDF 文档先经过 MinerU 解析成 Markdown
4. Markdown 文档直接进入读取链路

**MinerU 解决的问题：**
- PDF 文本顺序乱
- 表格难抽
- 图片引用难保留

### 3. 图片处理

图片处理节点：

1. 读取 Markdown 和 images 目录
2. 提取图片所在段落的上下文（前后的标题、上文、下文）
3. 调用 VLM 生成图片标题或摘要
4. 上传 MinIO
5. 把 Markdown 中的本地图片链接替换成远程图片 URL 和图片摘要

![文件中的图片上传到 MinIO](/img/文件中的图片上传到minio.jpg)

### 4. 文档切分

`DocumentSplitNode` 按标题层级切分文档：

1. 按 Markdown 1-6 级标题切分
2. 保留 title、parent_title、file_title、content 等元数据
3. 表格内容做线性化处理（HTML `<table>` → 自然语言）
4. 长段落按最大长度继续切分（最大 1200 字符）
5. 短内容按相邻上下文合并（最小 300 字符）
6. 最终形成适合检索的 chunk

![导入的新切片向量数据](/img/导入的新的切片的向量数据.jpg)

### 5. 商品名识别

1. 取前几个 chunk 和文件标题调用 LLM 提取 `item_name`
2. 用 BGE-M3 生成商品名的稠密向量和稀疏向量
3. 保存到商品名向量集合
4. 同时将提取的 item_name 回填到 chunks 中

![导入的主题词向量](/img/导入的主题词向量.jpg)

### 6. 向量化入库

1. 把 item_name 和 chunk 内容拼接成 embedding 内容
2. 按 batch 调用 BGE-M3 生成 `dense_vector` 和 `sparse_vector`
3. Milvus 入库节点创建 chunks 集合、稠密向量索引、稀疏向量索引和标量字段
4. 批量插入 Milvus

![Milvus 向量数据](/img/milvus向量数据.jpg)

### 7. 三类核心资产

- MinIO 中的原文件和图片对象
- Milvus 中的商品名向量
- Milvus 中的切片向量

---

## 查询流程

查询流程可以理解为"**商品名确认、多路召回、融合重排、答案生成**"四步。

![检索核心业务流程](/img/检索核心业务流程.drawio.png)

### 1. 入口

用户在前端输入问题后：

1. `QueryService` 生成 `task_id` 和 `session_id`
2. 流式查询为 `task_id` 创建 SSE 队列
3. `original_query`、`session_id`、`task_id`、`is_stream` 放进 `QueryGraphState`

![检索内容](/img/检索内容.jpg)

### 2. 商品名确认节点

1. 从 MongoDB 读取最近的历史对话
2. 把历史和当前问题一起交给 LLM
3. 抽取 `item_names` 并生成 `rewritten_query`
4. 用 BGE-M3 生成商品名向量
5. 到 Milvus 商品名集合中做混合向量对齐
6. 高分直接确认、中间分返回候选、低分返回补充型号提示
7. 多轮对话中如果前面历史消息缺失 item_names，确认成功后会回填历史记录

![Milvus 主题名](/img/milvus主题名.jpg)

### 3. multi_search 并行召回

**第一路：普通向量检索**
- `rewritten_query` 生成 dense 和 sparse 向量
- Milvus chunks 集合按 item_name 标量过滤检索

**第二路：HyDE 检索**
- LLM 根据问题生成假设性技术文档
- 原问题 + 假设文档一起向量化检索

**第三路：MCP 网络检索**
- MCP 客户端调用 `bailian_web_search`
- 拿到外部网页标题、摘要和 URL

![检索内容返回](/img/检索内容返回.jpg)

### 4. RRF 融合节点

本地两路结果按 chunk_id 去重融合：

- 权重：1.0
- k 值：60
- 保留靠前的候选 chunk

### 5. Rerank 节点

1. 把 RRF 后的本地 chunk 和 MCP 网页结果合并
2. 构造成 query-doc pair
3. 交给 BGE-Reranker 做交叉编码精排
4. 断崖检测动态截断候选结果（最少 6 条、最多 15 条）

![检索内容返回1](/img/检索内容返回1.jpg)

### 6. 答案生成节点

1. 把 reranked_docs、历史对话、商品名和用户问题组装成最终 prompt
2. 调用 LLM 生成答案
3. 非流式写入任务结果
4. 流式通过 SSE 推送 delta 事件
5. 结束时推送 final 事件
6. 写入 MongoDB 形成可追溯的会话历史

![MongoDB 对话记录](/img/mongodb对话记录.jpg)

---

## 核心算法

### RRF（Reciprocal Rank Fusion）

倒数排名融合算法，用来融合多路检索结果。

```
score(d) = Σ weight_i / (k + rank_i(d))
```

- 不依赖不同召回源原始分数可比性
- 根据文档在各路结果中的排名计算综合分
- k 常用 60（经验值）

### HyDE（Hypothetical Document Embeddings）

假设性文档检索：

1. 先让模型根据问题生成一段可能的答案或假设文档
2. 再用这段假设文档做向量检索
3. 用户问题短或缺实体，假想文档更像真实手册表达
4. 问题 + 假想文档向量检索，更容易命中

**防偏措施：**
- 提示限制必须围绕原问题生成
- HyDE 只是一路，还会和原问题合并
- 后面有 rerank 重排序

### 断崖检测截断

动态确定保留文档数量的方法：

- Rerank 后文档按分数从高到低排序
- 默认：绝对差 0.5 或相对差 25%
- 截断太激进 → context_recall 下降
- 截断太宽松 → context_precision 下降 + 模型幻觉风险

---

## 模型选择

| 模块 | 配置 |
|:---|:---|
| 应用服务 | 2 台 8C32G 云主机，Docker Compose 部署 FastAPI 服务 |
| 模型服务 | 1 台 GPU 服务器，32C128G，1 张 NVIDIA L20 48GB |
| 推理框架 | vLLM，OpenAI compatible API |
| 主力生成模型 | Qwen3.5-35B-A3B-GPTQ-Int4，max_model_len=16384 |
| 线上模型 | Qwen-Flash / Qwen-vl-Flash |
| Embedding | BGE-M3 |
| Reranker | BGE-reranker-large |
| 向量库 | Milvus |
| 文档/图片存储 | MinIO |
| 历史存储 | MongoDB |
| 监控 | Prometheus + Grafana + 结构化 trace 日志 |

---

## 压测数据

| 并发 | QPS | TTFT P50 | TTFT P95 | TPOT P95 | GPU 利用率 |
|:---|:---|:---|:---|:---|:---|
| 16 | 14.8 | 310ms | 620ms | 38ms/token | 61% |
| 32 | 25.6 | 420ms | 880ms | 46ms/token | 78% |
| 64 | 38.9 | 690ms | 1.42s | 63ms/token | 91% |

---

## 数据规模

| 类型 | 数量 |
|:---|:---|
| 电商平台 DAU | 1-5 万 |
| 知识库服务 QPS | 0.5-1 |
| 知识库文档 | 1000-5000 个 |
| 原始文件体积 | 5-25 GB |
| 文档 chunk | 20-100 万个 |
| 图片/图表 | 5000-25000 张 |
| MongoDB 历史消息 | 30-150 万条 |

---

## RAGAS 评估指标

| 指标 | 含义 | 低分说明 |
|:---|:---|:---|
| faithfulness | 答案是否被上下文支撑 | 可能幻觉 |
| answer_relevancy | 回答是否切题 | 模型理解或提示词问题 |
| context_precision | 召回上下文是否干净 | 噪声多 |
| context_recall | 证据是否召全 | 召回链路问题 |
| answer_correctness | 最终答案和标准答案是否一致 | 整体效果指标 |

---

## 项目亮点

1. **完整工程化 RAG 系统**：导入侧处理 PDF、图片、表格、商品名、向量；查询侧多路召回、RRF 融合、Rerank 精排
2. **商品名确认机制**：LLM 抽取 + 向量对齐，解决多轮对话中商品名缺失问题
3. **多路召回融合**：普通向量 + HyDE + MCP 网络检索，覆盖不同查询场景
4. **断崖检测截断**：动态确定保留文档数量，平衡召回率和精确率
5. **SSE 流式响应**：实时推送答案，提升用户体验
6. **非结构化资料沉淀**：把产品手册变成可检索、可追踪、可复用的知识库

---

## 项目截图

### 文件导入

![上传文件](/img/上传文件.jpg)

![上传完成](/img/上传完成.jpg)

### 向量数据

![Milvus 向量数据](/img/milvus向量数据.jpg)

![Milvus 主题名](/img/milvus主题名.jpg)

### 检索结果

![检索内容](/img/检索内容.jpg)

![检索内容返回](/img/检索内容返回.jpg)

![检索内容返回1](/img/检索内容返回1.jpg)

### 历史记录

![MongoDB 对话记录](/img/mongodb对话记录.jpg)