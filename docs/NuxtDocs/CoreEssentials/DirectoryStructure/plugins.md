# plugins
::: details 理论阐述
  
  **1. 什么是 plugins 目录？**
  > - `plugins` 目录用于存放Nuxt应用初始化时自动加载的插件。这些插件在 Vue 应用实例创建前执行，用于扩展 Nuxt 功能、集成第三方库或添加全局逻辑。
  ---
  **2. 有什么用？**
  > - **全局功能注入**：添加 Vue 指令、组件、混入等
  > - **第三方库集成**：初始化外部库（如 Sentry、GTM）
  > - **API客户端配置**：设置全局 API 调用实例
  > - **上下文扩展**：向 Nuxt 运行时上下文添加方法
  > - **环境设置**：配置运行时环境变量
  ---
  **3. 常见存放内容**
  > - **Vue 插件（如 vue-toastification、element-plus ui）**
  > - **工具库初始化（如 Axios、Apollo）**
  > - **全局指令/过滤器**
  > - **自定义上下文扩展**
  > - **客户端/服务端特定逻辑**
  > - **错误监控初始化**
  ---
  **4. 目录结构建议**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  plugins/
    ├── apollo.client.ts        # 仅客户端插件
    ├── directives.server.ts    # 仅服务端插件
    ├── i18n.ts                 # 国际化插件
    ├── sentry.ts               # 错误监控
    ├── vue-toastification.ts   # UI插件
    └── global-components.ts    # 全局组件注册
  ```
  ---
  **5. 需要引入才能使用吗？**
  > - **不需要**。Nuxt 会自动加载 plugins 目录下的所有文件（按文件名顺序）  
  但需注意：
  > - 1: 文件名决定加载顺序（按字母排序）
  > - 2: 插件文件名可包含 `.client` 或 `.server` 后缀指定运行环境
  ---
  **6.  与 middleware 目录的区别：**

  |  **特性**  |  **plugins**  |  **middleware**  |
  |  ---  |  ---  |  ---  |
  |  执行时机  |  应用初始化时  |  路由导航前  |
  |  执行次数  |  仅一次（或热更新时）  |  每次路由变化  |
  |  访问对象  |  NuxtApp 实例、Vue 应用  |  路由上下文 (to, from)  |
  |  主要用途  |  全局功能注入、库初始化  |  路由控制、权限验证  |
  |  环境限定  |  支持 client/server 限定  |  自动在对应环境执行  |
  ---
  **7. 配置相关：**

  在 <mark>nuxt.config.ts</mark> 中可配置插件行为：
  ```ts
  export default defineNuxtConfig({
    plugins: [
      '~/plugins/my-plugin.ts', // 手动指定顺序
      { src: '~/plugins/analytics.client.ts', mode: 'client' } // 显式指定环境
    ]
  })
  ```
  ---
:::
  
::: details 代码示例
  
  **1. 基础插件结构**

  **`plugins/my-plugin.ts`：**

  ```ts
  export default defineNuxtPlugin((nuxtApp) => {
    // 访问 Vue 应用
    const vueApp = nuxtApp.vueApp
    
    // 添加全局方法
    nuxtApp.provide('hello', (name: string) => `Hello ${name}!`)
    
    // 添加 Vue 全局属性
    vueApp.config.globalProperties.$formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('zh-CN').format(date)
    }
  })
  ```
  ---
  **2. 客户端专用插件**

  **``plugins/analytics.client.ts``：**

  ```ts
  export default defineNuxtPlugin(() => {
    // 仅在客户端执行
    if (process.client) {
      // 初始化 Google Analytics
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      gtag('js', new Date())
      gtag('config', 'GA_MEASUREMENT_ID')
    }
  })
  ```
  ---
  **3. 服务端专用插件**

  **``plugins/directives.server.ts``：**

  ```ts
  export default defineNuxtPlugin((nuxtApp) => {
    // 仅在服务端执行
    if (process.server) {
      nuxtApp.vueApp.directive('ssr-only', {
        mounted() {
          // 服务端特定逻辑
        }
      })
    }
  })
  ```
  ---
  **4. 集成第三方库**

  **``plugins/vue-toastification.ts``：**

  ```ts
  import Toast from 'vue-toastification'
  import 'vue-toastification/dist/index.css'

  export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Toast, {
      timeout: 3000,
      position: 'top-right'
    })
  })
  ```
  ---
  **5. 全局组件注册**

  **``plugins/global-components.ts``：**

  ```ts
  import CustomButton from '~/components/ui/CustomButton.vue'

  export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('CustomButton', CustomButton)
  })
  ```
  ---
  **6. API 客户端初始化**

  **``plugins/api.ts``：**

  ```ts
  export default defineNuxtPlugin(() => {
    const { $config } = useNuxtApp()
    
    // 创建全局 API 实例
    const api = $fetch.create({
      baseURL: $config.public.apiBase,
      headers: { Authorization: `Bearer ${useCookie('token').value}` },
      onResponseError({ response }) {
        if (response.status === 401) {
          navigateTo('/login')
        }
      }
    })
    
    // 注入全局使用
    return { provide: { api } }
  })
  ```
  ---
:::
  
::: details 问题补充
  
  **1. 插件执行顺序**
  
  > - Nuxt 内部插件（如 vue、router 等）
  > - 用户插件（按文件名排序）：

  ```text
  plugins/
    ├── 1.init.ts       # 1 | a
    ├── 2.analytics.ts  # 2 | b
    └── 3.ui.ts         # 3 | c
  ```
  ---
  **2. 环境限定策略**

  > - `*.client.ts` → 仅客户端
  > - `*.server.ts` → 仅服务端
  > - `*.ts` → 客户端和服务端
  > - 手动指定：

  ```ts
  export default defineNuxtPlugin({
    name: 'my-plugin',
    enforce: 'pre', // 或 'post'
    setup(nuxtApp) { /* ... */ }
  })
  ```
  ---
  **3. 插件间依赖**
  ```ts
  // plugins/2.dependent-plugin.ts
  export default defineNuxtPlugin((nuxtApp) => {
    // 确保依赖插件已加载
    if (!nuxtApp.$hello) {
      throw new Error('依赖插件未加载!')
    }
    
    // 使用其他插件提供的方法
    console.log(nuxtApp.$hello('World'))
  })
  ```
  ---
  **4. 类型安全扩展**

  **创建 `types/plugins.d.ts`：**

  ```ts
  declare module '#app' {
    interface NuxtApp {
      $hello: (name: string) => string
      $api: typeof import('~/plugins/api')['default']
    }
  }

  declare module 'vue' {
    interface ComponentCustomProperties {
      $formatDate: (date: Date) => string
    }
  }

  export {}
  ```
  ---
  **5. 性能优化**
  ```ts
  // 延迟加载重型插件
  export default defineNuxtPlugin({
    name: 'heavy-plugin',
    parallel: true, // 并行加载
    async setup(nuxtApp) {
      if (process.client) {
        const module = await import('heavy-library')
        nuxtApp.vueApp.use(module.default)
      }
    }
  })
  ```
  ---
  **6. 最佳实践**

  1.**命名规范：**

  > - 核心插件：`core-*.ts`
  > - 第三方集成：`[lib-name].ts`
  > - 环境限定：`[name].client/server.ts`
  
  2.**安全实践：**
  ```ts
  // 避免暴露敏感信息
  if (process.server) {
    // 服务器端密钥
    const secret = useRuntimeConfig().privateKey
  }
  ```
  
  3.**错误处理：**

  ```ts
  export default defineNuxtPlugin(() => {
    try {
      // 插件逻辑
    } catch (error) {
      console.error('[Plugin Error]', error)
      // 上报错误
      useTrackError(error)
    }
  })
  ```
  
  4.**组合式函数集成：**

  ```ts
  // 复用组合式逻辑
  export default defineNuxtPlugin(() => {
    const { $analytics } = useNuxtApp()
    useTrackPageView().init($analytics)
  })
  ```
  
  5.**插件模块化：**

  ```ts
  // 创建可配置插件
  export const createAnalyticsPlugin = (options) => {
    return defineNuxtPlugin(() => {
      // 使用options配置
    })
  }
  ```
  ---
  **7. 常见错误**

  1.**顺序依赖问题：**

  ```ts
  // 错误：依赖插件未加载
  nuxtApp.vueApp.use(requirePlugin()) // ❌ 应确保文件名顺序
  ```
  
  2.**环境判断错误：**

  ```ts
  // 错误：在服务端访问 window
  if (window.innerWidth > 768) // ❌
  ```
  
  3.**重复初始化：**

  ```ts
  // 错误：多次注册相同组件
  nuxtApp.vueApp.component('Button', Button) // ❌ 应检查是否已注册
  ```

  4.**类型未扩展：**

  ```ts
  // 错误：TS类型检查失败
  const message = nuxtApp.$hello('World') // ❌ 缺少类型声明
  ```
  
  5.**未处理异步：**

  ```ts
  // 错误：未等待异步操作
  fetchConfig() // ❌ 可能未完成初始化
  ```
  ---
  **8. 高级技巧**

  1.**插件钩子使用**
  ```ts
  export default defineNuxtPlugin((nuxtApp) => {
    // 应用创建前钩子
    nuxtApp.hook('app:beforeCreate', (vueApp) => {
      // 添加全局混入
      vueApp.mixin({
        created() {
          console.log('Component created')
        }
      })
    })
    
    // 页面过渡开始钩子
    nuxtApp.hook('page:start', () => {
      useLoading().start()
    })
  })
  ```
  
  2.**运行时配置集成**
  ```ts
  export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig()
    
    // 根据环境配置
    const baseURL = runtimeConfig.public.apiBase
    const debugMode = runtimeConfig.public.debug
  })
  ```
  
  3.**状态管理集成**
  ```ts
  export default defineNuxtPlugin((nuxtApp) => {
    const store = useUserStore()
    
    // 持久化状态
    if (process.client) {
      const savedState = localStorage.getItem('user-store')
      if (savedState) store.$state = JSON.parse(savedState)
      
      store.$subscribe((_, state) => {
        localStorage.setItem('user-store', JSON.stringify(state))
      })
    }
  })
  ```
  
  4.**自定义上下文方法**
  ```ts
  export default defineNuxtPlugin(() => {
    return {
      provide: {
        // 自定义格式化方法
        formatCurrency: (value: number) => {
          return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY'
          }).format(value)
        }
      }
    }
  })
  ```

  5.**插件热更新**
  ```ts
  export default defineNuxtPlugin(() => {
    // 仅开发环境生效的热更新
    if (process.dev) {
      watch(() => useSomeStore().state, (newVal) => {
        console.log('状态变化', newVal)
      })
    }
  })
  ```
  ---
:::
  