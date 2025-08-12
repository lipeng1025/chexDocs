# nuxt.config.ts
## 核心概念
  `nuxt.config.ts` 是 Nuxt3 项目的**核心配置文件**，控制框架行为、模块集成、构建设置和应用元数据。
## 1. 基本结构
  ```typescript
  import { defineNuxtConfig } from 'nuxt'

  export default defineNuxtConfig({
    // 所有配置项写在这里
  })
  ```
## 2. 应用配置 (app)
  
  控制全局应用行为和头部设置
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `baseURL`  |  string  |  应用基础路径  |  `'/app/'`  |
  |  `buildAssetsDir`  |  string  |  构建资源目录  |  `'/_nuxt/'`  |
  |  `cdnURL`  |  string  |  CDN 地址  |  `'https://cdn.example.com'`  |
  |  `head`  |  object  |  全局头部标签  |  示例(head 配置)  |
  |  `keepalive`  |  boolean  |  组件缓存  |  `true`  |
  |  `layoutTransition`  |  object  |  布局过渡动画  |  `{ name: 'fade' }`  |
  |  `pageTransition`  |  object  |  页面过渡动画  |  `{ name: 'slide' }`  |
  |  `rootId`  |  string  |  根元素 ID  |  `'__nuxt_app'`  |
  |  `rootTag`  |  string  |  根元素标签  |  `'div'`  |

  head 配置
  ```typescript
  head: {
    title: 'My App',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { src: 'https://analytics.example.com/script.js', async: true }
    ]
  }
  ```
## 3. 模块配置 (modules)

  集成 Nuxt 模块
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `modules`  |  array  |  模块列表  |  `['@nuxtjs/tailwindcss']`  |
  |  `buildModules`  |  array  |  开发环境模块  |  `['@nuxt/devtools']'`  |
  ```typescript
  modules: [
    '@nuxt/image',       // 图片优化模块
    '@pinia/nuxt',      // 状态管理
    '@nuxtjs/i18n'      // 国际化
  ]
  ```
## 4. 构建配置 (build)

  控制构建过程
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `analyze`  |  boolean/object  |  包分析器  |  `true`  |
  |  `babel`  |  object  |  Babel 配置  |  `{ presets: ['@babel/preset-env'] }`  |
  |  `loaders`  |  object  |  文件加载器  |  示例(loaders 配置)  |
  |  `optimization`  |  object  |  优化配置  |  `{ minimize: true }`  |
  |  `transpile`  |  array  |  转译依赖  |  `['lodash-es']`  |
  |  `templates`  |  array  |  自定义模板  |  示例(templates 配置)  |

  loaders 配置
  ```typescript
  build: {
    loaders: {
      scss: { 
        additionalData: '@use "~/assets/scss/vars.scss" as *;' 
      },
      vue: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('my-')
        }
      }
    }
  }
  ```

  templates 配置
  ```typescript
  build: {
    templates: [
      {
        src: 'templates/custom.html',
        dst: 'views/custom.html',
        options: { 
          title: 'Custom Page' 
        }
      }
    ]
  }
  ```
## 5. 运行时配置 (runtimeConfig)

  环境变量和运行时设置
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `public`  |  object  |  客户端可访问变量  |  `{ apiBase: '/api' }`  |
  |  `private`  |  object  |  仅服务端变量  |  `{ adminToken: 'secret' }`  |

  ```typescript
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || '/api'
    },
    stripeSecret: process.env.STRIPE_SECRET_KEY // 默认仅服务端
  }
  ```
## 6. 目录配置
  |  **属性**  |  **类型**  |  **说明**  |  **默认值**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `srcDir`  |  string  |  源码目录  |  `'/'`  |
  |  `rootDir`  |  string  |  根目录  |  `process.cwd()`  |
  |  `dir`  |  object  |  自定义目录  |  示例  |

  dir 配置
  ```typescript
  dir: {
    assets: 'resources',     // 资源文件
    layouts: 'designs',      // 布局文件
    middleware: 'middlewares', // 中间件
    pages: 'views',          // 页面
    public: 'static'         // 静态文件
  }
  ```
## 7. 类型检查 (typescript)

  TypeScript 配置
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `strict`  |  boolean  |  严格模式  |  `true`  |
  |  `typeCheck`  |  boolean/object  |  类型检查  |  `{ eslint: true }`  |
  |  `tsConfig`  |  object  |  TS 覆盖配置  |  `{ compilerOptions: { strict: true } }`  |

  ```typescript
  typescript: {
    strict: true,
    typeCheck: {
      eslint: {
        files: './**/*.{ts,js,vue}'
      }
    }
  }
  ```
## 8. 渲染配置 (ssr)

  服务端渲染控制
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `ssr`  |  boolean  |  启用 SSR  |  `true`  |
  |  `target`  |  string  |  构建目标  |  `'static'`  |
  |  `spaLoadingTemplate`  |  string  |  SPA 加载模板  |  `'spa-loading-template.html'`  |
  
