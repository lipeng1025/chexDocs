# 国际化

## 一、@nuxtjs/i18n 模块安装与基础配置

  1.**安装依赖**
  ```bash
  npm install @nuxtjs/i18n
  ```
  ---
  2.**基础配置**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@nuxtjs/i18n'],
    
    i18n: {
      // 基础配置
      locales: [
        { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
        { code: 'zh', iso: 'zh-CN', name: '中文', file: 'zh.json' },
        { code: 'es', iso: 'es-ES', name: 'Español', file: 'es.json' }
      ],
      defaultLocale: 'en', // 默认语言
      strategy: 'prefix_except_default', // 路由策略
      lazy: true, // 懒加载语言文件
      langDir: 'locales', // 语言文件目录
      
      // 检测浏览器语言
      detectBrowserLanguage: {
        useCookie: true,
        cookieKey: 'i18n_redirected',
        redirectOn: 'root'
      },
      
      // Vue I18n 配置
      vueI18n: {
        legacy: false,
        locale: 'en',
        fallbackLocale: 'en'
      }
    }
  })
  ```
  ---
  3.**文件结构准备**
  ```text
  locales/
    |- en.json
    |- zh.json
    |- es.json
  ```

  **示例语言文件：**

  ```json
  // locales/zh.json
  {
    "welcome": "欢迎使用我们的应用",
    "products": {
      "title": "产品列表",
      "description": "探索我们的优质产品"
    },
    "price": "价格: {price}元"
  }
  ```
## 二、语言切换与路由集成

  1.**基本语言切换**
  ```vue
  <template>
    <div>
      <select v-model="$i18n.locale">
        <option v-for="locale in $i18n.locales" :key="locale.code" :value="locale.code">
          {{ locale.name }}
        </option>
      </select>
      
      <h1>{{ $t('welcome') }}</h1>
      <p>{{ $t('products.title') }}</p>
    </div>
  </template>
  ```
  ---
  2.**路由前缀策略**
  |  **策略模式**  |  **URL 示例**  |  **说明**  |
  |  ---  |  ---  |  ---  |
  |  prefix  |  /en/about, /zh/about  |  所有路由添加前缀  |
  |  prefix_except_default  |  /about, /zh/about  |  默认语言不加前缀 (推荐)
  |  prefix_and_default  |  /en/about, /about  |  默认语言两种形式  |
  |  no_prefix  |  /about?locale=en  |  使用查询参数  |
  ---
  3.**编程式导航**
  ```ts
  // 切换语言并导航
  const switchLocale = (locale: string) => {
    setLocale(locale)
    navigateTo({
      path: switchLocalePath(locale),
      query: { ...route.query }
    })
  }

  // 获取当前路径的翻译路径
  const localizedPath = useLocalePath()
  <NuxtLink :to="localizedPath('/products')">{{ $t('products') }}</NuxtLink>
  ```
## 三、语言资源管理

  1.**模块化语言文件**
  ```text
  locales/
    |- en/
      |- common.json
      |- products.json
      |- user.json
    |- zh/
      |- common.json
      |- products.json
      |- user.json
  ```

  ```ts
  // nuxt.config.ts
  i18n: {
    lazy: true,
    langDir: 'locales',
    locales: [
      { code: 'en', file: 'en/index.ts' },
      { code: 'zh', file: 'zh/index.ts' }
    ]
  }

  // locales/en/index.ts
  export default {
    common: () => import('./common.json'),
    products: () => import('./products.json')
  }
  ```
  ---
  2.**动态加载语言资源**
  ```ts
  // 按需加载特定模块
  const loadProductTranslations = async () => {
    await loadLocaleMessages('zh', 'products')
  }
  ```
  3.**组合式 API 使用**
  ```ts
  import { useI18n } from 'vue-i18n'

  export default {
    setup() {
      const { t, locale, locales } = useI18n()
      
      return {
        t,
        locale,
        locales
      }
    }
  }
  ```
## 四、SEO 优化（hreflang 与多语言 SEO）

  1.**自动生成 hreflang**
  ```vue
  <script setup>
  // 在 app.vue 中添加
  useHead({
    link: [
      ...useAlternatePaths()
    ]
  })
  </script>
  ```
  ---
  2.**自定义 SEO 元数据**
  ```vue
  <script setup>
  const { t, locale } = useI18n()

  useHead({
    title: t('seo.title'),
    meta: [
      { 
        name: 'description', 
        content: t('seo.description') 
      },
      {
        property: 'og:locale',
        content: locale.value
      },
      {
        property: 'og:locale:alternate',
        content: locales.value.filter(l => l.code !== locale).map(l => l.iso).join(',')
      }
    ]
  })
  </script>
  ```
  ---
  3.**语言特定 Sitemap**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@nuxtjs/i18n', '@nuxtjs/sitemap'],
    
    sitemap: {
      urls: async () => {
        const products = await fetchProducts()
        return products.map(product => ({
          loc: `/products/${product.slug}`,
          changefreq: 'weekly',
          // 多语言版本
          links: useI18n().locales.value.map(locale => ({
            lang: locale.iso,
            url: `/${locale.code}/products/${product.slug}`
          }))
        }))
      },
      i18n: {
        locales: ['en', 'zh', 'es']
      }
    }
  })
  ```
