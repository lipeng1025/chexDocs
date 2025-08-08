# server
::: details 理论阐述

  **🧠 核心概念**

  > - `server/` 是 Nuxt3 的**后端核心**，用于创建 API 端点、服务器路由和处理服务端逻辑，让你的应用成为真正的全栈应用。
  ---
  **🚫 开发者须知（最重要！）**

  > - **服务端专用**：代码只在 Node.js 环境运行
  > - **自动路由**：文件路径即 API 路由
  > - **无需配置**：Nuxt 自动加载并注册
  > - **类型安全**：支持 TypeScript 和自动类型生成
  ---
  **📁 目录结构示例**

  这里只是一个参考：
  ``` text
  server/
    ├── api/              # API端点
    │   ├── hello.ts      # /api/hello
    │   └── user/
    │       ├── [id].ts   # /api/user/:id
    ├── routes/           # 自定义路由
    │   └── custom.ts     # /custom-route
    ├── middleware/       # 服务端中间件
    │   └── auth.ts       # 全局认证检查
    └── utils/            # 服务端工具函数
        └── db.ts         # 数据库连接
  ```
  ---
  **⚙️ 核心功能**
  
  > **1: 客户端请求** - **2: server/api/endpoint.ts** - **3: 处理逻辑** - **4: 返回响应**
  ---
  **💡 基础使用**
  
  1.**创建 API 端点：**
  ```ts
  // server/api/hello.ts
  export default defineEventHandler((event) => {
    return { message: 'Hello Nuxt Server!' }
  })
  ```
  > 访问：**`/api/hello`**

  2.**带参数的动态路由：**
  ```ts
  // server/api/user/[id].ts
  export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const user = await fetchUser(id)
    return user
  })
  ```
  > 访问：**`/api/user/123`**
  ---
  **🌟 关键知识点**

  1.**目录功能：**
  |  **目录**  |  **作用**  |  **访问方式**  |
  |  ---  |  ---  |  ---  |
  |  `api/`  | 创建 API 端点  | `/api/*`  |
  |  `routes/`  |  创建自定义路由  | 直接路径（如 `/custom`）  |
  |  `middleware/`  |  服务端中间件(全局/路由前)  | 自动应用  |
  |  `plugins/`  |  服务端插件(初始化逻辑)  | 自动加载  |

  2.**请求处理工具：**
  ```ts
  // 获取请求体
  const body = await readBody(event)

  // 获取查询参数
  const { search } = getQuery(event)

  // 设置响应头
  setHeader(event, 'Cache-Control', 'max-age=60')
  ```

  3.**数据库集成：**
  ```ts
  // server/utils/db.ts
  import { createClient } from '@supabase/supabase-js'

  export const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  )

  // 在API中使用
  // server/api/users.ts
  import { supabase } from '../utils/db'

  export default defineEventHandler(async () => {
    const { data } = await supabase.from('users').select('*')
    return data
  })
  ```
  ---
  **⚡️ 实用技巧**

  1.**RESTful API 示例：**
  ```ts
  // server/api/todos/index.ts
  export default defineEventHandler(async (event) => {
    // GET /api/todos
    if (event.method === 'GET') return fetchTodos()
    
    // POST /api/todos
    if (event.method === 'POST') {
      const body = await readBody(event)
      return createTodo(body)
    }
  })
  ```

  2.**文件上传处理：**
  ```ts
  // server/api/upload.ts
  import { createWriteStream } from 'fs'

  export default defineEventHandler(async (event) => {
    const files = await readMultipartFormData(event)
    
    if (files) {
      for (const file of files) {
        const stream = createWriteStream(`./uploads/${file.filename}`)
        stream.write(file.data)
        stream.end()
      }
      return { success: true }
    }
    return { error: 'No files uploaded' }
  })
  ```

  3.**服务端中间件：**
  ```ts
  // server/middleware/auth.ts
  export default defineEventHandler((event) => {
    // 全局认证检查
    const token = getHeader(event, 'Authorization')
    if (!token) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }
  })
  ```
  ---
  **⚠️ 常见问题**

  1.**热更新失效：**
  ```bash
  # 解决方案：强制重启
  npm run dev --force
  ```

  2.**跨域问题(CORS)：**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      routeRules: {
        '/api/**': { 
          cors: true,
          headers: { 'Access-Control-Allow-Origin': '*' } 
        }
      }
    }
  })
  ```

  3.**环境变量使用：**
  ```ts
  // 正确访问方式
  const apiKey = useRuntimeConfig().apiSecret

  // 错误方式（不会生效）
  const apiKey = process.env.API_SECRET
  ```
  ---
  **📚 学习资源**
  > - [Nitro 服务器文档](https://nitro.unjs.io/guide/introduction/routing)
  > - [Nuxt 服务端指南](https://nuxt.com/docs/guide/directory-structure/server)
  > - [API 路由示例](https://github.com/nuxt/nuxt/tree/main/examples/server-routes)
  ---
  > 💡 提示：`server/` 就像你的应用后台办公室 - 客户端（前台）发送请求，服务端（后台）处理数据、访问数据库并返回结果！
:::
  