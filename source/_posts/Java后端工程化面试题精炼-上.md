---
title: Java 后端工程化面试题精炼（上）
date: 2026-06-09 12:00:00
tags:
  - 面经
categories:
  - 技术
description: 精炼 Java 后端工程化高频面试题（上），涵盖 Maven 聚合与继承、Spring IoC/DI、Bean 生命周期与三级缓存解决循环依赖、AOP 原理、设计模式、Spring 事务实现与传播机制等核心考点。
cover: /img/random11.png
---

## 前言

> 上一篇：[JavaWeb 基础面试题精炼](/2026/06/08/JavaWeb基础面试题精炼/) — 涵盖 Session/Cookie、Servlet、HTTP 协议、AJAX 等。

本文精炼 **Java 后端工程化** 面试题上半部分（14 道），围绕 Maven 项目管理与 Spring 核心机制展开。每题聚焦面试回答的核心逻辑和关键结论，帮助建立清晰的答题框架。

---

## 一、Maven 中项目聚合和继承关系的概念和作用

### 

两者都用于多模块项目管理，但目的不同。

**继承（Inheritance）：共享配置**
- 子模块通过 `<parent>` 标签继承父 POM
- 统一管理依赖版本（`dependencyManagement`）、插件版本、编译参数
- 避免每个子模块重复配置

**聚合（Aggregation）：统一构建**
- 父模块通过 `<modules>` 列出所有子模块
- 在父模块执行 `mvn clean install` 会按顺序构建所有子模块
- 父模块的 `<packaging>` 必须是 `pom`

**一句话总结：** 继承解决"配置复用"，聚合解决"一键构建所有模块"。实际项目中两者通常同时使用。

---

## 二、Maven 依赖导入报错如何解决

### 

三种常见情况按顺序排查：

1. **`*.lastUpdated` 文件残留**：网络波动导致下载失败，删除 `.m2` 仓库中对应 `*.lastUpdated` 文件，重新下载
2. **jar 包下载损坏**：删除损坏的 jar 包，重新下载
3. **版本号错误**：检查依赖的 groupId、artifactId、version 是否正确，中央仓库是否存在该版本

---

## 三、Maven 依赖 Scope 的四个作用域

### 

| 作用域 | 编译有效 | 测试有效 | 运行时有效 | 打包 | 传递性 |
|--------|:---:|:---:|:---:|:---:|:---:|
| **compile**（默认） | ✅ | ✅ | ✅ | ✅ | ✅ |
| **provided** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **runtime** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **test** | ❌ | ✅ | ❌ | ❌ | ❌ |

**关键记忆点：**
- `compile`：全程有效，有传递性（默认）
- `provided`：容器提供，不打包（如 `servlet-api`）
- `runtime`：编译不需要但运行需要（如 JDBC 驱动）
- `test`：仅测试（如 JUnit）

---

## 四、Spring IoC 和 DI 概念以及涉及的注解

### 

**IoC（控制反转）：** 把对象的创建和管理权从程序员交给 Spring 容器。通俗说：以前用 `new` 创建对象，现在容器帮你创建并注入。

**DI（依赖注入）：** IoC 的具体实现方式。对象所依赖的其他对象由容器注入，而不是自己创建。

**三种注入方式：**
1. 构造器注入（推荐：依赖不可变，便于测试）
2. Setter 注入（可选依赖）
3. 字段注入（`@Autowired` 直接加字段上，简洁但不利于测试）

**核心注解速记：**

| 注解 | 作用 |
|------|------|
| `@Component` / `@Service` / `@Repository` / `@Controller` | 声明 Bean，交给 Spring 管理 |
| `@Autowired` | 自动注入依赖 |
| `@Qualifier` | 配合 @Autowired，多实现时指定注入哪个 |
| `@Value` | 注入配置文件中的值 |
| `@Configuration` + `@Bean` | Java 配置方式声明 Bean |
| `@Scope` | 指定作用域（singleton/prototype） |
| `@Primary` | 多个同类型 Bean 时优先注入 |
| `@PostConstruct` / `@PreDestroy` | 初始化/销毁回调 |

---

## 五、BeanFactory 和 FactoryBean 的区别

### 

**名字像但完全不同：**

- **BeanFactory**：Spring 的底层 IoC 容器接口，负责管理所有 Bean 的生命周期。`ApplicationContext` 是其子接口，提供更多企业级功能。默认**懒加载**。
- **FactoryBean**：一个特殊的 Bean，用来定制某个 Bean 的创建过程。实现了 `getObject()` 方法，Spring 拿到的是 `getObject()` 返回的对象，而非 FactoryBean 本身。

