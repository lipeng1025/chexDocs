# UtilsApi

## 一、数据获取与状态管理

  ### `$fetch`
  - **作用**：发起 HTTP 请求（类似 axios）
  - **特点**：自动处理错误，支持服务端/客户端
  - **示例**：

  ```ts
  const data = await $fetch('/api/products')
  ```
  - **注意**：服务端使用时不包含浏览器 cookie
  ---
  ### `useAsyncData` & `useLazyAsyncData`
  - **作用**：获取异步数据（支持 SSR）
  - **区别**：

      - `useAsyncData`：立即加载
      - `useLazyAsyncData`：延迟加载
  - **示例**：

  ```ts
  const { data } = await useAsyncData('products', () => $fetch('/api/products'))
  ```
  - **注意**：key 值必须唯一
  ---
  ### `useFetch` & `useLazyFetch`
  - **作用**：简化 API 请求
  - **区别**：

      - `useFetch`：自动发起请求
      - `useLazyFetch`：手动触发请求
  - **示例**：

  ```ts
  const { data } = await useFetch('/api/products')
  ```
  - **注意**：自动处理加载状态和错误
  ---
  ### `useState`
  - **作用**：创建响应式共享状态
  - **特点**：自动跨组件同步
  - **示例**：

  ```ts
  const counter = useState('counter', () => 0)
  counter.value++
  ```
  - **注意**：key 值必须唯一
  ---
  ### `refreshNuxtData`
  - **作用**：重新获取指定数据
  - **示例**：

  ```ts
  refreshNuxtData('products') // 刷新 products 数据
  ```
  - **注意**：需配合 useAsyncData 使用

  ### `clearNuxtData`
  - **作用**：清除缓存数据
  - **示例**：

  ```ts
  clearNuxtData('products') // 清除 products 缓存
  ```
  - **注意**：不会重新获取数据
  ---
  ### `clearNuxtState`
  - **作用**：清除共享状态
  - **示例**：

  ```ts
  clearNuxtState('counter') // 清除 counter 状态
  ```
  - **注意**：状态会被重置为初始值

## 二、路由与导航控制

  ### `navigateTo`
  - **作用**：编程式路由导航
  - **特点**：支持路径或路由对象
  - **示例**：

  ```ts
  navigateTo('/dashboard')
  navigateTo({ path: '/profile', query: { id: 1 } })
  ```
  - **注意**：服务端调用无效
  ---
  ### `abortNavigation`
  - **作用**：中止路由导航
  - **使用场景**：路由守卫中阻止导航
  - **示例**：

  ```ts
  defineNuxtRouteMiddleware((to) => {
    if (!isLoggedIn) return abortNavigation()
  })
  ```
  - **注意**：只能在路由中间件中使用
  ---
  ### `addRouteMiddleware`
  - **作用**：动态添加路由中间件
  - **示例**：

  ```ts
  addRouteMiddleware('auth', () => {
    if (!isLoggedIn) return navigateTo('/login')
  })
  ```
  - **注意**：可以全局或局部添加
  ---
  ### `onBeforeRouteLeave` & `onBeforeRouteUpdate`
  - **作用**：路由守卫钩子
  - **区别**：

      - `Leave`：离开当前路由时
      - `Update`：路由更新时（相同组件）
  - **示例**：

  ```ts
  onBeforeRouteLeave(() => {
    return confirm('确定离开吗？')
  })
  ```
  - **注意**：返回 false 可阻止导航
  ---
  ### `setPageLayout`
  - **作用**：动态更改页面布局
  - **示例**：

  ```ts
  setPageLayout('admin') // 使用 layouts/admin.vue
  ```
  - **注意**：只能在页面组件中使用

