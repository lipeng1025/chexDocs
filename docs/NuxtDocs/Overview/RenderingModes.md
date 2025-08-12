# 渲染模式差异

## 一、三种渲染模式对比
  |  **特性**  |  **SSR (Server-Side Rendering)**  |  **SSG (Static Site Generation)**  |  **SPA (Single Page Application)**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  工作原理  |  每次请求时在服务端生成HTML  |  构建时生成静态HTML文件  |  客户端动态渲染  |
  |  运行环境  |  Node.js 服务器  |  CDN/静态托管  |  浏览器  |
  |  数据获取  |  服务端获取 + 客户端激活  |  构建时获取  |  客户端获取  |
  |  首次加载速度  |  ⭐⭐⭐ (快)  |  ⭐⭐⭐⭐⭐ (极快)  |  ⭐ (慢)  |
  |  SEO支持  |  ✅ 完美支持  |  ✅ 完美支持  |  ❌ 需额外处理  |
  |  动态内容  |  ✅ 实时更新  |  ⚠️ 需重新构建  |  ✅ 实时更新  |
  |  服务器要求  |  需要Node服务器  |  无需服务器  |  无需服务器  |
  |  适用场景  |  内容频繁更新的网站  |  内容稳定的博客/文档  |  后台管理系统  |
  |  Nuxt配置  |  `ssr: true` (默认)  |  `ssr: false` + `target: 'static'`  |  `ssr: false`  |
## 二、渲染模式切换

  1.**全局配置 (nuxt.config.ts)**
  ```ts
  export default defineNuxtConfig({
    // SSR模式 (默认)
    ssr: true,
    
    // SSG模式
    ssr: true,
    target: 'static', // 生成静态站点
    
    // SPA模式
    ssr: false
  })
  ```
  ---
  2.**按路由覆盖 (routeRules)**
  ```ts
  export default defineNuxtConfig({
    routeRules: {
      // 首页使用SSG
      '/': { prerender: true },
      
      // 博客详情使用SSR
      '/blog/**': { ssr: true },
      
      // 用户中心使用SPA
      '/user/**': { ssr: false },
      
      // 大文件页面使用客户端渲染
      '/large-page': { ssr: false }
    }
  })
  ```
  ---
  3.**构建命令差异**
  ```bash
  # SSR模式 (需要Node服务器)
  npm run build
  npm run start

  # SSG模式 (生成静态文件)
  npm run generate

  # SPA模式
  npm run generate # 或修改配置后构建
  ```
