# app.config.ts
::: details 理论阐述
  
  **1. 什么是 app.config.ts 文件？**
  > - `app.config.ts` 是 Nuxt3 用于管理应用运行时配置的文件。它提供了一种在构建时定义、运行时访问的配置机制，特别适合存储需要在客户端访问的公共配置。
  ---
  **2. 有什么用？**
  > - **运行时配置**：提供可在客户端访问的配置值
  > - **类型安全**：通过 TypeScript 提供强类型配置
  > - **热更新**：开发模式下修改配置自动热更新
  > - **环境无关**：不依赖环境变量，直接注入运行时
  > - **响应式访问**：通过 `useAppConfig()` 组合式函数访问
  ---
  **3. 关键特性**
  > - **配置值在构建时确定**
  > - **值会自动序列化并包含在客户端包中**
  > - **支持嵌套配置对象**
  > - **可通过组合式函数响应式访问**
  > - **支持 TypeScript 类型推断**
  ---
  **4. 文件位置**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  your-project/
    ├── app.config.ts     # 应用运行时配置
    ├── nuxt.config.ts    # 应用构建时配置
    ├── package.json      # 其他同级文件或目录
    └── ...               # 其他同级文件或目录
  ```
  ---
  **5. 需要配置吗？**
  > - **是可选文件**，但强**烈推荐使用**。创建后会由 Nuxt 自动加载并处理。
  ---
  **6.  与 nuxt.config.ts 的区别：**

  |  **特性**  |  **app.config.ts**  |  **nuxt.config.ts**  |
  |  ---  |  ---  |  ---  |
  |  配置类型  |  运行时配置  |  构建时配置  |
  |  访问位置  |  客户端和服务端  |  仅服务端/构建时  |
  |  访问方式  |  `useAppConfig()`  |  `useRuntimeConfig()`  |
  |  环境变量  |  不直接使用  |  通过`runtimeConfig`使用  |
  |  热更新  |  支持开发时热更新  |  需要重启  |
  |  敏感数据  |  只适合公开数据  |  可包含私有数据  |
  |  主要用途  |  主题、UI配置、公共API端点等  |  模块配置、构建选项、环境变量等  |
  |  文件位置  |  根目录  |  根目录  |
  ---
:::
  
::: details 代码示例

  **1. 基础配置**
  
  **`app.config.ts`：**

  ```ts
  export default defineAppConfig({
    // 应用基本信息
    app: {
      name: '我的Nuxt应用',
      version: '1.0.0',
      baseURL: '/'
    },
    
    // UI主题配置
    theme: {
      primary: '#3b82f6',
      secondary: '#10b981',
      darkMode: false
    },
    
    // API端点配置
    api: {
      baseUrl: 'https://api.example.com',
      endpoints: {
        users: '/users',
        products: '/products'
      }
    },
    
    // 功能开关
    features: {
      darkMode: true,
      analytics: false
    }
  })
  ```
  ---
  **2. 在组件中访问配置**
  ```vue
  <script setup>
    const appConfig = useAppConfig()

    // 响应式访问配置
    const isDarkMode = computed(() => appConfig.theme.darkMode)

    // 使用配置值
    const apiUrl = computed(() => 
      `${appConfig.api.baseUrl}${appConfig.api.endpoints.products}`
    )
  </script>

  <template>
    <div :class="{'dark': isDarkMode}">
      <h1>{{ appConfig.app.name }} v{{ appConfig.app.version }}</h1>
      <button @click="appConfig.theme.darkMode = !appConfig.theme.darkMode">
        切换主题
      </button>
    </div>
  </template>
  ```
  ---
  **3. 类型安全配置**
  ```ts
  declare module '@nuxt/schema' {
    interface AppConfig {
      app: {
        name: string
        version: string
        baseURL: string
      }
      theme: {
        primary: string
        secondary: string
        darkMode: boolean
      }
      api: {
        baseUrl: string
        endpoints: Record<string, string>
      }
      features: {
        darkMode: boolean
        analytics: boolean
      }
    }
  }

  export {}
  ```
  ---
:::
  
::: details 问题补充

  **1. 配置覆盖与层级**
  ```ts
  // 默认配置
  export default defineAppConfig({
    theme: { primary: '#3b82f6' }
  })

  // 在页面中覆盖配置
  definePageMeta({
    appConfig: {
      theme: { primary: '#ef4444' } // 页面级覆盖
    }
  })
  ```
  ---
  **2. 响应式更新**
  ```vue
  <script setup>
    const appConfig = useAppConfig()

    // 响应式切换功能
    watch(() => appConfig.features.analytics, (enabled) => {
      if (enabled) initAnalytics()
      else disableAnalytics()
    })
  </script>
  ```
  ---
  **3. 与运行时配置集成**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    runtimeConfig: {
      public: {
        apiSecret: 'public_key' // 公共环境变量
      },
      private: {
        adminKey: 'secret_key'  // 私有环境变量
      }
    }
  })

  // app.config.ts
  export default defineAppConfig({
    api: {
      // 集成公共环境变量
      key: useRuntimeConfig().public.apiSecret
    }
  })
  ```
  ---
  **4. 多环境管理**
  ```ts
  // app.config.ts
  const envConfig = {
    development: {
      api: { baseUrl: 'https://dev.api.example.com' }
    },
    production: {
      api: { baseUrl: 'https://api.example.com' }
    }
  }

  export default defineAppConfig({
    ...envConfig[process.env.NODE_ENV || 'development'],
    
    // 公共配置
    app: {
      name: '我的应用'
    }
  })
  ```
  ---
  **5. 配置扩展函数**
  ```ts
  // app.config.ts
  export default defineAppConfig({
    theme: {
      primary: '#3b82f6'
    },
    
    // 配置方法
    getThemeColor(type: 'primary' | 'secondary' = 'primary') {
      const colors = {
        primary: this.theme.primary,
        secondary: this.theme.secondary || '#10b981'
      }
      return colors[type]
    }
  })
  ```
  ---
  **6. 最佳实践**

  1.**分层配置：**

  ```ts
  // 基础配置
  const baseConfig = {
    theme: { primary: '#3b82f6' }
  }

  // 环境特定配置
  const envConfig = {
    production: { api: { baseUrl: 'https://prod.api' } },
    staging: { api: { baseUrl: 'https://staging.api' } }
  }

  export default defineAppConfig({
    ...baseConfig,
    ...(envConfig[process.env.NODE_ENV] || {})
  })
  ```

  2.**配置分组：**

  ```ts
  export default defineAppConfig({
    ui: {
      button: {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-500 text-white'
      }
    },
    analytics: {
      enabled: true,
      id: 'UA-XXXXX-Y'
    }
  })
  ```
  
  3.**类型安全：**

  ```ts
  // schema/app.config.ts
  export default defineAppConfig({
    seo: {
      title: '默认标题',
      description: '默认描述'
    }
  })

  // types/app.config.d.ts
  declare module '@nuxt/schema' {
    interface AppConfig {
      seo: {
        title: string
        description: string
        image?: string
      }
    }
  }
  ```

  4.**响应式更新：**

  ```vue
  <script setup>
    const appConfig = useAppConfig()

    // 响应式更新页面标题
    watch(() => appConfig.seo.title, (newTitle) => {
      useHead({ title: newTitle })
    })
  </script>
  ```

  5.**配置验证：**

  ```ts
  // 使用zod进行配置验证
  import { z } from 'zod'

  const configSchema = z.object({
    theme: z.object({
      primary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
      darkMode: z.boolean()
    })
  })

  export default defineAppConfig(
    configSchema.parse({
      theme: {
        primary: '#3b82f6',
        darkMode: false
      }
    })
  )
  ```
  ---
  **7. 常见错误**

  1.**存储敏感数据：**

  ```ts
  // 错误：在app.config中存储敏感信息
  export default defineAppConfig({
    api: {
      secretKey: 'my_secret' // ❌ 会被暴露在客户端
    }
  })
  ```

  2.**过度使用：**

  ```ts
  // 错误：将动态内容放在配置中
  export default defineAppConfig({
    userPreferences: {} // ❌ 应使用状态管理
  })
  ```

  3.**类型不匹配：**

  ```ts
  // 错误：类型定义与实际配置不匹配
  declare module '@nuxt/schema' {
    interface AppConfig {
      theme: string // ❌ 实际是对象
    }
  }
  ```

  4.**环境变量误用：**

  ```ts
  // 错误：直接使用环境变量
  export default defineAppConfig({
    apiUrl: process.env.API_URL // ❌ 不会在客户端更新
  })
  ```

  5.**大型配置对象：**

  ```ts
  // 错误：配置对象过于庞大
  export default defineAppConfig({
    // 数千行配置... // ❌ 影响性能
  })
  ```
  ---
  **8. 高级技巧**

  1.**主题切换器实现**

  **`app.config.ts`：**

  ```ts
  export default defineAppConfig({
    theme: {
      current: 'light',
      schemes: {
        light: {
          primary: '#3b82f6',
          background: '#ffffff'
        },
        dark: {
          primary: '#60a5fa',
          background: '#1f2937'
        }
      }
    }
  })
  ```

  组件中使用：

  ```vue
  <script setup>
    const appConfig = useAppConfig()

    function toggleTheme() {
      appConfig.theme.current = appConfig.theme.current === 'light' ? 'dark' : 'light'
      
      // 更新CSS变量
      const scheme = appConfig.theme.schemes[appConfig.theme.current]
      document.documentElement.style.setProperty('--primary', scheme.primary)
      document.documentElement.style.setProperty('--background', scheme.background)
    }
  </script>
  ```

  2.**功能开关系统**
  ```ts
  export default defineAppConfig({
    features: {
      newDashboard: false,
      experimentalAPI: true,
      legacySupport: false
    }
  })

  // 在组件中
  const { features } = useAppConfig()

  if (features.experimentalAPI) {
    // 启用实验性功能
  }
  ```

  3.**多语言配置**
  ```ts
  export default defineAppConfig({
    i18n: {
      defaultLocale: 'zh',
      locales: [
        { code: 'zh', name: '中文' },
        { code: 'en', name: 'English' }
      ],
      messages: {
        zh: {
          welcome: '欢迎'
        },
        en: {
          welcome: 'Welcome'
        }
      }
    }
  })
  ```

  4.**配置持久化**
  ```ts
  export default defineAppConfig({
    userPreferences: {
      darkMode: false,
      fontSize: 16
    }
  })

  // 在插件中同步到localStorage
  export default defineNuxtPlugin(() => {
    const appConfig = useAppConfig()
    
    // 从存储加载
    if (process.client) {
      const saved = localStorage.getItem('userPreferences')
      if (saved) Object.assign(appConfig.userPreferences, JSON.parse(saved))
    }
    
    // 监听变化
    watch(() => appConfig.userPreferences, (newPrefs) => {
      localStorage.setItem('userPreferences', JSON.stringify(newPrefs))
    }, { deep: true })
  })
  ```

  5.**配置版本控制**
  ```ts
  export default defineAppConfig({
    meta: {
      configVersion: '1.2'
    }
  })

  // 检查配置版本
  export default defineNuxtPlugin(() => {
    const appConfig = useAppConfig()
    
    if (process.client) {
      const savedVersion = localStorage.getItem('configVersion')
      if (savedVersion !== appConfig.meta.configVersion) {
        // 重置配置或执行迁移
        localStorage.clear()
        localStorage.setItem('configVersion', appConfig.meta.configVersion)
      }
    }
  })
  ```
  ---
