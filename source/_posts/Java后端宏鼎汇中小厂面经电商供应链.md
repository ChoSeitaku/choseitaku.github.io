---
title: Java 后端面经精华 — 宏鼎汇中小厂电商供应链场景
date: 2026-06-07 12:00:00
tags:
  - 面经
categories:
  - 技术
description: 整理 Java 后端面试高频考点，涵盖 AI 编码验证、线程安全、synchronized 锁升级、Spring 事务失效、AOP 与循环依赖、线程池实践、MySQL 调优、B+ 树索引、策略模式、大表分页优化、分库分表等核心主题。
cover: /img/random01.png
---

## 前言

这篇面经围绕 **Java 后端** 常见面试题展开，结合 **电商供应链** 实际业务场景，整理了从基础到进阶的高频考点。每个问题都给出了面试中的标准回答思路，方便复习和模拟面试。

---

## 一、AI 辅助编码：如何保证生成代码的质量？

### 1.1 你用 AI 生成代码后，怎么验证代码没问题？

我使用 AI 生成代码后，**绝对不会直接使用**，一定会经过一套完整的验证流程，确保代码正确、健壮、可运行。验证步骤主要分 **5 步**：

**第一步：代码审查（Code Review）**

先通读一遍 AI 生成的代码：

- 检查逻辑是否符合我的需求
- 变量命名是否规范
- 有没有明显语法错误
- 有没有冗余、无用代码
- 是否符合项目的代码风格

这一步能过滤掉 60% 的明显问题。

**第二步：本地运行 + 测试**

把代码放到开发环境里**真实运行**：

- 能编译通过吗？
- 能正常执行吗？
- 输出结果是否符合预期？

前端代码在浏览器里看效果，后端代码跑起来看接口是否正常。

**第三步：边界条件 & 异常测试**

AI 经常忽略**边界情况**，我会专门测试：

- 空值、null、undefined
- 0、负数、超大数
- 异常输入、非法参数
- 循环边界、数组越界

**第四步：单元测试（项目代码）**

如果是正式项目，写**简单的单元测试**：输入 → 预期输出，覆盖主要业务逻辑。

**第五步：集成到项目验证**

- 看是否和现有代码冲突
- 看依赖是否齐全
- 看是否影响其他功能
- 看性能是否合理

> **面试收尾金句**：我把 AI 当成高效的辅助工具，但代码质量和正确性一定由我自己负责，不会完全依赖 AI。

### 1.2 AI 反复改不对，你怎么处理？

遇到这种情况，我不会一直跟 AI 死磕，而是用一套**固定、高效的处理方法**：

1. **先停下来**，自己把问题想清楚——一直说"不对、改一改"，AI 只会越改越乱
2. **自己先把逻辑拆清楚**，拆成步骤化、明确、无歧义的描述：第一步做什么、第二步做什么、异常怎么处理、输入输出是什么
3. **给 AI 更精准的指令**：明确告诉它哪里错了、应该是什么逻辑、要避免什么、要遵循什么规则
4. **如果还是不对，自己写核心逻辑**，让 AI 只做辅助工作（补全工具函数、写注释、优化格式、处理简单逻辑）

> **面试必说**：我不会依赖 AI 帮我思考逻辑，我只会用它提高我的编码效率。代码的逻辑正确性必须由我控制。

---

## 二、线程安全

### 2.1 怎么保证一个方法是线程安全的？

我会从**是否存在共享变量、是否存在竞争**来判断，然后用对应的手段保证线程安全。

**第一步：先判断需不需要线程安全**

看方法里有没有共享数据：类成员变量、静态变量、外部共享对象（缓存、集合、单例）。

**如果方法里只使用局部变量 → 天生线程安全，不需要处理。** 因为局部变量存在线程栈里，每个线程独立。

**第二步：如果有共享数据，用 4 种方案保证安全**

