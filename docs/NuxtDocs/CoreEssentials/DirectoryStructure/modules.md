# modules
::: details 理论阐述

  **🧠 核心概念**

  > - `modules/` 是存放**本地 Nuxt 模块**的目录，用于创建可在项目中复用或共享的自定义功能扩展。
  ---
  **🚫 开发者须知（最重要！）**

  > - **非官方模块**：存放自己开发的模块（官方模块直接通过 npm 安装）
  > - **模块化开发**：每个子目录是一个独立模块
  > - **按需加载**：在 nuxt.config.ts 中注册使用
  > - **功能封装**：适合封装复杂/复用功能
  ---
  **📁 目录结构示例**

  这里只是一个参考：
  ``` text
  modules/
    ├── analytics/       # 分析模块
    │   ├── index.ts     # 模块入口
    │   ├── plugin.ts    # Vue插件
    │   └── utils.ts     # 工具函数
    ├── auth/            # 认证模块
    └── ui-components/   # UI组件库模块
  ```
  ---
  **⚙️ 核心功能**
  
  > **1: 模块代码** - **2: nuxt.config.ts注册** - **3: Nuxt构建时加载** - **4: 扩展应用功能**
  ---
  **💡 基础使用**
  
  1.**创建模块：**
  ```ts
  // modules/analytics/index.ts
  import { defineNuxtModule } from '@nuxt/kit'

  export default defineNuxtModule({
    meta: {
      name: 'analytics-module'
    },
    setup(options, nuxt) {
      // 添加分析脚本
      nuxt.options.head.script.push({
        src: 'https://analytics.example.com/script.js',
        defer: true
      })
    }
  })
  ```

  2.**注册模块：**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: [
      // 本地模块
      './modules/analytics',
      
      // 官方模块
      '@nuxtjs/tailwindcss'
    ]
  })
  ```
  ---
  **🌟 关键知识点**

  1.**模块能力：**
  > - 添加Vue插件
  > - 注册服务器路由
  > - 修改Webpack/Vite配置
  > - 添加自定义模板
  > - 扩展运行时上下文

  2.**生命周期钩子：**
  ```ts
  setup(options, nuxt) {
    nuxt.hook('pages:extend', (pages) => {
      // 添加自定义路由
      pages.push({
        name: 'custom-route',
        path: '/custom',
        file: '~/pages/custom.vue'
      })
    })
  }
  ```
  
  3.**模块配置：**
  ```ts
  export default defineNuxtModule({
    defaults: { // 默认配置
      apiKey: ''
    },
    setup(options) {
      console.log('API Key:', options.apiKey)
    }
  })
  ```
  ---
  **💡 实用技巧**

  1.**模块开发模板：**
  ```bash
    npx nuxi init --template module my-module
  ```

  2.**模块测试：**
  ```ts
    // 在模块中添加测试环境逻辑
  if (process.env.NODE_ENV === 'development') {
    console.log('开发模式专用逻辑')
  }
  ```

  3.**内容嵌套：**
  > - 将模块目录转为独立npm包
  > - 通过 `npm publish` 发布
  > - 其他项目通过 `npm install your-module` 使用
  ---
  **⚠️ 常见问题**

  1.**模块未生效：**
  > - 确保在 `nuxt.config.ts` 中正确注册
  > - 检查模块路径是否正确

  2.**依赖问题：**
  ```ts
  // 在模块中声明依赖
  export default defineNuxtModule({
    meta: {
      requires: ['@nuxtjs/i18n'] // 需要i18n模块
    }
  })
  ```
  ---
  **📚 学习资源**
  > - [官方模块指南](https://nuxt.com/docs/guide/going-further/modules)
  > - [模块开发示例](https://github.com/nuxt/module-builder)
  > - [Nuxt Kit 文档](https://nuxt.com/docs/guide/going-further/kit)
  ---
  > 💡 提示：`modules/` 就像你的私人工具库 - 将常用功能封装成模块，让开发事半功倍！
:::
  