# package.json
::: details 理论阐述

  **🧠 核心概念**

  > - `package.json` 是 Node.js 项目的**核心依赖清单文件**，定义了项目元数据、依赖关系和执行脚本，是 Nuxt3 应用的"身份证"和"说明书"。
  ---
  **🚫 开发者须知（最重要！）**

  > - **项目必备**：没有它无法运行 `npm install` 或 `npm run dev`
  > - **手动编辑**：开发者需要直接修改此文件
  > - **版本控制**：必须提交到 Git 仓库
  > - **依赖中心**：所有模块依赖都在此声明
  ---
  **📋 关键字段说明**

  |  **字段名**  |  **作用说明**  |  **Nuxt3 示例值**  |
  |  ---  |  ---  |  ---  |
  |  `name`  |  项目名称  |  `"my-nuxt-app"`  |
  |  `version`  |  项目版本  |  `"1.0.0"`  |
  |  `scripts`  |  可运行的命令脚本  |  [见下方脚本示例]  |
  |  `dependencies`  |  生产环境依赖（会被打包）  |  `{ "vue": "^3.3.0" }`  |
  |  `devDependencies`  |  开发环境依赖（不打包）  |  `{ "nuxt": "^3.8.0" }`  |
  |  `type`  |  模块类型  |  `"module"`（必须）  |
  |  `engines`  |  所需 Node.js 版本  |  `{ "node": ">=16" }`  |

  ---
  **⚙️ Nuxt3 核心脚本**
  
  ```json
  "scripts": {
    "dev": "nuxt dev",          // 启动开发服务器
    "build": "nuxt build",      // 构建生产应用
    "preview": "nuxt preview",  // 本地预览生产构建
    "generate": "nuxt generate",// 静态站点生成
    "lint": "eslint .",         // 代码检查
    "start": "nuxt start"       // 生产环境启动（SSR模式）
  }
  ```
  ---
  **💡 基础操作**
  
  1.**添加依赖：**
  ```bash
  # 生产依赖
  npm install pinia

  # 开发依赖
  npm install eslint -D
  ```

  2.**运行命令：**
  ```bash
  # 开发模式
  npm run dev

  # 生产构建
  npm run build

  # 静态生成
  npm run generate
  ```
  ---
  **🌟 Nuxt3 特殊字段**

  1.**Nuxt 配置：**
  
  ```json
  "nuxt": {
    "extends": "./base.nuxt.config" // 扩展配置
  }
  ```

  2.**浏览器兼容：**
  
  ```json
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version"]
  }
  ```

  3.**私有包标记：**
  
  ```json
  "private": true // 防止意外发布
  ```
  ---
  **⚡️ 实用技巧**

  1.**多环境脚本：**
  ```json
  "scripts": {
    "dev:staging": "NODE_ENV=staging nuxt dev",
    "build:prod": "NODE_ENV=production nuxt build"
  }
  ```

  2.**组合命令：**
  ```json
  "scripts": {
    "rebuild": "rm -rf .nuxt && npm run build",
    "reset": "rm -rf node_modules .nuxt .output && npm install"
  }
  ```

  3.**钩子脚本：**
  ```json
  "scripts": {
    "prebuild": "npm run lint",    // 构建前自动执行
    "postinstall": "nuxt prepare"  // 安装后自动执行
  }
  ```
  ---
  **⚠️ 常见错误**

  1.**依赖版本冲突：**
  ```json
  // 错误：同时存在Nuxt2和Nuxt3
  "dependencies": {
    "nuxt": "^2.16.0", ❌
    "nuxt3": "latest"  ❌
  }
  ```

  2.**缺少关键字段：**
  ```json
  // 必须包含
  "type": "module" ✅
  ```

  3.**错误脚本名：**
  ```json
  // 正确
  "scripts": {
    "dev": "nuxt dev" ✅
  }

  // 错误（旧版）
  "scripts": {
    "dev": "nuxt3 dev" ❌
  }
  ```
  ---
  **🔒 安全最佳实践**

  1.**依赖版本锁定：**
  ```bash
  # 始终使用 package-lock.json
  npm install --package-lock-only
  ```

  2.**漏洞扫描：**
  ```bash
  # 定期检查
  npm audit
  ```

  3.**依赖清理：**
  ```bash
  # 检查未使用依赖
  npx depcheck
  ```
  ---
  **📚 完整 Nuxt3 package.json 示例**
  ```json
  {
    "name": "my-nuxt-app",
    "version": "1.0.0",
    "private": true,
    "type": "module",
    "scripts": {
      "dev": "nuxt dev",
      "build": "nuxt build",
      "preview": "nuxt preview",
      "generate": "nuxt generate",
      "lint": "eslint .",
      "start": "nuxt start",
      "postinstall": "nuxt prepare"
    },
    "dependencies": {
      "nuxt": "^3.8.0",
      "vue": "^3.3.0"
    },
    "devDependencies": {
      "@nuxt/devtools": "latest",
      "eslint": "^8.0.0",
      "sass": "^1.66.0"
    },
    "engines": {
      "node": ">=16"
    }
  }
  ```
  ---
  > 💡 提示：把 `package.json` 想象成汽车的仪表盘 - 从这里启动引擎（`npm run dev`）、查看油量（依赖）和控制所有功能（脚本）！
:::
  