| 方案 | 说明 | 适用场景 |
|------|------|----------|
| `synchronized` | 同一时间只有一个线程进入，保证原子性、可见性 | 简单场景、并发不高 |
| `ReentrantLock` | 比 synchronized 更灵活：可尝试锁、可超时、可中断 | 需要精细控制 |
| 线程安全工具类 | `ConcurrentHashMap`、`CopyOnWriteArrayList`、`AtomicInteger` | 集合、计数、高并发 |
| 无状态/不可变设计 | 不修改共享变量，类设计成不可变（final 成员） | 最安全、最高效 |

**第三步：验证**

多线程调用测试、压力测试，检查竞态条件、死锁、脏数据、重复执行。

### 2.2 线程安全实战优先级

在实际项目中，我的思考顺序是：

```
避免共享（无状态/ThreadLocal） > 不可变对象 > CAS/并发工具类 > 加锁
```

1. **优先设计为"无状态"方法**：只使用局部变量，线程栈物理隔离
2. **使用不可变对象**：类声明为 `final`，字段 `private final`，不提供 setter
3. **使用 JUC 并发工具类**：`AtomicInteger`（CAS）、`ConcurrentHashMap`、`CopyOnWriteArrayList`
4. **显式加锁（最后手段）**：`synchronized`（缩小锁粒度）、`ReentrantLock`、`ReentrantReadWriteLock`（读多写少）
5. **ThreadLocal 线程封闭**：注意在 finally 中调用 `remove()`，防止内存泄漏

> **面试总结**：要么不共享，要么共享了就加锁，要么用线程安全工具类。

---

## 三、synchronized 锁升级机制

### synchronized 是重量级还是轻量级锁？

`synchronized` 的锁**不是固定的重量级或轻量级**，它是**随着竞争情况自动升级**的。核心特点：**从轻量级开始，逐步升级，不会降级**。

**JDK 1.6 之后的锁升级过程：**

```
偏向锁 → 轻量级锁（CAS） → 重量级锁（Mutex）
```

- **无竞争 / 单线程**：偏向锁 → 轻量级锁，底层用 CAS，不涉及操作系统内核态，速度很快
- **多线程竞争激烈**：CAS 失败达到阈值 → 自动升级为重量级锁，依赖操作系统互斥量，涉及用户态 ↔ 内核态切换

> **面试必背**：synchronized 是自适应锁——无竞争时是轻量级锁，多线程竞争后自动膨胀为重量级锁，且只升不降。

---

## 四、Spring 事务失效排查

### 4.1 @Transactional 抛异常但没回滚，怎么分析？

我会按 **最常见原因从上到下排查**，100% 能定位问题：

**原因一（最常见）：抛了受检异常（Checked Exception）**

Spring 默认**只回滚 `RuntimeException` 和 `Error`**。如果抛出 `Exception`、`IOException`、`SQLException` 这些受检异常 → 事务不会回滚！

```java
// 解决方案
@Transactional(rollbackFor = Exception.class)
```

**原因二：异常被 try-catch 吞掉了**

```java
try {
    // 数据库操作
} catch (Exception e) {
    // 只打印日志，没往外抛 → 事务一定不会回滚！
}
```

Spring 事务原理：**必须抛异常才能触发回滚。**

**原因三：方法不是 public**

`@Transactional` 只能加在 public 方法上。private、default、protected → 事务全部失效（Spring AOP 代理不到）。

**原因四：类内部 this 调用，没走代理**

```java
@Service
public class UserService {
    public void a() {
        this.b(); // 不走代理，事务失效！
    }
    @Transactional
    public void b() { }
}
```

**原因五：数据库引擎不支持事务**（如 MySQL MyISAM，必须是 InnoDB）

**原因六：类没被 Spring 管理**（忘记加 @Service / @Component）

> **最快定位 4 步**：① 是不是抛了受检异常没加 rollbackFor；② 是不是 try-catch 吞异常；③ 是不是内部 this 调用；④ 数据库是不是 MyISAM。99% 都是前两个原因！

