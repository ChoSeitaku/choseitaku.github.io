---
title: Java 基础面试题精炼（四）：高级特性与网络编程
date: 2026-05-17 12:00:00
tags:
  - 面经
categories:
  - 技术
description: 精炼 Java 高级特性高频面试题，涵盖 HashMap 底层演变与扩容原理、Lambda 表达式、线程创建方式、线程停止、单例模式、IO 流、序列化、TCP/UDP 区别。
cover: /img/random08.png
---

## 前言

本文精炼 **Java 高级特性与网络编程** 共 12 道高频面试题，聚焦 HashMap 原理、多线程、设计模式、IO 与网络等核心考点的面试回答思路。

---

## 一、JDK1.7 到 JDK1.8，HashMap 底层发生了什么变化？（高频）

### 

**从"数组+链表"升级为"数组+链表+红黑树"：**

| 版本 | 底层结构 | 链表过长处理 |
|------|----------|--------------|
| **JDK 1.7** | 数组 + 链表 | 链表越来越长，查询变慢（O(n)） |
| **JDK 1.8** | 数组 + 链表 + 红黑树 | 链表长度 > 8 且数组长度 ≥ 64 → 转红黑树（O(log n)） |

**面试关键点**：
- 多个 key 的 hash 值相同时，以链表形式挂在同一个槽位
- 链表查询 O(n)，红黑树查询 O(log n)，性能大幅提升
- 转红黑树条件：链表长度 > 8 **且** 数组长度 ≥ 64

---

## 二、HashMap 的数组长度特点和扩容原理（高频）

### 

**三个核心要点：**

**1. 默认容量和 2 的 n 次方**
- 默认初始容量：16
- 数组长度必须是 2 的 n 次方（16、32、64...）
- 如果指定长度不是 2 的 n 次方，会自动纠正为大于该值的最近 2 的 n 次方
- 原因：`index = (数组长度-1) & hash`，2 的 n 次方才能保证均匀分布

**2. 扩容机制**
- 当元素数量 > 阈值（容量 × 负载因子 0.75）时触发扩容
- 每次扩容为原来的 2 倍
- 扩容过程：重新计算所有元素的 index，分配到新数组

| 阶段 | 容量 | 阈值 |
|------|------|------|
| 初始 | 16 | 12 |
| 第一次扩容 | 32 | 24 |
| 第二次扩容 | 64 | 48 |

**3. 特殊扩容场景**
- 某个槽位链表长度达到 8，但数组长度还不到 64 → 优先扩容数组，而不是转红黑树

---

## 三、Lambda 表达式是什么？有什么用？

### 

**Lambda 是匿名函数的简洁写法，用于实现函数式接口：**

| 特性 | 说明 |
|------|------|
| 本质 | 函数式接口（SAM 接口）的简洁实现 |
| 语法 | `(参数) -> { 方法体 }` |
| 优点 | 代码简洁，可读性好，支持函数式编程 |

**代码对比**：
```java
// 匿名内部类（繁琐）
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello");
    }
};

// Lambda（简洁）
Runnable r2 = () -> System.out.println("Hello");
```

**适用场景**：
- 给函数式接口的变量赋值
- 方法参数是函数式接口时
- 集合的 Stream 操作（filter、map、forEach 等）

**面试答法**：Lambda 是匿名函数的语法糖，让 Java 支持函数式编程，代码更简洁。

---

## 四、线程的创建方式（高频）

### 

**四种创建方式，按推荐程度排序：**

| 方式 | 实现方式 | 特点 |
|------|----------|------|
| **① 继承 Thread** | `class MyThread extends Thread` | 简单，但 Java 单继承限制 |
| **② 实现 Runnable** | `class MyRunnable implements Runnable` | 推荐，解耦任务与线程 |
| **③ 实现 Callable** | `class MyCallable implements Callable<V>` | 可返回结果，可抛异常 |
| **④ 线程池** | `ExecutorService.submit()` | **生产环境首选**，复用线程 |

**面试答法**：
- JavaSE 阶段答前两种即可
- 工作面试答四种，强调**生产环境用线程池**
- Runnable 优于 Thread：解耦任务与线程，支持多实现

---

## 五、线程的 run() 和 start() 有什么区别？（高频）

### 

**start() 启动新线程，run() 只是普通方法调用：**

| 方法 | 效果 | 是否多线程 |
|------|------|------------|
| **start()** | 启动线程，变成 RUNNABLE 状态，获取 CPU 后执行 run() | ✅ 是 |
| **run()** | 只是普通方法调用，不会启动新线程 | ❌ 否（单线程） |

**关键区别**：
- `start()` 只能调用一次，重复调用会抛异常
- `run()` 可以多次调用，但只是普通方法执行
- 直接调用 `run()` 等同于在当前线程执行，没有多线程效果

**面试答法**：start() 是"启动线程"，run() 是"执行任务"。直接调 run() 没有开新线程。

---

## 六、如何停止一个正在运行的线程？（高频）

### 

**两种方式，推荐使用退出标志：**

