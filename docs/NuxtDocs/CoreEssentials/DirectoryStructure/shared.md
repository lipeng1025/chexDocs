# shared
::: details 理论阐述

  **🧠 核心概念**

  > - `shared/` 是存放**客户端和服务端共享代码**的目录，用于放置可在前后端复用的通用逻辑、工具函数和类型定义。
  ---
  **🚫 开发者须知（最重要！）**

  > - **跨环境共享**：代码可同时在客户端和服务端使用
  > - **避免环境依赖**：不能包含浏览器或 Node.js 特有的 API
  > - **纯逻辑代码**：只包含可复用的业务无关逻辑
  > - **类型安全优先**：推荐使用 TypeScript
  ---
  **📁 目录结构示例**

  这里只是一个参考：
  ``` text
  shared/
    ├── utils/          # 通用工具函数
    │   ├── formatters.ts
    │   └── validators.ts
    ├── constants/      # 常量定义
    │   ├── api.ts
    │   └── settings.ts
    ├── types/          # 共享类型定义
    │   ├── user.d.ts
    │   └── product.d.ts
    └── lib/            # 第三方库封装
        └── analytics.ts
  ```
  ---
  **⚙️ 核心功能**
  
  > **1: 客户端-服务端** -> **2: shared/ 工具** -> **3: 复用逻辑**
  ---
  **💡 基础使用**
  
  1.**共享工具函数：**
  ```ts
  // shared/utils/formatters.ts
  export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }
  ```

  2.**在客户端使用：**
  ```vue
  <script setup>
    import { formatCurrency } from '~/shared/utils/formatters'

    const price = ref(99.99)
  </script>

  <template>
    <p>{{ formatCurrency(price) }}</p>
  </template>
  ```

  3.**在服务端使用：**
  ```ts
  // server/api/products.ts
  import { formatCurrency } from '~/shared/utils/formatters'

  export default defineEventHandler(() => {
    const products = fetchProducts()
    return products.map(p => ({
      ...p,
      formattedPrice: formatCurrency(p.price)
    }))
  })
  ```
  ---
  **🌟 关键知识点**

  1.**适用内容：**
  
  > - 纯逻辑工具函数
  > - 类型定义和接口
  > - 应用常量
  > - 验证规则
  > - 数学计算
  > - 日期处理

  2.**禁止内容：**
  |  **类型**  |  **原因**  |  **替代方案**  |
  |  ---  |  ---  |  ---  |
  |  DOM 操作  |  服务端无法执行  |  放在 `components/`  |
  |  Node.js 模块  |  客户端无法加载  |  放在 `server/utils/`  |
  |  组件逻辑  |  违反单—职责  |  放在 `composables/`  |
  |  环境变量  |  客户端无法访问私有变量  |  使用 `runtimeConfig`  |

  3.**最佳实践：**
  ```ts
  // 安全：纯函数
  export function add(a: number, b: number): number {
    return a + b
  }

  // 危险：访问 DOM
  export function getWindowSize() {
    return { 
      width: window.innerWidth, // ❌ 服务端会报错
      height: window.innerHeight
    }
  }
  ```
  ---
  **⚡️ 实用技巧**

  1.**类型共享：**
  ```ts
  // shared/types/user.d.ts
  export interface User {
    id: string
    name: string
    email: string
  }

  // 客户端使用
  // components/UserCard.vue
  import type { User } from '~/shared/types/user'

  // 服务端使用
  // server/api/user/[id].ts
  import type { User } from '~/shared/types/user'
  ```

  2.**常量管理：**
  ```ts
  // shared/constants/settings.ts
  export const MAX_ITEMS_PER_PAGE = 20
  export const DEFAULT_THEME = 'light'
  export const API_TIMEOUT = 10000
  ```

  3.**验证函数：**
  ```ts
  // shared/utils/validators.ts
  export const isEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  export const isPhone = (phone: string): boolean => {
    return /^1[3-9]\d{9}$/.test(phone)
  }
  ```
  ---
  **⚠️ 常见问题**

  1.**环境检测错误：**
  ```ts
  // 错误：使用 process.client
  if (process.client) { /* ... */ } // ❌

  // 解决方案：通过参数传递环境
  export function formatDate(date: Date, isClient: boolean) {
    if (isClient) { /* 客户端逻辑 */ }
    else { /* 服务端逻辑 */ }
  }
  ```

  2.**意外依赖：**
  ```bash
  # 检查共享代码是否包含环境特定API
  npx nuxt check # 或使用ESLint规则
  ```

  3.**循环依赖：**
  ```ts
  // 避免：
  // shared/utils/a.ts → import from shared/utils/b.ts
  // shared/utils/b.ts → import from shared/utils/a.ts
  ```
  ---
  **🛠️ 配置建议**

  1.**路径别名：**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    alias: {
      '@shared': './shared'
    }
  })

  // 使用
  import { formatDate } from '@shared/utils/formatters'
  ```

  2.**ESLint 规则：**
  ```js
  // .eslintrc.js
  module.exports = {
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['fs', 'path'],
            message: '在 shared/ 中禁止使用 Node.js 内置模块'
          },
          {
            group: ['window', 'document'],
            message: '在 shared/ 中禁止使用浏览器全局对象'
          }
        ]
      }]
    }
  }
  ```
  ---
  **📚 学习资源**
  > - [Nuxt 共享代码模式](https://nuxt.com/docs/guide/concepts/auto-imports)
  > - [跨环境 JavaScript 开发](https://www.javascripttutorial.net/javascript-this/)
  > - [TypeScript 实用类型](https://www.typescriptlang.org/docs/handbook/utility-types.html)
  ---
  > 💡 提示：把 `shared/` 想象成公司的共享资源库 - 不同部门（客户端/服务端）都可以从这里获取通用工具（代码），提高整体工作效率！
:::
  