### 4.2 同类调用和事务嵌套为什么失效？

**一句话：Spring 事务靠 AOP 代理实现，只有调用代理对象的方法事务才生效。this 是真实对象，绕开了代理。**

```java
// 失效示例
public void outer() {
    this.inner(); // this = 真实对象，不是代理 → 事务失效！
}
@Transactional
public void inner() { }

// 传播机制也全部失效
@Transactional
public void a() {
    b(); // 还是 this.b()，REQUIRES_NEW、NESTED 全部失效
}
@Transactional(propagation = REQUIRES_NEW)
public void b() { }
```

**三种解决方案：**

```java
// 方案1：自己注入自己（最常用）
@Autowired
private UserService self;
public void outer() { self.inner(); }

// 方案2：从 AopContext 获取代理
((UserService) AopContext.currentProxy()).inner();

// 方案3：拆到不同类（不同类调用自动走代理）
```

---

## 五、事务传播机制与 ACID

### 5.1 事务四大特性 ACID

| 特性 | 含义 | 实现机制 |
|------|------|----------|
| **原子性 (Atomic)** | 事务是不可分割的最小单元，要么全部成功，要么全部回滚 | undo 日志 |
| **一致性 (Consistent)** | 事务前后数据完整性约束不被破坏 | 由另外三者共同保障 |
| **隔离性 (Isolation)** | 并发事务互不干扰 | MVCC + 锁 |
| **持久性 (Durable)** | 事务提交后数据永久落地，宕机不丢失 | redo 日志 |

**原子性深入理解：**

- 事务内所有 DML 操作是一个整体，不能部分提交、部分回滚
- 例：转账 A 扣 100、B 加 100，B 异常 → 全部回滚，A 钱退回
- MySQL 依靠 **undo 回滚日志** 实现：执行前先写 undo log，异常时通过 undo log 恢复
- Spring 受异常触发回滚；如果异常被 try-catch 吞掉，框架无法触发回滚，原子性被打破

### 5.2 Spring 事务 7 种传播机制

| 传播机制 | 行为 |
|----------|------|
| **REQUIRED（默认）** | 有事务就加入，没有就新建（最常用） |
| **SUPPORTS** | 有事务就参与，无事务就非事务运行 |
| **MANDATORY** | 必须在事务中运行，无事务抛异常 |
| **REQUIRES_NEW** | 新建独立事务，挂起外层；内外互不影响 |
| **NOT_SUPPORTED** | 挂起外层事务，非事务执行 |
| **NEVER** | 禁止存在事务，有事务抛异常 |
| **NESTED** | 嵌套事务，基于 savepoint，内层可单独回滚 |

> 关键坑点：同类 this 调用，传播机制全部失效，不走 AOP 代理。

---

## 六、Spring AOP 与循环依赖

### 6.1 AOP 在 Bean 生命周期的哪个阶段？

**AOP 动态代理发生在 Bean 初始化完成之后（postProcessAfterInitialization）。**

Bean 生命周期完整流程：

1. 实例化（调用构造方法）
2. 依赖注入（@Autowired 赋值）
3. 初始化前（@PostConstruct 之前）
4. 初始化（InitializingBean、init-method）
5. **【核心】初始化后 — AOP 代理创建**：由 `AnnotationAwareAspectJAutoProxyCreator` 判断是否需要切面增强，需要则创建动态代理（JDK/CGLIB）
6. 最终放入单例池的是**代理对象**，不是原始对象

### 6.2 Spring 如何解决循环依赖？

Spring **只能解决单例 Bean 的 setter 循环依赖**，靠的是 **三级缓存**。

**三级缓存：**

| 缓存 | 名称 | 存放内容 |
|------|------|----------|
| 一级 | singletonObjects | 完全初始化好的成品 Bean |
| 二级 | earlySingletonObjects | 原始对象（已实例化，未填充属性） |
| 三级 | singletonFactories | ObjectFactory（lambda，用于获取早期对象/代理） |