## 三、错误处理

  ### `createError`
  - **作用**：创建错误对象
  - **特点**：可指定状态码和消息
  - **示例**：

  ```ts
  throw createError({ statusCode: 404, message: '页面未找到' })
  ```
  - **注意**：自动触发错误页面
  ---
  ### `showError`
  - **作用**：显示错误页面
  - **示例**：

  ```ts
  showError('数据加载失败')
  ```
  - **注意**：会中断当前执行流程
  ---
  ### `clearError`
  - **作用**：清除错误状态
  - **示例**：

  ```ts
  clearError() // 返回上一页或首页
  ```
  - **注意**：通常在错误页面使用
  ---
  ### `useError`
  - **作用**：获取当前错误对象
  - **示例**：

  ```ts
  const error = useError()
  if (error.value) showAlert(error.value.message)
  ```
  - **注意**：需在错误页面使用

### 四、SEO 与头部管理

  ### `useHead` & `useHeadSafe`
  - **作用**：管理页面头部标签
  - **区别**：

      - `useHead`：直接设置
      - `useHeadSafe`：自动转义特殊字符
  - **示例**：

  ```ts
  useHead({
    title: '产品页面',
    meta: [{ name: 'description', content: '产品详情' }]
  })
  ```
  - **注意**：避免重复设置相同标签
  ---
  ### `useSeoMeta` & `useServerSeoMeta`
  - **作用**：简化 SEO 设置
  - **区别**：

      - `useSeoMeta`：客户端和服务端
      - `useServerSeoMeta`：仅服务端
  - **示例**：

  ```ts
  useSeoMeta({
    title: '首页',
    ogTitle: '欢迎访问'
  })
  ```
  - **注意**：自动处理常用 SEO 标签

## 五、组件与渲染

  ### `defineNuxtComponent`
  - **作用**：定义 Nuxt 组件
  - **特点**：支持自动导入等功能
  - **示例**：

  ```ts
  export default defineNuxtComponent({
    setup() {
      // 组件逻辑
    }
  })
  ```
  - **注意**：与 Vue 组件基本一致
  ---
  ### `defineLazyHydrationComponent`
  - **作用**：创建延迟水合组件
  - **使用场景**：优化首屏性能
  - **示例**：

  ```ts
  export default defineLazyHydrationComponent(() => import('HeavyComponent.vue'))
  ```
  - **注意**：适用于非关键组件
  ---
  ### `prefetchComponents` & `preloadComponents`
  - **作用**：预加载组件资源
  - **区别**：

      - `prefetch`：低优先级预取
      - `preload`：高优先级预加载
  - **示例**：

  ```ts
  preloadComponents(['ProductCard']) // 提前加载组件
  ```
  - **注意**：优化用户下一步操作体验
  ---
  ### `preloadRouteComponents`
  - **作用**：预加载路由所需组件
  - **示例**：

  ```ts
  preloadRouteComponents('/dashboard') // 预加载仪表盘路由
  ```
  - **注意**：提升导航速度

