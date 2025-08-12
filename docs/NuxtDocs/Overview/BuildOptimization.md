# 构建优化

## 一、Vite 配置调优

  1.**缓存优化配置**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    vite: {
      cacheDir: '.vite_cache', // 自定义缓存目录
      build: {
        rollupOptions: {
          cache: true // 启用Rollup缓存
        }
      },
      optimizeDeps: {
        include: ['lodash-es', 'vue', 'pinia'], // 预构建依赖
        exclude: ['heavy-library'] // 排除不需要预构建的包
      }
    }
  })
  ```

  **优化效果：**

  - 首次构建时间：减少 40-60%
  - 热更新速度：提升 50-70%
  ---
  2.**预构建策略**
  ```ts
  optimizeDeps: {
    // 强制预构建大型库
    include: [
      'three',
      'echarts',
      'monaco-editor'
    ],
    
    // 排除已知问题库
    exclude: [
      'problematic-module'
    ],
    
    // 自定义入口点
    entries: [
      './src/utils/heavy-utils.ts'
    ]
  }
  ```

  **注意事项：**

  - 避免预构建频繁更新的模块
  - 排除非ESM规范的包
  - 定期清理 `node_modules`/`.vite` 缓存目录

## 二、代码分割与异步加载

  1.**路由级分割**
  ```ts
  definePageMeta({
    // 自动分割页面组件
    lazy: true
  })
  ```
  ---
  2.**组件级异步加载**
  ```vue
  <script setup>
  // 静态导入（默认打包到主文件）
  import HeavyComponent from '@/components/HeavyComponent.vue'

  // 动态导入（单独打包）
  const LazyChart = defineAsyncComponent(() => 
    import('@/components/ChartComponent.vue')
  )
  </script>
  ```
  ---
  3.**第三方库分割**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // 按库分组
            lodash: ['lodash-es'],
            charts: ['echarts', 'd3'],
            // 按目录分组
            utils: [
              '@/utils/data-processor',
              '@/utils/form-validator'
            ]
          }
        }
      }
    }
  })
  ```
## 三、组件懒加载

  1.**基础用法**
  ```vue
  <template>
    <!-- 默认加载 -->
    <RegularComponent />
    
    <!-- 懒加载组件 -->
    <LazyLazyComponent v-if="showLazy" />
    
    <!-- 带加载状态 -->
    <LazyHeavyComponent>
      <template #loading>
        <LoadingSpinner />
      </template>
    </LazyHeavyComponent>
  </template>

  <script setup>
  const showLazy = ref(false)

  // 滚动到可视区域时加载
  onMounted(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        showLazy.value = true
        observer.disconnect()
      }
    })
    observer.observe(document.getElementById('lazy-trigger'))
  })
  </script>
  ```
  ---
  2.**高级模式：智能预加载**
  ```vue
  <script setup>
  // 鼠标悬停时预加载
  const preloadHeavyComponent = () => {
    import('@/components/HeavyComponent.vue')
  }

  // 路由预加载
  const router = useRouter()
  router.beforeEach((to) => {
    if (to.path === '/dashboard') {
      import('@/components/DashboardChart.vue')
    }
  })
  </script>

  <template>
    <div 
      @mouseenter="preloadHeavyComponent"
      @touchstart="preloadHeavyComponent"
    >
      <LazyHeavyComponent />
    </div>
  </template>
  ```