**解决流程（A ↔ B 循环依赖）：**

1. 创建 A，实例化后放入三级缓存
2. A 填充属性，发现依赖 B
3. 创建 B，实例化后放入三级缓存
4. B 填充属性，发现依赖 A，去缓存找
5. B 从三级缓存拿到 A 的早期引用，完成创建
6. B 放入一级缓存
7. A 拿到 B，完成创建，放入一级缓存

> **为什么需要三级缓存？** 主要为了处理 **AOP 代理**！如果只有二级缓存，循环依赖时无法正确获取代理对象。
>
> **构造方法循环依赖解决不了**，因为实例化都无法完成，放不进缓存。

---

## 七、线程池实践

### 7.1 项目中怎么用线程池？

实际项目里**绝不手动 new Thread()**，全部统一使用线程池：

```java
@Configuration
public class ThreadPoolConfig {
    @Bean("asyncTaskExecutor")
    public Executor asyncTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);       // 核心线程数
        executor.setMaxPoolSize(20);        // 最大线程数
        executor.setQueueCapacity(100);     // 队列容量
        executor.setKeepAliveSeconds(60);   // 空闲存活时间
        executor.setThreadNamePrefix("async-task-");
        executor.setRejectedExecutionHandler(
            new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

```java
// 使用时直接注入
@Async("asyncTaskExecutor")
public void sendLoginSms(String phone) { }
```

**典型使用场景：** 接口异步处理（发短信、记日志）、批量任务、定时任务并发、非核心耗时操作。

### 7.2 为什么要用线程池？

1. **避免频繁创建/销毁线程的性能消耗**：线程是重量级资源，高并发下频繁 new Thread() 导致 CPU 飙升、内存抖动
2. **控制并发数量，防止系统被压垮**：严格限制最大线程数，避免 OOM
3. **统一管理**：设置线程名称、监控活跃线程数、队列堆积、拒绝策略

> **一句话**：线程池复用线程、控制并发、保护服务器。

---

## 八、大数据量导出 + 进度展示

### 8.1 项目导出数据量

- 单表导出：1 万 ~ 50 万条
- 大报表导出：50 万 ~ 200 万条
- 超过 200 万走**异步生成文件 + 下载**

### 8.2 导出进度条实现方案

**整体架构：**

```
前端点击导出
    ↓
后端：
  1. 查询总条数 total
  2. 往 Redis 存进度 = 0%
  3. 线程池异步执行导出
  4. 每完成一批，更新 Redis 进度
  5. 完成后进度 = 100%，生成文件

前端：
  每秒轮询进度接口 → 展示 1%、5%…100%
```

**后端核心代码：**

```java
@Async("asyncTaskExecutor")
public void exportDataAsync(ExportQuery query, String taskId) {
    try {
        int total = dataMapper.countTotal(query);
        redisUtil.set("export:progress:" + taskId, "0");

        int pageSize = 1000;
        int pages = (total + pageSize - 1) / pageSize;
        int current = 0;

        for (int i = 1; i <= pages; i++) {
            List<Data> list = dataMapper.findPage(query, i, pageSize);
            excelWriter.write(list);

            current += list.size();
            int progress = (int) ((current * 100.0) / total);
            redisUtil.set("export:progress:" + taskId, String.valueOf(progress));
        }
        redisUtil.set("export:progress:" + taskId, "100");
    } catch (Exception e) {
        redisUtil.set("export:progress:" + taskId, "失败");
    }
}

