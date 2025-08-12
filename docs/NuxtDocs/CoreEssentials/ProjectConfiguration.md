# 项目配置

## 1. 项目配置 (Project Configuration)

  **核心：用 `nuxt.config.ts` 控制项目行为**

  **常用配置项详解**
  ``` ts
  // nuxt.config.ts  
  export default defineNuxtConfig({
    // 模块：扩展功能  
    modules: [
      '@nuxtjs/tailwindcss', // CSS框架  
      '@pinia/nuxt',        // 状态管理  
    ],  

    // 自动导入：免手动import  
    imports: {
      dirs: ['composables/**'] // 自动导入composables目录  
    },  

    // 组件：自动注册  
    components: {
      global: true, // 全局自动注册组件  
      dirs: ['~/components'] // 组件目录  
    },  

    // 运行时配置：环境变量  
    runtimeConfig: {
      public: { // 客户端可访问  
        apiBase: '/api'   
      },  
      stripeSecret: '' // 仅服务端  
    }
  })  
  ```
  ---
  **环境变量管理**
  |  **方式**  |  **位置**  |  **访问方式**  |  **特点**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `.env`  |  项目根目录  |  `process.env.KEY`  |  原始环境变量  |
  |  `runtimeConfig`  |  `nuxt.config.ts`  |  `useRuntimeConfig()`  |  类型安全、区分客户端服务端  |
  ---
  **.env 示例**
  ```env
  # .env  
  PUBLIC_API_BASE=https://api.example.com  
  STRIPE_SECRET=sk_test_123  
  ```
  
  **runtimeConfig 使用**
  ```ts
  // 服务端API (server/api/test.ts)  
  export default defineEventHandler(() => {
    const config = useRuntimeConfig()  
    console.log(config.stripeSecret) // 可访问  
  })  

  // 客户端组件  
  <script setup>  
  const { public: { apiBase } } = useRuntimeConfig()  
  console.log(apiBase) // 客户端安全访问  
  </script>  
  ```
  ---
  **配置生效范围**
  |  **配置类型**  |  **构建时**  |  **服务端**  |  **客户端**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |  ---  |
  |  `modules`  |  ✅  |  ✅  |  ❌  |  `@nuxt/image`  |
  |  `runtimeConfig.public`  |  ❌  |  ✅  |  ✅  |  `apiBase`  |
  |  `runtimeConfig.private`  |  ❌  |  ✅  |  ❌  |  `stripeSecret`  |
  |  `imports`  |  ✅  |  ✅  |  ✅  |  自动导入组合函数  |

  **原理说明：**

  - 构建时：`npm run build` 阶段生效，影响最终产物
  - 服务端：Node.js 环境执行，可访问敏感数据
  - 客户端：浏览器环境，只能访问 `public` 数据
  ---
  **最佳实践与常见问题**

  ✅ **最佳实践**：

  - 敏感数据放 `runtimeConfig`，**绝不放** `.env` 提交到 Git
  - 大型项目拆分配置：

  ```typescript
  // nuxt.config.ts  
  import seoConfig from './config/seo'  
  import analyticsConfig from './config/analytics'  

  export default defineNuxtConfig({
    ...seoConfig,  
    ...analyticsConfig  
  })  
  ```

  ⚠️ **常见问题**：

  **环境变量不生效**：

  - 重启服务：`npm run dev --force`
  - 确认变量前缀：`PUBLIC_` 客户端可见

  **配置合并冲突**：

  - 模块顺序影响行为，按官方推荐顺序排列