## 四、图片优化

  1. **Nuxt Image 模块**
  ```bash
  npm install @nuxt/image
  ```

  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@nuxt/image'],
    image: {
      domains: ['cdn.example.com'],
      presets: {
        avatar: {
          modifiers: {
            width: 80,
            height: 80,
            format: 'webp'
          }
        }
      }
    }
  })
  ```

  ```vue
  <template>
    <NuxtImg
      src="/images/hero.jpg"
      width="1200"
      height="800"
      format="webp"
      quality="80"
      loading="lazy"
      :modifiers="{ 
        blur: 5, 
        grayscale: true 
      }"
    />
  </template>
  ```
  ---
  2.**高级优化技巧**
  ```ts
  // 自动生成响应式图片
  const srcset = computed(() => {
    const widths = [320, 640, 960, 1280]
    return widths.map(w => `/api/image?src=hero.jpg&width=${w} ${w}w`).join(', ')
  })
  ```
  
  ```vue
  <template>
    <img
      :src="placeholder"
      :srcset="srcset"
      sizes="(max-width: 768px) 100vw, 50vw"
      alt="Responsive image"
    />
  </template>

  <script setup>
  // 使用低质量占位图
  const placeholder = await $fetch('/api/image?src=hero.jpg&width=20&quality=10')
  </script>
  ```
## 五、构建体积分析

  1. **Rollup Visualizer 集成**
  ```bash
  npm install rollup-plugin-visualizer -D
  ```

  ```ts
  // nuxt.config.ts
  import visualizer from 'rollup-plugin-visualizer'

  export default defineNuxtConfig({
    vite: {
      plugins: [
        visualizer({
          open: true,
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true
        })
      ]
    }
  })
  ```
  ---
  2.**分析结果解读**

  https://example.com/visualizer-sample.png

  **关键指标：**

  - **主包大小**：应 < 200KB
  - **第三方库占比**：超过 60% 需优化
  - **重复模块**：检查是否多次打包相同库
  - **未使用代码**：识别可删除的死代码
  ---
  3.**优化策略**
  ```ts
  // 1. 按需导入
  import { debounce } from 'lodash-es'

  // 2. 使用轻量替代品
  import dayjs from 'dayjs' // 替代 moment.js

  // 3. 动态加载重型库
  const loadHeavyLib = async () => {
    const { init } = await import('heavy-library')
    init()
  }

  // 4. 压缩资源
  export default defineNuxtConfig({
    build: {
      terser: {
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production'
          }
        }
      }
    }
  })
  ```
## 六、高级优化技巧

  1.**服务端组件精简**
  ```ts
  // 服务端专用组件
  export default defineComponent({
    // 不会打包到客户端
    serverOnly: true,
    setup() {
      // 服务端逻辑
    }
  })
  ```
  ---
  2.**条件编译**
  ```ts
  // 根据环境变量排除代码
  if (process.env.NODE_ENV === 'development') {
    console.log('Debug info')
  }

  // 使用 defineClientComponent
  defineClientComponent(() => {
    // 只在客户端执行的代码
    useBrowserOnlyAPI()
  })
  ```
  ---
  3.**资源预加载**
  ```vue
  <template>
    <!-- 预加载关键资源 -->
    <link rel="preload" href="/_nuxt/assets/main.css" as="style">
    <link rel="preload" href="/_nuxt/entry.js" as="script">
    
    <!-- 预取非关键资源 -->
    <link rel="prefetch" href="/_nuxt/chart-component.js">
  </template>
  ```
  4.**构建性能分析**
  ```bash
  # 生成构建时间报告
  npx nuxi build --timing

  # 输出结果示例
  [build timing]
  - initialize: 120ms
  - pages: 450ms
  - server: 320ms
  - client: 780ms
  - total: 1670ms
  ```
## 七、优化前后对比指标
  |  **指标**  |  **优化前**  |  **优化后**  |  **提升幅度**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  首次加载时间  |  3.8s  |  1.2s  |  68%  |
  |  首页资源大小  |  1.8MB  |  450KB  |  75%  |
  |  交互时间(TTI)  |  2.5s  |  0.9s  |  64%  |
  |  构建时间  |  45s  |  18s  |  60%  |
  |  热更新速度  |  1200ms  |  300ms  |  75%  |
## 八、最佳实践与注意事项
  
  1.**优化优先级排序**
  > - A[图片/媒体资源] --> B[JavaScript 体积]--> C[代码分割]--> D[预加载策略]--> E[第三方库优化]
  ---
  2.**避免的陷阱**
  - **过度分割**：导致过多网络请求（平衡点：50-100个文件）
  - **错误缓存**：静态资源未添加哈希导致缓存失效
  - **重复依赖**：多个版本相同库共存（使用 `npm dedupe`）
  - **未压缩资源**：确保启用 Gzip/Brotli 压缩
  ---
  3.**持续监控**
  ```json
  // package.json
  {
    "scripts": {
      "analyze": "nuxi build && npx vite-bundle-visualizer",
      "profile": "NODE_OPTIONS='--cpu-prof' nuxi build",
      "size-check": "bundlesize --config .bundlesize.json"
    }
  }
  ```
  ---
  4.**生产环境检查清单**
  - 开启资源压缩（Gzip/Brotli）
  - 配置长期缓存（`immutable` 资源）
  - 验证懒加载组件水合效果
  - 测试关键路径性能（Lighthouse）
  - 确保无阻塞渲染脚本
## 九、Nuxt3 优化生态系统
  |  **工具类型**  |  **推荐方案**  |  **功能特点**  |
  |  ---  |  ---  |  ---  |
  |  图片优化  |  `@nuxt/image`  |  智能格式转换 + CDN 集成  |
  |  字体优化  |  `nuxt-font-loader`  |  字体子集 + 预加载  |
  |  CSS 压缩  |  `nuxt-purgecss`  |  移除未使用样式  |
  |  Bundle分析  |  `rollup-plugin-visualizer`  |  可视化依赖分析  |
  |  性能监控  |  `@nuxtjs/web-vitals`  |  Core Web Vitals 追踪  |
  |  CDN 集成  |  `nuxt-cdn`  |  自动上传静态资源到 CDN  |
## 总结

  核心优化策略：

  **Vite 深度调优：**

  - 合理配置预构建
  - 利用持久化缓存
  - 优化 Rollup 输出
  ---
  **智能代码分割：**

  - 路由级懒加载
  - 组件级按需加载
  - 第三方库分块
  ---
  **资源极致优化：**

  - 现代图片格式（WebP/AVIF）
  - 字体子集化
  - CSS 压缩与 Purge
  ---
  **构建分析驱动：**

  - 可视化体积分析
  - 性能基准测试
  - 持续监控机制
  ---
  **关键原则：**

  - **按需加载**：不加载当前不需要的资源
  - **最小传输**：减少字节数和请求数
  - **高效缓存**：最大化利用浏览器缓存
  - **渐进增强**：优先加载关键内容
  ---
  通过实施这些优化策略，Nuxt3 应用可以达到：
  - 加载性能提升 50-70%
  - 构建时间减少 40-60%
  - 用户体验评分（Lighthouse）90+
  - 更好的SEO表现和用户留存率






