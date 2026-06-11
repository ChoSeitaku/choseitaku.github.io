---
title: JavaWeb 基础面试题精炼
date: 2026-06-08 12:00:00
tags:
  - 面经
categories:
  - 技术
description: 精炼 JavaWeb 基础高频面试题，涵盖 Session/Cookie、Servlet、HTTP 协议、GET/POST、状态码、转发与重定向、AJAX 等核心考点，聚焦面试回答思路。
cover: /img/random06.png
---

## 前言

本文精炼 **JavaWeb 基础** 7 道高频面试题，每道题聚焦面试回答的核心思路和关键结论，帮助快速掌握面试中的标准答法。

---

## 一、Session 和 Cookie 的机制和区别（重点）

### 

HTTP 是无状态协议，Session 和 Cookie 都是为了解决状态记录问题。

**核心区别一句话：Session 存服务器，Cookie 存客户端，通过 SessionID 关联。**

| 维度 | Session | Cookie |
|------|---------|--------|
| 存储位置 | 服务器端 | 客户端浏览器 |
| 安全性 | 更安全，数据不暴露给客户端 | 易受 XSS 攻击，需设 HttpOnly/Secure |
| 容量 | 无浏览器限制 | 单个 4KB，每域名约 20 个 |
| 生命周期 | 默认 30 分钟，关闭浏览器失效 | 可设 expires 持久化 |
| 数据传输 | 每次请求只传 SessionID | 每次请求携带所有 Cookie |
| 分布式扩展 | 需集中存储（如 Redis） | 天然支持，存在客户端 |

**关键补充：**
- Session 通过 Cookie 中携带的 JSESSIONID 来识别用户
- 浏览器关闭后 Session 并非立即销毁，而是因为携带 SessionID 的 Cookie（默认会话级）失效，导致找不到之前的 Session
- 分布式系统中 Session 需用 Redis 等集中存储解决共享问题

---

## 二、Servlet 实现方案和生命周期方法

### 

Servlet 是 Java EE 规范接口，运行在 Servlet 容器中处理 HTTP 请求。

**三种实现方案：**

| 方案 | 方式 | 适用场景 |
|------|------|----------|
| 实现 `Servlet` 接口 | 需管理全部生命周期方法 | 通用协议处理 |
| 继承 `GenericServlet` | 抽象类，简化了生命周期管理 | 通用协议 |
| 继承 `HttpServlet` | 最常用，重写 `doGet()`/`doPost()` | HTTP 请求专用 |

**生命周期四个阶段：**

1. **`init()`**：首次请求时调用一次，用于初始化（如加载配置）
2. **`service()`**：每次请求调用，根据 HTTP 方法分发到 doGet/doPost
3. **`destroy()`**：容器关闭时调用，释放资源
4. **多线程处理**：每个请求由独立线程处理 → 注意线程安全，避免共享变量

---

## 三、HTTP 协议请求和响应的报文格式（重点）

### 

HTTP 是 Web 通信的基础协议。

**请求报文结构：**
```
请求行（方法 URL 版本）
请求头（Host、User-Agent、Content-Type 等）
空行
请求体（GET 无，POST 有）
```

**响应报文结构：**
```
状态行（版本 状态码 描述）
响应头（Content-Type、Set-Cookie 等）
空行
响应体（HTML、JSON 等）
```

**HTTP 版本演进：**
- HTTP/1.0：每次请求新建 TCP 连接
- HTTP/1.1：持久连接 + 管道化，默认 keep-alive
- HTTP/2：多路复用 + 二进制分帧 + 头部压缩 + 服务器推送
- HTTP/3：基于 QUIC（UDP），更低延迟，解决队头阻塞

**常见的请求/响应头**了解即可，面试时提到几个关键的即可：`Host`、`Content-Type`、`Authorization`、`Cookie`、`Cache-Control`、`Set-Cookie`。

---

## 四、HTTP 协议 GET 和 POST 区别（重点）

### 