**记忆技巧：** BeanFactory 是"容器的核心"，FactoryBean 是"工厂模式的 Bean"。

---

## 六、Spring 的组件实例化过程（Bean 的生命周期）

### 

**八步走，记忆框架：实例化 → 赋值 → 前置 → 初始化 → 后置 → 使用 → 销毁。**

1. **加载配置**：读取 XML 或注解，解析 BeanDefinition
2. **实例化**：通过反射调用构造方法创建对象
3. **依赖注入**：`@Autowired` 属性填充
4. **BeanPostProcessor 前置处理**：`postProcessBeforeInitialization`
5. **初始化**：`@PostConstruct` → `InitializingBean.afterPropertiesSet()` → `init-method`
6. **BeanPostProcessor 后置处理**：`postProcessAfterInitialization`（**AOP 代理在此阶段创建！**）
7. **使用**：Bean 就绪，放入单例池供应用使用
8. **销毁**：`@PreDestroy` → `DisposableBean.destroy()` → `destroy-method`

> **面试加分点：** 知道 AOP 代理在 `postProcessAfterInitialization` 创建。

---

## 七、Spring 的组件作用域有哪些

### 

**五大作用域：**

| 作用域 | 说明 |
|--------|------|
| **singleton** | 默认，容器中只有一个实例 |
| **prototype** | 每次获取都创建新实例 |
| request | Web 环境下每个 HTTP 请求一个实例 |
| session | Web 环境下每个 Session 一个实例 |
| globalSession | Portlet 环境下全局 Session 一个实例 |

**面试关键：** 默认 singleton，多例用 prototype。注意 prototype 的 Bean Spring 不负责完整生命周期。

---

## 八、Spring 怎么解决循环依赖问题（重点）

### 

**一句话：Spring 通过三级缓存解决单例 Bean 的 setter 循环依赖。**

**三级缓存结构：**

| 缓存 | 名称 | 存放内容 |
|------|------|----------|
| 一级 | `singletonObjects` | 完全初始化好的成品 Bean |
| 二级 | `earlySingletonObjects` | 提前暴露的早期引用（半成品） |
| 三级 | `singletonFactories` | ObjectFactory，用于生成早期引用/代理对象 |

**解决流程（A ⇄ B 互相依赖）：**
1. A 实例化 → 放入三级缓存
2. A 需要注入 B → 去创建 B
3. B 实例化 → 放入三级缓存
4. B 需要注入 A → 从三级缓存拿到 A 的早期引用 → 注入给 B → B 完成初始化
5. A 拿到完整的 B → A 完成初始化

**为什么需要三级缓存？** 主要为了处理 AOP 代理！工厂对象可以在需要时生成代理，只靠二级缓存无法区分代理对象和原始对象。

**两种循环依赖无法解决：**
1. **构造器注入的循环依赖**：连实例化都完成不了，放不进缓存
2. **prototype 作用域的循环依赖**：Spring 不管理 prototype 的完整生命周期

---

## 九、Spring 中单例 Bean 的线程安全问题

### 

**核心：Spring 不对单例 Bean 做线程安全处理，需要开发者自己保证。**

**判断标准：** Bean 是否有状态（是否有可变的成员变量）。

- **无状态 Bean**（Controller、Service、DAO 层只调方法）：天然线程安全，因为局部变量在线程栈中隔离
- **有状态 Bean**（有共享的成员变量）：需要处理

**四种解决方案：**
1. 改作用域为 `prototype`（每次请求新建实例）
2. 使用 `ThreadLocal` 将变量变为线程私有（Spring 事务管理器就用 ThreadLocal 隔离 Connection）
3. 使用 `synchronized` / `ReentrantLock` 加锁
4. 使用并发工具类（`ConcurrentHashMap`、`AtomicInteger`）

> **最佳实践：** 设计无状态 Bean，避免在单例 Bean 中声明可变的实例变量。

---

## 十、谈谈你对 AOP 的理解以及底层实现原理

### 

**AOP（面向切面编程）** 是把横切关注点（日志、事务、权限）从核心业务逻辑中抽离出来，增强代码模块化。

**核心概念（5 个关键术语）：**

| 概念 | 说明 |
|------|------|
| **切面（Aspect）** | 横切关注点的模块化，= 通知 + 切入点 |
| **连接点（Joinpoint）** | 程序执行中的某个点（如方法调用） |
| **通知（Advice）** | 切面在连接点执行的动作（Before/After/Around） |
| **切入点（Pointcut）** | 匹配连接点的表达式 |
| **织入（Weaving）** | 将切面应用到目标对象的过程 |