@GetMapping("/export/progress/{taskId}")
public Result getProgress(@PathVariable String taskId) {
    String progress = redisUtil.get("export:progress:" + taskId);
    return Result.success(progress);
}
```

**前端轮询：**

```javascript
const taskId = await api.startExport();
const timer = setInterval(async () => {
    const progress = (await api.getExportProgress(taskId)).data;
    showProgress(progress);
    if (progress == 100) {
        clearInterval(timer);
        downloadFile(taskId);
    }
}, 1000);
```

**设计要点：**
- 异步任务和查询进度是不同线程 → 必须用 Redis 共享进度
- 分批查询避免 OOM → 每批更新进度，前端看到平滑增长
- 线程池复用线程，保护系统

---

## 九、死锁

### 9.1 什么情况发生死锁？

**两个或多个线程，互相持有对方需要的锁，又都不释放 → 无限等待 = 死锁。**

死锁必须同时满足 **4 个条件**：

1. **互斥**：一个锁只能被一个线程持有
2. **请求与保持**：线程拿着锁 A，又去请求锁 B
3. **不可剥夺**：锁不能被强行抢走
4. **循环等待**：线程 1 等线程 2，线程 2 等线程 1，形成环路

```java
// 死锁示例
// 线程1：先 lock1 再 lock2
synchronized (lock1) { synchronized (lock2) { } }

// 线程2：先 lock2 再 lock1
synchronized (lock2) { synchronized (lock1) { } }
// → 互相卡死！
```

### 9.2 碰到死锁怎么处理？

1. **排查**：`jstack 进程ID > dump.txt`，搜索 `deadlock`、`waiting to lock`
2. **紧急修复**：重启服务（临时），然后修复代码（根本）
3. **根本解决**：破坏死锁 4 个条件之一

### 9.3 写代码时如何避免死锁？

| 方案 | 说明 |
|------|------|
| **固定锁的获取顺序** | 所有线程按相同顺序获取锁（最有效） |
| **使用 tryLock 超时** | `ReentrantLock.tryLock(timeout)`，拿不到就放弃，不硬等 |
| **一个线程只持有一把锁** | 从根本上杜绝死锁 |
| **缩小锁范围** | 只锁必须安全的代码，持有时间越短概率越低 |
| **无锁设计** | ThreadLocal、CAS、ConcurrentHashMap |

> **一句话**：死锁 = 你等我，我等你，谁都不放手。避免 = 按顺序拿锁 + 不贪心 + 不硬等。

---

## 十、数据库锁：读锁 vs 写锁

### 10.1 for update 排他锁的阻塞行为

当第一个人执行 `select ... for update` 拿到排他锁，事务未提交：

- **第二个人执行同样的 for update → 直接阻塞在 SQL 上，不会往下执行任何代码！**
- 直到第一个人 commit 或 rollback 释放锁，第二个人才能继续

**比喻：** 厕所门被锁了——第一个人进去锁门，第二个人只能在门口等，绝对不会直接冲进去。

### 10.2 读锁和写锁的区别

| 特性 | 读锁（共享锁 / S 锁） | 写锁（排他锁 / X 锁） |
|------|----------------------|----------------------|
| 别人能不能读 | ✅ 可以 | ❌ 不可以 |
| 别人能不能写 | ❌ 不可以 | ❌ 不可以 |
| 加锁后自己能写吗 | ❌ 不能 | ✅ 能 |
| 多人能同时持有吗 | ✅ 可以（共享） | ❌ 不可以（独占） |
| 对应 SQL | `LOCK IN SHARE MODE` | `FOR UPDATE` |

**兼容规则：**

- 读锁 + 读锁：兼容 ✅（多人一起读）
- 读锁 + 写锁：互斥 ❌（有人在读就不能写，有人在写就不能读）
- 写锁 + 写锁：互斥 ❌（只能一个人写）

---

## 十一、MySQL 调优与索引

### 11.1 项目中 MySQL 怎么调优？

**从简单到复杂，6 步调优：**

1. **先抓慢查询**：开启慢查询日志，抓执行超过 1 秒的 SQL，用 `explain` 分析（90% 的问题都是没走索引或索引失效）
2. **建合适的索引**：高频查询字段建索引，联合索引遵循最左前缀原则，单表索引不超过 5 个
3. **优化 SQL**：避免 `select *`、`not in`、`!=`、`is null` 等导致索引失效的写法，大分页用延迟关联
4. **表结构优化**：字段类型尽可能小，大表拆小、冷热分离
5. **配置调优**：`innodb_buffer_pool_size` 设为内存 50%~70%
6. **架构层面**：读写分离、分库分表、加 Redis 缓存

### 11.2 MySQL 索引数据结构

**InnoDB 默认索引结构是 B+ 树。** 绝对不是二叉树、红黑树或 B 树。

**为什么用 B+ 树？**

- 层级少（千万数据 3~4 层）
- 磁盘 IO 次数极少
- 范围查询极快（叶子节点是有序链表）
- 只有叶子节点存数据，非叶子只存键 → 更小、能放内存

**聚簇索引 vs 非聚簇索引：**

| 类型 | 说明 |
|------|------|
| 聚簇索引（主键索引） | 叶子节点直接存整行数据，一个表只有一个 |
| 非聚簇索引（二级索引） | 叶子节点存主键值，查询需要**回表** |

### 11.3 B+ 树 vs B 树

| 对比点 | B 树 | B+ 树 |
|--------|------|-------|
| 数据存储 | 所有节点都存数据 | **只有叶子节点存数据** |
| 叶子节点 | 不是链表 | **双向有序链表** |
| 范围查询 | 慢，需回溯遍历 | **极快，直接扫链表** |
| 查询速度 | 不稳定（有的快有的慢） | **稳定（都走叶子）** |
| 树高度 | 相对更高 | **更矮（IO 更少）** |
| MySQL 使用 | 不用 | **InnoDB 默认使用** |

**B+ 树 6 大特点：**

1. 非叶子节点不存数据，只存索引键
2. 只有叶子节点存真实数据
3. 叶子节点用双向链表串起来，有序排列
4. 查询效率非常稳定（任何查询都必须走到叶子节点）
5. 树高度很低（3~4 层）
6. 适合磁盘读取，IO 最少

---

## 十二、设计模式：策略模式实战

### 场景：多支付方式

系统支持微信支付、支付宝、银行卡、云闪付等。用 if/else 会导致代码臃肿、违反开闭原则。

**策略模式实现：**

```java
// 1. 统一接口
public interface PayStrategy {
    PayResult pay(Order order);
}