## 三、混合渲染模式 (Hybrid Rendering)

  1.**原理说明**

  - 同时支持 SSR、SSG 和 SPA
  - 根据路由动态选择渲染策略
  - 静态页面托管 + 动态API服务
  ---
  2.**配置示例**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      prerender: {
        routes: ['/', '/about', '/contact']
      }
    },
    routeRules: {
      // 静态页面
      '/blog': { static: true },
      
      // 动态页面（服务端渲染）
      '/blog/:slug': { swr: 3600 }, // 缓存1小时
      
      // 客户端渲染页面
      '/dashboard': { ssr: false },
      
      // API代理
      '/api/**': { proxy: 'http://api.example.com/**' }
    }
  })
  ```
  ---
  3.**混合渲染优势**

  - **性能优化**：静态资源CDN分发 + 动态内容按需渲染
  - **成本降低**：减少服务器计算压力
  - **灵活扩展**：不同路由采用最佳渲染策略
  - **渐进增强**：从纯静态逐步过渡到动态
## 四、客户端边界处理

  1.**`<ClientOnly>` 组件**
  ```vue
  <template>
    <div>
      <!-- 只在客户端渲染 -->
      <ClientOnly>
        <RealTimeChart />
        <template #fallback>
          <!-- 加载状态 -->
          <LoadingSpinner />
        </template>
      </ClientOnly>
    </div>
  </template>
  ```
  ---
  2.**`useClientOnly` 组合函数**
  ```ts
  import { useClientOnly } from '#imports'

  const { isClient, isServer } = useClientOnly()

  const windowWidth = ref(0)

  if (isClient) {
    windowWidth.value = window.innerWidth
    window.addEventListener('resize', () => {
      windowWidth.value = window.innerWidth
    })
  }
  ```
  ---
  3.**生命周期钩子控制**
  ```vue
  <script setup>
    import { onMounted } from 'vue'

    // 只在客户端执行
    onMounted(() => {
      initMapLibrary()
      trackAnalytics()
    })
  </script>
  ```
  ---
  4.**条件导入**
  ```ts
  // 动态导入客户端专用库
  const loadHeavyLibrary = async () => {
    if (process.client) {
      const { init } = await import('heavy-client-lib')
      init()
    }
  }
  ```
## 五、使用场景与性能考量

  1.**渲染模式选择指南**
  |  **场景类型**  |  **推荐模式**  |  **原因说明**  |
  |  ---  |  ---  |  ---  |
  |  企业官网/博客  |  SSG  |  内容稳定，SEO要求高  |
  |  电商网站  |  SSR  |  动态内容多，SEO关键  |
  |  后台管理系统  |  SPA  |  无需SEO，交互复杂  |
  |  新闻媒体  |  Hybrid  |  首页静态，文章页动态  |
  |  用户社区  |  SSR  |  实时更新，用户生成内容  |

  ---
  2.**性能优化策略**

  **SSR优化：**
  - 使用 `lazy: true` 延迟加载组件
  ```ts
  definePageMeta({
    lazy: true
  })
  ```

  - 数据缓存减少数据库压力
  ```ts
  // 带缓存的useFetch
  const { data } = await useFetch('/api/products', {
    key: 'products-cache',
    getCachedData(key) {
      return nuxtApp.payload.data[key]
    }
  })
  ```

  **SSG优化：**

  - 增量静态生成 (ISR)
  ```ts
  // nuxt.config.ts
  routeRules: {
    '/blog/:slug': { swr: 3600 } // 每小时重新验证
  }
  ```

  - 按需生成页面
  ```ts
  // 动态生成静态页面
  export default defineNuxtConfig({
    nitro: {
      prerender: {
        crawlLinks: true,
        routes: [
          '/',
          ...getAllBlogPaths() // 从API获取路径
        ]
      }
    }
  })
  ```

  **SPA优化：**

  - 代码分割 + Tree Shaking
  - 预加载关键资源
  ```html
  <!-- 在app.vue中 -->
  <Link rel="preload" href="/_nuxt/assets/main.css" as="style" />
  ```
  ---
  3.**关键注意事项**
  
  **环境变量安全：**

  ```ts
  // 错误：客户端暴露密钥
  const apiKey = 'secret123'

  // 正确：使用运行时配置
  // nuxt.config.ts
  export default defineNuxtConfig({
    runtimeConfig: {
      public: {
        apiBase: '/api'
      },
      apiSecret: process.env.API_SECRET
    }
  })
  ```

  **第三方库兼容性：**

  - 检查库是否支持SSR
  - 使用`<ClientOnly>`包装非SSR安全组件

  **内存管理：**

  - SSR模式下避免全局变量
  - 使用useState管理服务端状态

  **错误处理：**

  ```ts
  // 统一错误处理
  export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.hook('app:error', (err) => {
      sendToErrorTracking(err)
    })
  })
  ```

  **性能监控：**

  ```ts
  // 使用Nuxt Performance插件
  export default defineNuxtConfig({
    modules: ['@nuxtjs/web-vitals']
  })
  ```
## 六、高级场景：边缘渲染 (Edge-Side Rendering)

  1.**配置示例**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      preset: 'vercel-edge' // 或 'netlify-edge'
    }
  })
  ```
  ---
  2.**边缘函数示例**
  ```ts
  // server/api/hello.ts
  export default defineEventHandler(async (event) => {
    const country = event.headers.get('cf-ipcountry') || 'unknown'
    
    return {
      message: `Hello from ${country}!`,
      timestamp: Date.now()
    }
  })
  ```
  ---
  3.**边缘渲染优势**
  - 全球加速（靠近用户的CDN节点渲染）
  - 更低的延迟
  - 自动扩展能力
  - 更细粒度的缓存控制
## 总结

  Nuxt3的渲染模式选择策略：

  - **内容优先**：SEO关键内容使用SSR/SSG
  - **交互优先**：复杂交互页面使用SPA
  - **混合策略**：结合静态生成与动态渲染
  - **性能优化**：静态内容CDN分发，动态内容边缘渲染
  ---
  关键决策点：

  - **SEO需求**：需要SEO → 选择SSR/SSG
  - **内容更新频率**：高频更新 → 选择SSR
  - **用户地理位置**：全球用户 → 选择边缘渲染
  - **开发复杂度**：快速上线 → 选择SSG