**底层实现两种动态代理：**
- **JDK 动态代理**：目标类实现接口时使用，基于反射 + `InvocationHandler`
- **CGLIB 代理**：目标类无接口时使用，通过继承生成子类（方法不能是 final）

**Spring AOP 的选择逻辑：** 有接口用 JDK，无接口用 CGLIB。Spring Boot 2.x 起默认使用 CGLIB。

---

## 十一、AOP 涉及的具体注解有哪些

### 

| 注解 | 作用 |
|------|------|
| `@Aspect` | 声明切面类 |
| `@Pointcut` | 定义切入点表达式 |
| `@Before` | 前置通知 |
| `@After` | 后置通知（无论是否异常都执行） |
| `@AfterReturning` | 返回通知（正常返回后执行，可获取返回值） |
| `@AfterThrowing` | 异常通知（抛出异常后执行，可获取异常） |
| `@Around` | 环绕通知（最强大，可控制方法是否执行） |

**记忆口诀：** Before → Around(前) → 目标方法 → Around(后) → After → AfterReturning；异常时 Before → AfterThrowing → After。

---

## 十二、Spring 框架中用到了哪些设计模式

### 

至少说出 5 个，并结合 Spring 中的具体体现：

| 设计模式 | Spring 中的体现 |
|----------|----------------|
| **工厂模式** | `BeanFactory` / `ApplicationContext`，根据名称或类型返回 Bean |
| **单例模式** | Bean 默认 singleton 作用域 |
| **代理模式** | AOP 实现核心（JDK 动态代理 / CGLIB） |
| **模板方法模式** | `JdbcTemplate`、`RestTemplate`、`TransactionTemplate` |
| **观察者模式** | Spring 事件机制（`ApplicationListener`） |
| **适配器模式** | SpringMVC 的 `HandlerAdapter` |
| **策略模式** | Spring 的 `Resource` 接口，不同实现访问不同类型的资源 |
| **装饰器模式** | 类名含 Wrapper/Decorator 的类（如 `BeanWrapper`） |

---

## 十三、Spring 事务实现方式以及原理

### 

**两种方式：**

| 方式 | 说明 | 推荐度 |
|------|------|--------|
| **编程式事务** | 通过 `TransactionTemplate` 或 `PlatformTransactionManager` 手动控制 | 灵活但侵入业务代码 |
| **声明式事务** | `@Transactional` 注解，AOP 实现 | ✅ 推荐，业务代码无侵入 |

**`@Transactional` 工作原理（面试必背）：**
1. Spring 为加了 `@Transactional` 的类生成 AOP 代理对象
2. 代理逻辑：先**关闭自动提交** → 执行业务方法 → 无异常则 **commit**，有异常则 **rollback**
3. 默认只对 `RuntimeException` 和 `Error` 回滚
4. 可通过 `rollbackFor = Exception.class` 扩展回滚范围

**本质：** 事务是数据库层面的，Spring 只是基于数据库事务做了封装，通过 AOP 让开发者更方便地使用事务。

---

## 十四、Spring 事务定义的传播规则

### 

**业务场景：** 方法 A（有事务）调用方法 B，B 的事务行为如何？

| 传播机制 | 行为 | 记忆要点 |
|----------|------|----------|
| **REQUIRED**（默认） | 有事务就加入，没有就新建 | 最常用 |
| **SUPPORTS** | 有就加入，没有就非事务运行 | |
| **MANDATORY** | 必须在事务中，没有就抛异常 | 强制要求 |
| **REQUIRES_NEW** | 新建独立事务，挂起外层 | 内外互不影响 |
| **NOT_SUPPORTED** | 挂起外层事务，非事务执行 | |
| **NEVER** | 禁止事务存在，有就抛异常 | |
| **NESTED** | 嵌套事务，基于 savepoint | 内层回滚不影响外层 |

**关键对比：**
- **REQUIRES_NEW vs NESTED**：REQUIRES_NEW 内外完全独立，外层回滚不影响内层；NESTED 是父子关系，外层回滚子事务也回滚
- **REQUIRED vs NESTED**：REQUIRED 共用同一事务，被调用方异常整条事务都回滚；NESTED 被调用方异常只回滚子事务（调用方可 catch 处理）

---

## 结语

上半部分重点在于 **Spring 核心机制**——IoC 容器如何管理 Bean、如何用三级缓存解决循环依赖、AOP 如何实现、事务如何通过 AOP 工作。这些是面试中问得最深的部分，理解原理比死记硬背更重要。

> 下一篇：[Java 后端工程化面试题精炼（下）](/2026/06/10/Java后端工程化面试题精炼-下/) — 涵盖 SpringMVC、MyBatis、SpringBoot 自动配置等核心考点。
