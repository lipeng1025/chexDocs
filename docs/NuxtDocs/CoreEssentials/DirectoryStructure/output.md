# .output
::: details 理论阐述

  **🧠 核心概念**

  > - `.output` 是 Nuxt3 **生产构建的最终输出目录**，包含你应用部署所需的所有文件，是发布到服务器的"成品包"。
  ---
  **🚫 开发者须知（最重要！）**

  > - **生产专用**：仅 `nuxt build` 后生成
  > - **不要修改**：内容由 Nuxt 完全控制
  > - **部署核心**：服务器运行的就是这个目录
  > - **忽略提交**：必须添加到 `.gitignore`
  ---
  **📁 目录结构速览**

  这里只是一个参考：
  ``` text
  .output/
    ├── public/          # 静态资源（原样复制）
    ├── server/          # 服务端代码（Nitro引擎）
    │   ├── chunks/      # 代码模块
    │   ├── node_modules # 服务端依赖
    │   └── index.mjs    # 服务端入口
    └── static/          # 客户端资源
        ├── _nuxt/       # 编译后的前端代码
        └── index.html   # 入口HTML文件
  ```
  ---
  **⚙️ 工作流程**

  > **1: 开发代码** -> **2: nuxt build** -> **3: 生成 .output 目录** -> **4: 部署到服务器**
  ---
  **🌟 关键知识点**

  1.**生成方式**：

  ``` bash
  # 构建生产包
  npx nuxt build

  # 预览生产环境
  npx nuxt preview
  ```

  2.**核心作用**：

  > - 包含完整的全栈应用（前端 + 后端）
  > - 支持多种部署环境（Node, Serverless, Static等）
  > - 已优化的生产级代码

  3.**与 .nuxt 的区别**：

  |  **场景**  |  **.nuxt 目录**  |  **.output 目录**  |
  |  ---  |  ---  |  ---  |
  |  用途  |  开发/构建中间产物  |  最终生产输出  |
  |  大小  |  较小  |  完整应用包  |
  |  包含内容  |  未优化的中间文件  |  优化后的生产代码  |
  |  运行环境  |  本地开发  |  生产服务器  |
  ---
  **💡 开发者建议**

  1.**不要手动修改内容，通过配置控制生成：**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      preset: 'node-server' // 更改部署目标
    }
  })
  ```

  2.**部署前检查：**
  ```bash
  # 检查文件大小
  du -sh .output

  # 检查目录结构
  tree .output -L 2
  ```

  3.**清理旧构建：**
  ```bash
  # 自动清理
  npx nuxt cleanup

  # 手动清理
  rm -rf .output
  ```

  ---
  **⚠️ 常见问题**

  1.**部署后报错**：

  > - 确保服务器 Node 版本 >= 16
  > - 检查 `node_modules` 是否完整

  2.**文件过大**：

  ```ts
  // 配置优化
  export default defineNuxtConfig({
    build: {
      analyze: true // 分析包大小
    }
  })
  ```
  ---
  **📚 学习资源**

  > - [官方部署指南](https://nuxt.com/docs/getting-started/deployment)
  > - [Nitro部署指南](https://nitro.unjs.io/deploy)
  > - [性能优化技巧](https://nuxt.com/docs/getting-started/performance)
  ---
  > 💡 记住：`.output` 就像工厂的成品仓库 - 你只需关心生产什么（代码），不用关心怎么包装运输（Nuxt 自动处理）！
:::