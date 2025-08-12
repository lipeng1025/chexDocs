# SEO 与 Meta 管理

## 一、使用 useHead 动态管理头部标签

  1.**基础用法**
  ```vue
  <script setup>
  // 在组件内使用
  useHead({
    title: '产品详情页',
    meta: [
      { name: 'description', content: '探索我们的优质产品系列' },
      { name: 'keywords', content: '产品,购物,电商' }
    ],
    link: [
      { rel: 'canonical', href: 'https://example.com/product' }
    ],
    script: [
      { 
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Nuxt3高级课程'
        })
      }
    ]
  })
  </script>
  ```
  ---
  2.**响应式元数据**
  ```vue
  <script setup>
    const product = ref({ title: '初始标题' })

    // 响应式更新标题
    useHead({
      title: () => `${product.value.title} - 我的商城`
    })

    // 从API获取数据后更新
    onMounted(async () => {
      const { data } = await useFetch('/api/product')
      product.value = data.value
    })
  </script>
  ```
  ---
  3.**全局默认配置**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    app: {
      head: {
        title: '默认标题',
        meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' }
        ],
        link: [
          { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
      }
    }
  })
  ```

  **注意事项：**

  - 组件内的 `useHead` 会覆盖全局配置
  - 优先在页面级组件中使用
  - 避免在多个组件中同时修改相同标签
## 二、使用 useSeoMeta 简化 SEO 元数据设置

  1.**基础用法**
  ```vue
  <script setup>
    useSeoMeta({
      title: '产品页面',
      ogTitle: '我们的产品 - 优质选择',
      description: '发现我们的产品系列',
      ogDescription: '探索精选产品系列',
      ogImage: 'https://example.com/product.jpg',
      twitterCard: 'summary_large_image'
    })
  </script>
  ```
  ---
  2.**自动推导的字段**
  ```ts
  useSeoMeta({
    title: '动态标题', // 自动设置 og:title 和 twitter:title
    description: '动态描述' // 自动设置 og:description 和 twitter:description
  })
  ```
  ---
  3.**高级用法**
  ```ts
  // 使用计算属性
  const pageTitle = computed(() => `${product.value.name} - ${siteName}`)

  useSeoMeta({
    title: pageTitle,
    ogImage: () => product.value.mainImage || '/default.jpg'
  })
  ```

  **优势对比：**
  |  **特性**  |  **useHead**  |  **useSeoMeta**  |
  |  ---  |  ---  |  ---  |
  |  语法复杂度  |  较高（需要完整对象结构）  |  较低（简化键值对）  |
  |  SEO专用字段  |  需手动配置  |  自动处理SEO相关meta  |
  |  响应式支持  |  ✅  |  ✅  |
  |  类型安全  |  ⚠️ 一般  |  ✅ 强类型  |
## 三、组件式元数据管理

  1.**内置组件**
  ```vue
  <template>
    <div>
      <Title>产品详情页</Title>
      <Meta name="description" content="产品详细信息页面" />
      <Link rel="preload" href="/fonts/special.woff2" as="font" />
      <Style>
        body { background-color: #f5f5f5; }
      </Style>
      <NoScript>
        <p>您的浏览器不支持JavaScript</p>
      </NoScript>
    </div>
  </template>
  ```
  ---
  2.**动态组件**
  ```vue
  <script setup>
    const product = ref({ title: '加载中...' })
  </script>

  <template>
    <Title>{{ product.title || '默认标题' }}</Title>
    <Meta v-if="product.keywords" name="keywords" :content="product.keywords.join(',')" />
  </template>
  ```

  **最佳实践：**

  - 优先使用组件式声明（更符合Vue开发习惯）
  - 复杂逻辑场景使用 `useHead`/`useSeoMeta`
  - 避免在同一个组件中混合使用组件式和函数式
## 四、结构化数据 (JSON-LD)

  1.**基本实现**
  ```vue
  <script setup>
    useHead({
      script: [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Nuxt3大师课程",
          "image": "/course-image.jpg",
          "description": "深入学习Nuxt3框架",
          "offers": {
            "@type": "Offer",
            "price": "299.00",
            "priceCurrency": "CNY"
          }
        })
      }]
    })
  </script>
  ```
  ---
  2.**使用 `Schema.org` 组件**
  ```vue
  <template>
    <SchemaOrgProduct
      :name="product.name"
      :description="product.description"
      :image="product.image"
      :offers="{
        price: product.price,
        priceCurrency: 'CNY'
      }"
    />
  </template>
  ```
  ---
  3.**自动生成工具**
  ```bash
  npm install @nuxtjs/schema-org
  ```

  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@nuxtjs/schema-org'],
    schemaOrg: {
      canonicalHost: 'https://example.com',
      defaultLanguage: 'zh-CN'
    }
  })
  ```

  **注意事项：**

  - 验证工具：使用 [Google结构化数据测试工具](https://search.google.com/test/rich-results)
  - 避免多个重复的结构化数据
  - 动态内容需确保在客户端渲染时更新
  - 特殊字符需要正确转义

## 五、第三方SEO工具集成

  1.**Google Analytics**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['nuxt-gtag'],
    gtag: {
      id: 'G-XXXXXXXXXX'
    }
  })
  ```
  ---
  2.**Google Tag Manager**
  ```vue
  <script setup>
    useHead({
      script: [
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.GTM_ID}`,
          async: true
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${import.meta.env.GTM_ID}');
          `
        }
      ]
    })
  </script>
  ```
  ---
  3.**SEO分析工具**
  ```ts
  // 集成 Ahrefs
  useHead({
    meta: [
      { name: 'ahrefs-site-verification', content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }
    ]
  })

  // 集成 Bing Webmaster
  useHead({
    meta: [
      { name: 'msvalidate.01', content: 'XXXXXXXXXXXXXXXXXXXXXXXX' }
    ]
  })
  ```
## 六、高级SEO技巧

  1.**分页SEO处理**
  ```ts
  useSeoMeta({
    title: `产品列表 - 第${currentPage}页`,
    canonical: `https://example.com/products?page=${currentPage}`,
    link: [
      { 
        rel: 'prev', 
        href: currentPage > 1 
          ? `https://example.com/products?page=${currentPage - 1}` 
          : null 
      },
      { 
        rel: 'next', 
        href: hasNextPage 
          ? `https://example.com/products?page=${currentPage + 1}` 
          : null 
      }
    ]
  })
  ```
  ---
  2.**多语言SEO**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    i18n: {
      locales: [
        { code: 'zh', iso: 'zh-CN', file: 'zh-CN.json' },
        { code: 'en', iso: 'en-US', file: 'en-US.json' }
      ],
      defaultLocale: 'zh'
    }
  })
  vue
  <script setup>
  const { locale } = useI18n()

  useSeoMeta({
    title: i18n.t('seo.title'),
    lang: locale.value,
    ogLocale: locale.value
  })
  </script>
  ```
  ---
  3.**动态Open Graph图片**
  ```ts
  // 使用第三方服务生成OG图片
  const ogImageUrl = computed(() => {
    return `https://og.example.com/api/generate?title=${encodeURIComponent(pageTitle.value)}`
  })

  useSeoMeta({
    ogImage: ogImageUrl,
    twitterImage: ogImageUrl
  })
  ```
## 七、SEO最佳实践与注意事项

  1.**关键优化点**

  - **页面标题**：每个页面唯一，包含关键词（<60字符）
  - **Meta描述**：吸引点击，包含关键词（<160字符）
  - **规范链接**：避免重复内容
  - **结构化数据**：提升搜索结果显示
  - **移动友好**：响应式设计
  ---
  2.**常见错误**
  ```ts
  // 错误1：重复meta标签
  useHead({ meta: [{ name: 'description', content: 'A' }] })
  useSeoMeta({ description: 'B' }) // 会覆盖前面的

  // 错误2：忽略H1标签
  <template>
    <div>
      <!-- 缺少H1标签 -->
      <h2>产品标题</h2>
    </div>
  </template>

  // 错误3：阻塞渲染的脚本
  useHead({
    script: [
      { src: '/heavy-analytics.js', async: false } // 应使用async或defer
    ]
  })
  ```
  ---
  3.**性能优化**
  ```ts
  // 延迟加载第三方脚本
  useHead({
    script: [
      { 
        src: 'https://example.com/analytics.js',
        defer: true,
        body: true // 放在body底部
      }
    ]
  })
  ```
  ---
  4.**SEO测试工具**
  - [Google Search Console](https://search.google.com/search-console)
  - [Lighthouse SEO审计](https://developer.chrome.com/docs/lighthouse/seo/)
  - [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)
  - [Ahrefs网站分析](https://ahrefs.com/)
# 总结

  Nuxt3 提供了多层次的 SEO 管理方案：

  - **全局配置**：`nuxt.config.ts` 设置默认值
  - **函数式API**：`useHead` 和 `useSeoMeta` 动态控制
  - **组件式声明**：`<Title>`、`<Meta>` 等直观组件
  - **结构化数据**：JSON-LD 增强搜索结果
  - **工具集成**：无缝接入 Google Analytics 等第三方服务
  ---
  关键原则：

  - 每个页面必须有唯一的标题和描述
  - 重要内容应在服务器端渲染保证SEO抓取
  - 使用规范链接避免重复内容惩罚
  - 移动端体验优先（影响搜索排名）
  - 定期使用SEO工具审计网站
