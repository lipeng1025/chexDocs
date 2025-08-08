# public
::: details 理论阐述

  **🧠 核心概念**

  > - `public/` 是存放**纯静态资源**的目录，这些文件会被直接复制到最终构建产物的根目录，可通过绝对路径直接访问。
  ---
  **🚫 开发者须知（最重要！）**

  > - **直接访问**：文件可通过 `/文件名` 访问（如 `/favicon.ico`）
  > - **不会处理**：不会经过构建流程（原样复制）
  > - **优先使用**：适合不需要构建处理的静态资源
  > - **替代方案**：需要优化的资源请用 `assets/`
  ---
  **📁 目录结构示例**

  这里只是一个参考：
  ``` text
  public/
    ├── favicon.ico      # 网站图标
    ├── robots.txt       # 搜索引擎规则
    ├── sitemap.xml      # 网站地图
    ├── images/          # 静态图片
    │   ├── logo.png
    │   └── banner.jpg
    └── downloads/       # 下载文件
        └── brochure.pdf
  ```
  ---
  **⚙️ 访问路径对照表**
  |  **文件位置**  |  **访问 URL**  |
  |  ---  |  ---  |
  |  `public/favicon.ico`  | `/favicon.ico`  |
  |  `public/images/logo.png`  |  `/images/logo.png`  |
  |  `public/downloads/file.zip`  |  `/downloads/file.zip`  |
  ---
  **💡 基础使用**
  
  1.**组件中引用：**
  ```vue
  <template>
    <img src="/images/logo.png" alt="Logo">
    <a href="/downloads/brochure.pdf">下载手册</a>
  </template>
  ```

  2.**CSS 中引用：**
  ```css
  .hero {
    background-image: url('/images/banner.jpg');
  }
  ```
  ---
  **🌟 关键知识点**

  1.**适用场景：**
  > - 网站图标 (favicon)
  > - SEO 文件 (robots.txt, sitemap.xml)
  > - 大型媒体文件（视频/PDF）
  > - 不需要优化的图片
  > - 静态配置文件

  2.**与 assets 目录的区别：**
  |  **特性**  |  **public 目录**  |  **assets 目录**  |
  |  ---  |  ---  |  ---  |
  |  构建处理  | ❌ 原样复制  | ✅ 优化/编译  |
  |  访问路径  |  `/file.ext`  | `~/assets/file.ext`  |
  |  别名  |  `/` 根路径  | `~/assets`  |
  |  适用资源  |  纯静态文件  | 需要处理的资源  |
  ---
  **⚡️ 实用技巧**

  1.**动态引用：**
  ```vue
  <script setup>
    const imagePath = computed(() => `/images/${userType}-banner.jpg`)
  </script>

  <template>
    <img :src="imagePath" alt="动态图片">
  </template>
  ```

  2.**优先使用 public 的情况：**
  ```md
  - 文件 > 10KB 且不需要优化
  - 需要精确控制文件名（如 `manifest.json`）
  - 第三方要求固定路径的文件
  ```

  3.**配置默认文件：**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    app: {
      head: {
        link: [
          { rel: 'icon', href: '/favicon.ico' } // 使用public文件
        ]
      }
    }
  })
  ```
  ---
  **⚠️ 常见问题**

  1.**文件未更新：**
  ```bash
  # 解决方案：重启开发服务器
  npm run dev --force
  ```

  2.**路径错误：**
  ```vue
  <template>
    <!-- 错误 -->
    <img src="/public/images/logo.png">

    <!-- 正确 -->
    <img src="/images/logo.png">
  </template>
  ```

  3.**大文件优化：**

  > - 超过 100KB 的图片建议用 `assets/` 优化
  > - 视频文件使用 CDN 而非本地存储
  ---
  **🛡️ 安全最佳实践**

  1.**文件组织：**
  ```text
  public/
    ├── static/           # 通用静态文件
    ├── media/            # 媒体文件
    ├── documents/        # PDF/DOC等文档
    └── _redirects        # 部署重定向规则
  ```

  2.**缓存控制：**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    routeRules: {
      '/images/*': { 
        headers: { 'Cache-Control': 'public, max-age=31536000' } // 1年缓存
      }
    }
  })
  ```

  3.**安全防护：**
  ```txt
  # public/robots.txt
  User-agent: *
  Disallow: /admin/
  Disallow: /private/
  ```
  ---
  **📚 学习资源**
  > - [Nuxt 静态资源文档](https://nuxt.com/docs/guide/directory-structure/public)
  > - [Vite 静态资源处理](https://vitejs.dev/guide/assets.html)
  > - [HTTP 缓存策略](https://web.dev/http-caching/)
  ---
  > 💡 提示：把 `public/` 想象成商店的展示橱窗 - 顾客（用户）可以直接看到并获取里面的内容（文件），无需额外加工！
:::
  