# .gitignore
::: details 理论阐述

  **🧠 核心概念**

  > - `.gitignore` 是 **Git 版本控制的忽略规则文件**，用于指定哪些文件/目录不应该提交到代码仓库，保护敏感数据和避免垃圾文件污染。
  ---
  **🚫 开发者须知（最重要！）**

  > - **必须存在**：每个 Nuxt3 项目都应包含此文件
  > - **位置固定**：位于项目根目录
  > - **格式简单**：每行一个忽略规则
  > - **立即生效**：添加后需重新 git add
  ---
  **📄 文件结构示例**

  这里只是一个参考：
  ``` text
  # .gitignore
  # =========== 核心忽略项 ===========
    .nuxt
    .output
    node_modules
    dist

  # =========== 环境文件 ===========
    .env
    .env.*
    !.env.example

  # =========== 系统文件 ===========
    .DS_Store
    Thumbs.db

  # =========== 日志文件 ===========
    *.log
    logs/

  # =========== 编辑器文件 ===========
    .idea/
    .vscode/
    *.suo
    *.ntvs*
    *.njsproj
    *.sln
    *.sw?
  ```
  ---
  **⚙️ 工作原理**
  
  > **1: git add** -> **2: 检查.gitignore** -> **3: {匹配规则?}** -> **4: [匹配到: 跳过文件; 没有匹配到: 添加到暂存区]**
  ---
  **💡 基础使用**
  
  1.**添加忽略规则：**
  ```gitignore
  # 忽略所有 .tmp 文件
  *.tmp

  # 忽略目录
  temp/

  # 忽略特定文件
  secret-key.txt
  ```

  2.**例外规则：**
  ```gitignore
  # 忽略所有 .md 文件
  *.md

  # 但不忽略 README.md
  !README.md
  ```
  ---
  **🌟 Nuxt3 必备忽略项**

  |  **忽略项**  |  **原因说明**  |  **是否必须**  |
  |  ---  |  ---  |  ---  |
  |  .nuxt  |  构建缓存目录  |  ✅  |
  |  .output  |  生产构建输出  |  ✅  |
  |  node_modules  |  依赖目录（可通过安装重建）  |  ✅  |
  |  .env  |  环境变量（含敏感信息）  |  ✅  |
  |  *.log  |  日志文件  |  ⭐️  |
  |  .DS_Store  |  macOS 系统文件  |  ⭐️  |
  |  .idea/.vscode  |  编辑器配置文件  |  ⭐️  |
  |  dist  |  旧版构建输出  |  ⏳  |
  ---
  **⚡️ 实用技巧**

  1.**分层忽略：**
  ```gitignore
  # gitignore
  node_modules/

  # 但允许特定子目录
  !app/test-utils/node_modules/
  ```

  2.**注释说明：**
  ```gitignore
  # ========== Nuxt 构建文件 ==========
  .nuxt
  .output

  # ========== 环境配置 ==========
  .env
  .env.local
  ```

  3.**通用模板：**
  ```gitignore
  # Nuxt官方推荐基础配置
  .nuxt
  .output
  node_modules
  dist
  .env
  .DS_Store
  *.log
  ```
  ---
  **⚠️ 常见错误**

  1.**忽略规则失效：**
  ```bash
  # 已跟踪文件需要先取消
  git rm --cached file.txt
  ```

  2.**忽略语法错误：**
  ```gitignore
  # 错误：缺少斜杠（会忽略所有同名文件）
  node_modules  ❌

  # 正确：忽略目录
  node_modules/ ✅
  ```

  3.**误忽略必要文件：**
  ```gitignore
  # 危险：忽略所有配置文件
  *.js         ❌

  # 安全：只忽略特定文件
  temp/*.js    ✅
  ```
  ---
  **📚 完整 Nuxt3 .gitignore 模板**
  ```gitignore
  # ========== Nuxt 核心 ==========
  .nuxt
  .output
  .nitro
  .nuxtrc

  # ========== 依赖项 ==========
  node_modules
  /.pnpm-store

  # ========== 构建产物 ==========
  dist
  .function_cache

  # ========== 环境变量 ==========
  .env
  .env.*
  !.env.example

  # ========== 系统文件 ==========
  .DS_Store
  Thumbs.db
  Desktop.ini

  # ========== 日志/缓存 ==========
  *.log
  logs/
  .cache/
  *.tmp

  # ========== 测试报告 ==========
  coverage/
  .nyc_output/

  # ========== 编辑器配置 ==========
  .idea
  .vscode
  *.suo
  *.ntvs*
  *.njsproj
  *.sln
  *.sw?
  ```
  ---
  > 💡 提示：把 `.gitignore` 想象成海关安检 - 阻止危险品（敏感文件）和多余行李（临时文件）进入代码仓库，只放行真正需要的货物（源代码）！
:::
  