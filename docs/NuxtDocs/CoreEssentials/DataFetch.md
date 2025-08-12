# 数据获取

## 一、useAsyncData 与 useFetch 详解

  **核心区别：**

  |  **特性**  |  **useAsyncData**  |  **useFetch**  |
  |  ---  |  ---  |  ---  |
  |  主要用途  |  通用异步操作  |  专门用于HTTP请求  |
  |  请求发起  |  需手动调用$fetch  |  自动处理请求  |
  |  参数灵活性  |  更高（可封装任意异步逻辑）  |  专注于HTTP请求参数  |
  |  使用场景  |  数据库查询、文件操作等  |  API调用  |

  代码示例：
  ```vue
  <script setup>
    // 使用 useFetch
    const { data: posts } = await useFetch('/api/posts', {
      params: { limit: 10 },
      transform: (res) => res.data
    })

    // 使用 useAsyncData
    const { data: user } = await useAsyncData('user-data', async () => {
      const [profile, orders] = await Promise.all([
        $fetch('/api/profile'),
        $fetch('/api/orders')
      ])
      return { profile, orders }
    })
  </script>
  ```

  关键参数说明：
  ```typescript
  const { data, pending, error, refresh } = useFetch(url, {
    key: 'unique-key',      // 缓存键（必填）
    lazy: false,            // 是否延迟加载
    server: true,           // 是否在服务端执行
    immediate: true,        // 是否立即执行
    default: () => ({}),    // 默认值
    transform: (data) => {},// 数据转换
    pick: ['id', 'name']    // 只取指定字段
  })
  ```

## 二、服务端数据获取
  
  1.**核心方法**：

  - **$fetch**：通用请求方法
  - **useLazyFetch**：非阻塞式请求
  - **useLazyAsyncData**：非阻塞式异步操作

  代码示例：
  ```vue
  <script setup>
    // 阻塞式（默认）
    const { data } = await useFetch('/api/data')

    // 非阻塞式（lazy模式）
    const { data, pending } = useLazyFetch('/api/data')

    // 服务端专用（只在服务端执行）
    const serverData = ref()
    if (process.server) {
      serverData.value = await $fetch('/api/server-only')
    }
  </script>

  <template>
    <div v-if="pending">加载中...</div>
    <div v-else>{{ data }}</div>
  </template>
  ```