## 五、高级国际化功能

  1.**日期与时间本地化**
  ```ts
  import { useI18n } from 'vue-i18n'
  import { format, utcToZonedTime } from 'date-fns-tz'

  const { locale } = useI18n()

  // 本地化日期格式
  const formatLocalDate = (date: Date) => {
    const timeZone = locale.value === 'en' ? 'America/New_York' : 'Asia/Shanghai'
    const zonedDate = utcToZonedTime(date, timeZone)
    
    return format(zonedDate, 'PPP', { 
      locale: locale.value === 'zh' ? zhLocale : enLocale 
    })
  }
  ```
  ---
  2.**货币本地化**
  ```ts
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: locale.value === 'en' ? 'USD' : 'CNY'
    }).format(amount)
  }
  ```
  ---
  3.**复数规则处理**
  ```json
  // locales/en.json
  {
    "cart": {
      "items": "{count} item | {count} items"
    }
  }

  // 使用
  $t('cart.items', { count: 1 }) // "1 item"
  $t('cart.items', { count: 5 }) // "5 items"
  ```
## 六、性能优化策略

  1.**按需加载语言包**
  ```ts
  // nuxt.config.ts
  i18n: {
    lazy: true,
    langDir: 'locales',
    locales: [
      { code: 'en', file: 'en.json', isCatchallLocale: true },
      { code: 'zh', file: 'zh.json' }
    ]
  }
  ```
  ---
  2.**预加载关键语言**
  ```vue
  <template>
    <link 
      v-for="locale in $i18n.locales" 
      :key="locale.code"
      rel="preload"
      :href="`/_nuxt/locales/${locale.file}`"
      as="fetch"
      crossorigin
    >
  </template>
  ```
  ---
  3.**服务端渲染优化**
  ```ts
  // 在中间件中设置语言
  export default defineNuxtRouteMiddleware((to) => {
    const { getLocaleFromPath } = useI18n()
    const locale = getLocaleFromPath(to.path) || 'en'
    
    // 设置SSR上下文中的语言
    const nuxtApp = useNuxtApp()
    nuxtApp.provide('i18n:locale', locale)
  })
  ```
## 七、常见问题解决方案

  1.**动态路由参数本地化**
  ```ts
  // nuxt.config.ts
  i18n: {
    routes: {
      product: {
        en: '/product/:slug',
        zh: '/产品/:slug',
        es: '/producto/:slug'
      }
    }
  }

  // 使用
  const route = useRoute()
  const localizedRoute = localePath({ 
    name: 'product', 
    params: { slug: 'my-product' } 
  })
  ```
  ---
  2.**处理缺失翻译**
  ```ts
  // 创建自定义缺失处理器
  export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.compilerOptions.warnHtmlMessage = false
    
    nuxtApp.$i18n.onMissing = (locale, key) => {
      console.warn(`Missing translation: ${key} for locale ${locale}`)
      return key // 返回键名作为后备
    }
  })
  ```
  ---
  3.**RTL 语言支持**
  ```vue
  <template>
    <div :dir="direction">
      <!-- 内容 -->
    </div>
  </template>

  <script setup>
  const { locale } = useI18n()
  const direction = computed(() => 
    ['ar', 'he', 'fa'].includes(locale.value) ? 'rtl' : 'ltr'
  )
  </script>
  ```
