# .env
::: details 理论阐述

  **🧠 核心概念**

  > - `.env` 文件是**存储环境变量的配置文件**，用于在不同环境（开发/生产）中安全管理敏感数据和配置。
  ---
  **🚫 开发者须知（最重要！）**

  > - **绝不提交**：必须添加到 `.gitignore`（防止泄露密钥）
  > - **命名规范**：`.env` 用于本地开发，`.env.production` 用于生产
  > - **自动加载**：Nuxt 启动时自动读取
  > - **分层覆盖**：特定环境文件 > 通用 `.env` 文件
  ---
  **📁 目录结构示例**

  这里只是一个参考：
  ``` text
  项目根目录/
    ├── .env                # 通用环境变量
    ├── .env.development    # 开发环境特定变量
    ├── .env.production     # 生产环境特定变量
    └── .env.staging        # 预发布环境变量
  ```
  ---
  **⚙️ 工作流程**
  
  > **1: 应用启动** -> **2: 读取 .env 文件** -> **3: 注入 runtimeConfig** -> **4: 代码中访问**
  ---
  **💡 基础使用**
  
  1.**创建 .env 文件：**
  ```env
  # .env
  API_KEY=your_dev_key
  API_BASE=https://dev.api.example.com
  ```

  2.**在代码中访问：**
  ```ts
  // 客户端可访问的变量
  const runtimeConfig = useRuntimeConfig()
  console.log(runtimeConfig.public.apiBase)

  // 仅服务端可访问的变量
  console.log(runtimeConfig.apiKey)
  ```
  ---
  **🌟 关键知识点**

  1.**变量前缀规则：**
  |  **前缀**  |  **访问位置**  |  **示例**  |
  |  ---  |  ---  |  ---  |
  |  `PUBLIC_`  |  客户端+服务端  |  `PUBLIC_API_BASE`  |
  |  无前缀  |  仅服务端  |  `DB_PASSWORD`  |

  2.**环境文件加载顺序：**
  
  > - `.env.${NODE_ENV}`
  > - `.env`
  > - 系统环境变量

  3.**实际使用示例：**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    runtimeConfig: {
      apiKey: '', // 会被 .env 覆盖
      public: {
        apiBase: '' // 会被 PUBLIC_API_BASE 覆盖
      }
    }
  })
  ```
  ---
  **⚡️ 实用技巧**

  1.**多环境管理：**
  ```env
  # .env.development
  API_KEY=dev_12345
  PUBLIC_API_BASE=https://dev.api.com

  # .env.production
  API_KEY=prod_67890
  PUBLIC_API_BASE=https://api.com
  ```

  2.**类型安全配置：**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    runtimeConfig: {
      apiKey: process.env.API_KEY || 'default_key',
      public: {
        apiBase: process.env.PUBLIC_API_BASE || 'https://default.api'
      }
    },
    typescript: {
      shim: false,
      strict: true
    }
  })
  ```

  3.**敏感数据保护：**
  ```env
  # 正确：服务端专用变量
  DB_PASSWORD=s3cr3tP@ss

  # 危险：不要这样暴露给客户端
  PUBLIC_DB_PASSWORD=s3cr3tP@ss ❌
  ```
  ---
  **⚠️ 常见问题**

  1.**变量未生效：**
  ```bash
  # 解决方案：重启服务
  npm run dev --force
  ```

  2.**生产环境配置：**
  ```bash
  # 启动时指定环境
  NODE_ENV=production node .output/server/index.mjs
  ```

  3.**安全警告：**
  ```env
  # 错误：提交 .env 到版本控制
  git add .env ❌

  # 正确：添加 .env 到 .gitignore
  echo ".env*" >> .gitignore ✅
  ```
  ---
  **🔒 安全最佳实践**

  1.**密钥管理：**
  ```bash
  # 使用加密工具
  npm install dotenv-vault
  npx dotenv-vault new
  ```

  2.**访问控制：**
  ```ts
  // 服务端API示例
  export default defineEventHandler((event) => {
    const apiKey = useRuntimeConfig().apiKey
    const clientKey = getHeader(event, 'X-API-KEY')
    
    if (apiKey !== clientKey) {
      throw createError({ statusCode: 401 })
    }
  })
  ```

  3.**自动密钥轮换：**
  ```bash
  # 使用CI/CD工具定期更新密钥
  # GitHub Actions 示例
  - name: Rotate keys
    run: |
      echo "API_KEY=$(openssl rand -hex 32)" >> $GITHUB_ENV
  ```
  ---
  **📚 学习资源**
  > - [Nuxt 环境变量文档](https://nuxt.com/docs/guide/going-further/runtime-config)
  > - [dotenv 安全实践](https://www.dotenv.org/docs/security)
  > - [12因素应用原则](https://12factor.net/config)
  ---
  > 💡 提示：把 `.env` 文件想象成保险箱 - 把钥匙（敏感数据）锁在里面，只让授权人员（服务端）访问，公共区域（客户端）只展示非敏感信息！
:::
  