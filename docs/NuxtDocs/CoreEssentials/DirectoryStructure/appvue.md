# app.vue
::: details 理论阐述
  
  **1. 什么是 app.vue 文件？**
  > - `app.vue` 是 Nuxt3 应用的根组件和核心入口文件。它作为整个应用的顶层容器，负责初始化应用框架、定义全局布局结构，并提供应用级别的功能集成。
  ---
  **2. 有什么用？**
  > - **应用入口**：整个 Nuxt 应用的启动点
  > - **全局布局**：定义所有页面共享的布局结构
  > - **上下文提供**：为应用提供全局上下文（如状态管理、主题等）
  > - **错误处理**：定义全局错误边界
  > - **生命周期管理**：控制应用级别的生命周期钩子
  > - **全局功能集成**：集成第三方库、全局样式等
  ---
  **3. 关键功能**
  > - **页面内容渲染（通过 `<NuxtPage>`）**
  > - **布局系统集成（通过 `<NuxtLayout>`）**
  > - **全局状态初始化**
  > - **错误边界处理**
  > - **SEO 元数据管理**
  > - **全局样式引入**
  ---
  **4. 文件位置**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  your-project/
    ├── app.vue           # 应用入口文件
    ├── nuxt.config.ts    # 其他同级文件或目录
    ├── package.json      # 其他同级文件或目录
    └── ...               # 其他同级文件或目录
  ```
  ---
  **5. 需要配置吗？**
  > - **不需要**额外配置，Nuxt3 会自动识别根目录下的 app.vue 文件作为应用入口。如果不存在 app.vue，Nuxt 会使用默认入口。
  ---
  **6.  与 layouts 目录的关系：**

  |  **特性**  |  **app.vue**  |  **layouts 目录**  |
  |  ---  |  ---  |  ---  |
  |  层级  |  顶级入口  |  页面级布局  |
  |  使用范围  |  全局唯一  |  可定义多个布局  |
  |  内容  |  整个应用结构  |  页面内容包裹  |
  |  页面指定  |  不涉及  |  通过 definePageMeta 指定  |
  |  错误处理  |  可定义全局错误边界  |  通常不处理错误(可以创建错误页面的布局)  |
  ---
:::
  
::: details 代码示例

  **1. 基础结构**
  
  **`app.vue`：**

  ```vue
  <template>
    <!-- 应用根容器 -->
    <div>
      <!-- 全局导航 -->
      <AppHeader />
      
      <!-- 页面内容出口 -->
      <NuxtPage />
      
      <!-- 全局页脚 -->
      <AppFooter />
    </div>
  </template>

  <script setup>
  // 全局组件（如果未自动导入）
  import AppHeader from '@/components/AppHeader.vue'
  import AppFooter from '@/components/AppFooter.vue'
  </script>

  <style>
  /* 全局样式 */
  body {
    margin: 0;
    font-family: 'Arial', sans-serif;
  }
  </style>
  ```
  ---
  **2. 添加错误边界**
  ```vue
  <template>
    <NuxtErrorBoundary>
      <!-- 默认插槽：主要内容 -->
      <NuxtPage />
      
      <!-- 错误处理插槽 -->
      <template #error="{ error }">
        <div class="error-container">
          <h1>应用出错</h1>
          <p>{{ error.message }}</p>
          <button @click="resetError">重试</button>
        </div>
      </template>
    </NuxtErrorBoundary>
  </template>

  <script setup>
  const resetError = () => clearError({ redirect: '/' })
  </script>
  ```
  ---
  **3. 集成布局系统**
  ```vue
  <template>
    <!-- 使用默认布局 -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </template>

  <script setup>
  // 动态设置布局
  const route = useRoute()
  const layout = computed(() => route.meta.layout || 'default')
  </script>
  ```
  ---
  **4. 全局状态提供**
  ```vue
  <script setup>
  // 提供全局主题状态
  const theme = ref('light')
  provide('theme', theme)

  // 切换主题函数
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  </script>

  <template>
    <div :class="`theme-${theme}`">
      <button @click="toggleTheme">切换主题</button>
      <NuxtPage />
    </div>
  </template>
  ```
  ---
  **5. 全局Head配置**
  ```vue
  <script setup>
  useHead({
    titleTemplate: (title) => title ? `${title} - 我的网站` : '我的网站',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    bodyAttrs: {
      class: 'min-h-screen bg-gray-50'
    }
  })
  </script>
  ```
  ---
:::
  
::: details 问题补充

  **1. 身份验证状态初始化**
  ```vue
  <script setup>
  const auth = useAuthStore()

  // 应用初始化时检查用户登录状态
  onMounted(async () => {
    if (!auth.user) {
      await auth.refreshUser()
    }
  })
  </script>
  ```
  ---
  **2. 全局监听路由变化**
  ```vue
  <script setup>
  const router = useRouter()

  // 监听路由变化
  router.beforeEach((to, from) => {
    console.log(`从 ${from.path} 跳转到 ${to.path}`)
    useTrackPageView(to.path)
  })

  // 页面加载时执行
  onMounted(() => {
    console.log('应用已挂载')
  })
  </script>
  ```
  ---
  **3. 多语言支持**
  ```vue
  <script setup>
  const { locale, setLocale } = useI18n()

  // 根据用户设置或浏览器语言设置初始语言
  onMounted(() => {
    const savedLocale = localStorage.getItem('locale')
    const browserLocale = navigator.language.split('-')[0]
    setLocale(savedLocale || browserLocale || 'zh')
  })
  </script>
  ```
  ---
  **4. 性能监控**
  ```vue
  <script setup>
  if (process.client) {
    // 客户端性能监控
    window.addEventListener('load', () => {
      const timing = performance.timing
      console.log('页面加载耗时:', timing.loadEventEnd - timing.navigationStart)
    })
    
    // 路由性能监控
    const router = useRouter()
    let navigationStart = 0
    
    router.beforeEach(() => {
      navigationStart = performance.now()
    })
    
    router.afterEach(() => {
      const duration = performance.now() - navigationStart
      console.log(`路由切换耗时: ${duration.toFixed(2)}ms`)
    })
  }
  </script>
  ```
  ---
  **5. 环境特定逻辑**
  ```vue
  <script setup>
  // 根据环境变量执行不同逻辑
  const runtimeConfig = useRuntimeConfig()

  if (runtimeConfig.public.env === 'production') {
    // 生产环境初始化
    initAnalytics()
  } else {
    // 开发环境逻辑
    console.log('开发模式')
  }
  </script>
  ```
  ---
  **6. 最佳实践**

  1.**保持精简：**
  > - 避免在 app.vue 中添加过多业务逻辑
  > - 将复杂功能拆分为可组合函数或插件

  2.**组件拆分：**

  ```vue
  <template>
    <AppLayout>
      <NuxtPage />
    </AppLayout>
  </template>

  <script setup>
  // 将布局组件拆分到单独文件
  import AppLayout from '@/layouts/AppLayout.vue'
  </script>
  ```
  
  3.**错误处理：**

  ```vue
  <NuxtErrorBoundary @error="handleGlobalError">
    <NuxtPage />
  </NuxtErrorBoundary>

  <script setup>
  const handleGlobalError = (error) => {
    console.error('全局错误:', error)
    useTrackError(error)
  }
  </script>
  ```

  4.**状态管理：**

  ```vue
  <script setup>
  // 使用Pinia进行全局状态管理
  const store = useMainStore()

  // 初始化必要状态
  store.initialize()
  </script>
  ```

  5.**性能优化：**

  ```vue
  <script setup>
  // 延迟加载非关键组件
  const HeavyComponent = defineAsyncComponent(() => 
    import('@/components/HeavyComponent.vue')
  )
  </script>
  ```

  6.**SEO优化：**

  ```vue
  <script setup>
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '我的网站',
        url: 'https://example.com'
      })
    }]
  })
  </script>
  ```
  ---
  **7. 常见错误**

  1.**缺少 `<NuxtPage>`：**

  ```vue
  <!-- 错误：忘记添加页面出口 -->
  <template>
    <div>没有页面内容</div>
  </template>
  ```

  2.**服务端兼容问题：**

  ```vue
  <script setup>
  // 错误：在服务端访问 window
  onMounted(() => {
    const token = window.localStorage.getItem('token') // ❌ 服务端会报错
  })
  </script>
  ```

  3.**过度使用全局状态：**

  ```vue
  <script setup>
    // 错误：将页面级状态放在全局
    const pageTitle = ref('首页') // ❌ 应放在页面组件中
  </script>
  ```

  4.**样式污染：**

  ```vue
  <style scoped>
    /* 错误：scoped 在 app.vue 中通常无效 */
  </style>
  ```

  5.**重复导入：**

  ```vue
  <script setup>
  // 错误：重复导入已自动导入的组件
  import { useHead } from '@unhead/vue' // ❌ Nuxt 已自动导入
  </script>
  ```
  ---
  **8. 高级技巧**

  1.**动态主题切换**
  ```vue
  <script setup>
  const theme = ref('light')

  // 监听系统主题变化
  if (process.client) {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    theme.value = darkModeMediaQuery.matches ? 'dark' : 'light'
    
    darkModeMediaQuery.addEventListener('change', (e) => {
      theme.value = e.matches ? 'dark' : 'light'
    })
  }
  </script>

  <template>
    <div :class="theme">
      <NuxtPage />
    </div>
  </template>

  <style>
  .dark {
    background-color: #1a202c;
    color: #e2e8f0;
  }
  .light {
    background-color: #ffffff;
    color: #2d3748;
  }
  </style>
  ```

  2.**全局加载状态**
  ```vue
  <template>
    <div>
      <AppLoadingBar v-if="isLoading" />
      <NuxtPage />
    </div>
  </template>

  <script setup>
  const isLoading = ref(false)
  const router = useRouter()

  router.beforeEach(() => {
    isLoading.value = true
  })

  router.afterEach(() => {
    isLoading.value = false
  })
  </script>
  ```

  3.**多入口支持（高级）**
  ```vue
  <script setup>
    // 根据条件渲染不同内容
    const isAdminApp = computed(() => useRoute().path.startsWith('/admin'))

    // 提供不同的应用上下文
    provide('appContext', isAdminApp.value ? 'admin' : 'main')
  </script>

  <template>
    <NuxtPage v-if="isAdminApp" :layout="'admin'" />
    <NuxtPage v-else />
  </template>
  ```

  4.**集成第三方SDK**
  ```vue
  <script setup>
    import * as Sentry from '@sentry/vue'

    onMounted(() => {
      if (process.client) {
        Sentry.init({
          app: nuxtApp.vueApp,
          dsn: 'YOUR_DSN',
          integrations: [new Sentry.BrowserTracing()],
          tracesSampleRate: 1.0,
        })
      }
    })
  </script>
  ```

  5.**自定义过渡效果**
  ```vue
  <template>
    <NuxtPage :transition="{
      name: 'page',
      mode: 'out-in',
      onBeforeEnter: () => { /* 自定义逻辑 */ },
      onAfterEnter: () => { /* 自定义逻辑 */ }
    }" />
  </template>

  <style>
    .page-enter-active,
    .page-leave-active {
      transition: opacity 0.3s, transform 0.3s;
    }
    .page-enter-from,
    .page-leave-to {
      opacity: 0;
      transform: translateY(20px);
    }
  </style>
  ```
  ---
:::
  