# tsconfig.json
::: details 理论阐述

  **🧠 核心概念**

  > - `tsconfig.json` 是 TypeScript 项目的**核心配置文件**，定义了如何编译 TypeScript 代码和类型检查规则，是 Nuxt3 类型安全的"守护者"。
  ---
  **🚫 开发者须知（最重要！）**

  > - **自动生成**：Nuxt3 创建项目时自动生成基础配置
  > - **位置固定**：必须位于项目根目录
  > - **动态扩展**：Nuxt 构建时会自动扩展配置
  > - **无需重启**：修改后即时生效（VSCode 可能需要重新加载）
  ---
  **📋 基础配置结构**

  这里只是一个参考：
  ``` json
  {
    "extends": "./.nuxt/tsconfig.json", // 继承Nuxt默认配置
    "compilerOptions": {
      "target": "ESNext",          // 编译目标版本
      "module": "ESNext",          // 模块系统
      "moduleResolution": "Bundler", // 模块解析策略
      "strict": true,              // 启用严格类型检查
      "jsx": "preserve",           // JSX处理方式
      "types": ["@types/node"]     // 包含的类型定义
    },
    "include": [                   // 包含的文件范围
      "**/*.ts",
      "**/*.vue"
    ]
  }
  ```
  ---
  **⚙️ 核心功能**
  
  > **1: TS代码** -> **2: tsconfig.json** -> **3: 类型检查** -> **4: 错误提示**  
  > **1: TS代码** -> **2: tsconfig.json** -> **3: 编译规则**-> **4: JS输出**
  ---
  **🌟 关键知识点**

  1.**继承机制：**
  ``` json
  "extends": "./.nuxt/tsconfig.json" // 关键配置！继承Nuxt的默认设置
  ```

  2.**Nuxt自动扩展：**
  
  > - 自动添加 `@nuxt/types` 类型
  > - 包含 `auto-imports.d.ts` 和 `components.d.ts`
  > - 设置正确的路径别名（`~/*`, `@/*`）

  3.**严格模式：**
  ```json
  "strict": true // 强烈推荐开启，包含：
  // - noImplicitAny
  // - strictNullChecks
  // - strictFunctionTypes
  // - strictBindCallApply
  // - strictPropertyInitialization
  ```
  ---
  **⚡️ 实用配置技巧**

  1.**路径别名：**
  ```json
  "compilerOptions": {
    "paths": {
      "~/*": ["./*"],
      "@/*": ["./*"]
    }
  }
  ```

  2.**忽略测试文件：**
  ```json
  "exclude": [
    "**/*.spec.ts",
    "**/*.test.ts",
    "tests/**"
  ]
  ```

  3.**Vue 支持：**
  ```json
  "vueCompilerOptions": {
    "target": 3, // Vue 3
    "experimentalCompatMode": false
  }
  ```

  3.**类型增强：**
  ```json
  "types": [
    "@nuxt/types",
    "@pinia/nuxt",
    "nuxt-icon"
  ]
  ```
  ---
  **⚠️ 常见问题**

  1.**类型错误：**
  ```bash
  # 重新生成类型声明
  npx nuxi typecheck
  ```

  2.**配置不生效：**
  ```json
  // 确保包含继承
  "extends": "./.nuxt/tsconfig.json"
  ```

  3.**VSCode 报错：**
  ```bash
  # 重启TS服务
  > TypeScript: Restart TS Server
  ```
  ---
  **🔧 高级配置项**

  |  **配置项**  |  **推荐值**  |  **说明**  |
  |  ---  |  ---  |  ---  |
  |  allowJs  |  true  |  允许编译JS文件  |
  |  esModuleInterop  |  true  |  改进CommonJS互操作性  |
  |  skipLibCheck  |  true  |  跳过库类型检查（提升性能）  |
  |  forceConsistentCasingInFileNames  |  true  |  强制文件名大小写一致  |
  |  resolveJsonModule  |  true  |  允许导入JSON文件  |
  ---
  **🔒 最佳实践**

  1.**定期类型检查：**
  ```json
  "scripts": {
    "typecheck": "nuxt typecheck"
  }
  ```

  2.**类型维护：**
  ```bash
  # 自动修复类型问题
  npx vue-tsc --noEmit --fix
  ```

  3.**配置版本控制：**
  ```json
  // tsconfig.json
  {
    "$schema": "https://json.schemastore.org/tsconfig"
  }
  ```

  ---
  **📚 完整配置示例**
  ```json
  {
    "extends": "./.nuxt/tsconfig.json",
    "compilerOptions": {
      "target": "ESNext",
      "module": "ESNext",
      "moduleResolution": "Bundler",
      "strict": true,
      "jsx": "preserve",
      "resolveJsonModule": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "types": [
        "@nuxt/types",
        "@pinia/nuxt",
        "nuxt-icon"
      ],
      "paths": {
        "~/*": ["./*"],
        "@/*": ["./*"]
      },
      "vueCompilerOptions": {
        "target": 3
      }
    },
    "include": [
      "**/*.ts",
      "**/*.tsx",
      "**/*.vue",
      ".nuxt/**/*.ts",
      "types/**/*.d.ts",
      "composables/**/*.ts",
      "constants/**/*.ts"
    ],
    "exclude": [
      "node_modules",
      "dist",
      ".output",
      "**/*.spec.ts",
      "**/*.test.ts"
    ]
  }
  ```
  ---
  > 💡 提示：把 `tsconfig.json` 想象成建筑蓝图 - 它指导 TypeScript 编译器（建筑队）如何将你的代码（设计图）转化为安全可靠的 JavaScript（建筑物）！
:::
  