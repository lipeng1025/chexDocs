# content
::: details 理论阐述

  **🧠 核心概念**

  > - `content/` 是 Nuxt Content 模块的**专用目录**，用于管理应用的 Markdown、JSON 等文档内容，让你的网站变成动态文档库。
  ---
  **🚫 开发者须知（最重要！）**

  > - **需要安装模块**：`npm install @nuxt/content`
  > - **文件即路由**：`content/docs/hello.md` → `/docs/hello`
  > - **支持多种格式**：Markdown、JSON、YAML、CSV 等
  > - **自动生成路由**：无需手动配置
  ---
  **📁 目录结构示例**

  这里只是一个参考：
  ``` text
  content/
    ├── index.md                    # 首页内容 (对应路由 /)
    ├── blog/                       # 博客目录
    │   ├── welcome.md              # /blog/welcome
    │   └── nuxt-tips.md            # /blog/nuxt-tips
    ├── docs/                       # 文档目录
    │   ├── 1.getting-started.md
    │   └── 2.configuration.md
    └── authors/                    # 作者数据
        └── john-doe.json
  ```
  ---
  **⚙️ 核心功能**
  
  > **1: Markdown文件** - **2: Content模块** - **3: 自动解析** - **4: 生成API路由** - **5: 前端组件使用**
  ---
  **💡 基础使用**
  
  1.**创建内容文件：**
  ```md
  <!-- content/blog/first-post.md -->
  # 我的第一篇博客

  欢迎阅读Nuxt内容模块的示例！
  ```

  2.**查询内容：**
  ```vue
  <script setup>
    const { data: posts } = await useAsyncData('blog-posts', () => {
      return queryContent('blog').find()
    })
  </script>
  ```

  3.**显示内容：**
  ```vue
  <template>
    <div v-for="post in posts" :key="post._path">
      <ContentRenderer :value="post" />
    </div>
  </template>
  ```
  ---
  **🌟 关键知识点**

  1.**自动路由生成**
  |  **文件位置**  |  **访问URL**  |
  |  ---  |  ---  |
  |  `content/index.md`  |  `/`  |
  |  `content/about.md`  |  `/about`  |
  |  `content/blog/first.md`  |  `/blog/first`  |

  2.**内容查询方法：**
  ```ts
  // 获取单个文档
  const article = await queryContent('blog', 'hello').findOne()

  // 按条件筛选
  const tutorials = await queryContent('docs')
    .where({ category: 'tutorial' })
    .find()
  ```
  
  3.**Markdown 增强功能：**
  > - 支持 Vue 组件
  > - 代码高亮
  > - 自动目录生成
  > - Frontmatter 元数据
  > - 自定义块
  ---
  **⚡️ 配置示例**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@nuxt/content'],
    
    content: {
      // 内容目录位置
      sources: ['content'],
      
      // Markdown 增强配置
      markdown: {
        toc: { depth: 3 },
        remarkPlugins: ['remark-reading-time']
      }
    }
  })
  ```
  ---
  **💡 实用技巧**

  1.**添加 Frontmatter：**
  ```md
    ---
    title: 我的文章
    description: 文章描述
    image: /cover.jpg
    ---
    正文内容...
  ```

  2.**使用 Vue 组件：**
  ```md
    :my-custom-component{prop="value"}

    在Markdown中直接使用Vue组件
  ```

  3.**内容嵌套：**
  ```text
  content/
    └── docs/
        ├── index.md         # /docs
        └── getting-started/ # /docs/getting-started
            ├── index.md     # /docs/getting-started
            └── install.md   # /docs/getting-started/install
  ```
  ---
  **⚠️ 常见问题**

  1.**内容不更新：**
  ```bash
  # 开发时启用监听
  npx nuxi dev --force
  ```

  2.**路由冲突：**

  > - 避免在 `pages/` 和 `content/` 创建同名路由
  > - 优先使用 `content/` 路由
  ---
  **📚 学习资源**
  > - [官方文档](https://content.nuxtjs.org/)
  > - [Markdown 指南](https://content.nuxtjs.org/guide/writing/markdown)
  > - [API 参考](https://content.nuxtjs.org/api/composables/query-content)
  ---
  > 💡 提示：`content/` 就像你网站的智能文件柜 - 只需放入文档，Nuxt 会自动整理、索引并提供给用户！
:::
  