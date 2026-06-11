---
title: Java 后端工程化面试题精炼（下）
date: 2026-06-10 12:00:00
tags:
  - 面经
categories:
  - 技术
description: 精炼 Java 后端工程化高频面试题（下），涵盖 Spring 事务失效场景、SpringMVC 工作原理、MyBatis 核心机制、SpringBoot 自动配置原理与 Starter 机制等核心考点。
cover: /img/random16.png
---

## 前言

> 上一篇：[Java 后端工程化面试题精炼（上）](/2026/06/09/Java后端工程化面试题精炼-上/) — 涵盖 IoC/DI、Bean 生命周期、循环依赖、AOP、事务传播等。

本文接续上篇，精炼 **Java 后端工程化** 面试题下半部分（14 道），聚焦 Spring 事务失效排查、SpringMVC 请求处理流程、MyBatis 核心机制、SpringBoot 自动配置原理等高频考点。

---

## 一、Spring 事务什么时候会失效

### 

**根本原因：AOP 代理没有生效。** 按频率从高到低排查：

**1. 异常被 try-catch 吞掉（最常见）**
Spring 事务必须感知到异常才会回滚。如果 catch 住异常不往外抛，框架不知道出错了。
```java
// ❌ 失效：异常被吞了
try { db.save(); } catch (Exception e) { log.error(e); }
```

**2. 抛了受检异常（Checked Exception）**
Spring 默认只回滚 `RuntimeException` 和 `Error`。抛 `IOException`、`SQLException` 不回滚。
```java
// ✅ 修复
@Transactional(rollbackFor = Exception.class)
```

**3. 同类内部 this 调用（高频）**
事务靠 AOP 代理实现，`this.method()` 调用的是真实对象，不是代理，事务注解失效。
```java
// ❌ 失效
public void a() { this.b(); }
@Transactional
public void b() { ... }

// ✅ 修复方案
// 方案1：注入自己
@Autowired private XxxService self; → self.b();
// 方案2：AopContext.currentProxy()
// 方案3：拆到不同类
```

**4. 方法不是 public**：AOP 代理不到非 public 方法

**5. 数据库引擎不支持事务**：如 MySQL MyISAM（必须 InnoDB）

**6. 类没被 Spring 管理**：忘了加 `@Service`/`@Component`

> **面试金句：** 99% 的事务失效是前三种情况——吞异常、受检异常、this 调用。

---

## 二、SpringMVC 常用的注解

### 

按功能分类记忆：

| 分类 | 注解 | 作用 |
|------|------|------|
| 控制器 | `@Controller`、`@RestController` | 声明控制器（后者 = @Controller + @ResponseBody） |
| 请求映射 | `@RequestMapping`、`@GetMapping`、`@PostMapping`、`@PutMapping`、`@DeleteMapping` | URL 到方法的映射 |
| 参数获取 | `@RequestParam`、`@PathVariable`、`@RequestBody` | 分别获取查询参数、路径变量、请求体 |
| 数据返回 | `@ResponseBody` | 返回 JSON/XML 而非视图 |
| 校验 | `@Valid`、`@Validated` | 触发 JSR-303 参数校验 |
| 异常处理 | `@ExceptionHandler` | 局部异常处理 |
| 跨域 | `@CrossOrigin` | 允许跨域请求 |

---

## 三、SpringMVC 工作原理

### 

**核心流程 11 步（简化为 5 大环节）：**

```
用户请求 → DispatcherServlet（前端控制器，统一入口）
    → HandlerMapping（找到处理请求的 Controller）
    → HandlerAdapter（适配调用 Controller 方法）
    → Controller 执行，返回 ModelAndView
    → ViewResolver（解析视图） → 渲染 → 响应
```

**关键组件记忆：**
| 组件 | 作用 |
|------|------|
| `DispatcherServlet` | 核心调度器，所有请求入口 |
| `HandlerMapping` | 根据 URL 找到对应的处理器 |
| `HandlerAdapter` | 适配器模式，调用具体 Controller |
| `ViewResolver` | 将逻辑视图名解析为物理视图 |

