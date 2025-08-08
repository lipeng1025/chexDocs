# error.vue
::: details 理论阐述
  
  **1. 什么是 error.vue 文件？**
  > - `error.vue` 是 Nuxt3 的全局错误处理页面，用于显示应用运行时发生的未捕获异常。它作为应用的错误边界，当路由渲染或数据加载过程中发生错误时，Nuxt 会自动显示此页面。
  ---
  **2. 有什么用？**
  > - **错误展示**：显示用户友好的错误信息
  > - **错误隔离**：防止错误影响整个应用崩溃
  > - **错误恢复**：提供重试或返回安全页面的选项
  > - **错误诊断**：开发环境下显示详细错误信息
  > - **自定义处理**：根据错误类型显示不同内容
  ---
  **3. 关键特性**
  > - **接收 `error` 对象作为 prop**
  > - **自动处理 404 等常见错误**
  > - **支持自定义错误页面布局**
  > - **提供 `clearError` 方法恢复应用**
  > - **开发环境显示详细错误堆栈**
  ---
  **4. 文件位置**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  your-project/
    ├── error.vue         # 全局错误页面
    ├── app.vue           # 其他同级文件或目录
    ├── package.json      # 其他同级文件或目录
    └── ...               # 其他同级文件或目录
  ```
  ---
  **5. 需要配置吗？**
  > - **不需要**额外配置，Nuxt3 会自动识别根目录下的 `error.vue` 文件作为错误页面。如果不存在，会使用默认错误页面。
  ---
  **6.  与普通页面的区别：**

  |  **特性**  |  **error.vue**  |  **普通页面**  |
  |  ---  |  ---  |  ---  |
  |  用途  |  错误处理  |  正常内容展示  |
  |  访问方式  |  Nuxt 自动调用  |  通过路由访问  |
  |  参数传递  |  自动接收 `error` prop  |  通过路由参数  |
  |  布局系统  |  可自定义布局  |  使用 layouts 目录  |
  |  生命周期  |  错误发生时触发  |  路由匹配时触发  |
  |  恢复机制  |  提供 `clearError（）` 方法  |  无特殊恢复机制  |
  ---
:::
  
::: details 代码示例

  **1. 基础结构**
  
  **`error.vue`：**

  ```vue
  <template>
    <div class="error-container">
      <h1 v-if="error.statusCode === 404">页面未找到</h1>
      <h1 v-else>应用出错</h1>
      
      <p>{{ error.message }}</p>
      
      <button @click="handleError">返回首页</button>
    </div>
  </template>

  <script setup>
    const props = defineProps({
      error: Object
    })

    const handleError = () => clearError({ redirect: '/' })
  </script>

  <style scoped>
    .error-container {
      text-align: center;
      padding: 2rem;
    }
  </style>
  ```
  ---
  **2. 详细错误展示**
  ```vue
  <template>
    <div>
      <h1>{{ errorTitle }}</h1>
      <pre v-if="isDev">{{ error.stack }}</pre>
      <p v-else>{{ userFriendlyMessage }}</p>
      
      <button @click="handleRetry">重试</button>
      <button @click="goHome">返回首页</button>
    </div>
  </template>

  <script setup>
    const { error } = defineProps(['error'])
    const isDev = process.dev

    const errorTitle = computed(() => {
      if (error.statusCode === 404) return '页面未找到'
      if (error.statusCode === 500) return '服务器错误'
      return '应用出错'
    })

    const userFriendlyMessage = computed(() => {
      if (error.statusCode === 404) return '您访问的页面不存在，请检查网址是否正确'
      return '服务器开小差了，请稍后再试'
    })

    const handleRetry = () => clearError()
    const goHome = () => clearError({ redirect: '/' })
  </script>
  ```
  ---
  **3. 自定义布局**
  ```vue
  <script setup>
    definePageMeta({
      layout: 'error-layout'
    })
  </script>

  <template>
    <div>
      <!-- 错误内容 -->
    </div>
  </template>
  ```
  ---
  **4. 错误类型处理**
  ```vue
  <template>
    <div>
      <template v-if="error.statusCode === 404">
        <NotFoundError :error="error" />
      </template>
      
      <template v-else-if="error.statusCode === 403">
        <ForbiddenError :error="error" />
      </template>
      
      <template v-else>
        <GenericError :error="error" />
      </template>
    </div>
  </template>

  <script setup>
    import NotFoundError from '@/components/errors/NotFound.vue'
    import ForbiddenError from '@/components/errors/Forbidden.vue'
    import GenericError from '@/components/errors/Generic.vue'

    const { error } = defineProps(['error'])
  </script>
  ```
  ---
:::
  
::: details 问题补充

  **1. 错误对象结构**

  错误对象包含以下关键属性：

  ```ts
  interface NuxtError {
    url: string           // 发生错误的URL
    statusCode: number    // HTTP状态码（404, 500等）
    statusMessage: string // HTTP状态消息
    message: string       // 错误描述
    description?: string  // 额外描述（可选）
    data?: any            // 附加数据（可选）
    stack?: string        // 错误堆栈（开发环境）
  }
  ```
  ---
  **2. 手动触发错误**

  在组件中手动触发错误：
  ```vue
  <script setup>
    throw createError({
      statusCode: 404,
      message: '页面不存在',
      fatal: true // 强制显示错误页面
    })
  </script>
  ```
  ---
  **3. 错误生命周期钩子**
  ```vue
  <script setup>
    const { error } = defineProps(['error'])

    onMounted(() => {
      // 错误发生时执行
      trackError(error)
      
      // 设置超时自动恢复
      if (error.statusCode === 500) {
        setTimeout(() => clearError(), 5000)
      }
    })
  </script>
  ```
  ---
  **4. 错误边界处理**

  在 `app.vue` 中添加错误边界：
  ```vue
  <template>
    <NuxtErrorBoundary @error="handleGlobalError">
      <NuxtPage />
      <template #error="{ error }">
        <ErrorPage :error="error" />
      </template>
    </NuxtErrorBoundary>
  </template>
  ```
  ---
  **5. 服务端错误处理**

  在服务端 API 中返回错误：
  ```ts
  // server/api/user/[id].ts
  export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const user = await fetchUser(id)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: '用户不存在'
      })
    }
    
    return user
  })
  ```
  ---
  **6. 最佳实践**

  1.**用户友好设计：**
  ```vue
  <template>
    <div class="error-page">
      <div v-if="error.statusCode === 404">
        <img src="~/assets/images/404-illustration.svg" alt="未找到页面">
        <h1>页面迷路了</h1>
        <p>您访问的页面不存在，试试以下操作：</p>
        <ul>
          <li>检查网址是否正确</li>
          <li>返回<a href="/">首页</a></li>
          <li>使用搜索功能查找内容</li>
        </ul>
      </div>
    </div>
  </template>
  ```

  2.**错误日志记录：**

  ```vue
  <script setup>
    const { error } = defineProps(['error'])

    onMounted(() => {
      // 记录客户端错误
      if (process.client) {
        logErrorToService(error)
      }
      
      // 发送错误到监控系统
      useTrackError(error)
    })
  </script>
  ```
  
  3.**多语言支持：**

  ```vue
  <script setup>
    const { t } = useI18n()
    const { error } = defineProps(['error'])

    const errorMessages = {
      404: t('errors.notFound'),
      500: t('errors.serverError'),
      default: t('errors.generic')
    }

    const errorMessage = computed(() => 
      errorMessages[error.statusCode] || errorMessages.default
    )
  </script>
  ```

  4.**重定向策略：**

  ```vue
  <script setup>
    const route = useRoute()
    const { error } = defineProps(['error'])

    const handleRecovery = () => {
      // 根据错误类型重定向
      if (error.statusCode === 401) {
        clearError({ redirect: '/login?returnUrl=' + route.fullPath })
      } else if (error.statusCode === 403) {
        clearError({ redirect: '/upgrade' })
      } else {
        clearError({ redirect: '/' })
      }
    }
  </script>
  ```

  5.**自定义元数据：**

  ```vue
  <script setup>
    const { error } = defineProps(['error'])

    // 设置错误页面的SEO元数据
    useHead({
      title: error.statusCode === 404 ? '页面未找到' : '应用出错',
      meta: [
        { name: 'robots', content: 'noindex' } // 阻止搜索引擎索引错误页
      ]
    })
  </script>
  ```
  ---
  **7. 常见错误**

  1.**缺少 clearError 调用：**

  ```vue
  <!-- 错误：点击按钮后应用仍处于错误状态 -->
  <button @click="$router.push('/')">返回首页</button> <!-- ❌ -->

  <!-- 正确：使用 clearError 清除错误状态 -->
  <button @click="clearError({ redirect: '/' })">返回首页</button> <!-- ✅ -->
  ```

  2.**敏感信息泄露：**

  ```vue
  <template>
    <!-- 错误：生产环境显示堆栈信息 -->
    <pre v-if="error.stack">{{ error.stack }}</pre> <!-- ❌ -->
    
    <!-- 正确：仅在开发环境显示 -->
    <pre v-if="isDev && error.stack">{{ error.stack }}</pre> <!-- ✅ -->
  </template>
  ```

  3.**无限重定向循环：**

  ```vue
  <script setup>
    // 错误：在错误页面中再次抛出错误
    if (error.statusCode === 404) {
      throw createError({ statusCode: 500 }) // ❌ 导致无限循环
    }
  </script>
  ```

  4.**忽略错误边界：**

  ```vue
  <!-- 错误：未处理组件内错误 -->
  <template>
    <ComponentThatMayThrow /> <!-- ❌ 可能导致白屏 -->
  </template>

  <!-- 正确：添加错误边界 -->
  <NuxtErrorBoundary>
    <ComponentThatMayThrow />
    <template #error="{ error }">
      <ErrorCard :error="error" />
    </template>
  </NuxtErrorBoundary> <!-- ✅ -->
  ```

  5.**未处理异步错误：**

  ```vue
  <script setup>
    // 错误：未捕获异步错误
    onMounted(async () => {
      const data = await fetchData() // ❌ 错误不会被全局捕获
    })

    // 正确：使用 try/catch
    onMounted(async () => {
      try {
        const data = await fetchData()
      } catch (err) {
        showError('加载失败') // ✅
      }
    })
  </script>
  ```
  ---
  **8. 高级技巧**

  1.**错误监控集成**
  ```vue
  <script setup>
    const { error } = defineProps(['error'])

    onMounted(() => {
      // 集成Sentry错误监控
      if (process.client && window.Sentry) {
        window.Sentry.captureException(error)
      }
      
      // 集成自定义监控
      useTrackError(error)
    })
  </script>
  ```

  2.**渐进式错误恢复**
  ```vue
  <template>
    <div>
      <h1>部分功能不可用</h1>
      <p>核心功能仍可继续使用：</p>
      
      <div v-if="!isCritical">
        <MainContent /> <!-- 显示降级内容 -->
      </div>
      
      <button @click="retryFailedComponent">重试加载</button>
    </div>
  </template>

  <script setup>
    const { error } = defineProps(['error'])
    const isCritical = computed(() => error.fatal || error.statusCode >= 500)

    function retryFailedComponent() {
      // 清除错误并重试
      clearError()
      // 重新加载失败组件
      reloadNuxtApp({
        path: route.path,
        persistState: true
      })
    }
  </script>
  ```

  3.**错误分析系统**
  ```vue
  <script setup>
    const route = useRoute()
    const { error } = defineProps(['error'])

    onMounted(() => {
      // 发送错误分析数据
      $fetch('/api/error-log', {
        method: 'POST',
        body: {
          url: route.fullPath,
          status: error.statusCode,
          message: error.message,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })
    })
  </script>
  ```

  4.**A/B测试错误页**
  ```vue
  <script setup>
    const error = ref(props.error)
    const errorVariant = ref('A')

    onMounted(() => {
      // 根据用户分组显示不同错误页
      const group = localStorage.getItem('ab-group') || 'A'
      errorVariant.value = group
      
      // 记录错误页展示
      logEvent(`error-page-view-${group}`)
    })
  </script>

  <template>
    <ErrorVariantA v-if="errorVariant === 'A'" :error="error" />
    <ErrorVariantB v-else :error="error" />
  </template>
  ```

  5.**服务端错误增强**
  ```ts
  // server/middleware/error-handler.ts
  export default defineEventHandler((event) => {
    try {
      // 正常处理请求
      return await handleEvent(event)
    } catch (err) {
      // 增强错误对象
      const enhancedError = createError({
        statusCode: err.statusCode || 500,
        message: err.message,
        data: {
          timestamp: new Date(),
          requestId: event.context.requestId,
          path: event.path
        }
      })
      
      // 记录服务端错误
      logServerError(enhancedError)
      
      throw enhancedError
    }
  })
  ```
  ---
:::
  