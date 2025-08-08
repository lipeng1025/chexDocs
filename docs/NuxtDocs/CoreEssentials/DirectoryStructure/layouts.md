# layouts
::: details 理论阐述
  
  **1. 什么是 layouts 目录？**
  > - `layouts` 目录是存放布局组件的地方。布局是 Nuxt3 中用于定义页面整体结构的组件，它们包装页面内容并提供可复用的 UI 结构（如页眉、页脚、导航栏等）。
  ---
  **2. 有什么用？**
  > - **页面结构复用**：定义公共页面框架
  > - **嵌套布局**：创建多层布局结构
  > - **上下文感知**：访问路由信息和全局状态
  > - **页面包装**：自动包装所有匹配的页面
  > - **自定义错误处理**：提供全局错误页面
  ---
  **3. 核心特点**
  > - **约定优先**：文件名即布局名
  > - **自动注册**：无需手动导入
  > - **动态切换**：页面可指定使用不同布局
  > - **错误处理**：内置错误页面布局
  > - **嵌套支持**：布局可以嵌套使用
  ---
  **4. 目录结构建议&命名规则：**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  layouts/
    ├── default.vue      # 默认布局（必选）
    ├── admin.vue        # 后台管理布局
    ├── auth.vue         # 认证页面布局
    ├── error.vue        # 错误页面布局（自定义）
    └── nested/          # 嵌套布局
        ├── sidebar.vue
        └── dashboard.vue
  ```
  |  **文件位置**  |  **布局名**  |  **使用方式**  |
  |  ---  |  ---  |  ---  |
  |  `default.vue`  |  `default`  |  默认布局（未指定时使用）  |
  |  `admin.vue`  |  `admin`  |  在页面中指定 `layout: 'admin'`  |
  |  `error.vue`  |  `error`  |  自动用于错误页面  |
  ---
  **6. 布局组件结构：**

  每个布局文件必须包含：
  > - 1: `<slot />`：用于插入页面内容
  > - 2: 可选的公共 UI 元素（页眉、页脚等）
  > - 3: 全局逻辑（如用户认证检查）
  ---
  **7. 配置相关：**

  在 <mark>nuxt.config.ts</mark> 中可以设置默认布局：
  ```ts
  export default defineNuxtConfig({
    // 设置默认布局（可选）
    app: {
      layout: 'default'
    }
  })
  ```
  ---
:::
  
::: details 代码示例
  
  **1. 基础布局示例**
  ```vue
  <!-- layouts/default.vue -->
  <template>
    <div class="layout-container">
      <header class="header">
        <nav>
          <NuxtLink to="/">首页</NuxtLink>
          <NuxtLink to="/about">关于</NuxtLink>
        </nav>
      </header>
      
      <main class="content">
        <slot /> <!-- 页面内容将渲染在这里 -->
      </main>
      
      <footer class="footer">
        <p>&copy; 2023 我的网站</p>
      </footer>
    </div>
  </template>

  <style scoped>
  .layout-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .header, .footer {
    padding: 1rem;
    background: #f3f4f6;
  }

  .content {
    flex: 1;
    padding: 2rem;
  }
  </style>
  ```
  ---
  **2. 后台管理布局**
  ```vue
  <!-- layouts/admin.vue -->
  <template>
    <div class="admin-layout">
      <aside class="sidebar">
        <h2>管理后台</h2>
        <nav>
          <NuxtLink to="/admin/dashboard">仪表盘</NuxtLink>
          <NuxtLink to="/admin/users">用户管理</NuxtLink>
          <NuxtLink to="/admin/settings">系统设置</NuxtLink>
        </nav>
      </aside>
      
      <div class="main-content">
        <header class="admin-header">
          <AdminToolbar />
        </header>
        <div class="content-wrapper">
          <slot />
        </div>
      </div>
    </div>
  </template>

  <script setup>
  // 布局级别的逻辑
  const route = useRoute()
  const { isAdmin } = useAuth()

  // 非管理员重定向
  if (!isAdmin.value) {
    showError('您没有访问权限')
  }
  </script>

  <style scoped>
  .admin-layout {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 250px;
    background: #1f2937;
    color: white;
    padding: 1rem;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .admin-header {
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem;
  }

  .content-wrapper {
    padding: 2rem;
    flex: 1;
  }
  </style>
  ```
  ---
  **3. 在页面中使用布局**
  ``` vue
  <!-- pages/index.vue -->
  <template>
    <div>
      <h1>首页内容</h1>
      <!-- 使用默认布局 -->
    </div>
  </template>
  ```
  ``` vue
  <!-- pages/admin/dashboard.vue -->
  <template>
      <div>
        <h1>仪表盘</h1>
        <!-- 管理后台内容 -->
      </div>
  </template>

  <script setup>
      // 指定使用 admin 布局
      definePageMeta({
        layout: 'admin'
      })
  </script>
  ```
  > - 在 Nuxt3 中，布局并不需要额外的 `<nuxt-layout></nuxt-layout>` 包裹组件，因为布局本身是通过文件系统和组件自动关联的。  
  > - Nuxt3 会自动根据页面中设置的 layout 属性匹配到相应的布局文件，并渲染页面内容。如果没有指定 `layout`，则会默认使用 `layouts/default.vue。`无须手动在页面中引入 `<nuxt-layout>` 组件，Nuxt3 会自动处理布局的渲染。  
  > - 在页面中只需通过 `definePageMeta` 指定布局名，Nuxt3 会自动应用相应的布局组件。无需额外的 `<nuxt-layout>` 包裹。
  ---
  **4. 错误页面布局**
  ``` vue
  <!-- layouts/error.vue -->
  <template>
    <div class="error-layout">
      <div class="error-content">
        <h1 v-if="error.statusCode === 404">页面未找到</h1>
        <h1 v-else>发生错误</h1>
        
        <p>{{ error.message || '抱歉，发生了意外错误' }}</p>
        
        <button @click="handleError">返回首页</button>
      </div>
    </div>
  </template>

  <script setup>
  const props = defineProps(['error'])

  const handleError = () => clearError({ redirect: '/' })
  </script>

  <style scoped>
  .error-layout {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
  }

  .error-content {
    max-width: 500px;
    padding: 2rem;
  }
  </style>
  ```
  ---
  **5. 嵌套布局**
  ``` vue
  <!-- layouts/nested/sidebar.vue -->
  <template>
    <div class="sidebar-layout">
      <aside class="sidebar">
        <slot name="sidebar" />
      </aside>
      <main class="main-content">
        <slot />
      </main>
    </div>
  </template>
  ```
  ``` vue
  <!-- layouts/dashboard.vue -->
  <template>
    <div class="dashboard-layout">
      <DashboardHeader />
      <SidebarLayout>
        <template #sidebar>
          <DashboardNav />
        </template>
        
        <slot />
      </SidebarLayout>
      <DashboardFooter />
    </div>
  </template>
  ```
  ``` vue
  <!-- pages/dashboard.vue -->
  <script setup>
    definePageMeta({
      layout: 'dashboard'
    })
  </script>
  ```
  ---
:::
  
::: details 问题补充
  
  **1. 布局选择优先级**

  当页面指定布局时，Nuxt3 按以下顺序查找：

  > - 1: 页面中定义的 `definePageMeta({ layout: 'xxx' })`
  > - 2: <mark>nuxt.config.ts</mark> 中的默认布局设置
  > - 3: 默认的 `layouts/default.vue`
  ---
  **2. 禁用布局**

  如果某个页面不需要布局：

  ``` vue
  <script setup>
      definePageMeta({
        layout: false
      })
  </script>
  ```
  ---
  **3. 动态布局切换**
  ```vue
  <script setup>
  const route = useRoute()
  const layout = ref('default')

  // 根据路由动态设置布局
  watch(() => route.path, (path) => {
    if (path.startsWith('/admin')) {
      layout.value = 'admin'
    } else {
      layout.value = 'default'
    }
  })

  // 动态设置布局
  setPageLayout(layout.value)
  </script>
  ```
  ---
  **4. 布局与中间件配合**
  
  布局中可以集成路由中间件：

  ```vue
  <!-- layouts/admin.vue -->
  <script setup>
    definePageMeta({
      middleware: 'admin-auth'
    })
  </script>
  ```
  > `middleware/`是Nuxt3主要的目录之一，存放中间件
  > 多数用于跳转路由(就也就是页面)前做，比如token是否存在，是否过期检查
  > 然后跳转到成功或者错误后的路由(页面), 比如token过期跳转到登录页面
  ```ts
  // middleware/admin-auth.ts
  export default defineNuxtRouteMiddleware((to) => {
    const { isAdmin } = useAuth()
    
    if (!isAdmin.value) {
      return navigateTo('/login')
    }
  })
  ```
  ---
  **5. 最佳实践**
  
  1.**布局设计：**
  > - 保持布局专注于结构而非内容
  > - 使用具名插槽提供灵活性
  > - 避免在布局中包含业务逻辑

  2.**性能优化：**
  > - 大型布局使用异步组件
  > - 公共组件在布局中只加载一次
  > - 使用 v-if 条件渲染不总是需要的部分

  3.**响应式设计：**
  ``` vue
  <template>
    <div :class="{ 'mobile-layout': isMobile }">
      <slot />
    </div>
  </template>

  <script setup>
  const isMobile = useMediaQuery('(max-width: 768px)')
  </script>
  ```

  4.**错误处理：**
  > - 自定义 `error.vue` 提供友好错误提示
  > - 在布局中处理全局错误
  ```ts
  onErrorCaptured((err) => {
    console.error('布局级错误:', err)
    return false // 阻止错误继续向上传播
  })
  ```
  ---
  **6. 常见问题解决方案**
  
  1.**布局未生效：**
  > - 确保文件名正确（如 `default.vue`）
  > - 检查布局中是否包含 `<slot />`
  > - 确认页面中正确设置了 `definePageMeta`
  
  2.**布局重复渲染：**
  > - 避免在布局中使用 `<NuxtPage>` 组件
  > - 确保没有嵌套使用多个布局组件
  
  3.**样式冲突：**
  > - 使用布局级别的 CSS 作用域
  > - 添加布局专属类名：
  ```vue
  <div class="admin-layout">
    <!-- 内容 -->
  </div>
  ```
  
  3.**服务端渲染问题：**
  > - 在布局中使用 `useHead` 管理元数据
  > - 避免在布局的 setup 中使用浏览器 API
  ```ts
  useHead({
    title: '我的网站',
    meta: [
      { name: 'description', content: '网站描述' }
    ]
  })
  ```
  ---
  **7. 高级用法**

  1.**布局过渡动画：**
  ```vue
  <template>
    <div>
      <Transition name="fade" mode="out-in">
        <slot />
      </Transition>
    </div>
  </template>

  <style>
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.3s;
    }
    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
  </style>
  ```

  2.**基于角色的布局：**
  ```vue
  <script setup>
    const { user } = useAuth()
    const layout = computed(() => {
      if (user.value?.isAdmin) return 'admin'
      if (user.value) return 'user'
      return 'guest'
    })

    setPageLayout(layout.value)
  </script>
  ```
  
  3.**布局注入数据：**
  ```vue
  <!-- layouts/default.vue -->
  <script setup>
    provide('layoutData', {
      version: '1.0.0',
      year: new Date().getFullYear()
    })
  </script>
  ```
  ```vue
  <!-- 页面中使用 -->
  <script setup>
    const layoutData = inject('layoutData')
  </script>
  ```
  
  4.**布局级插件：**
  ```ts
  // plugins/layout-plugin.ts
  export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('page:start', () => {
      // 布局切换前逻辑
    })
    
    nuxtApp.hook('page:finish', () => {
      // 布局切换后逻辑
    })
  })
  ```
  ---
  **8. 布局与组合式函数**

  在布局中使用 composables 实现复杂逻辑：
  ```ts
  // composables/useLayout.js
  export const useLayout = () => {
    const isSidebarOpen = useState('sidebarOpen', () => true)
    
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value
    }
    
    return {
      isSidebarOpen,
      toggleSidebar
    }
  }
  ```
  ```vue
  <!-- layouts/admin.vue -->
  <script setup>
  const { isSidebarOpen, toggleSidebar } = useLayout()
  </script>

  <template>
    <button @click="toggleSidebar">
      {{ isSidebarOpen ? '收起' : '展开' }}
    </button>
    
    <aside v-if="isSidebarOpen">
      <!-- 侧边栏内容 -->
    </aside>
  </template>
  ```
  ---
:::
  