# 错误处理与调试

## 一、自定义错误页面（error.vue）

  1.**基础实现**
  ```bash
  |- layouts/
    |- error.vue  # 全局错误页面
  ```

  ```vue
  <!-- layouts/error.vue -->
  <template>
    <div class="error-container">
      <h1 v-if="error.statusCode === 404">页面不存在</h1>
      <h1 v-else>应用错误</h1>
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
  ```
  ---
  2.**高级功能**
  ```vue
  <script setup>
  import { useHead } from '#app'

  const props = defineProps({
    error: Object
  })

  // 动态设置错误页面的SEO
  useHead({
    title: () => `${props.error.statusCode}错误`,
    meta: [
      { name: 'robots', content: 'noindex' } // 防止搜索引擎索引错误页
    ]
  })

  // 记录错误到日志系统
  if (process.client) {
    logErrorToService(props.error)
  }
  </script>
  ```
  ---
  **注意事项：**

  - 错误页面必须放在 `layouts` 目录下
  - 通过 `clearError()` 清除错误状态
  - 404 错误会自动使用此布局
  - 避免在错误页面中触发新的错误

## 二、捕获运行时错误

  1.**Vue 组件错误捕获**
  ```vue
  <script setup>
  onErrorCaptured((err, instance, info) => {
    console.error('组件错误:', err, info)
    // 阻止错误继续向上传播
    return false
  })
  </script>
  ```
  ---
  2.**全局错误处理**
  ```ts
  // plugins/global-error.ts
  export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
      console.error('全局Vue错误:', err, info)
    }
    
    nuxtApp.hook('app:error', (err) => {
      console.error('应用级错误:', err)
    })
  })
  ```
  ---
  3.**服务器端错误处理**
  ```ts
  // server/middleware/error-handler.ts
  export default defineEventHandler((event) => {
    try {
      // 业务逻辑
    } catch (err) {
      console.error('服务器错误:', err)
      
      // 返回自定义错误响应
      throw createError({
        statusCode: 500,
        statusMessage: '服务器内部错误',
        data: { 
          timestamp: new Date().toISOString(),
          requestId: event.context.requestId
        }
      })
    }
  })
  ```
  ---
  4.**API 错误统一处理**
  ```ts
  // server/utils/error-response.ts
  export const sendErrorResponse = (event, error) => {
    const statusCode = error.statusCode || 500
    const message = error.statusMessage || 'Internal Server Error'
    
    setResponseStatus(event, statusCode)
    return {
      code: statusCode,
      message,
      data: error.data || null
    }
  }

  // 在API中使用
  export default defineEventHandler(async (event) => {
    try {
      // 业务逻辑
    } catch (err) {
      return sendErrorResponse(event, err)
    }
  })
  ```
## 三、调试技巧

  1.**内置开发工具**
  ```bash
  # 启动开发服务器
  npm run dev

  # 访问调试面板
  http://localhost:3000/__nuxt
  ```

  **功能包括：**

  - 组件树检查
  - 路由状态查看
  - 请求/响应追踪
  - Pinia 状态调试
  - 性能分析
  ---
  2.**VS Code 调试配置**
  ```json
  // .vscode/launch.json
  {
    "version": "0.2.0",
    "configurations": [
      {
        "type": "chrome",
        "request": "launch",
        "name": "Client: Chrome",
        "url": "http://localhost:3000",
        "webRoot": "${workspaceFolder}"
      },
      {
        "type": "node",
        "request": "launch",
        "name": "Server: Node",
        "runtimeExecutable": "npm",
        "runtimeArgs": ["run", "dev"],
        "port": 9229,
        "skipFiles": ["<node_internals>/**"]
      }
    ]
  }
  ```
  ---
  3.**调试模块推荐**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: [
      '@nuxt/devtools', // 官方调试工具
      'nuxt-bugsnag',   // 错误跟踪
      '@nuxtjs/sentry'  // 性能监控
    ],

    // 增强调试功能
    devtools: {
      enabled: true,
      vscode: {
        enabled: true,
        startOnBoot: true
      }
    }
  })
  ```
  ---
  4.**实用调试命令**
  ```bash
  # 查看Nuxt配置
  npx nuxi config

  # 分析构建产物大小
  npx nuxi analyze

  # 查看路由
  npx nuxi routes
  ```
## 四、类型检查（nuxi typecheck）

  1.**基本使用**
  ```bash
  # 运行类型检查
  npx nuxi typecheck

  # 监听模式
  npx nuxi typecheck --watch
  ```
  ---
  2.**配置选项**
  ```json
  // package.json
  {
    "scripts": {
      "typecheck": "nuxi typecheck --stric"
    }
  }
  ```

  **可用参数：**

  - `--watch`：实时监控
  - `--stric`：严格模式
  - `--fix`：自动修复简单错误
  - `--ignore`：忽略特定路径
  ---
  3.**常见类型问题解决**

  **问题1：第三方库类型缺失**

  ```bash
  npm install -D @types/package-name
  ```

  **问题2：动态导入类型**

  ```ts
  const module = await import('~/lib/utils') as typeof import('~/lib/utils')
  ```

  **问题3：全局类型扩展**

  ```ts
  // types/index.d.ts
  declare global {
    interface Window {
      customProperty: string
    }
  }
  ```
  ---
  4.**高级配置**
  ```ts
  // tsconfig.json
  {
    "extends": "./.nuxt/tsconfig.json",
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "types": ["@nuxt/types", "@pinia/nuxt"],
      "typeRoots": ["./types", "./node_modules/@types"]
    },
    "include": [
      "components/**/*",
      "layouts/**/*",
      "pages/**/*",
      "plugins/**/*",
      "types/**/*"
    ]
  }
  ```
## 五、生产环境错误监控

  1.**Sentry 集成**
  ```bash
  npm install @sentry/vue @sentry/node @nuxtjs/sentry
  ```

  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@nuxtjs/sentry'],
    
    sentry: {
      dsn: process.env.SENTRY_DSN,
      config: {
        environment: process.env.NODE_ENV,
        release: process.env.npm_package_version
      },
      clientConfig: {
        tracesSampleRate: 0.1
      },
      serverConfig: {
        tracesSampleRate: 0.5
      }
    }
  })
  ```
  ---
  2.**自定义错误上报**
  ```ts
  // plugins/error-monitoring.ts
  export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('app:error', (err) => {
      captureError(err)
    })
    
    const captureError = (error) => {
      if (process.env.NODE_ENV === 'production') {
        // 发送到监控服务
        fetch('/api/log-error', {
          method: 'POST',
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            url: window.location.href
          })
        })
      }
    }
  })
  ```
  ---
  3.**性能监控**
  ```ts
  // 跟踪API性能
  export default defineEventHandler(async (event) => {
    const start = Date.now()
    
    try {
      // 业务逻辑
      return data
    } finally {
      const duration = Date.now() - start
      trackPerformance(event.path, duration)
    }
  })
  ```
  ---
  4.**日志管理系统**
  ```ts
  // server/utils/logger.ts
  import pino from 'pino'

  export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    }
  })

  // 在中间件中使用
  export default defineEventHandler((event) => {
    logger.info({
      method: event.method,
      path: event.path,
      ip: event.headers.get('x-forwarded-for')
    })
  })
  ```
