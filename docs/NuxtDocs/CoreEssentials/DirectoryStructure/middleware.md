# middleware
::: details 理论阐述
  
  **1. 什么是 middleware 目录？**
  > - `middleware` 目录用于存放路由中间件文件。这些文件在页面渲染前执行，可拦截路由、修改请求/响应、执行认证检查等操作。中间件在服务端和客户端均可运行。
  ---
  **2. 有什么用？**
  > - **路由守卫**：控制页面访问权限
  > - **全局逻辑**：执行跨页面共享的逻辑
  > - **数据预处理**：提前获取页面所需数据
  > - **请求修改**：修改请求头或响应头
  > - **错误处理**：统一处理路由错误
  ---
  **3. 常见使用场景**
  > - **用户身份验证**
  > - **权限控制**
  > - **日志记录**
  > - **A/B测试**
  > - **地理定位检查**
  > - **维护模式切换**
  ---
  **4. 目录结构建议**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  middleware/
    ├── auth.global.ts    # 全局中间件（自动运行）
    ├── admin.ts          # 管理员权限检查
    ├── guest.ts          # 访客限制
    ├── log.ts            # 访问日志记录
    └── maintenance.ts    # 维护模式检查
  ```
  ---
  **5. 需要引入才能使用吗？**
  > - **全局中间件**（`.global`后缀）自动应用于所有路由
  > - **命名中间件**需要在页面中通过 `definePageMeta` 显式调用
  ---
  **6. 与插件（plugins）的区别：**

  |  **特性**  |  **middleware**  |  **plugins**  |
  |  ---  |  ---  |  ---  |
  |  执行时机  |  路由导航前（客户端或服务端）  |  Nuxt应用初始化时（客户端和服务端）  |
  |  使用场景  |  路由相关的逻辑  |  应用初始化、全局功能注入  |
  |  访问上下文  |  访问路由对象 (to, from)  |  访问Nuxt应用实例  |
  |  多次执行  |  每次路由变化  |  仅一次（或每次热更新）  |
  ---
  **7. 配置相关：**

  在 <mark>nuxt.config.ts</mark> 中可配置中间件行为：
  ```ts
  export default defineNuxtConfig({
    routeRules: {
      '/admin/**': { 
        middleware: ['auth', 'admin'] // 路由级中间件
      }
    }
  })
  ```
  ---
:::
  
::: details 代码示例
  
  **1. 全局身份验证中间件**

  **`/middleware/auth.global.ts`**
  ```ts
  export default defineNuxtRouteMiddleware((to) => {
    const { isAuthenticated } = useAuthStore()
    
    // 重定向到登录页
    if (!isAuthenticated && !to.path.startsWith('/login')) {
      return navigateTo('/login?redirect=' + to.fullPath)
    }
    
    // 已登录时禁止访问登录页
    if (isAuthenticated && to.path === '/login') {
      return navigateTo('/dashboard')
    }
  })
  ```
  ---
  **2. 命名中间件（管理员检查）**

  **`/middleware/admin.ts`**
  ```ts
  export default defineNuxtRouteMiddleware((to) => {
    const user = useUserStore()
    
    if (!user.isAdmin) {
      // 中止导航并显示错误
      return abortNavigation({
        statusCode: 403,
        message: 'Requires admin privileges'
      })
    }
  })
  ```

  在页面中使用：
  ```vue
  <script setup>
    definePageMeta({
      middleware: ['admin'] // 使用中间件
    })
  </script>
  ```
  ---
  **3. 维护模式中间件**

  **`/middleware/maintenance.ts`**
  ```ts
  export default defineNuxtRouteMiddleware(() => {
    const { maintenanceMode } = useRuntimeConfig().public
    
    if (maintenanceMode) {
      // 重定向到维护页面
      return navigateTo('/maintenance', { redirectCode: 503 })
    }
  })
  ```
  ---
  **4. 异步数据预取**

  **`/middleware/data-prefetch.ts`**
  ```ts
  export default defineNuxtRouteMiddleware(async (to) => {
    const productId = to.params.id
    if (productId) {
      // 预取产品数据
      await useProductStore().fetchProduct(productId as string)
    }
  })
  ```
  ---
  **5. 多中间件组合使用**

  ```vue
  <script setup>
    definePageMeta({
      middleware: [
        'auth',    // 先验证登录
        'admin',   // 再验证管理员权限
        'log'      // 最后记录访问日志
      ]
    })
  </script>
  ```
  ---
:::
  
::: details 问题补充
  
  **1. 执行顺序规则**
  > - 1: 全局中间件（按文件名顺序）
  > - 2: 布局（layout）中定义的中间件
  > - 3: 页面中定义的中间件
  ---
  **2. 服务端 vs 客户端执行**
  > - **首次访问**：在服务端执行
  > - **客户端导航**：在客户端执行
  > - **强制服务端执行**：
  ```ts
  defineNuxtRouteMiddleware(to => {
      if (process.server) {
        // 仅服务端逻辑
      }
  })
  ```
  ---
  **3. 动态添加中间件**
  ```ts
  // 在插件或组件中动态添加
  addRouteMiddleware('tracking', (to) => {
    useTrackPageView(to.path)
  }, { global: true })
  ```
  ---
  **4. 错误处理最佳实践**
  ```ts
  export default defineNuxtRouteMiddleware(() => {
      try {
        // 业务逻辑
      } catch (error) {
        // 统一错误处理
        showError({
          statusCode: 500,
          message: 'Middleware error'
        })
        // 或中止导航
        return abortNavigation(error)
      }
  })
  ```
  ---
  **5. 中间件类型定义**
  ```ts
  // 增强类型安全
  interface MiddlewareContext {
    to: RouteLocationNormalized
    from: RouteLocationNormalized
    next?: () => void
  }

  export default defineNuxtRouteMiddleware((context: MiddlewareContext) => {
    // 逻辑处理
  })
  ```
  ---
  **6. 性能优化建议**
  > - 避免在中间件中执行重型同步操作
  > - 对数据预取使用 `lazy: true` 选项
  > - 使用 `watch: false` 防止重复执行：
  ```ts
  definePageMeta({
    middleware: ['auth', { path: '/dashboard', watch: false }]
  })
  ```
  ---
  **7. 性能优化建议**

  1.**命名规范：**
  > - 全局中间件：[name].global.ts
  > - 局部中间件：[name].ts

  2.**安全实践：**
  ```ts
  // 防止敏感信息泄露
  if (process.client) {
    deleteHeaders(['X-Secret-Token'])
  }
  ```

  3.**中间件复用：**
  ```ts
  // 创建可配置中间件
  export const createAuthMiddleware = (options) => {
    return defineNuxtRouteMiddleware((to) => {
      // 使用options配置
    })
  }
  ```

  4.**组合式函数集成：**
  ```ts
  // 复用组合式逻辑
  export default defineNuxtRouteMiddleware(() => {
    const { validate } = useAuth()
    return validate()
  })
  ```

  5.**避免副作用：**
  > - 不要在中间件中直接修改组件状态
  > - 通过状态管理（Pinia）共享数据
  ---
  **8. 常见错误**
  
  1.**循环重定向：**
  ```ts
  // 错误示例：未设置排除路径
  if (!isAuth) return navigateTo('/login')
  ```

  2.**服务端客户端不一致：**
  ```ts
  // 错误：在服务端使用window
  if (window.localStorage.token) // ❌
  ```

  3.**未处理异步：**
  ```ts
  // 错误：未等待异步操作
  fetchData() // ❌ 可能未完成就继续导航
  ```
  4.**路径硬编码：**
  ```ts
  // 错误
  navigateTo('/en/login') // ❌ 应使用i18n路径
  ```
  5.**中间件顺序错误：**
  ```ts
  definePageMeta({
    middleware: ['log', 'auth'] // ❌ 应先执行auth
  })
  ```
  ---
:::
  