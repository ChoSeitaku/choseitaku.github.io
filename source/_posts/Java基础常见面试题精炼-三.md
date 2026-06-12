---
title: Java 基础面试题精炼（三）：集合框架与线程安全
date: 2025-05-16 12:00:00
tags:
  - 面经
categories:
  - 技术
description: 精炼 Java 集合框架高频面试题，涵盖 List/Set/Map 区别、HashMap 与 Hashtable、ArrayList 与 LinkedList、线程安全集合、栈与队列、Set 实现类对比。
cover: /img/random07.png
---

## 前言

本文精炼 **Java 集合框架与线程安全** 共 10 道高频面试题，聚焦集合体系的核心区别和线程安全方案的面试回答思路。

---

## 一、如何把线程不安全的 List 转成线程安全的 List？

### 

**三种方案，按场景选择：**

| 方案 | 实现方式 | 适用场景 |
|------|----------|----------|
| **方案一** | `Collections.synchronizedList(list)` | 简单场景，低并发 |
| **方案二** | 使用 `Vector` 或 `CopyOnWriteArrayList` | 需要现成的线程安全类 |
| **方案三** | 自定义类实现 List 接口，加 synchronized | 需要精细控制 |

**面试答法**：最常用 `Collections.synchronizedList()`；读多写少用 `CopyOnWriteArrayList`；简单场景直接用 `Vector`。

---

## 二、List、Set、Map 之间的区别（高频）

### 

**三大集合体系的核心区别：**

| 维度 | List | Set | Map |
|------|------|-----|-----|
| 元素类型 | 单列 | 单列 | 双列（键值对） |
| 是否有序 | ✅ 有序 | ❌ 无序（LinkedHashSet 有序） | ❌ 无序（LinkedHashMap 有序） |
| 是否重复 | ✅ 可重复 | ❌ 不可重复 | key 不重复，value 可重复 |
| 下标访问 | ✅ 支持（get(index)） | ❌ 不支持 | ❌ 不支持（通过 key 访问） |

**典型实现类**：
- **List**：ArrayList（数组）、LinkedList（链表）
- **Set**：HashSet（哈希表）、TreeSet（红黑树）
- **Map**：HashMap（哈希表）、TreeMap（红黑树）

---

## 三、HashMap 和 Hashtable 有什么区别？（高频）

### 

**核心区别：HashMap 非线程安全但高效，Hashtable 线程安全但低效。**

| 维度 | HashMap | Hashtable |
|------|---------|-----------|
| 线程安全 | ❌ 不安全 | ✅ 安全（synchronized） |
| null 键值 | ✅ 允许 | ❌ 不允许 |
| 性能 | **高** | 低 |
| 继承关系 | AbstractMap | Dictionary（已过时） |
| 推荐使用 | ✅ 推荐 | ❌ 被 ConcurrentHashMap 替代 |

**面试关键点**：
- HashMap 允许一个 null key 和多个 null value
- Hashtable 的 key 和 value 都不能为 null
- 多线程环境用 `ConcurrentHashMap` 替代 Hashtable

---

## 四、如何决定使用 HashMap 还是 TreeMap？

### 

**根据是否需要排序来选择：**

| 需求 | 选择 | 原因 |
|------|------|------|
| 不需要排序 | **HashMap** | 性能更高，O(1) 查找 |
| 需要按 key 排序 | **TreeMap** | 底层红黑树，自动排序 |

**TreeMap 的特点**：
- 底层红黑树，查找/插入/删除都是 O(log n)
- key �须实现 Comparable 或传入 Comparator
- 按 key 的自然顺序或自定义规则排序

**面试答法**：一般选 HashMap；需要排序或范围查询时选 TreeMap。

---

## 五、ArrayList 和 LinkedList 的区别（高频）

### 

**底层数据结构决定了各自的优劣势：**

| 维度 | ArrayList | LinkedList |
|------|-----------|------------|
| 底层结构 | **数组** | **双向链表** |
| 随机访问 | ✅ O(1) | ❌ O(n) |
| 头部增删 | ❌ O(n)（需移动元素） | ✅ O(1) |
| 尾部增删 | ✅ O(1)（均摊） | ✅ O(1) |
| 内存占用 | 较少（连续存储） | 较多（每个节点额外存指针） |
| 实际性能 | **整体更优** | 理论快但实际慢 |

**为什么 LinkedList 理论快但实际慢？**
- 每次操作需要创建 Node 对象，GC 压力大
- 内存不连续，CPU 缓存命中率低
- ArrayList 虽然需要移动元素，但内存拷贝技术性能很高

**面试答法**：绝大多数场景选 ArrayList；频繁在头部插入删除才考虑 LinkedList（但实际很少）。

---

## 六、如何做到数组和 List 之间的转换？

### 

**数组转 List，List 转数组，各有常用方法：**