:::
  
::: details 重要补充

  > - 在Nuxt 3项目中，`app.config.ts`和`nuxt.config.ts`的核心差异在于配置生效的阶段和动态性，理解“运行时（Runtime）”与“构建时（Build-time）”是掌握两者区别的关键。以下从定义、功能案例和代码示例展开分析：
  ---
  **⚙️ 一、核心概念解析**

  1.**构建时（Build-time）**

  > - **定义**：指执行 `npm run build` 时，Nuxt将源代码编译为生产环境可部署文件（如HTML、JS、CSS）的过程。
  > - **特点**：配置值在构建后**固定不变**，需重新构建才能更新。
  > - **典型场景**：模块注册、构建优化、敏感环境变量注入。

  2.**运行时（Runtime）**

  > - **定义**：指应用已部署到服务器，用户通过浏览器访问时的执行阶段。
  > - **特点**：配置值可**动态修改**（如通过环境变量），无需重新构建应用。
  > - **典型场景**：动态主题切换、功能开关、API端点更新。
  ---

  **🧩 二、`nuxt.config.ts`：构建时配置**

  功能与案例
  - **作用**：配置构建过程，影响最终产物的结构和行为。

  - **适用场景**：

  > - 注册模块（如Pinia、TailwindCSS）
  > - 配置构建工具（Vite/Webpack）
  > - 定义**环境变量**（通过`runtimeConfig`）
  > - 设置路由规则、服务器中间件。

  代码示例
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss'],  // 构建时注册模块
    runtimeConfig: {
      apiSecret: 'default_key',        // 敏感值（构建时被环境变量覆盖）
      public: {
        apiBase: process.env.API_BASE  // 公共API地址（构建时确定）
      }
    },
    vite: {                            // 构建工具配置
      optimizeDeps: { include: ['vue'] }
    }
  })
  ```

  关键特性：

  > - `runtimeConfig`中的值需通过`NUXT_`前缀的环境变量覆盖（如`NUXT_API_SECRET=new_key`）。
  > - 构建后，`apiSecret`等私有变量仅服务端可访问，避免客户端暴露敏感数据。
  ---
  **🔄 三、`app.config.ts`：运行时配置**

  功能与案例

  - **作用**：提供应用运行期间的动态配置，支持响应式更新。
  - **适用场景**：

  > - 主题管理（亮/暗模式切换）
  > - 功能开关（A/B测试、实验性功能）
  > - 非敏感全局设置（标题、元数据）。

  代码示例
  ```ts
  // app.config.ts
  export default defineAppConfig({
    theme: {
      primaryColor: '#3b82f6',   // 主题色（运行时可修改）
      darkMode: false            // 暗模式开关
    },
    features: {
      analytics: true            // 功能开关（可动态启停）
    }
  })
  ```

  ```vue
  <!-- 组件中使用 -->
  <script setup>
  const appConfig = useAppConfig()
  // 响应式切换暗模式
  const isDark = computed(() => appConfig.theme.darkMode)
  </script>

  <template>
    <div :class="{ 'dark': isDark }">
      <button @click="appConfig.theme.darkMode = !appConfig.theme.darkMode">
        切换主题
      </button>
    </div>
  </template>
  ```

  关键特性：

  > - **热更新（HMR）**：修改配置后无需刷新页面，即时生效。
  > - **全客户端可用**：所有配置均暴露给浏览器。
  > - **类型安全**：支持TS接口扩展（如限制primaryColor为特定色值）。
  ---
  **📊 四、对比总结**
  |  **特性**  |  **`nuxt.config.ts` (构建时)**  |  **`app.config.ts` (运行时)**  |
  |  ---  |  ---  |  ---  |
  |  生效阶段  |  构建阶段固定  |  应用运行时动态更新  |
  |  敏感数据  |  ✅ 支持私有密钥（仅服务端）  |  ❌ 禁止存储敏感信息  |
  |  环境变量覆盖  |  ✅ 通过`NUXT_`前缀变量  |  ❌ 不支持  |
  |  热更新 (HMR)  |  ❌ 需重启服务  |  ✅ 修改后即时生效  |
  |  客户端访问  |  仅`public`字段  |  ✅ 全部配置  |
  |  典型用例  |  模块注册、构建优化、私有环境变量  |  主题、功能开关、UI配置  |
  ---
  **💡 五、如何选择？**
  - **选`nuxt.config.ts`**：
  > - 需区分环境（开发/生产）、含敏感数据（API密钥）、依赖构建过程的行为（如压缩配置）。

  - **选`app.config.ts`**：
  > - 需动态调整（如用户切换主题）、非敏感全局设置、需HMR提升开发效率的场景。

  > - 案例：电商项目中，支付网关密钥通过`nuxt.config.ts`的`runtimeConfig`注入（避免泄露），而商品页主题色通过`app.config.ts`管理（支持用户实时切换）
:::
  