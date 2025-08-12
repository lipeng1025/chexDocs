# ComponentsApi

## 一、环境相关组件

  ### `<ClientOnly>`

  - **作用**：只在浏览器中显示内容
  - **使用场景**：依赖浏览器功能的组件（如访问 localStorage、DOM 操作）
  - **示例**：

  ```vue
  <ClientOnly>
    <div>只在浏览器中显示</div>
  </ClientOnly>
  ```
  - **注意**：不要在里面放关键内容，服务端渲染时用户看不到
  ---
  ### `<DevOnly>`

  - **作用**：只在开发环境显示内容
  - **使用场景**：调试信息、开发工具
  - **示例**：

  ```vue
  <DevOnly>
    <DebugPanel />
  </DevOnly>
  ```
  - **注意**：生产环境会自动移除这些内容
## 二、错误处理组件

  ### `<NuxtErrorBoundary>`

  - **作用**：捕获子组件的错误
  - **使用场景**：防止局部错误导致整个页面崩溃
  - **示例**：

  ```vue
  <NuxtErrorBoundary>
    <UnstableComponent />
    <template #error="{ error }">
      <p>出错了: {{ error.message }}</p>
    </template>
  </NuxtErrorBoundary>
  ```
  - **注意**：只能捕获客户端错误
  ---
  ### `<NuxtClientFallback>`

  - **作用**：当组件在客户端渲染失败时显示备用内容
  - **使用场景**：不稳定的第三方组件
  - **示例**：

  ```vue
  <NuxtClientFallback>
    <ThirdPartyComponent />
    <template #fallback>
      <p>组件加载中...</p>
    </template>
  </NuxtClientFallback>
  ```
  - **注意**：必须和 ssr: false 一起使用
## 三、图片优化组件

  ### `<NuxtImg>`

  - **作用**：智能图片组件（自动优化、格式转换）
  - **使用场景**：所有需要显示图片的地方
  - **示例**：

  ```vue
  <NuxtImg src="/logo.png" width="200" height="100" />
  ```
  - **注意**：需要安装 `@nuxt/image` 模块
  ---
  ### `<NuxtPicture>`

  - **作用**：响应式图片组件（根据设备显示不同图片）
  - **使用场景**：需要适配不同屏幕尺寸的图片
  - **示例**：

  ```vue
  <NuxtPicture
    src="/hero.jpg"
    sizes="sm:100vw md:50vw lg:400px"
    alt="响应式图片"
  ></NuxtPicture>
  ```
  - **注意**：比 `<NuxtImg>` 功能更强但更复杂
## 四、路由相关组件

  ### `<NuxtPage>`

  - **作用**：显示当前页面内容（路由容器）
  - **使用场景**：布局文件中包裹页面内容
  - **示例**：

  ```vue
  <div class="container">
    <NuxtPage />
  </div>
  ```
  - **注意**：必须放在布局文件中
  ---
  ### `<NuxtLink>`

  - **作用**：智能页面导航链接
  - **使用场景**：所有内部页面跳转
  - **示例**：

  ```vue
  <NuxtLink to="/about">关于我们</NuxtLink>
  <NuxtLink :to="{ name: 'products' }">产品列表</NuxtLink>
  ```
  - **注意**：比普通 `<a>` 标签性能更好
  ---
  ### `<NuxtLayout>`

  - **作用**：应用布局组件
  - **使用场景**：切换不同页面布局
  - **示例**：

  ```vue
  <template>
    <NuxtLayout name="admin">
      <NuxtPage />
    </NuxtLayout>
  </template>
  ```
  - **注意**：布局文件需放在 `layouts/` 目录
## 五、辅助功能组件

  ### `<NuxtLoadingIndicator>`

  - **作用**：显示页面加载进度条
  - **使用场景**：提升用户体验
  - **示例**：

  ```vue
  <NuxtLoadingIndicator color="#00ff00" />
  ```
  - **注意**：默认显示在页面顶部
  ---
  ### `<NuxtRouteAnnouncer>`

  - **作用**：为屏幕阅读器用户朗读页面标题
  - **使用场景**：提升无障碍体验
  - **示例**：

  ```vue
  <NuxtRouteAnnouncer />
  ```
  - **注意**：自动工作，无需额外配置
  ---
  ### `<Teleport>`

  - **作用**：将内容渲染到指定 DOM 节点
  - **使用场景**：模态框、通知、全局组件
  - **示例**：

  ```vue
  <Teleport to="#modal-container">
    <Modal />
  </Teleport>
  ```
  - **注意**：目标容器需存在于 DOM 中
## 六、其他实用组件

  ### `<NuxtTime>`

  - **作用**：智能时间格式化组件
  - **使用场景**：显示日期时间
  - **示例**：

  ```vue
  <NuxtTime :date="new Date()" />
  ```
  - **注意**：自动处理时区转换
  ---
  ### `<NuxtWelcome>`

  - **作用**：显示 Nuxt 欢迎页面
  - **使用场景**：新项目初始页面
  - **示例**：

  ```vue
  <NuxtWelcome />
  ```
  - **注意**：仅用于开发演示
  ---
  ### `<NuxtIsland>`(实验性)

  - **作用**：部分服务端渲染组件
  - **使用场景**：混合渲染模式
  - **示例**：

  ```vue
  <NuxtIsland name="Comments" />
  ```
  - **注意**：Nuxt3这个API**可能变更**，谨慎使用
## 七、使用注意事项

  通用原则：

  - **按需使用**：只在需要时使用特殊组件
  - **性能考虑**：图片组件优化资源加载
  - **错误处理**：关键区域使用错误边界
  - **无障碍**：使用路由播报提升可访问性
  - **环境区分**：正确使用 ClientOnly/DevOnly
  ---
  组件对比：
  |  **组件**  |  **类似功能**  |  **主要区别**  |
  |  ---  |  ---  |  ---  |
  |  `<ClientOnly>`  |  `v-if="process.client"`  |  更简洁的语法  |
  |  `<NuxtImg>`  |  普通 `<img>`  |  自动优化图片  |
  |  `<NuxtPicture>`  |  `<picture>`  |  更简单的响应式图片  |
  |  `<NuxtErrorBoundary>`  |  `try/catch`  |  组件级错误处理  |
  ---
  常见错误：

  - **图片组件未安装模块**：需先安装 `@nuxt/image`
  - **NuxtPage 位置错误**：只能放在布局文件中
  - **Teleport 目标不存在**：确保目标容器已创建
  - **过度使用 ClientOnly**：影响 SEO 和首屏性能
## 八、最佳实践建议

  1.**路由导航：**

  ```vue
  <!-- 优先使用 NuxtLink -->
  <NuxtLink to="/contact" prefetch>联系我们</NuxtLink>
  ```
  ---
  2.**图片优化：**

  ```vue
  <!-- 使用 NuxtImg 替代普通 img -->
  <NuxtImg 
    src="/banner.jpg" 
    sizes="sm:100vw md:50vw lg:1200px"
    quality="80"
    loading="lazy"
  ></NuxtImg>
  ```
  ---
  3.**错误处理组合：**

  ```vue
  <NuxtErrorBoundary>
    <ClientOnly>
      <ThirdPartyComponent />
    </ClientOnly>
    <template #error>
      <p>组件加载失败</p>
    </template>
  </NuxtErrorBoundary>
  ```
  ---
  4.**无障碍支持：**

  ```vue
  <div>
    <NuxtRouteAnnouncer />
    <main>
      <!-- 页面内容 -->
    </main>
  </div>
  ```