## 六、服务端与运行时

  ### `useRuntimeConfig`
  - **作用**：访问运行时配置
  - **特点**：区分公开/私有配置
  - **示例**：

  ```ts
  const config = useRuntimeConfig()
  const apiKey = config.public.apiKey
  ```
  - **注意**：私有配置仅服务端可用
  ---
  ### `useAppConfig`
  - **作用**：访问应用配置
  - **示例**：

  ```ts
  const appConfig = useAppConfig()
  const theme = appConfig.theme
  ```
  - **注意**：用于项目级配置
  ---
  ### `useRequestEvent` (服务端)
  - **作用**：访问 HTTP 请求事件对象
  - **示例**：

  ```ts
  const event = useRequestEvent()
  const ip = event.node.req.socket.remoteAddress
  ```
  - **注意**：仅服务端可用
  ---
  ### `useRequestFetch`
  - **作用**：服务端安全 fetch 方法
  - **示例**：

  ```ts
  const fetch = useRequestFetch()
  const data = await fetch('/api/data')
  ```
  - **注意**：自动处理凭证和头信息
  ---
  ### `useRequestHeaders`
  - **作用**：获取请求头信息
  - **示例**：

  ```ts
  const headers = useRequestHeaders(['cookie'])
  ```
  - **注意**：仅服务端可用
  ---
  ### `useRequestURL`
  - **作用**：获取请求 URL
  - **示例**：

  ```ts
  const url = useRequestURL()
  console.log(url.hostname)
  ```
  - **注意**：服务端和客户端均可使用
  ---
  ### `setResponseStatus`
  - **作用**：设置 HTTP 响应状态码
  - **示例**：

  ```ts
  setResponseStatus(**0- **) // 设置**0- **状态
  ```
  - **注意**：仅服务端可用
  ---
  ### `useResponseHeader`
  - **作用**：设置响应头
  - **示例**：

  ```ts
  setResponseHeader('Cache-Control', 'public, max-age=```600')
  ```
  - **注意**：仅服务端可用
  ---
  ### `refreshCookie`
  - **作用**：刷新请求中的 cookie
  - **示例**：

  ```ts
  refreshCookie(event) // 更新cookie状态
  ```
  - **注意**：主要用于服务端中间件

## 七、应用生命周期

  ### `onNuxtReady`
  - **作用**：Nuxt 应用加载完成时触发
  - **示例**：

  ```ts
  onNuxtReady(() => {
    console.log('应用已准备就绪')
  })
  ```
  - **注意**：只在客户端执行
  ---
  ### `reloadNuxtApp`
  - **作用**：重新加载整个应用
  - **示例**：

  ```ts
  reloadNuxtApp() // 类似页面刷新
  ```
  - **注意**：会重置应用状态
  ---
  ### `callOnce`
  - **作用**：确保函数只执行一次
  - **示例**：

  ```ts
  const init = callOnce(() => {
    console.log('只执行一次')
  })
  init()
  ```
  - **注意**：全局作用域有效

## 八、高级功能

  ### `defineRouteRules`
  - **作用**：定义路由规则
  - **示例**：

  ```ts
  defineRouteRules({
    '/admin/**': { ssr: false } // 关闭SSR
  })
  ```
  - **注意**：通常在配置文件中使用
  ---
  ### `prerenderRoutes`
  - **作用**：预渲染路由
  - **示例**：

  ```ts
  prerenderRoutes(['/about', '/contact'])
  ```
  - **注意**：适用于静态站点生成
  ---
  ### `usePreviewMode`
  - **作用**：管理预览模式
  - **示例**：

  ```ts
  const { enabled } = usePreviewMode()
  if (enabled) showDraftContent()
  ```
  - **注意**：需要 CMS 集成
  ---
  ### `defineNuxtPlugin`
  - **作用**：定义 Nuxt 插件
  - **示例**：

  ```ts
  defineNuxtPlugin((nuxtApp) => {
    nuxtApp.provide('hello', (name) => `Hello ${name}!`)
  })
  ```
  - **注意**：插件文件放在 `plugins` 目录
  ---
  ### `defineNuxtRouteMiddleware`
  - **作用**：定义路由中间件
  - **示例**：

  ```ts
  defineNuxtRouteMiddleware((to) => {
    if (!isAuth(to)) return '/login'
  })
  ```
  - **注意**：中间件文件放在 `middleware` 目录
  ---
  ### `definePageMeta`
  - **作用**：定义页面元信息
  - **示例**：

  ```ts
  definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
  })
  ```
  - **注意**：只能在页面组件使用

## 使用注意事项总结
  1.**环境区分**：

  - 服务端专用：`useRequestEvent`, `setResponseStatus`
  - 客户端专用：`onNuxtReady, `useRouter`
  ---
  2.**唯一性要求**：

  - `useState`, `useAsyncData` 需要唯一 key
  - 避免命名冲突
  ---
  3.**性能优化**：

  - 非关键组件用 `defineLazyHydrationComponent`
  - 预加载资源用 `preloadRouteComponents`
  ---
  4.**错误处理**：

  - 主动错误用 `createError`
  - 全局捕获用 `showError`
  ---
  5.**SEO 最佳实践**：

  - 关键页面用 `useServerSeoMeta`
  - 动态内容用 `useSeoMeta`
  ---
  6.**路由控制**：

  - 导航用 `navigateTo`
  - 阻止导航用 `abortNavigation`
  ---
  7.**数据管理**：

  - 刷新数据用 `refreshNuxtData`
  - 清除状态用 `clearNuxtState`