---

## 四、SpringMVC 拦截器和 JavaWeb Filter 的区别

### 

**核心区别：范畴不同——Filter 是 Servlet 级别，Interceptor 是 Spring 级别。**

| 维度 | Filter（过滤器） | Interceptor（拦截器） |
|------|----------------|---------------------|
| 所属规范 | Servlet 规范（Java EE） | SpringMVC 框架 |
| 作用范围 | 所有请求（含静态资源） | 仅 SpringMVC 处理的请求 |
| 执行时机 | 进入 Servlet 之前 | Controller 方法前后 |
| 能访问 Spring Bean | ❌ 不能直接访问 | ✅ 可以 |
| 配置方式 | `web.xml` 或 `@WebFilter` | Spring 配置类或 XML |
| 精细度 | 粗粒度（请求级） | 细粒度（方法级，pre/post/after） |

**适用场景：**
- Filter：字符编码、CORS、请求日志
- Interceptor：权限验证、登录检查、Controller 级别日志

---

## 五、MyBatis 中 # 和 $ 的区别（重点）

### 

**一句话：`#` 是预编译占位符（安全），`$` 是直接字符串替换（有 SQL 注入风险）。**

| 对比 | `#{}` | `${}` |
|------|-------|-------|
| 处理方式 | 预编译（PreparedStatement），参数用 `?` 占位 | 直接拼接到 SQL 字符串 |
| SQL 注入 | ✅ 安全 | ❌ 不安全 |
| 类型处理 | 自动处理（字符串自动加引号） | 不处理 |
| 使用场景 | 普通参数值（where name = #{name}） | 表名、列名等动态数据库对象 |
| 性能 | 预编译可复用 | 每次拼接新 SQL |

**面试必背：** 能用 `#` 就用 `#`，只有动态表名/列名时才用 `$`。

---

## 六、MyBatis 中一级缓存与二级缓存

### 

| 对比 | 一级缓存 | 二级缓存 |
|------|---------|---------|
| 作用范围 | SqlSession 级别 | SqlSessionFactory 级别（跨 SqlSession） |
| 默认开启 | ✅ 是 | ❌ 否（需配置） |
| 生命周期 | SqlSession 关闭即清空 | SqlSessionFactory 生命周期内有效 |
| 线程安全 | 天然安全（每 SqlSession 单线程） | 需要注意并发问题 |

**工作方式：**
- 一级缓存：同一 SqlSession 内相同查询直接返回缓存结果，有 DML 操作会自动清空
- 二级缓存：需在 mapper.xml 中加 `<cache/>` 标签，实体类需实现 `Serializable`

---

## 七、MyBatis 插件运行原理

### 

**底层：JDK 动态代理 + 责任链模式。**

- MyBatis 只支持拦截 4 种接口：`Executor`、`StatementHandler`、`ParameterHandler`、`ResultSetHandler`
- 插件实现 `Interceptor` 接口，重写 `intercept()` 方法
- 通过 `@Intercepts` + `@Signature` 注解指定拦截的目标方法和参数
- 多个插件形成责任链，依次执行

**编写步骤：**
1. 实现 `Interceptor` 接口
2. 在 `intercept()` 中编写拦截逻辑
3. 在 mybatis-config.xml 中注册 `<plugin>`

---

## 八、MyBatis 多表映射中 association 与 collection 区别

### 

| 元素 | 关系类型 | 属性 | 使用场景 |
|------|---------|------|----------|
| `association` | 一对一 | `javaType` 指定单个对象类型 | 用户 ↔ 地址 |
| `collection` | 一对多 | `ofType` 指定集合元素类型 | 用户 ↔ 多个订单 |

**简单记忆：** association（关联）→ 一个对象，collection（集合）→ 多个对象组成的集合。

---

## 九、MyBatis 中常用的动态标签

### 