## 2. 目录结构与自动导入

  **核心：约定优于配置，减少样板代码**

  **约定式目录详解**
  ```bash
    ├── components/    # 组件 [自动导入]
    ├── composables/   # 组合函数 [自动导入]
    ├── layouts/       # 布局  
    ├── pages/         # 路由 [自动生成]
    ├── plugins/       # 插件 [自动注册]
    ├── public/        # 静态资源  
    ├── server/        # API路由  
    ├── utils/         # 工具函数 [手动导入]
  ```
  ---
  **自动导入机制原理**

  **Nuxt 自动扫描以下目录**：

  - `components/*` → 全局组件
  - `composables/*` → `useXxx()` 函数
  - `utils/*` → 工具函数（需配置）
  ---
  **控制自动导入**

  **禁用全局组件**：
  ```ts
  // nuxt.config.ts  
  components: [
    { path: '~/components', global: false } // 需手动导入  
  ]
  ```
  
  **显式导入组件**：
  ```vue
  <script setup>  
    import Button from '~/components/Button.vue'  
  </script>  
  ```

  **自定义自动导入**

  ``` ts
  // nuxt.config.ts
  imports: {
    // 添加新目录
    dirs: ['composables/**', 'utils'],

    // 从指定库导入
    presets: [
      {
        from: 'vue-i18n',
        imports: ['useI18n']
      }
    ]
  }
  ```

  **目录别名配置**

  |  别名  |  指向  |  示例  |
  |  ---  |  ---  |  ---  |
  |  `~`  |  项目根目录  |  `import X from '~/utils'`  |
  |  `@`  |  同 `~`  |  `import Y from '@/components'`  |
  |  `~~`  |  绝对路径  |  `~~/node_modules/package`  |
  |  `@@`  |  绝对路径  |  同 `~~`  |

  **自定义别名**：
  ```ts
  // nuxt.config.ts  
  alias: {
    '@styles': './assets/scss', // 使用：@styles/variables  
  }
  ```
  ---
  **注意事项与常见陷阱**

  ✅ **正确做法**：

  ```vue
  <!-- components/Button.vue -->  
  <template>  
    <button class="btn">  
      <!-- 直接使用无需导入 -->  
      <IconSearch /> <!-- 来自components/IconSearch.vue -->  
    </button>  
  </template>  
  ```

  ⚠️ **常见错误**：

  1.**循环依赖**：

  ```bash
  # 错误：composableA 引入 composableB，  
  #       composableB 又引入 composableA  
  [循环依赖] Cannot access 'useA' before initialization
  ```

  2.**命名冲突**：

  ```bash
  # 错误：两个组件同名  
  [冲突] Component "Button" conflicts with existing component  
  ```

  **解决方案**：

  ```ts
  components: {
    dirs: [
      { path: '~/components/base', prefix: 'Base' } // <BaseButton>  
    ]
  }
  ```

  3.**服务端客户端混合**：

  ```ts
  // 错误：在 utils 中使用 window  
  export function getWidth() {
    return window.innerWidth // ❌ 服务端报错  
  }
  ```

  **解决方案**：

  ```ts
  // 仅在客户端使用  
  if (process.client) {
    console.log(window.innerWidth)  
  }
  ```

## 3. 服务端 vs 客户端原理

  - **服务端 (Server-Side)**：在服务器上生成 HTML 页面（厨房做菜）
  - **客户端 (Client-Side)**：在浏览器中运行 JavaScript 交互（顾客吃菜）
  - **Nuxt3 特殊能力**：既能服务端渲染（SSR），也能静态生成（SSG），还能客户端渲染（CSR）
  ---
  **核心差异表**：

  |  **特性**  |  **服务端**  |  **客户端**  |
  |  ---  |  ---  |  ---  |
  |  运行环境  |  Node.js 服务器  |  用户浏览器  |
  |  访问权限  |  数据库/API 密钥  |  Cookie/localStorage  |
  |  生命周期钩子  |  `onServerPrefetch()`  |  `onMounted()`  |
  |  DOM 操作  |  ❌ 不可用  |  ✅ 可用  |
  |  首次加载速度  |  ✅ 更快（直接给 HTML）  |  ❌ 较慢（需下载 JS）  |

  代码示例：
  ```vue
  <script setup>
    // 服务端数据获取（SEO友好）
    const { data } = await useAsyncData('goods', () => $fetch('/api/goods'))

    // 客户端操作（页面加载后执行）
    onMounted(() => {
      console.log('窗口宽度：', window.innerWidth)
    })
  </script>

  <template>
    <div>{{ data }}</div>
  </template>
  ```

  执行流程：
  - 用户请求页面 → Nuxt 服务器生成 HTML
  - 浏览器收到 HTML 立即显示
  - 后台下载 JavaScript → 激活页面交互（hydration）

  ---
## 4. `modules` vs `plugins` 配置区别

  对比表：
  |  **特性**  |  **modules**  |  **plugins**  |
  |  ---  |  ---  |  ---  |
  |  主要用途  |  集成 Nuxt 生态系统扩展  |  注入自定义逻辑  |
  |  安装方式  |  npm 包  |  本地文件  |
  |  执行时机  |  Nuxt 初始化阶段  |  Vue 应用实例化时  |
  |  典型用例  |  认证模块、UI 库集成  |  全局组件/指令  |
  |  服务端运行  |  ✅ 默认支持  |  需手动指定 `.server`  |

  安装示例：ElementPlus

  **方式1：使用 modules（推荐）**
  ```bash
  npm install @element-plus/nuxt
  ```

  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@element-plus/nuxt']
  })
  ```

  **方式2：使用 plugins**
  ```ts
  // plugins/element.client.ts
  import ElementPlus from 'element-plus'
  import 'element-plus/dist/index.css'

  export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.use(ElementPlus)
  })
  ```


## 5.什么都不配置会怎样？

  ✅ **必须手动引入组件**：
  ```vue
  <script setup>
    // 每个组件都要单独引入
    import { ElButton } from 'element-plus'
  </script>

  <template>
    <ElButton>点我</ElButton>
  </template>
  ```

## 6.最佳实践建议

  1.**优先使用 modules** - 官方维护的模块会自动处理：

  - 按需导入（自动 tree-shaking）
  - SSR 兼容性
  - 主题配置集成

  2.**plugins 适用场景**：

  - 需要客户端特定逻辑（如 `element.client.ts`）
  - 自定义全局指令

  ```ts
  // plugins/directive.ts
  export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.directive('focus', {
      mounted(el) {
        el.focus()
      }
    })
  })
  ```