## 三、客户端数据获取注意事项

  1.**敏感信息保护：**
  ```typescript
  // 错误！API密钥会暴露给客户端
  const apiKey = 'secret-key'
  const data = await $fetch('https://api.example.com', { headers: { key: apiKey } })

  // 正确做法：通过API路由代理
  const data = await $fetch('/api/proxy-example')
  ```
  ---
  2.**跨域问题处理：**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      routeRules: {
        '/external-api/**': {
          proxy: 'https://api.example.com/**'
        }
      }
    }
  })
  ```
  ---
  3.**性能优化：**
  ```vue
  <script setup>
    // 避免在客户端请求大数据
    const { data } = useLazyFetch('/api/large-data', {
      transform: (res) => res.slice(0, 100) // 只取前100条
    })
  </script>
  ```
## 四、创建API路由

  **文件结构：**
  ```text
  server/
    api/
      hello.ts              → GET /api/hello
      users/
        [id].ts             → GET /api/users/:id
        index.ts            → GET /api/users
      post.ts               → POST /api/post
  ```

  基础示例：
  ```ts
  // server/api/hello.ts
  export default defineEventHandler((event) => {
    return { message: 'Hello Nuxt3!' }
  })
  ```

  参数处理：
  ```ts
  // server/api/users/[id].ts
  export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const query = getQuery(event) // 获取URL参数
    const body = await readBody(event) // 获取请求体
    
    // 模拟数据库查询
    const user = await db.users.findUnique({ where: { id } })
    
    if (!user) {
      throw createError({ 
        statusCode: 404, 
        statusMessage: 'User not found' 
      })
    }
    
    return user
  })
  ```
## 五、API路由中间件

  1.**全局中间件：**
  ```ts
  // server/middleware/auth.ts
  export default defineEventHandler((event) => {
    const token = getHeader(event, 'Authorization')
    
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    // 验证token逻辑...
  })
  ```
  ---
  2.**局部中间件：**
  ```ts
  // server/api/secret.ts
  import authMiddleware from '~/server/middleware/auth'

  export default defineEventHandler((event) => {
    // 先执行中间件
    authMiddleware(event)
    
    // 业务逻辑
    return { secret: 'Confidential data' }
  })
  ```
## 六、数据缓存策略

  1.**自动缓存：**
  ```ts
  const { data } = useFetch('/api/data', {
    key: 'unique-cache-key', // 基于key自动缓存
    getCachedData(key) {
      // 自定义缓存获取逻辑
      return nuxtApp.payload.data[key] 
        || nuxtApp.static.data[key]
    }
  })
  ```
  ---
  2.**手动缓存管理：**
  ```ts
  // 设置缓存
  const setCache = (key, data, ttl = 60) => {
    useStorage().setItem(key, data, { ttl })
  }

  // 获取缓存
  const getCache = async (key) => {
    return useStorage().getItem(key)
  }

  // 使用示例
  const cachedData = await getCache('user-data')
  if (!cachedData) {
    const freshData = await $fetch('/api/data')
    setCache('user-data', freshData)
  }
  ```
## 七、错误处理与重试机制

  1.**基础错误处理：**
  ```vue
  <script setup>
    const { data, error } = await useFetch('/api/unstable', {
      onError({ error }) {
        console.error('API错误:', error)
        showToast('数据加载失败')
      }
    })
  </script>

  <template>
    <div v-if="error">错误: {{ error.message }}</div>
  </template>
  ```
  ---
  2.**自动重试：**
  ```ts
  const { data } = useFetch('/api/unstable', {
    retry: 3,                   // 最大重试次数
    retryDelay: 1000,           // 重试间隔(ms)
    onResponseError({ error }) {
      if (error.statusCode === 429) {
        // 特殊错误处理
      }
    }
  })
  ```
  ---
  3.**全局错误处理：**
  ```ts
  // plugins/error-handler.ts
  export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.hook('app:error', (err) => {
      // 发送错误日志
      logErrorToService(err)
    })
    
    nuxtApp.$fetch = async (url, opts) => {
      try {
        return await $fetch(url, opts)
      } catch (err) {
        // 统一处理网络错误
        showGlobalErrorNotification()
        throw err
      }
    }
  })
  ```

## 八、关键注意事项

  1.**环境区分：**
  ```ts
  if (process.server) {
    // 服务端专用逻辑（数据库操作等）
  }
  ```
  ---
  2.**请求头处理：**
  ```ts
  // 传递cookie到API
  const { data } = useFetch('/api/protected', {
    headers: useRequestHeaders(['cookie'])
  })
  ```
  ---
  3.**性能优化：**
  ```ts
  // 并行请求优化
  const [user, posts] = await Promise.all([
    useFetch('/api/user'),
    useFetch('/api/posts')
  ])
  ```
  ---
  4.**类型安全：**
  ```ts
  // 定义API响应类型: 返回数据必须符合User格式包括里面的属性类型
  interface User {
    id: number
    name: string
  }

  const { data } = await useFetch<User>('/api/user')
  ```
  ---
  5.**节流控制：**
  ```ts
  // 防止重复请求
  let pendingRequest = null

  const fetchData = async () => {
    if (!pendingRequest) {
      pendingRequest = $fetch('/api/data')
        .finally(() => { pendingRequest = null })
    }
    return pendingRequest
  }
  ```
  ---
  6.**API版本管理：**
  ```text
  server/
    api/
      v1/
        users.ts
      v2/
        users.ts
  ```

  访问：`/api/v1/users` 和 `/api/v2/users`
