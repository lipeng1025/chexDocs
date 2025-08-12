# 插件与模块开发

## 一、插件开发详解

  1.**插件基础概念**

  - **作用**：扩展 Vue 应用实例功能
  - **执行时机**：在 Vue 应用初始化之前
  - **位置**：/plugins 目录
  - **特点**：
      - 自动注册（按文件名顺序）
      - 支持客户端/服务端特定插件
      - 可访问 Nuxt 运行时上下文
  ---
  2.**插件创建与注册**

  基本结构：
  ```ts
  // plugins/my-plugin.ts
  export default defineNuxtPlugin((nuxtApp) => {
    // 插件逻辑
    
    return {
      provide: {
        // 注入全局方法/属性
        hello: (name: string) => `Hello ${name}!`
      }
    }
  })
  ```

  注册方式：
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    plugins: [
      '~/plugins/my-plugin', // 自动注册
      { src: '~/plugins/client-only', mode: 'client' }, // 仅客户端
      { src: '~/plugins/server-only', mode: 'server' } // 仅服务端
    ]
  })
  ```
  ---
  3.**高级插件模式**

  异步插件：
  ```ts
  export default defineNuxtPlugin(async (nuxtApp) => {
    const data = await fetchData()
    
    nuxtApp.provide('asyncData', data)
  })
  ```
  
  Vue 插件集成：
  ```ts
  // plugins/vue-plugin.ts
  import { createPinia } from 'pinia'

  export default defineNuxtPlugin((nuxtApp) => {
    const pinia = createPinia()
    nuxtApp.vueApp.use(pinia)
  })
  ```
  ---
  4.**插件使用场景**

  全局工具函数：
  ```ts
  // plugins/utils.ts
  export default defineNuxtPlugin(() => {
    return {
      provide: {
        formatDate: (date: Date) => new Intl.DateTimeFormat().format(date)
      }
    }
  })

  // 组件中使用
  const { $formatDate } = useNuxtApp()
  $formatDate(new Date())
  ```

  自定义指令：
  ```ts
  // plugins/directives.ts
  export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('focus', {
      mounted(el) {
        el.focus()
      }
    })
  })
  ```
  ---
  5.**插件开发注意事项**

  **命名冲突**：使用前缀避免全局属性冲突

  ```ts
  provide: {
    $myApp_hello: () => 'Hello'
  }
  ```
  
  **环境判断：**

  ```ts
  if (process.client) {
    // 客户端专用逻辑
  }
  ```
  
  **执行顺序控制：**

  ```ts
  // nuxt.config.ts
  plugins: [
    { src: '~/plugins/init.ts', order: -10 } // 最先执行
  ]
  ```
  
  **类型安全：**

  ```ts
  // types/plugins.d.ts
  declare module '#app' {
    interface NuxtApp {
      $hello: (name: string) => string
    }
  }
  ```
## 二、模块开发详解

  1.**模块基础概念**

  - **作用**：扩展 Nuxt 框架核心功能
  - **执行时机**：在 Nuxt 初始化过程中
  - **位置**：独立 npm 包或项目本地模块
  - **特点**：
        - 可修改 Nuxt 配置
        - 可添加运行时模板
        - 可注册 hooks
        - 可集成其他工具
  ---
  2.**模块创建与注册**

  基本结构：
  ```ts
  // modules/my-module.ts
  import { defineNuxtModule } from '@nuxt/kit'

  export default defineNuxtModule({
    meta: {
      name: 'my-module',
      configKey: 'myModule'
    },
    defaults: { // 默认配置
      enabled: true
    },
    setup(options, nuxt) {
      if (!options.enabled) return
      
      // 模块逻辑
      nuxt.options.runtimeConfig.public.myModule = options
      
      // 添加插件
      nuxt.options.plugins.push('~/plugins/module-plugin')
    }
  })
  ```

  注册方式：
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: [
      '@nuxtjs/axios', // npm 模块
      '~/modules/my-module' // 本地模块
    ],
    
    myModule: { // 模块配置
      enabled: true,
      apiKey: process.env.MY_API_KEY
    }
  })
  ```
  ---
  3.**模块核心功能**
  
  添加运行时模板：
  ```ts
  setup(options, nuxt) {
    addTemplate({
      filename: 'my-module-runtime.js',
      getContents: () => `export const config = ${JSON.stringify(options)}`
    })
    
    nuxt.options.app.head.script.push({
      src: '/_nuxt/my-module-runtime.js'
    })
  }
  ```

  注册 hooks：
  ```ts
  setup(options, nuxt) {
    nuxt.hook('pages:extend', (pages) => {
      pages.push({
        name: 'custom-page',
        path: '/custom',
        file: resolve(__dirname, 'pages/custom.vue')
      })
    })
    
    nuxt.hook('app:resolve', (app) => {
      app.head.title = 'My Custom Title'
    })
  }
  ```

  修改构建配置：
  ```ts
  setup(options, nuxt) {
    nuxt.hook('vite:extendConfig', (config) => {
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = [
        ...(config.optimizeDeps.include || []),
        'my-heavy-library'
      ]
    })
  }
  ```
  4.**模块使用场景**

  集成第三方服务：
  ```ts
  // modules/analytics.ts
  export default defineNuxtModule({
    setup(options, nuxt) {
      nuxt.options.app.head.script.push({
        src: `https://analytics.example.com/tracker.js?id=${options.trackingId}`
      })
    }
  })
  ```

  自动注册组件：
  ```ts
  // modules/auto-components.ts
  export default defineNuxtModule({
    hooks: {
      'components:dirs'(dirs) {
        dirs.push({
          path: resolve(__dirname, 'components'),
          prefix: 'auto' // <AutoButton> 组件
        })
      }
    }
  })
  ```

  自定义 CLI 命令：
  ```ts
  // modules/cli-module.ts
  export default defineNuxtModule({
    setup(_, nuxt) {
      nuxt.hook('app:resolve', () => {
        nuxt.options.nitro.commands = nuxt.options.nitro.commands || {}
        nuxt.options.nitro.commands.custom = 'node ./custom-script.js'
      })
    }
  })
  ```
  5.**模块开发注意事项**

  **配置验证**：

  ```ts
  import Joi from 'joi'

  const schema = Joi.object({
    apiKey: Joi.string().required()
  })

  export default defineNuxtModule({
    setup(options) {
      const { error } = schema.validate(options)
      if (error) throw new Error('Invalid module options')
    }
  })
  ```
  
  **类型安全**：

  ```ts
  // 扩展 Nuxt 配置类型
  declare module '@nuxt/schema' {
    interface NuxtConfig {
      myModule?: {
        enabled?: boolean
        apiKey?: string
      }
    }
  }
  ```
  
  **性能优化**：

  ```ts
  // 延迟加载重型依赖
  setup: async (options) => {
    const heavyLib = await import('heavy-library')
    // 使用 heavyLib
  }
  ```
  
  **错误处理**：

  ```ts
  try {
    // 模块逻辑
  } catch (error) {
    console.error('Module initialization failed', error)
    throw createError({
      message: 'Module setup error',
      statusCode: 500
    })
  }
  ```
## 三、插件与模块对比
  |  **特性**  |  **插件 (Plugins)**  |  **模块 (Modules)**  |
  |  ---  |  ---  |  ---  |
  |  定位  |  Vue 应用级别扩展  |  Nuxt 框架级别扩展  |
  |  执行时机  |  应用初始化时  |  Nuxt 构建过程中  |
  |  主要功能  |  添加全局功能、集成 Vue 插件  |  修改配置、添加功能、集成工具  |
  |  作用域  |  运行时  |  构建时 + 运行时  |
  |  复杂度  |  相对简单  |  相对复杂  |
  |  复用性  |  项目内复用  |  跨项目复用 (npm)  |
  |  典型用例  |  全局组件、工具函数  |  集成第三方库、自动化配置  |
## 四、高级开发技巧

  1.**模块组合**
  ```ts
  // modules/complex-module.ts
  import ModuleA from './module-a'
  import ModuleB from './module-b'

  export default defineNuxtModule({
    async setup(options, nuxt) {
      await nuxt.requireModule(ModuleA)
      await nuxt.requireModule(ModuleB)
      
      // 组合模块逻辑
    }
  })
  ```
  ---
  2.**模块间通信**
  ```ts
  // modules/logger.ts
  export const useModuleLogger = () => {
    return {
      log: (msg: string) => console.log(`[MODULE] ${msg}`)
    }
  }

  // modules/analytics.ts
  import { useModuleLogger } from './logger'

  export default defineNuxtModule({
    setup() {
      const logger = useModuleLogger()
      logger.log('Analytics module initialized')
    }
  })
  ```
  ---
  3.**运行时插件注入**
  ```ts
  // modules/dynamic-plugins.ts
  export default defineNuxtModule({
    setup(_, nuxt) {
      nuxt.hook('app:resolve', (app) => {
        app.plugins.push({
          src: '~/plugins/dynamic-plugin',
          mode: 'client'
        })
      })
    }
  })
  ```
  ---
  4.**模块测试策略**
  ```ts
  // 使用 @nuxt/test-utils
  import { describe, test, expect } from 'vitest'
  import { setup } from '@nuxt/test-utils'

  describe('My Module', async () => {
    await setup({
      config: {
        modules: ['~/modules/my-module'],
        myModule: { enabled: true }
      }
    })

    test('should inject global helper', () => {
      const nuxtApp = useNuxtApp()
      expect(nuxtApp.$myHelper).toBeDefined()
    })
  })
  ```
## 五、发布与维护

  1.**模块发布流程**

  **创建 npm 包：**

  ```bash
  mkdir nuxt-my-module
  cd nuxt-my-module
  npm init -y
  ```
  
  **目录结构：**

  ```text
    ├── package.json
    ├── src
    │   ├── module.ts      # 模块主文件
    │   └── runtime        # 运行时文件
    ├── tsconfig.json
    └── .npmignore
  ```
  
  **package.json 配置：**

  ```json
  {
    "name": "nuxt-my-module",
    "version": "1.0.0",
    "type": "module",
    "main": "./src/module.ts",
    "types": "./src/module.ts",
    "dependencies": {
      "@nuxt/kit": "^3.0.0"
    },
    "peerDependencies": {
      "nuxt": "^3.0.0"
    },
    "keywords": ["nuxt", "module"]
  }
  ```
  
  **发布到 npm：**

  ```bash
  npm publish
  ```
  ---
  2.**版本管理策略**

  **语义化版本(SemVer)：** 
  - MAJOR：不兼容的 API 修改
  - MINOR：向下兼容的功能新增
  - PATCH：向下兼容的问题修复

  **支持矩阵：**

  ```json
  "engines": {
    "node": ">=16",
    "nuxt": "^3.0.0 || ^3.1.0"
  }
  ```
  ---
  3.**文档编写指南**

  **README.md 结构：**

  - 安装说明
  - 配置选项
  - 使用示例
  - 开发指南
  - 常见问题

  **类型文档：**

  ```ts
  /**
  * My Module Configuration
  * 
  * @property enabled - 是否启用模块
  * @property apiKey - API 密钥
  */
  interface ModuleOptions {
    enabled?: boolean
    apiKey?: string
  }
  ```
## 六、最佳实践总结

  插件开发最佳实践：

  - **单一职责**：每个插件只解决一个问题
  - **命名空间**：使用前缀避免全局冲突
  - **环境隔离**：明确区分客户端/服务端逻辑
  - **性能优先**：避免阻塞主线程的长任务
  - **类型安全**：为所有注入属性添加类型声明

  模块开发最佳实践：

  - **配置驱动**：提供合理的默认值和配置选项
  - **渐进增强**：支持模块部分功能启用
  - **依赖管理**：明确声明 peerDependencies
  - **错误处理**：提供清晰的错误信息和恢复方案
  - **测试覆盖**：编写单元测试和集成测试

  性能优化技巧：

  - **延迟加载**：对重型依赖使用动态导入

  ```ts
  const heavyLib = await import('heavy-library')
  ```

  - **条件初始化**：按需初始化功能

  ```ts
  if (options.enabled) {
    // 初始化逻辑
  }
  ```

  - **缓存机制**：避免重复计算

  ```ts
  let cachedResult: any = null

  return {
    provide: {
      getCachedData: () => {
        if (!cachedResult) {
          cachedResult = computeExpensiveValue()
        }
        return cachedResult
      }
    }
  }
  ```

  - **构建优化：**

  ```ts
  nuxt.options.build.transpile.push('my-module')
  ```
## 七、调试与排错

  调试工具：

  - **Nuxt DevTools**：可视化检查插件/模块
  - **VS Code 调试**：

  ```json
  // .vscode/launch.json
  {
    "type": "node",
    "request": "launch",
    "name": "Debug Module",
    "runtimeExecutable": "npx",
    "runtimeArgs": ["nuxt", "dev"],
    "skipFiles": ["<node_internals>/**"]
  }
  ```
  ---
  常见问题解决：

  **插件未执行：**

  - 检查文件名是否正确
  - 确认是否在 `nuxt.config.ts` 中显式注册
  - 查看控制台错误信息

  **注入属性未识别：**

  - 确保类型声明文件正确配置
  - 检查属性是否通过 `provide` 注入
  - 确认使用 `useNuxtApp()` 获取上下文

  **模块配置无效：**

  - 验证配置选项名称是否正确
  - 检查配置是否在正确的位置声明
  - 确认模块的 `configKey` 设置正确

  **服务端/客户端不一致：**

  - 使用 `process.client` 和 `process.server` 区分环境
  - 确保只在特定环境初始化功能
  - 避免在服务端使用浏览器 API

## 总结
  核心要点：

  - **插件用于应用级扩展**：添加全局功能，集成 Vue 插件
  - **模块用于框架级扩展**：修改配置，自动化任务，集成工具
  - **开发原则**：单一职责、类型安全、环境适配
  - **性能优先**：延迟加载、条件初始化、缓存机制
  - **生态兼容**：明确版本要求，提供清晰文档
  ---
  选择指南：
  |  **场景**  |  **解决方案**  |
  |  ---  |  ---  |
  |  添加全局工具函数  |  插件  |
  |  注册 Vue 指令/组件  |  插件  |
  |  集成第三方 Vue 库  |  插件  |
  |  修改 Nuxt 配置  |  模块  |
  |  自动化重复任务  |  模块  |
  |  创建可复用功能包  |  模块  |
  |  集成复杂服务  |  模块 + 插件组合  |