**核心区别：参数位置不同 → 引发一系列连锁差异。**

| 维度 | GET | POST |
|------|-----|------|
| 参数位置 | URL 中拼接 | 请求体中携带 |
| 请求体 | 无 | 有 |
| 安全性 | 较低，参数暴露在 URL | 相对安全 |
| 大小限制 | URL 长度受限（浏览器限制） | 请求体无大小限制 |
| 用途 | 查询、获取数据 | 提交、上传、修改 |
| 幂等性 | ✅ 幂等 | ❌ 非幂等 |
| 效率 | 更高（没有请求体） | 较低 |

**其他常用方法：**
- PUT：更新资源（幂等）
- DELETE：删除资源（幂等）
- PATCH：部分更新（非幂等）
- HEAD：只获取响应头
- OPTIONS：查询支持的 HTTP 方法（CORS 预检）

---

## 五、HTTP 协议常见的响应状态码（重点）

### 

状态码按首位数字分为 5 类，面试时每类至少说出 2~3 个常用的：

**1xx 信息：** 请求已接收，继续处理（100 Continue、101 切换协议）

**2xx 成功：**
- **200 OK**：请求成功
- **201 Created**：创建资源成功（POST）
- **204 No Content**：成功但无返回内容

**3xx 重定向：**
- **301 永久重定向**：资源永久迁移，浏览器更新书签
- **302 临时重定向**：临时跳转，搜索引擎不更新
- **304 Not Modified**：资源未变化，使用浏览器缓存

**4xx 客户端错误：**
- **400 Bad Request**：请求格式有误
- **401 Unauthorized**：未认证，需登录
- **403 Forbidden**：无权限访问
- **404 Not Found**：资源不存在
- **405 Method Not Allowed**：HTTP 方法错误

**5xx 服务器错误：**
- **500 Internal Server Error**：服务器内部错误
- **502 Bad Gateway**：网关/代理收到无效响应
- **503 Service Unavailable**：服务器过载或维护

---

## 六、转发和重定向的区别

### 

**一句话：转发是服务器内部行为（URL 不变），重定向是让浏览器重新发请求（URL 变）。**

| 维度 | 转发（Forward） | 重定向（Redirect） |
|------|----------------|-------------------|
| 行为方 | 服务器端 | 客户端（浏览器） |
| 地址栏 | 不变 | 变为新 URL |
| 请求次数 | 1 次 | 2 次（先返回 302，浏览器再请求） |
| 共享 request | ✅ 可以 | ❌ 不能（新请求） |
| 实现方式 | `RequestDispatcher.forward()` | `response.sendRedirect()` |
| 状态码 | 200 | 301/302 |
| 使用场景 | 内部页面流转（如登录后转发到首页） | 跳转到外部页面或登录后重定向到主页 |

---

## 七、什么是 AJAX，主要有什么作用？

### 

**AJAX = Asynchronous JavaScript And XML**，核心能力是**在不刷新整个页面的情况下与服务器交互并局部更新页面**。

**工作流程：**
1. 事件触发（点击按钮等）
2. JavaScript 创建 `XMLHttpRequest`（或使用 `fetch`）向服务器发请求
3. 服务器处理并返回数据（JSON/XML/HTML）
4. JS 接收响应，更新页面局部 DOM

**核心价值：**
- 异步交互，用户操作不阻塞
- 局部更新，体验流畅
- 减少数据传输，节省带宽

现代开发中更多使用 `fetch` API 或 Axios 库代替原生 XMLHttpRequest。

---

## 结语

JavaWeb 基础是后端开发的基石。这 7 道题覆盖了 HTTP 协议、Servlet、会话管理三大核心领域，面试时关键是把**核心区别 + 对比维度**说清楚，不必逐字背诵细节。

> 下一篇：[Java 后端工程化面试题精炼（上）](/2026/06/09/Java后端工程化面试题精炼-上/) — 涵盖 Spring IoC/DI、Bean 生命周期、循环依赖、AOP、事务等核心考点。