## 9. 路由配置 (router)

  路由行为控制
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  options  |  object  |  Vue Router 配置  |  `{ linkActiveClass: 'active' }`  |
  |  routes  |  function  |  动态路由  |  示例(routes 配置)  |

  routes 配置
  ```typescript
  router: {
    options: {
      scrollBehavior(to, from, savedPosition) {
        return { top: 0 }
      }
    },
    routes: (_routes) => [
      ..._routes,
      { path: '/custom', component: '~/pages/custom.vue' }
    ]
  }
  ```
## 10. 别名配置 (alias)

  路径别名设置
  ```typescript
  alias: {
    '@components': './components',
    '@styles': './assets/scss'
  }
  ```
## 11. 环境配置 (env)

  环境变量映射
  ```typescript
  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  }
  ```
## 12. 钩子配置 (hooks)

  Nuxt 生命周期钩子
  ```typescript
  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name: 'custom',
        path: '/custom',
        file: '~/pages/custom.vue'
      })
    },
    'build:done'(builder) {
      console.log('构建完成！')
    }
  }
  ```
## 13. 插件配置 (plugins)

  全局插件注册
  ```typescript
  plugins: [
    '~/plugins/analytics.client.ts', // 仅客户端
    '~/plugins/init.server.ts',      // 仅服务端
    { 
      src: '~/plugins/directives.ts', 
      mode: 'all'                    // 所有环境
    }
  ]
  ```
## 14. 自动导入配置 (imports)

  自动导入控制
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `autoImport`  |  boolean  |  启用自动导入  |  `true`  |
  |  `dirs`  |  array  |  扫描目录  |  `['./composables']`  |
  |  `global`  |  boolean  |  全局导入  |  `false`  |

  ```typescript
  imports: {
    dirs: [
      'composables',
      'composables/*/index.{ts,js}'
    ],
    presets: [
      { 
        from: 'vue-i18n', 
        imports: ['useI18n'] 
      }
    ]
  }
  ```
## 15. 组件配置 (components)

  组件自动导入
  ```typescript
  components: {
    global: true,          // 全局自动导入
    dirs: ['~/components'], // 扫描目录
    extensions: ['.vue'],  // 文件扩展名
    prefix: 'App'          // 组件前缀
  }
  ```
## 16. Nitro 配置

  服务端引擎配置
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `preset`  |  string  |  部署目标  |  `'node-server'`  |
  |  `serveStatic`  |  boolean  |  静态文件服务  |  `true`  |
  |  `storage`  |  object  |  存储配置  |  示例(storage 配置)  |
  |  `routeRules`  |  object  |  路由规则  |  示例(routeRules 配置)  |

  storage 配置
  ```typescript
  nitro: {
    storage: {
      'redis': {
        driver: 'redis',
        url: 'redis://localhost:6379'
      },
      'db': {
        driver: 'fs',
        base: './data'
      }
    }
  }
  ```

  routeRules 配置
  ```typescript
  nitro: {
    routeRules: {
      '/api/**': { 
        cache: { 
          maxAge: 60 * 60 
        },
        cors: true
      },
      '/admin/**': { 
        ssr: false 
      },
      '/static/**': { 
        static: true 
      }
    }
  }
  ```
## 17. 开发工具配置 (devtools)

  开发者工具设置
  ```typescript
  devtools: {
    enabled: true,
    timeline: {
      enabled: true
    },
    vscode: {
      startOnBoot: true
    }
  }
  ```
## 18. 实验性配置 (experimental)

  启用新特性
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `componentIslands`  |  boolean  |  组件群岛  |  `true` |
  |  `crossOriginPrefetch`  |  boolean  |  跨域预取  |  `false` |
  |  `externalVue`  |  boolean  |  外部 Vue  |  `false` |
  |  `inlineSSRStyles`  |  boolean  |  内联 SSR 样式  |  `true` |
  |  `payloadExtraction`  |  boolean  |  负载提取  |  `true` |
  |  `reactivityTransform`  |  boolean  |  响应式转换  |  `true` |
  |  `viewTransition`  |  boolean  |  View Transitions API  |  `true` |