| 方式 | 原理 | 推荐度 |
|------|------|--------|
| **① 退出标志** | 定义 volatile boolean flag，循环中判断 flag | ✅ 推荐 |
| **② stop()** | 强制终止线程（已过时） | ❌ 不推荐 |

**方案一：退出标志（推荐）**
```java
public class MyThread extends Thread {
    volatile boolean flag = false;

    @Override
    public void run() {
        while (!flag) {
            // 执行任务
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        MyThread t = new MyThread();
        t.start();
        Thread.sleep(6000);
        t.flag = true; // 设置退出标志
    }
}
```

**面试关键点**：
- `stop()` 已过时，可能导致数据不一致
- 退出标志让线程安全地完成当前工作后退出
- 也可以使用 `interrupt()` 中断线程

---

## 七、单例设计模式（高频）

### 

**某个类在运行期间有且只有 1 个实例，分为饿汉式和懒汉式：**

| 类型 | 创建时机 | 线程安全 | 推荐度 |
|------|----------|----------|--------|
| **饿汉式** | 类加载时就创建 | ✅ 安全 | ✅ 推荐 |
| **懒汉式** | 第一次使用时创建 | 需加锁保证安全 | 按需选择 |

**饿汉式三种写法**：

```java
// 写法1：枚举（最简洁，防反射和序列化）
public enum SingleOne { INSTANCE }

// 写法2：静态常量
public class SingleTwo {
    public static final SingleTwo INSTANCE = new SingleTwo();
    private SingleTwo() {}
}

// 写法3：静态代码块
public class SingleThree {
    private static final SingleThree instance = new SingleThree();
    private SingleThree() {}
    public static SingleThree getInstance() { return instance; }
}
```

**懒汉式写法**：
```java
// 双重检查锁（DCL）
public class SingleFour {
    private static volatile SingleFour instance;
    private SingleFour() {}

    public static SingleFour getInstance() {
        if (instance == null) {
            synchronized (SingleFour.class) {
                if (instance == null) {
                    instance = new SingleFour();
                }
            }
        }
        return instance;
    }
}
```

**面试答法**：推荐饿汉式（简单安全）；需要延迟加载用 DCL 双重检查锁。

---

## 八、Java 中 IO 流分为几种？

### 

**按方向和类型组合为四种流：**

| 流类型 | 输入流 | 输出流 |
|--------|--------|--------|
| **字节流** | `InputStream` | `OutputStream` |
| **字符流** | `Reader` | `Writer` |

**常用实现类**：
| 类型 | 输入流 | 输出流 |
|------|--------|--------|
| 文件操作 | `FileInputStream` | `FileOutputStream` |
| 缓冲流 | `BufferedInputStream` | `BufferedOutputStream` |
| 转换流 | `InputStreamReader`（字节→字符） | `OutputStreamWriter`（字符→字节） |
| 对象流 | `ObjectInputStream` | `ObjectOutputStream` |

**面试关键点**：
- **字节流**：处理二进制数据（图片、音频、视频）
- **字符流**：处理文本数据（自动处理编码）
- **缓冲流**：提高读写效率（内部维护缓冲区）

---

## 九、Java 序列化是什么？

### 

**序列化是将对象转为字节流，反序列化是将字节流恢复为对象：**

| 概念 | 说明 |
|------|------|
| **序列化** | 对象 → 字节流（用于存储、传输） |
| **反序列化** | 字节流 → 对象（用于恢复） |

**实现步骤**：
1. 类实现 `Serializable` 接口（标记接口，无需实现方法）
2. 添加 `serialVersionUID` 常量（版本控制）
3. 使用 `ObjectOutputStream` 序列化，`ObjectInputStream` 反序列化

**注意事项**：
- `static` 和 `transient` 修饰的字段不参与序列化
- `transient` 修饰的字段反序列化后为默认值（0、null、false）
- `serialVersionUID` 用于版本兼容，修改类后反序列化会失败

---

## 十、TCP 和 UDP 协议有什么区别？

### 

**TCP 可靠但慢，UDP 快但不可靠：**

| 维度 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接（三次握手） | 无连接 |
| 可靠性 | ✅ 可靠（确认应答、重传） | ❌ 不可靠 |
| 传输方式 | 字节流 | 数据报 |
| 速度 | 较慢 | **快** |
| 流量控制 | ✅ 有（滑动窗口） | ❌ 无 |
| 报头大小 | 20 字节 | 8 字节 |

**适用场景**：
| 协议 | 适用场景 |
|------|----------|
| **TCP** | 文件传输、邮件、网页浏览（需要可靠性） |
| **UDP** | 视频直播、语音通话、在线游戏（需要实时性） |

**面试答法**：TCP 可靠但开销大，适合文件传输；UDP 快但不保证，适合实时场景。

---

## 结语

这 12 道题覆盖了 Java 高级特性的核心：HashMap 底层演变与扩容、Lambda 表达式、线程创建与停止、单例模式、IO 流、序列化、TCP/UDP。面试时关键是把**原理机制 + 对比维度 + 适用场景**说清楚。

> 持续更新中，欢迎收藏和讨论。