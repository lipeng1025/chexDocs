# pages
::: details 理论阐述
  
  **1. 什么是 pages 目录？**
  > - `pages` 目录是 Nuxt3 的核心目录，用于存放应用的路由页面。该目录中的每个 Vue 文件都会自动映射为应用的一个路由，遵循基于文件系统的路由规则。
  ---
  **2. 有什么用？**
  > - **自动路由生成**：根据目录结构自动创建路由配置
  > - **动态路由支持**：通过方括号语法 `[param].vue` 创建动态路由
  > - **嵌套路由**：通过子目录和 `<NuxtPage>` 组件实现嵌套视图
  > - **布局集成**：支持页面级布局配置
  > - **路由元数据**：通过 `definePageMeta` 定义路由特定信息
  ---
  **3. 常见使用场景**
  > - **页面组件（.vue 文件）**
  > - **动态路由参数文件（如 `[id].vue`）**
  > - **嵌套路由目录结构**
  > - **错误页面（`error.vue`）**
  > - **自定义 404 页面（`[...slug].vue）`**
  ---
  **4. 目录结构建议**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  pages/
    ├── index.vue            # 首页路由：/
    ├── about.vue            # /about
    ├── products/
    │   ├── index.vue        # /products
    │   ├── [id].vue         # /products/:id
    │   └── category/
    │       └── [slug].vue   # /products/category/:slug
    ├── dashboard/
    │   ├── index.vue        # /dashboard
    │   └── settings.vue     # /dashboard/settings
    ├── blog/
    │   ├── index.vue        # /blog
    │   └── [...slug].vue    # /blog/* (捕获所有路由)
    ├── contact.vue          # /contact
    └── error.vue            # 自定义错误页面
  ```
  ---
  **5. 需要引入才能使用吗？**
  > - **不需要**。Nuxt 会自动扫描 `pages` 目录并生成路由配置。页面组件会自动注册为路由。
  ---
  **6.  与 layouts 目录的区别：**

  |  **特性**  |  **pages 目录**  |  **layouts 目录**  |
  |  ---  |  ---  |  ---  |
  |  目的  |  定义路由页面内容  |  定义页面通用框架  |
  |  路由影响  |  直接影响 URL 路径  |  不影响 URL，只影响渲染  |
  |  嵌套  |  通过目录结构实现路由嵌套  |  通过 `<slot>` 实现内容嵌套  |
  |  动态路由  |  支持动态参数  |  不支持动态参数  |
  |  自动注册  |  自动生成路由  |  需在页面中指定使用  |
  ---
  **7. 配置相关：**

  在 <mark>nuxt.config.ts</mark> 中可配置页面行为：
  ```ts
  export default defineNuxtConfig({
    pages: true, // 启用基于文件的路由（默认）
    routeRules: {
      '/old-page': { redirect: '/new-page' } // 路由重定向
    }
  })
  ```
  ---
:::
  
::: details 代码示例
  
  **1. 基本页面创建**

  **`pages/index.vue`**
  ```vue
  <template>
    <div>
      <h1>欢迎来到首页</h1>
      <NuxtLink to="/about">关于我们</NuxtLink>
    </div>
  </template>
  ```
  ---
  **2. 动态路由参数**

  **`pages/products/[id].vue`**
  ```vue
  <template>
    <div>
      <h2>产品详情: {{ product.name }}</h2>
      <p>ID: {{ $route.params.id }}</p>
    </div>
  </template>

  <script setup>
  const route = useRoute()
  const { data: product } = await useFetch(`/api/products/${route.params.id}`)
  </script>
  ```
  ---
  **3. 嵌套路由**

  **`pages/parent/index.vue`**
  ```vue
  <template>
    <div>
      <h1>父页面</h1>
      <!-- 子路由出口 -->
      <NuxtPage />
    </div>
  </template>
  ```

  **`pages/parent/child.vue`**
  ```vue
  <template>
    <div>
      <h2>子页面内容</h2>
    </div>
  </template>
  ```
  ---
  **4. 路由参数验证**

  **`pages/user/[id].vue`**
  ```vue
  <script setup>
    definePageMeta({
      validate: async (route) => {
        // 验证ID是否为数字
        return /^\d+$/.test(route.params.id)
      }
    })
  </script>
  ```
  ---
  **5. 页面元数据配置**

  **`pages/about.vue`**
  ```vue
  <script setup>
    definePageMeta({
      title: '关于我们',
      layout: 'custom-layout',
      middleware: ['auth'],
      keepalive: true // 开启缓存
    })
  </script>
  ```
  ---
  **6. 捕获所有路由（404页面）**

  **`pages/[...slug].vue`**
  ```vue
  <template>
    <div>
      <h1>页面不存在</h1>
      <p>请求的路径: {{ $route.params.slug.join('/') }}</p>
      <NuxtLink to="/">返回首页</NuxtLink>
    </div>
  </template>

  <script setup>
  definePageMeta({
    layout: 'error'
  })
  </script>
  ```
  ---
:::
  
::: details 问题补充
  
  **1. 动态路由匹配规则**
  > - `[param].vue` → 单参数（/product/123）
  > - `[...slug].vue` → 捕获所有路由（/foo/bar/baz）
  > - `[[...slug]].vue` → 可选捕获（可匹配 / 或 /foo/bar）
  ---
  **2. 路由中间件使用**
  ```vue
  <script setup>
    definePageMeta({
      middleware: [
        'auth', // 命名中间件
        function (to) { // 内联中间件
          if (!userStore.isAdmin) return '/'
        }
      ]
    })
  </script>
  ```
  ---
  **3. 页面缓存配置**
  ```vue
  <script setup>
    definePageMeta({
      keepalive: {
        exclude: ['Modal'] // 排除特定组件
      }
    })

    // 手动控制缓存
    const { $keepalive } = useNuxtApp()
    $keepalive.refresh('ProductPage')
  </script>
  ```
  ---
  **4. 错误页面处理**

  **`error.vue`**：

  ```vue
  <template>
    <div class="error-container">
      <h1>{{ error.statusCode }}</h1>
      <p>{{ error.message }}</p>
      <button @click="clearError">返回首页</button>
    </div>
  </template>

  <script setup>
    const props = defineProps(['error'])
    const clearError = () => clearError({ redirect: '/' })
  </script>
  ```
  ---
  **5. 布局系统集成**
  ```vue
  <script setup>
      // 指定使用的布局
      definePageMeta({
        layout: 'admin'
      })
  </script>

  <template>
      <div>
        <!-- 页面内容 -->
      </div>
  </template>
  ```
  **6. 页面特殊钩子**
  ```vue
  <script setup>
    // 服务端异步数据获取
    const { data } = await useAsyncData('page-data', () => $fetch('/api/page'))

    // 路由切换前处理
    onBeforeRouteLeave((to, from) => {
      if (formDirty) return confirm('确定离开吗？')
    })

    // 仅客户端执行的代码
    onMounted(() => {
      trackPageView()
    })
  </script>
  ```
  ---
  **7. 最佳实践**

  1.**命名规范**：
  > - 文件：小写字母 + 连字符（`user-profile.vue`）
  > - 目录：复数形式（`products/`）

  2.**性能优化**：
  ```vue
  <script setup>
    // 懒加载组件
    definePageMeta({
      layout: () => import('~/layouts/dynamic-layout.vue')
    })
  </script>
  ```

  3.**API 集成**：
  ```vue
  <script setup>
    // 并行请求优化
    const [user, posts] = await Promise.all([
      useFetch('/api/user'),
      useFetch('/api/posts')
    ])
  </script>
  ```

  4.**国际化路由**：
  ```text
  pages/
    ├── [lang]/
    │   ├── index.vue
    │   └── about.vue
  ```

  5.**分组路由**：
  ```vue
  <script setup>
    definePageMeta({
      group: 'admin'
    })
  </script>
  ```
  ---
  **8. 常见错误**

  1.**动态路由命名冲突**：
  ```text
  pages/
    ├── [id].vue
    └── index.vue    # ❌ 冲突：应改为 users/index.vue
  ```

  2.**无效的嵌套路由**：
  ```vue
  <!-- 父页面忘记添加 <NuxtPage> -->
  <template>
    <div>父页面内容</div>
    <!-- 缺少子路由出口 -->
  </template>
  ```

  3.**路由参数未处理**：
  ```vue
  <script setup>
  // 错误：未处理异步数据加载状态
  const { data } = await useFetch('/api/data')
  </script>

  <template>
    {{ data.name }} <!-- 可能为undefined -->
  </template>
  ```

  4.**布局无限循环**：
  ```vue
  <!-- 错误：布局内引用自身 -->
  <template>
    <NuxtLayout name="self-layout">
      <slot />
    </NuxtLayout>
  </template>
  ```

  5.**未处理404错误**：

  ``` ts
  // 错误：缺少全局捕获路由
  // 应添加 pages/[...slug].vue
  ```
  ---
  **9. 高级技巧**

  1.**路由过渡效果**

  **`app.vue`：**
  ```vue
  <template>
    <NuxtPage :transition="{
      name: 'page',
      mode: 'out-in'
    }" />
  </template>

  <style>
    .page-enter-active,
    .page-leave-active {
      transition: opacity 0.3s;
    }
    .page-enter-from,
    .page-leave-to {
      opacity: 0;
    }
  </style>
  ```

  2.**编程式导航**
  ```vue
  <script setup>
    const router = useRouter()

    function navigate() {
      router.push({
        path: '/product/123',
        query: { ref: 'home' },
        hash: '#section'
      })
    }
  </script>
  ```

  3.**路由别名**
  ```vue
  <script setup>
    definePageMeta({
      alias: ['/old-path', '/v2/new-path']
    })
  </script>
  ```

  4.**页面滚动行为**

  **`nuxt.config.ts`**：
  ```ts
  export default defineNuxtConfig({
    app: {
      scrollBehavior(to) {
        if (to.hash) {
          return { 
            el: to.hash,
            behavior: 'smooth'
          }
        }
        return { top: 0 }
      }
    }
  })
  ```

  5.**路由守卫集成**
  ```ts
  // plugins/router.ts
  export default defineNuxtPlugin(() => {
    const router = useRouter()
    
    router.beforeEach((to) => {
      // 全局前置守卫
    })
    
    router.afterEach((to) => {
      // 全局后置守卫
    })
  })
  ```
  ---
:::
  