// 2. 各支付策略
@Component("WECHAT")
public class WechatPay implements PayStrategy {
    @Override
    public PayResult pay(Order order) { /* 微信支付逻辑 */ }
}

@Component("ALIPAY")
public class AliPay implements PayStrategy {
    @Override
    public PayResult pay(Order order) { /* 支付宝逻辑 */ }
}

// 3. 工厂类
@Service
public class PayFactory {
    @Autowired
    private Map<String, PayStrategy> payMap;

    public PayStrategy getStrategy(String payType) {
        return payMap.get(payType);
    }
}

// 4. 最终调用（无 if/else！）
PayStrategy strategy = payFactory.getStrategy(payType);
strategy.pay(order);
```

**策略模式解决了什么？**

- 消除大量 if/else
- 每种逻辑独立，代码干净
- 新增支付方式完全不用改旧代码（符合开闭原则）
- 易维护、易扩展、易测试

---

## 十三、千万级订单分页查询优化

### 场景

千万级订单主表，上百个字段（宽表），10~20 个查询条件，可能关联其他表，limit 深分页查询十几秒。

### 8 步优化方案（从 10 秒 → 200ms）

**第一步：干掉深分页 — 延迟关联**

```sql
-- 原始（慢）
SELECT * FROM `order` WHERE ... ORDER BY create_time DESC LIMIT 100000, 20;