## 19. 其他关键配置
  |  **属性**  |  **类型**  |  **说明**  |  **示例**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  `css`  |  array  |  全局 CSS 文件  |  `['~/assets/main.css']`  |
  |  `devServer`  |  object  |  开发服务器  |  `{ port: 4000 }`  |
  |  `features`  |  object  |  功能开关  |  `{ inlineStyles: false }`  |
  |  `ignore`  |  array  |  忽略文件  |  `['**/*.test.ts']`  |
  |  `sourcemap`  |  boolean/object  |  源码映射  |  `{ server: true }`  |
  |  `vite`  |  object  |  Vite 配置  |  [Vite 文档](https://vitejs.dev/config/)  |
  |  `webpack`  |  object  |  Webpack 配置  |  [Webpack 文档](https://webpack.js.org/configuration/)  |

## 最佳实践指南

  1.**环境区分配置**

  ```typescript
  const isProduction = process.env.NODE_ENV === 'production'

  export default defineNuxtConfig({
    devtools: { enabled: !isProduction },
    sourcemap: !isProduction,
    css: isProduction ? ['minified.css'] : ['debug.css']
  })
  ```

  2.**配置模块顺序**

  ```typescript
  modules: [
    // 基础模块
    '@nuxtjs/tailwindcss',
    
    // 功能模块
    '@pinia/nuxt',
    
    // 最后加载
    '~/modules/custom'
  ]
  ```

  3.**安全配置**

  ```typescript
  runtimeConfig: {
    secretKey: process.env.SECRET_KEY, // 不暴露给客户端
    public: {
      safeKey: process.env.PUBLIC_KEY // 客户端可访问
    }
  },
  routeRules: {
    '/admin/**': { 
      appMiddleware: ['auth'] 
    }
  }
  ```

  4.**性能优化**

  ```typescript
  nitro: {
    compressPublicAssets: true,
    routeRules: {
      '/_nuxt/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=31536000' 
        }
      }
    }
  },
  experimental: {
    payloadExtraction: true,
    inlineSSRStyles: true
  }
  ```

## 错误处理与调试
  
  1.**配置验证**

  ```bash
  npx nuxi config-validate
  ```

  2.**调试配置**

  ```typescript
  export default defineNuxtConfig({
    debug: true,  // 启用调试模式
    hooks: {
      'config:resolved'(config) {
        console.log('Resolved config:', config)
      }
    }
  })
  ```

  3.**常见错误**

  - **模块顺序问题**：某些模块依赖顺序（如 Pinia 需在 i18n 之前）
  - **路径别名冲突**：避免自定义别名与 Nuxt 默认冲突
  - **环境变量未加载**：确保 `.env` 文件存在且变量前缀正确
  - **类型错误**：运行 `npx nuxi typecheck` 检查
  ---
  **💡 核心提示**：`nuxt.config.ts` 是 Nuxt3 项目的控制中心，建议：

  1. 按功能模块分区配置
  2. 使用 JSDoc 注释说明重要配置
  3. 定期检查[官方配置变更](https://nuxt.com/docs/api/configuration/nuxt-config)
  4. 复杂项目拆分为多个配置文件

  ```typescript
  import apiConfig from './config/api'  
  import uiConfig from './config/ui'  
  
  export default defineNuxtConfig({  
    ...apiConfig,  
    ...uiConfig  
  })
  ```
## 完整文件配置

  [nuxt.config.ts更详细的配置](https://nuxt.com/docs/4.x/api/nuxt-config)
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    // 1. 应用配置
    app: {
      head: {},
      layoutTransition: {},
      pageTransition: {},
      keepalive: false
    },
    
    // 2. 运行时配置
    runtimeConfig: {
      public: {},
      private: {}
    },
    
    // 3. 模块配置
    modules: [],
    
    // 4. 组件配置
    components: true,
    
    // 5. 目录配置
    dir: {
      assets: 'assets',
      layouts: 'layouts',
      middleware: 'middleware',
      pages: 'pages',
      public: 'public',
      plugins: 'plugins'
    },
    
    // 6. 自动导入配置
    imports: {
      dirs: [],
      global: false
    },
    
    // 7. 别名配置
    alias: {},
    
    // 8. 构建配置
    build: {},
    
    // 9. Vite 配置
    vite: {},
    
    // 10. Webpack 配置（不推荐，优先使用 Vite）
    webpack: {},
    
    // 11. CSS 配置
    css: [],
    
    // 12. 开发工具配置
    devtools: {
      enabled: false
    },
    
    // 13. 实验性功能
    experimental: {},
    
    // 14. TypeScript 配置
    typescript: {
      strict: true,
      typeCheck: true
    },
    
    // 15. SSR 配置
    ssr: true,
    
    // 16. Nitro 配置
    nitro: {
      routeRules: {},
      storage: {},
      devProxy: {}
    },
    
    // 17. 路由配置
    router: {},
    
    // 18. 钩子配置
    hooks: {},
    
    // 19. 构建后处理
    postcss: {},
    
    // 20. 源文件配置
    sourcemap: false,
    
    // 21. 调试配置
    debug: false,
    
    // 22. 功能标志
    features: {},
    
    // 23. 生成配置
    generate: {},
    
    // 24. 插件配置
    plugins: [],
    
    // 25. 忽略前缀
    ignorePrefix: '-',
    
    // 26. 忽略选项
    ignoreOptions: {},
    
    // 27. 服务器配置
    server: {},
    
    // 28. 开发服务器配置
    devServer: {}
  })
  ```





