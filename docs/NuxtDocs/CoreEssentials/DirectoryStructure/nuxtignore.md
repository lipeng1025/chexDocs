# .nuxtignore
::: details 理论阐述

  **🧠 核心概念**

  > - `.nuxtignore` 是 **Nuxt3 的构建排除配置文件**，用于告诉 Nuxt 在构建过程中忽略特定文件或目录，提升构建速度和减少包体积。
  ---
  **🚫 开发者须知（最重要！）**

  > - **构建优化工具**：只影响构建过程，不影响开发
  > - **文件位置**：项目根目录下
  > - **格式简单**：每行一个忽略规则（支持 glob 模式）
  > - **优先于 .gitignore**：Nuxt 会优先遵守此文件规则
  ---
  **📄 文件结构示例**

  这里只是一个参考：
  ``` text
  # .nuxtignore
  # ========== 测试文件 ==========
  **/*.test.js
  **/*.spec.ts
  tests/

  # ========== 文档文件 ==========
  docs/
  *.md

  # ========== 设计资源 ==========
  designs/
  *.psd
  *.sketch

  # ========== 旧版代码 ==========
  legacy/
  deprecated.js
  ```
  ---
  **⚙️ 工作原理**
  
  > **1: 开始构建** -> **2: 读取 .nuxtignore** -> **3: 应用忽略规则** -> **4: 生成精简的构建产物**
  ---
  **💡 基础使用**
  
  1.**创建文件**： 在项目根目录创建 `.nuxtignore`  
  2.**添加规则**：
  ```gitignore
  # 忽略所有测试文件
  **/*.test.*
  tests/

  # 忽略特定目录
  experimental/
  ```
  3.**验证效果**： 运行 `nuxt build` 查看构建大小变化

  ---
  **🌟 与 .gitignore 的区别**

  |  **特性**  |  **.nuxtignore**  |  **.gitignore**  |
  |  ---  |  ---  |  ---  |
  |  目的  |  控制构建包含内容  |  控制版本控制提交内容  |
  |  影响阶段  |  构建过程  |  代码提交过程  |
  |  生效范围  |  仅 Nuxt 构建  |  Git 操作  |
  |  优先级  |  高于 .gitignore  |  独立作用  |
  |  典型内容  |  测试文件、文档、资源文件  |  构建产物、环境变量  |

  ---
  **⚡️ 实用技巧**

  1.**性能优化：**
  ```gitignore
  # 忽略大型资源文件
  assets/raw-videos/
  assets/uncompressed-images/
  ```

  2.**安全排除：**
  ```gitignore
  # 防止配置文件被打包
  config.local.json
  keys/
  ```

  3.**条件排除：**
  ```gitignore
  # 仅在开发环境排除
  [if:development]
  mock-data/
  ```

  4.**保留必要文件：**
  ```gitignore
  # 忽略所有 .md 文件
  **/*.md

  # 但保留 README.md
  !README.md
  ```
  ---
  **✅ 推荐排除项**

  |  **规则**  |  **说明**  |  **影响**  |
  |  ---  |  ---  |  ---  |
  |  `**/*.test.*`  |  所有测试文件  |  ⭐⭐⭐  |
  |  `docs/`  |  文档目录  |  ⭐⭐  |
  |  `designs/`  |  设计资源  |  ⭐  |
  |  `*.md`  |  Markdown 文件  |  ⭐  |
  |  `cypress/`  |  E2E 测试文件  |  ⭐⭐⭐  |
  |  `**/__mocks__/**`  |  测试模拟文件  |  ⭐⭐  |
  |  `benchmarks/`  |  性能测试文件  |  ⭐  |
  ---
  **⚠️ 注意事项**

  1.**不要过度排除：**
  ```gitignore
  # 危险：可能排除必要文件
  components/* ❌

  # 安全：排除特定测试文件
  components/**/*.spec.js ✅
  ```

  2.**动态文件处理：**
  ```gitignore
  # 正确：忽略所有 .stories 文件
  **/*.stories.js
  ```

  3.**验证排除效果：**
  ```bash
  # 查看构建包含的文件
  npx nuxi build --analyze
  ```
  ---
  **🔧 高级配置**

  1.**正则表达式：**
  ```gitignore
  # 忽略所有 _开头的文件/目录
  /_*/
  ```

  2.**目录深度控制：**
  ```gitignore
  # 忽略二级目录下的 .tmp 文件
  */*/.tmp
  ```

  3.**多环境配置：**
  ```gitignore
  [if:production]
  # 生产环境额外忽略调试文件
  debug/

  [if:development]
  # 开发环境忽略生产优化文件
  **/*.min.js
  ```
  ---
  **📚 完整 Nuxt3 .gitignore 模板**
  ```gitignore
  # ========== 测试文件 ==========
  **/*.test.js
  **/*.spec.ts
  **/*.cy.js
  tests/
  cypress/

  # ========== 文档资源 ==========
  docs/
  *.md
  *.pdf
  presentations/

  # ========== 设计资源 ==========
  designs/
  *.psd
  *.ai
  *.sketch

  # ========== 开发工具 ==========
  scripts/
  tools/

  # ========== 临时文件 ==========
  **/.tmp
  **/*.bak

  # ========== 但保留必要的文档 ==========
  !README.md
  !CONTRIBUTING.md
  ```
  ---
  > 💡 提示：把 `.nuxtignore` 想象成搬家时的筛选器 - 只打包必需品（生产代码），留下不需要的物品（测试/文档），让搬家车（构建包）更轻更快！
:::
  