## 六、错误处理最佳实践

  1.**错误分类处理**
  |  **错误类型**  |  **处理方式**  |
  |  ---  |  ---  |
  |  用户输入错误  |  返回400状态，明确错误提示  |
  |  认证错误  |  返回401/403状态  |
  |  资源不存在  |  返回404状态  |
  |  服务器错误  |  返回500状态，记录日志  |
  |  第三方服务错误  |  重试机制+优雅降级  |
  ---
  2.**防御性编程技巧**

  **数据访问保护：**

  ```ts
  // 安全访问嵌套属性
  const userName = user?.profile?.name ?? '未知用户'

  // 使用可选链和空值合并
  ```

  **API请求保护：**

  ```ts
  const { data, error } = await useFetch('/api/data', {
    retry: 2,
    retryDelay: 1000,
    onError({ error }) {
      showToast('请求失败，请重试')
    }
  })
  ```

  **错误边界组件：**

  ```vue
  <ErrorBoundary>
    <UnstableComponent />
    <template #fallback>
      <div class="error-fallback">
        <p>组件加载失败</p>
        <button @click="reset">重试</button>
      </div>
    </template>
  </ErrorBoundary>
  ```
  ---
  3.**错误信息规范化**
  ```ts
  // 统一错误结构
  interface AppError {
    code: string    // 错误代码: AUTH_001
    message: string // 用户友好信息
    detail?: any    // 开发调试信息
    timestamp: string
  }
  ```
  ---
  4.**开发与生产差异处理**
  ```ts
  // 只在开发环境显示详细错误
  const errorMessage = process.dev 
    ? `${error.message}\n${error.stack}` 
    : '发生错误，请稍后重试'

  // 生产环境隐藏敏感信息
  if (process.env.NODE_ENV === 'production') {
    delete error.internalData
  }
  ```
## 总结

  Nuxt3 错误处理核心要点：

  1.**分层处理**：

  - 组件级：onErrorCaptured
  - 应用级：app:error 钩子
  - 全局级：自定义 error.vue
  --
  2.**环境区分**：

  - 开发环境：详细错误信息 + 热重载
  - 生产环境：友好提示 + 错误监控
  ---
  3.**类型安全**：

  - 定期运行 nuxi typecheck
  - 使用 TypeScript 严格模式
  - 扩展全局类型定义
  ---
  4.**监控体系**：

  - 前端：Sentry/Bugsnag
  - 后端：Pino/Winston 日志
  - 基础设施：Prometheus/Grafana
  ---
  5.**预防措施**：

  - 错误边界组件
  - 防御性编程
  - 单元测试覆盖
  ---
  关键注意事项：

  避免在生产环境暴露堆栈跟踪
  为异步操作添加超时控制
  重要操作实现重试机制
  定期审查错误监控系统
  为关键路径添加性能监控