| 标签 | 作用 |
|------|------|
| `<if>` | 条件判断 |
| `<foreach>` | 遍历集合（构建 IN 条件、批量操作） |
| `<choose>` / `<when>` / `<otherwise>` | 类似 Java switch |
| `<where>` | 自动去掉开头的 AND/OR |
| `<set>` | 动态 UPDATE 时自动去掉末尾逗号 |
| `<trim>` | 更灵活的格式控制（去除/添加前缀/后缀） |
| `<sql>` + `<include>` | 复用 SQL 片段 |

---

## 十、SpringBoot 框架的主要优势

### 

**四大核心优势：**

1. **自动配置**：根据引入的依赖自动配置 Spring 环境，无需手动写大量 XML
2. **内嵌服务器**：内置 Tomcat/Jetty，打成 jar 包直接 `java -jar` 运行
3. **起步依赖（Starter）**：聚合常用依赖，一个 starter 搞定一个技术栈
4. **开箱即用**：约定大于配置，Spring Initializr 快速生成项目骨架

**附加优势：** 与 Spring Cloud 无缝集成做微服务，提供 Actuator 监控端点。

---

## 十一、SpringBoot 的自动配置原理（重点）

### 

**核心五步：**

1. **启动类 `@SpringBootApplication`** = `@EnableAutoConfiguration` + `@ComponentScan` + `@Configuration`
2. **`@EnableAutoConfiguration`** 通过 `@Import(AutoConfigurationImportSelector.class)` 批量导入配置类
3. 加载 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 文件中指定的 **142 个自动配置类**
4. 每个 `xxxAutoConfiguration` 都有 `@ConditionalOnXxx` 条件注解，**按需生效**（如 classpath 有相关 jar 才生效）
5. 配置类通过 `@EnableConfigurationProperties(xxxProperties.class)` 将 `application.yml` 中的配置值绑定到属性类，再注入到组件中

**面试一句话总结：** 导入 starter → autoconfigure 包中的配置类按条件生效 → 配置类和配置文件绑定 → 开发者只改配置文件就能控制底层行为。

---

## 十二、SpringBoot 如何实现不同环境配置切换

### 

使用 `application-{profile}.properties/yml` 文件，通过 `spring.profiles.active` 指定：

```
application.yml           # 公共配置
application-dev.yml       # 开发环境
application-test.yml      # 测试环境
application-prod.yml      # 生产环境
```

```yaml
# application.yml 中激活
spring:
  profiles:
    active: dev
```

也可通过启动参数 `--spring.profiles.active=prod` 或环境变量切换。

---

## 十三、SpringBoot 启动类注解的构成

### 

`@SpringBootApplication` 是复合注解，由三个注解组成：

| 注解 | 作用 |
|------|------|
| `@EnableAutoConfiguration` | 开启自动配置，批量导入 autoconfigure 包下的配置类 |
| `@ComponentScan` | 扫描启动类所在包及其子包的组件（@Service、@Controller 等） |
| `@SpringBootConfiguration` | 标识该类为配置类（等同于 `@Configuration`） |

---

## 十四、SpringBoot Starter 的工作原理

### 

**Starter = 依赖聚合 + 自动配置。**

工作流程：
1. SpringBoot 启动时读取所有引入 starter 中的 `META-INF/spring/...AutoConfiguration.imports` 文件
2. 根据文件中列出的 `AutoConfiguration` 类，结合 `@Conditional` 条件注解，按需加载配置
3. 配置类中通过 `@Bean` 向容器注入组件，组件的参数从 `application.yml` 绑定
4. 启动完毕，所有资源就绪，业务代码直接注入使用即可

**一句话：** Starter 让你引入一个依赖就能用一类功能，所有繁琐的配置由 SpringBoot 自动完成。

---

## 结语

下半部分的核心是 **"为什么这样设计"和"出了故障怎么排查"**。SpringMVC 的请求处理链路、MyBatis 的 `#` 与 `$` 区别、SpringBoot 的自动配置原理，是面试中区分"会用"和"理解"的关键分界线。

> 下一篇：[Java 分布式项目面试题精炼](/2026/06/11/Java分布式项目面试题精炼/) — 涵盖 Redis、Nginx、认证方案、Git 等核心考点。