-- 优化（快 5~10 倍）
SELECT o.* FROM `order` o
INNER JOIN (
    SELECT id FROM `order`
    WHERE ... ORDER BY create_time DESC LIMIT 100000, 20
) t ON o.id = t.id;
```

原理：子查询只查主键 id，排序、分页都在小结果集上做，最后再回表。

**第二步：禁止 `SELECT *`**

上百个字段 + `SELECT *` → 数据行超大、IO 暴增、无法用覆盖索引。只查页面需要的字段。

**第三步：建立联合索引**

等值查询放前面（=、in），范围查询放后面（between、>、<），order by 字段放最后。

**第四步：减少关联查询**

不要一次 join 4~5 张表！能冗余就冗余（订单表冗余用户名），查询拆分成先查订单再批量查关联数据。

**第五步：分表**

按时间分表（`order_202501`、`order_202502`），用户 99% 查最近 3 个月订单，每次只查一张小表。

**第六步：引入 ES**

10~20 个查询条件 + 模糊查询 + 排序分页 → MySQL 扛不住。数据同步 ES，千万级查询 200ms 内。

**第七步：热点数据加 Redis 缓存**

**第八步：读写分离（最后一步）**

---

## 十四、大数据量 Count 优化

### 核心问题

复杂条件 + 千万级数据 count = 必须遍历大量数据 = 天然慢。加再多索引也要扫描符合条件的所有数据。

### 四种解决方案

**方案一：不展示总条数（最推荐）**

京东、淘宝、拼多多都不用总条数！只展示上一页/下一页。

去掉 `select count(*)`，查询直接从 10 秒 → 几十毫秒。

**方案二：使用近似值（99% 业务能接受）**

```sql
SHOW TABLE STATUS LIKE 'order';
SELECT TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'order';
```

0ms 出结果，误差 5%~10%。

**方案三：异步统计 + Redis 缓存（最常用）**

```
用户请求 → 查列表（很快）
→ 同时线程池异步算 count
→ 存入 Redis（缓存 5~10 分钟）
→ 前端下次直接拿缓存
```

列表永远快，总数不影响接口响应。

**方案四：统计表 + 定时任务（大数据平台标准）**

建 `order_statistics` 统计表，定时任务每 5 分钟统计一次，查询直接查统计表。

> **面试金句**：千万级大数据量分页，慢的不是列表，是 count！count 无法真正实时优化，只能用业务方案绕开。

---

## 十五、分库分表

### 为什么分表？解决什么问题？

**单表数据太多（千万、亿级），查询、写入、索引都变慢 → 把大表拆成多张小表。**

- 单表 500 万~1000 万以上必须考虑分表
- 分表后单表数据量变少，索引变小，IO 减少
- 常见方式：按时间分（订单表）、按哈希分（用户表）

**通俗比喻：** 一个柜子东西太多 → 分多层抽屉 → 找东西飞快。

### 为什么分库？解决什么问题？

**单库扛不住高并发、高写入、高连接数 → 拆成多个库分摊压力。**

- CPU 100%、磁盘 IO 爆了、连接数不够
- 分库后压力分摊到多个库，避免单点崩溃
- 实现业务隔离（订单库、用户库、商品库）

**通俗比喻：** 一个柜子不够用 → 多买几个柜子，大家分流。

| 方式 | 解决什么问题 | 本质 |
|------|-------------|------|
| **分表** | 单表数据太大，查询慢 | 一张大表 → 多张小表 |
| **分库** | 高并发、高写入，扛不住压力 | 一个库 → 多个库，分摊压力 |

---

## 结语

这篇面经覆盖了 Java 后端面试中 **线程安全、Spring 事务、AOP、线程池、MySQL 调优、分库分表、设计模式、大表优化** 等核心考点。每个问题都给出了面试中的标准回答思路——理解原理 + 记住关键结论 + 结合项目场景，基本能应对大部分中小厂后端面试。

> 持续更新中，欢迎收藏和讨论。
