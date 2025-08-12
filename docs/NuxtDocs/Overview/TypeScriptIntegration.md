# TypeScript 深度集成

## 一、TypeScript 集成概述

  Nuxt3 的 TypeScript 支持特性：

  - **开箱即用**：无需额外配置即可开始使用
  - **自动类型生成**：.nuxt 目录下自动生成类型声明
  - **零配置类型检查**：nuxi typecheck 命令内置支持
  - **完整框架类型**：Nuxt/Vue/Pinia 等完整类型定义

  ```bash
  # 创建TypeScript项目
  npx nuxi init my-app --template typescript
  ```
## 二、核心配置

  1.**tsconfig.json 配置**
  ```json
  {
    "extends": "./.nuxt/tsconfig.json",
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "moduleResolution": "node",
      "types": ["@types/node", "@nuxt/types"],
      "paths": {
        "~/*": ["./*"],
        "@/*": ["./*"]
      }
    },
    "include": [
      "components/**/*",
      "layouts/**/*",
      "pages/**/*",
      "plugins/**/*",
      "nuxt.config.ts",
      "app.vue"
    ],
    "exclude": ["node_modules"]
  }
  ```
  ---
  2.**Nuxt 配置**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    typescript: {
      strict: true, // 启用严格模式
      typeCheck: true, // 开发时进行类型检查
      shim: false // 不使用Vue2兼容的shim
    },
    modules: ['@pinia/nuxt']
  })
  ```
## 三、组件中的 TypeScript

  1. **组件 Props 类型**
  ```vue
  <script setup lang="ts">
  interface Props {
    id: number
    title: string
    description?: string
    items: string[]
  }

  const props = defineProps<Props>()
  </script>
  ```
  ---
  2.**组件 Emits 类型**
  ```vue
  <script setup lang="ts">
  const emit = defineEmits<{
    (e: 'update', value: number): void
    (e: 'delete', id: number): void
  }>()
  </script>
  ```
  3.**组件 Refs 类型**
  ```vue
  <script setup lang="ts">
  import { ref } from 'vue'

  interface User {
    id: number
    name: string
  }

  const user = ref<User | null>(null)
  const inputRef = ref<HTMLInputElement | null>(null)
  </script>
  ```
## 四、路由类型安全

  1.**路由参数类型**
  ```vue
  <!-- pages/user/[id].vue -->
  <script setup lang="ts">
  const route = useRoute()

  // 自动推断为 string | string[]
  const id = route.params.id

  // 精确类型
  const userId = computed(() => {
    const id = route.params.id
    return Array.isArray(id) ? parseInt(id[0]) : parseInt(id)
  })
  </script>
  ```
  2.**路由验证**
  ```vue
  <script setup lang="ts">
  definePageMeta({
    validate: ({ params }) => {
      // 验证参数必须是数字
      return /^\d+$/.test(params.id as string)
    }
  })
  </script>
  ```
## 五、API 路由类型

  1.**类型安全 API 处理**
  ```ts
  // server/api/user/[id].get.ts
  import { defineEventHandler } from 'h3'

  interface User {
    id: number
    name: string
    email: string
  }

  export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id as string)
    
    // 模拟数据库查询
    const user: User | undefined = await fetchUser(id)
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    return user
  })
  ```
  ---
  2.**客户端请求类型**
  ```ts
  // 使用泛型指定响应类型
  const { data: user } = await useFetch<User>('/api/user/123', {
    method: 'GET'
  })

  // POST请求带类型体
  const { data: result } = await useFetch<{ success: boolean }>('/api/submit', {
    method: 'POST',
    body: {
      name: 'John',
      age: 30
    }
  })
  ```
## 六、状态管理 (Pinia) 类型

  1. **定义类型化 Store**
  ```ts
  // stores/counter.ts
  import { defineStore } from 'pinia'

  interface CounterState {
    count: number
    lastUpdated: Date | null
  }

  export const useCounterStore = defineStore('counter', {
    state: (): CounterState => ({
      count: 0,
      lastUpdated: null
    }),
    actions: {
      increment() {
        this.count++
        this.lastUpdated = new Date()
      },
      async fetchCount() {
        const { data } = await useFetch<number>('/api/count')
        if (data.value) {
          this.count = data.value
        }
      }
    },
    getters: {
      doubleCount: (state) => state.count * 2
    }
  })
  ```
  2.**在组件中使用**
  ```vue
  <script setup lang="ts">
  import { useCounterStore } from '@/stores/counter'

  const counter = useCounterStore()
  const doubleValue = computed(() => counter.doubleCount)
  </script>
  ```
## 七、自动生成的类型

  1.**自动类型文件**

  Nuxt 自动生成的类型位于 `.nuxt/nuxt.d.ts`，包含：

  - 组件自动导入类型
  - 组合函数自动导入类型
  - 路由类型定义
  - 运行时配置类型
  ---
  2.**自定义类型扩展**
  ```ts
  // types/index.d.ts
  declare global {
    // 扩展 NuxtApp 接口
    interface NuxtApp {
      $myPlugin: (msg: string) => void
    }
    
    // 扩展运行时配置
    interface RuntimeConfig {
      public: {
        apiBase: string
      }
      secretKey: string
    }
    
    // 扩展页面元数据
    interface PageMeta {
      requiresAuth?: boolean
      layout?: 'default' | 'admin'
    }
  }

  // 确保文件作为模块处理
  export {}
  ```
## 八、高级类型技巧

  1.**类型守卫**
  ```ts
  function isUser(user: any): user is User {
    return user && typeof user.id === 'number' && typeof user.name === 'string'
  }

  const data = await $fetch('/api/data')
  if (isUser(data)) {
    // 此处 data 被推断为 User 类型
  }
  ```
  ---
  2.**条件类型**
  ```ts
  type ApiResponse<T> = 
    | { status: 'success'; data: T }
    | { status: 'error'; message: string }

  async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const data = await $fetch<T>(url)
      return { status: 'success', data }
    } catch (error: any) {
      return { status: 'error', message: error.message }
    }
  }
  ```
  ---
  3.**实用工具类型**
  ```ts
  // 从 API 端点提取类型
  type UserEndpoint = Awaited<ReturnType<typeof getUser>>

  // 从组件 props 提取类型
  type PropsType<T> = T extends new () => { $props: infer P } ? P : never
  type MyComponentProps = PropsType<typeof MyComponent>
  ```
## 九、类型检查与构建

  1.**类型检查命令**
  ```bash
  # 运行类型检查
  npx nuxi typecheck

  # 监听模式
  npx nuxi typecheck --watch

  # 严格模式
  npx nuxi typecheck --strict
  ```
  ---
  2.**构建配置**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    typescript: {
      // 构建时进行类型检查
      typeCheck: 'build',
      
      // 生成TS声明文件
      tsConfig: {
        generate: true,
        outputDir: 'dist/types'
      }
    }
  })
  ```