## 八、测试与质量保证

  1.**翻译覆盖率检测**
  ```json
  // package.json
  {
    "scripts": {
      "i18n:report": "nuxt i18n:report --locales en zh es"
    }
  }
  ```
  ---
  2.**E2E 多语言测试**
  ```ts
  // tests/e2e/specs/i18n.spec.ts
  describe('Internationalization', () => {
    const locales = ['en', 'zh', 'es']
    
    locales.forEach(locale => {
      it(`should render ${locale} content correctly`, () => {
        cy.visit(`/${locale}`)
        cy.get('h1').should('contain', locale === 'zh' ? '欢迎' : 'Welcome')
      })
    })
  })
  ```
  ---
  3.**自动化翻译检查**
  ```ts
  // 使用i18n-ally插件 (VS Code)
  // 配置 .vscode/settings.json
  {
    "i18n-ally.localesPaths": ["locales"],
    "i18n-ally.keystyle": "nested",
    "i18n-ally.sortKeys": true,
    "i18n-ally.enabledParsers": ["json"]
  }
  ```
## 九、最佳实践与注意事项

  1.**组织规范**

  - **键名命名**：使用命名空间 (如 `product.title·)
  - **文件结构**：按功能模块而非语言组织
  - **避免硬编码**：所有用户可见文本使用翻译键
  ---
  2.**内容管理**
  - **参数化文本**：`"welcome": "Hello, {name}!"`
  - **避免拼接**：使用完整句子而非拼接片段
  - **文化适配**：日期/数字/货币格式本地化
  ---
  3.**技术优化**
  - **CDN 分发**：将语言文件托管到 CDN
  - **长期缓存**：为语言文件添加内容哈希
  - **按需加载**：只加载用户需要的语言
  ---
  4.**SEO 关键点**
  - **hreflang 标签**：确保所有语言版本互链
  - **规范链接**：指定语言版本的规范 URL
  - **语言检测**：正确实现浏览器语言重定向
  - **内容一致性**：不同语言内容质量保持一致
## 总结

  Nuxt3 国际化核心要点：

  1.**模块化架构**：

  - 使用 @nuxtjs/i18n 作为核心
  - 支持懒加载和按需加载
  - 无缝集成 Vue I18n
  ---
  2.**路由策略**：

  - 多种 URL 策略可选
  - 自动路由本地化
  - 支持动态参数翻译
  ---
  3.**资源管理**：

  - JSON/YAML 文件支持
  - 模块化语言文件组织
  - 按需加载机制
  ---
  4.**SEO 优化**：

  - 自动 hreflang 生成
  - 多语言 sitemap
  - 语言元数据优化
  ---
  5.**高级功能**：

  - 日期/时间本地化
  - 货币/数字格式化
  - RTL 语言支持
  ---
  关键注意事项：
  - **避免键名冲突**：使用命名空间前缀
  - **处理动态内容**：预留翻译插槽
  - **测试所有语言**：确保布局不会错位
  - **监控翻译覆盖率**：保持翻译完整性
  - **考虑文化差异**：不仅仅是文本翻译
  ---
  通过合理实施 Nuxt3 的国际化方案，可以：

  - 提升全球用户覆盖 30-50%
  - 改善国际用户转化率 20-40%
  - 增强搜索引擎可见性
  - 提升用户满意度和留存率
  ---
  最后建议：

  - 使用专业翻译服务保证质量
  - 建立持续本地化流程
  - 监控不同语言版本的用户行为差异
  - 定期审计国际化实现效果