| 转换方向 | 方法 | 注意事项 |
|----------|------|----------|
| **List → 数组** | `list.toArray(new String[0])` | 推荐用 `toArray(T[])` |
| **数组 → List** | `Arrays.asList(array)` | 返回的是**固定大小**的 List，不能 add/remove |
| **数组 → List** | `new ArrayList<>(Arrays.asList(array))` | 可修改的 List |

**代码示例**：
```java
// List 转数组
String[] arr = list.toArray(new String[0]);

// 数组转 List（不可修改）
List<String> list1 = Arrays.asList(arr);

// 数组转 List（可修改）
List<String> list2 = new ArrayList<>(Arrays.asList(arr));
```

**面试关键点**：`Arrays.asList()` 返回的 List 底层仍然是数组，不支持增删操作。

---

## 七、ArrayList 和 Vector 的区别是什么？

### 

**Vector 是 ArrayList 的线程安全版本，但已过时：**

| 维度 | ArrayList | Vector |
|------|-----------|--------|
| 版本 | JDK 1.2（较新） | JDK 1.0（古老） |
| 线程安全 | ❌ 不安全 | ✅ 安全 |
| 初始容量 | 0（首次 add 时创建 10） | 10 |
| 扩容倍数 | **1.5 倍** | **2 倍** |
| 性能 | **更高** | 较低 |
| 推荐使用 | ✅ 推荐 | ❌ 被替代 |

**面试关键点**：
- ArrayList 默认初始容量为 0，首次 add 时才创建长度为 10 的数组
- Vector 默认初始容量为 10，每次扩容为原来的 2 倍
- 多线程需要线程安全 List 时，用 `Collections.synchronizedList()` 或 `CopyOnWriteArrayList`

---

## 八、如何遍历 List 集合？

### 

**四种遍历方式，各有适用场景：**

| 方式 | 代码示例 | 适用场景 |
|------|----------|----------|
| **普通 for** | `for (int i = 0; i < list.size(); i++)` | 需要下标或修改元素 |
| **增强 for** | `for (String s : list)` | 简单遍历，不需要下标 |
| **Iterator** | `Iterator it = list.iterator(); while(it.hasNext())` | 需要在遍历中删除元素 |
| **ListIterator** | `ListIterator it = list.listIterator()` | 需要双向遍历或修改元素 |

**面试关键点**：
- 遍历中删除元素必须用 Iterator 的 `remove()` 方法
- 增强 for 遍历中修改集合会抛出 `ConcurrentModificationException`
- ListIterator 支持从后往前遍历（`hasPrevious()` / `previous()`）

---

## 九、哪些集合类是线程安全的？

### 

**Java 中线程安全的集合类：**

| 集合类 | 线程安全机制 | 特点 |
|--------|--------------|------|
| **Vector** | synchronized | 比 ArrayList 多了同步机制 |
| **Hashtable** | synchronized | 比 HashMap 多了线程安全 |
| **ConcurrentHashMap** | 分段锁/CAS | **高并发首选**，比 Hashtable 效率高 |
| **CopyOnWriteArrayList** | 写时复制 | 读多写少场景 |
| **Stack** | 继承 Vector | 栈结构，已过时 |

**面试关键点**：
- ConcurrentHashMap 是目前最常用的线程安全 Map
- CopyOnWriteArrayList 适合读多写少（每次写都会复制整个数组）
- Stack 是 Vector 的子类，实际开发很少使用

---

## 十、栈和队列有什么区别？

### 

**核心区别：栈是后进先出，队列是先进先出。**

| 特性 | 栈（Stack） | 队列（Queue） |
|------|-------------|---------------|
| 原则 | **FILO**（后进先出） | **FIFO**（先进先出） |
| 操作 | push 入栈、pop 出栈、peek 查看栈顶 | add/offer 入队、remove/poll 出队 |
| Java 实现 | Stack、LinkedList | LinkedList、ArrayDeque |

**Queue 的两种方法形式**：
| 操作 | 抛出异常 | 返回特殊值 |
|------|----------|------------|
| 插入 | `add(e)` | `offer(e)` |
| 移除 | `remove()` | `poll()` |
| 检查 | `element()` | `peek()` |

**Deque 双端队列**：两端都可以进出，既可以当栈用，也可以当队列用。实现类有 `ArrayDeque` 和 `LinkedList`。

**面试答法**：栈是"叠盘子"（后进先出），队列是"排队"（先进先出）。

---

## 结语

这 10 道题覆盖了 Java 集合框架的核心：List/Set/Map 区别、HashMap/Hashtable、ArrayList/LinkedList、线程安全集合、栈与队列。面试时关键是把**底层结构 + 性能特点 + 适用场景**说清楚。

> 下一篇：[Java 基础面试题精炼（四）：高级特性与网络编程](/2026/05/17/Java基础常见面试题精炼-四/) — 涵盖 HashMap 底层演变、Lambda 表达式、线程创建、单例模式、IO 流、序列化、TCP/UDP 等核心考点。