## 十、常见问题解决方案

  1.**第三方库缺少类型声明**
  ```bash
  # 安装社区类型声明
  npm install -D @types/library-name

  # 或创建自定义声明
  // types/shims.d.ts
  declare module 'library-name' {
    export function someFunction(): void
    // ...
  }
  ```
  ---
  2.**自动导入的类型问题**
  ```ts
  // 显式导入解决类型问题
  import { useHead } from '#app'

  // 或声明全局类型
  declare global {
    const useHead: typeof import('#app')['useHead']
  }
  ```
  ---
  3.**异步组件类型**
  ```vue
  <script setup lang="ts">
  import { defineAsyncComponent } from 'vue'

  const AsyncComponent = defineAsyncComponent(() => 
    import('@/components/HeavyComponent.vue')
  )
  </script>
  ```
## 十一、最佳实践

  1.**类型安全策略**
  |  **场景**  |  **推荐方案**  |
  |  ---  |  ---  |
  |  组件 Props  |  `defineProps<Type>()`  |
  |  组件 Emits  |  `defineEmits<Type>()`  |
  |  API 响应  |  泛型 `useFetch<T>()`  |
  |  Pinia Store  |  显式定义 State/Getter 类型  |
  |  事件处理  |  类型化事件处理器  |
  ---
  2.**性能优化**

  - 避免过度使用 `any` 类型
  - 使用 `import type` 减少运行时开销

  ```ts
  import type { User } from '@/types'
  ```
  ---
  3.**项目结构建议**
  ```text
  src/
    ├── types/               # 全局类型声明
    │   ├── index.d.ts
    │   ├── custom.d.ts
    │   └── shims.d.ts
    ├── interfaces/          # 业务接口定义
    │   ├── user.interface.ts
    │   └── product.interface.ts
    ├── utils/               # 类型工具函数
    │   └── type-guards.ts
  ```
  ---
  4.**代码质量工具**
  ```bash
  # 安装ESLint TypeScript支持
  npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

  # .eslintrc 配置
  {
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:nuxt/recommended"
    ]
  }
  ```
## 十二、调试技巧

  1.**类型探索技巧**
  ```ts
  // 获取变量的类型
  type DebugType<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

  // 使用示例
  const user = { id: 1, name: 'John' }
  type UserType = DebugType<typeof user>
  /* 
    显示为:
    {
      id: number;
      name: string;
    }
  */
  ```
  ---
  2.**IDE 集成**

  **VSCode 插件：**

  - Vue Language Features (Volar)
  - TypeScript Vue Plugin (Volar)
  - ESLint
  - Prettier

  **WebStorm 配置：**

  - 启用 TypeScript 语言服务
  - 配置 Vue 支持
  - 设置 Nuxt 识别
## 总结：TypeScript 集成要点

  核心优势

  - **增强代码健壮性**：编译时错误检测
  - **提升开发体验**：智能代码补全和导航
  - **完善文档作用**：类型作为代码文档
  - **重构安全性**：安全的重构能力
  ---
  关键注意事项

  - **避免 any 类型**：尽量使用精确类型
  - **定期运行类型检查**：纳入开发工作流
  - **合理使用类型断言**：仅在必要时使用 as
  - **保持类型更新**：随业务逻辑变化更新类型
  - **利用自动生成类型**：不要手动修改 .nuxt 下的类型文件
  ---
  迁移建议

  - 从 JavaScript 文件重命名为 .ts
  - 修复基本类型错误
  - 逐步添加复杂类型
  - 启用严格模式 (strict: true)
  - 集成到 CI/CD 流程
  ---
  通过深度集成 TypeScript，Nuxt3 应用可以获得：

  - 减少 30-50% 的运行时错误
  - 提升 20-40% 的开发效率
  - 增强代码可维护性和团队协作
  - 更好的重构能力和长期可扩展性
