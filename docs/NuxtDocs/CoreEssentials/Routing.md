# 路由系统

## 一、文件路由规则

  1.**静态路由**
  ```bash
  pages/
    index.vue       → /
    about.vue       → /about
    contact.vue     → /contact
  ```
  ---
  2.**动态路由**
  ```bash
  pages/
    users/
      [id].vue          → /users/:id (单参数)
    posts/
      [slug]-[cid].vue  → /posts/:slug-:cid (多参数)
  ```

  ```vue
  <!-- pages/users/[id].vue -->
  <!-- pages/users/10086 -->

  <!-- pages/posts/:slug-:cid -->
  <!-- pages/posts/10086-10010 -->
  <script setup>
    const route = useRoute()
    console.log(route.params.id) // 获取动态参数
  </script>
  ```
  ---
  3.**嵌套路由**
  ```bash
  pages/
    parent/
      index.vue     → /parent
      child.vue     → /parent/child
    parent.vue      ← 父组件需包含 <NuxtPage/>
  ```

  ```vue
  <!-- pages/parent.vue -->
  <template>
    <div>
      <h1>父布局</h1>
      <NuxtPage /> <!-- 子路由出口 -->
    </div>
  </template>
  ```
## 二、编程式导航

  1.**`navigateTo` (推荐)**
  ```typescript
  // 在任何JS上下文中使用
  navigateTo('/about')

  // 带参数
  navigateTo({
    path: '/users/123',
    query: { ref: 'home' }
  })

  // 替换当前路由（不添加历史记录）
  navigateTo('/login', { replace: true })
  ```
  ---
  2.**`useRouter().push`**
  ```typescript
  // 仅在Vue组件中使用
  const router = useRouter()
  router.push('/dashboard')

  // 带参数
  router.push({
    path: '/posts/456',
    query: { mode: 'edit' }
  })
  ```

  **区别对比：**
  |  **特性**  |  **`navigateTo`**  |  **`useRouter().push`**  |
  |  ---  |  ---  |  ---  |
  |  使用场景  |  任意JS环境（中间件、插件等）  |  仅Vue组件内  |
  |  服务端支持  |  ✅  |  ❌  |
  |  类型安全  |  ✅  |  ✅  |
  |  返回Promise  |  ✅  |  ❌  |
  > **最佳实践**：优先使用 `navigateTo`，在组件内部可使用 `useRouter().push`
## 三、路由中间件
  
  1.**全局中间件**
  ```bash
  middleware/
    auth.global.ts   # 自动应用于所有路由
  ```

  ```typescript
  // middleware/auth.global.ts
  export default defineNuxtRouteMiddleware((to, from) => {
    const isLoggedIn = useAuthStore().isAuthenticated
    
    if (!isLoggedIn && to.path !== '/login') {
      return navigateTo('/login?redirect=' + to.fullPath)
    }
  })
  ```
  ---
  2.**局部中间件**
  ```typescript
  // middleware/check-admin.ts
  export default defineNuxtRouteMiddleware(() => {
    if (!useUser().isAdmin) {
      return abortNavigation("管理员权限不足")
    }
  })
  ```

  ```vue
  <!-- pages/admin/dashboard.vue -->
  <script setup>
    definePageMeta({
      middleware: ['check-admin'] // 应用局部中间件
    })
  </script>
  ```

  **中间件执行顺序**：
  - 全局中间件（按文件名顺序）
  - 布局（layout）中间件
  - 页面（page）中间件

  > **注意**：使用 `abortNavigation()` 终止导航时需传递错误信息

## 四、路由验证与参数转换
  
  路由验证
  ```vue
  <!-- pages/users/[id].vue -->
  <script setup>
    definePageMeta({
      validate: async (route) => {
        // 验证ID必须是数字
        return /^\d+$/.test(route.params.id)
      }
    })
  </script>
  ```
  ---
  参数转换
  ```vue
  <script setup>
    definePageMeta({
      transform: (route) => {
        // 转换参数类型
        const id = parseInt(route.params.id)
        return { id } // 新参数会合并到route.params
      }
    })
  </script>
  ```

## 五、路由冲突解决规则

  **优先级顺序（从高到低）**：

  - **静态路由**：`pages/about.vue`
  - **带前缀的动态路由**：`pages/users-[group]/[id].vue`
  - **单参数动态路由**：`pages/users/[id].vue`
  - **多参数动态路由**：`pages/[...slug].vue`
  - **通配路由**：`pages/[...all].vue`

  冲突示例：
  ```bash
  pages/
    search.vue         # 1. 静态路由 → /search
    [query].vue        # 3. 动态路由 → /:query
    [...slug].vue      # 4. 通配路由 → /:slug(.*)
  ```
  访问 `/search` → 优先匹配 `search.vue`  
  访问 `/books` → 匹配 `[query].vue`  
  访问 `/docs/getting-started` → 匹配 `[...slug].vue`  

  > **重要**：同名文件与目录会冲突（如 `users.vue` 和 `users/index.vue`），需避免
## 六、高级路由技巧

  1.**自定义路由**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    pages: true, // 启用文件路由
    routeRules: {
      '/legacy-page': { redirect: '/new-page' },
      '/api/*': { proxy: 'http://backend.example.com/' }
    }
  })
  ```
  ---
  2.**路由元信息**
  ```vue
  <!-- 页面组件内 -->
  <script setup>
    definePageMeta({
      title: '用户详情',
      layout: 'admin',
      requiresAuth: true,
      breadcrumb: [{ text: '首页', to: '/' }]
    })
  </script>
  ```

  ```ts
  // 在中间件中访问
  export default defineNuxtRouteMiddleware((to) => {
    if (to.meta.requiresAuth) {
      // 验证逻辑
    }
  })
  ```
  ---
  3.**动态布局切换**
  ```vue
  <script setup>
    // 根据路由动态改变布局
    const route = useRoute()
    const layout = ref('default')

    watch(() => route.meta.layout, (newLayout) => {
      layout.value = newLayout || 'default'
    })
  </script>

  <template>
    <NuxtLayout :name="layout">
      <NuxtPage />
    </NuxtLayout>
  </template>
  ```
## 七、关键注意事项

  1.**动态参数获取：**

  - 使用 `useRoute()` 在组件中获取
  - 服务端使用 `event.context.params`
  ---
  2.**404处理：**
  ```bash
  pages/
    [...notFound].vue  # 捕获所有未匹配路由
  ```
  ---
  3.**路由过渡动画：**
  ```vue
  <style>
    .page-enter-active, .page-leave-active {
      transition: opacity 0.3s;
    }
    .page-enter, .page-leave-to {
      opacity: 0;
    }
  </style>
  ```
  ---
  4.**路由懒加载：**
  ```vue
  <script setup>
    definePageMeta({
      lazy: true // 延迟加载页面组件
    })
  </script>
  ```
  ---
  5.**SEO优化：**
  ```vue
  <script setup>
    useHead({
      title: () => `${route.meta.title} - 我的网站`,
      meta: [{ name: 'description', content: '页面描述' }]
    })
  </script>
  ```






