# ComposablesApi

## 一、数据获取相关

  ### `useAsyncData` 和 `useLazyAsyncData`

  - **作用**：获取异步数据（支持服务端渲染）
  - **区别**：

      - `useAsyncData`：立即执行
      - `useLazyAsyncData`：延迟执行（需要手动触发）

  - **示例**：

  ```ts
  const { data } = await useAsyncData('user', () => $fetch('/api/user'))

  // 延迟加载
  const { data, execute } = useLazyAsyncData('posts', () => $fetch('/api/posts'))
  ```
  - **注意**：key 值必须唯一，避免重复请求
  ---
  ### `useFetch` 和 `useLazyFetch`

  - **作用**：简化 API 请求
  - **区别**：

      - `useFetch`：自动发起请求
      - `useLazyFetch`：手动触发请求

  - **示例**：

  ```ts
  const { data } = await useFetch('/api/products')

  // 带参数
  const { data } = await useFetch('/api/search', {
    params: { q: 'nuxt' }
  })
  ```
  - **注意**：会自动处理错误和加载状态
  ---
  ### `useNuxtData`

  - **作用**：获取缓存数据
  - **使用场景**：避免重复请求相同数据
  - **示例**：

  ```ts
  const { data } = useNuxtData('cached-products')

  if (!data.value) {
    await useAsyncData('cached-products', () => $fetch('/api/products'))
  }
  ```
  - **注意**：需要配合 `useAsyncData` 使用
## 二、状态管理

  ### `useState`

  - **作用**：创建响应式状态
  - **特点**：自动跨组件共享
  - **示例**：

  ```ts
  const counter = useState('counter', () => 0)
  ```
  - **注意**：key 值必须唯一
  ---
  ### `useCookie`

  - **作用**：读写浏览器 Cookie
  - **特点**：自动处理序列化
  - **示例**：

  ```ts
  const token = useCookie('token')

  // 设置 Cookie
  token.value = 'abc123'

  // 删除 Cookie
  token.value = null
  ```
  - **注意**：服务端和客户端均可使用
## 三、路由与导航

  ### `useRoute`

  - **作用**：访问当前路由信息
  - **示例**：

  ```ts
  const route = useRoute()
  console.log(route.params.id)
  ```
  - **注意**：返回只读对象、不能修改
  ---
  ### `useRouter`

  - **作用**：操作路由导航
  - **示例**：

  ```ts
  const router = useRouter()
  router.push('/dashboard')
  ```
  - **注意**：客户端专用
  ---
  ### `useRouteAnnouncer`

  - **作用**：屏幕阅读器路由提示
  - **示例**：

  ```ts
  useRouteAnnouncer({
    route: useRoute(),
    pageTitle: '我的应用'
  })
  ```
  - **注意**：提升无障碍体验
## 四、请求处理

  ### `useRequestHeaders`

  - **作用**：访问请求头信息
  - **使用场景**：服务端传递头信息
  - **示例**：

  ```ts
  const headers = useRequestHeaders(['cookie'])

  // 客户端调用 API
  const { data } = await useFetch('/api/user', { headers })
  ```
  - **注意**：服务端专用
  ---
  ### `useRequestURL`

  - **作用**：获取请求 URL
  - **示例**：

  ```ts
  const url = useRequestURL()
  console.log(url.href)
  ```
  - **注意**：服务端和客户端均可使用
  ---
  ### `useResponseHeader`

  - **作用**：设置响应头
  - **示例**：

  ```ts
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  ```
  - **注意**：服务端专用
## 五、SEO 与头部管理

  ### `useHead` 和 `useHeadSafe`

  - **作用**：管理页面头部信息
  - **区别**：

      - `useHead`：直接设置
      - `useHeadSafe`：自动转义特殊字符

  - **示例**：

  ```ts
  useHead({
    title: '首页',
    meta: [{ name: 'description', content: '欢迎访问' }]
  })
  ```
  - **注意**：避免重复设置相同标签
  ---
  ### `useSeoMeta` 和 `useServerSeoMeta`

  - **作用**：简化 SEO 设置
  - **区别**：

      - `useSeoMeta`：客户端和服务端
      - `useServerSeoMeta`：仅服务端

  - **示例**：

  ```ts
  useSeoMeta({
    title: '产品详情',
    ogTitle: '优质产品'
  })
  ```
  - **注意**：自动处理常用 SEO 标签
## 六、生命周期与状态

  ### `useHydration`

  - **作用**：处理服务端到客户端的数据传递
  - **示例**：

  ```ts
  const data = useHydration('init-data', () => fetchData())
  ```
  - **注意**：确保数据一致性
  ---
  ### `onPrehydrate`

  - **作用**：在客户端激活前执行
  - **示例**：

  ```ts
  onPrehydrate(() => {
    console.log('即将激活客户端')
  })
  ```
  - **注意**：主要用于插件开发
## 七、实用工具

  ### `useNuxtApp`

  - **作用**：访问 Nuxt 运行时上下文
  - **示例**：

  ```ts
  const { $hello } = useNuxtApp()
  $hello('world')
  ```
  - **注意**：核心工具函数
  ---
  ### `useRuntimeConfig`

  - **作用**：访问运行时配置
  - **示例**：

  ```ts
  const config = useRuntimeConfig()
  console.log(config.public.apiBase)
  ```
  - **注意**：区分 public 和私有配置
  ---
  ### `useAppConfig`

  - **作用**：访问应用配置
  - **示例**：

  ```ts
  const appConfig = useAppConfig()
  console.log(appConfig.theme)
  ```
  - **注意**：用于项目级配置
  ---
  ### `useError`

  - **作用**：处理全局错误
  - **示例**：

  ```ts
  const error = useError()
  if (error.value) {
    showAlert(error.value.message)
  }
  ```
  - **注意**：配合错误页面使用
  ---
  ### `useLoadingIndicator`

  - **作用**：控制加载指示器
  - **示例**：

  ```ts
  const { start, finish } = useLoadingIndicator()

  start() // 开始加载
  await fetchData()
  finish() // 结束加载
  ```
  - **注意**：默认与 `<NuxtLoadingIndicator>` 关联
  ---
  ### `usePreviewMode`

  - **作用**：管理预览模式
  - **示例**：

  ```ts
  const { enabled, state } = usePreviewMode()

  if (enabled) {
    console.log('预览模式激活')
  }
  ```
  - **注意**：需要 CMS 集成
## 八、注意事项总结

  1.**服务端 vs 客户端**：

  - `useRequestHeaders`、`useResponseHeader` 仅服务端
  - `useRouter` 仅客户端
  - 其他大多两端通用

  2.**唯一性要求**：

  - `useState`、`useAsyncData` 需要唯一 key
  - 避免命名冲突

  3.**性能优化**：

  - 合理使用 `useLazy*` 延迟加载
  - 用 `useNuxtData` 避免重复请求

  4.**SEO 最佳实践**：

  - 关键页面使用 `useServerSeoMeta`
  - 动态内容用 `useSeoMeta`

  5.**错误处理**：

  - 全局错误用 `useError`
  - 请求错误用 `useFetch` 自带的错误处理

  6.**数据一致性**：

  - 服务端渲染数据用 `useHydration` 传递
  - 避免客户端激活时数据闪烁

