# composables
::: details 理论阐述
  
  **1. 什么是 composables 目录？**
  > - `composables` 目录是存放 Vue 组合函数 (Composables) 的地方。这些是使用 Vue Composition API 封装的可复用逻辑
  让你可以在组件之间共享状态和逻辑。
  ---
  **2. 有什么用？**
  > - **逻辑复用：** 封装可复用的业务逻辑
  > - **代码组织：** 将复杂逻辑从组件中抽离
  > - **状态管理：** 创建可共享的响应式状态
  > - **SSR 支持：** 自动处理服务端和客户端差异
  > - **自动导入：** 无需手动导入即可使用
  ---
  **3. 核心特点**
  > - **自动扫描：** 目录下的文件自动导入
  > - **命名规范：** 文件名决定函数名
  > - **SSR 友好：** 自动处理服务端渲染
  > - **类型支持：** 完整的 TypeScript 支持
  > - **代码分割：** 按需加载逻辑
  ---
  **4. 目录结构建议&命名规则：**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  composables/
    ├── useAuth.ts              # 认证相关逻辑
    ├── useApi.ts               # API请求封装
    ├── useCart.ts              # 购物车逻辑
    ├── utils/                  # 工具函数
    │   ├── useFormat.ts
    │   └── useValidation.ts
    └── features/               # 按功能划分
        ├── useProduct.ts
        └── useUser.ts
  ```
  |  **文件位置**  |  **可调用函数名**  |
  |  ---  |  ---  |
  |  `useCounter.ts`  |  `useCounter()`  |
  |  `utils/useFormat.ts`  |  `useFormat()`  |
  |  `features/product.ts`  |  `useProduct()`  |
  ---
  **6. 需要手动导入吗？**

  **不需要！** 这是 composables 目录最大的优势：
  > - 1: 在 composables 目录创建 .ts 文件
  > - 2: 在文件中定义并导出组合函数
  > - 3: 在组件中直接调用函数名使用
  > - 4: Nuxt3 会自动处理导入
  ---
:::
  
::: details 代码示例
  
  **1. 基础计数器示例**

  ``` ts
  // composables/useCounter.ts
  export default function () {
    const count = ref(0)
    
    const increment = () => count.value++
    const decrement = () => count.value--
    const reset = () => count.value = 0
    
    return {
      count,
      increment,
      decrement,
      reset
    }
  }
  ```
  ``` vue
  <!-- 在组件中使用 -->
  <script setup>
  const { count, increment } = useCounter()
  </script>

  <template>
    <div>
      <p>计数: {{ count }}</p>
      <button @click="increment">增加</button>
    </div>
  </template>
  ```
  ---
  **2. API 请求封装**

  ``` ts
  // composables/useApi.ts
  export default function () {
    const fetchData = async <T>(url: string): Promise<T> => {
      const { data, error } = await useFetch<T>(url)
      
      if (error.value) {
        throw new Error(error.value.message)
      }
      
      return data.value as T
    }
    
    return {
      fetchData
    }
  }
  ```
  ``` vue
  <script setup>
  const { fetchData } = useApi()

  const products = ref([])

  onMounted(async () => {
    products.value = await fetchData<Product[]>('/api/products')
  })
  </script>
  ```
  ---
  **3. 用户认证状态**

  ``` ts
  // composables/useAuth.ts
  export const useAuth = () => {
    const user = useState<User | null>('user', () => null)
    const isLoggedIn = computed(() => !!user.value)
    
    const login = async (email: string, password: string) => {
      const { data, error } = await useFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      
      if (data.value) {
        user.value = data.value.user
        return true
      }
      
      throw error.value
    }
    
    const logout = async () => {
      await useFetch('/api/auth/logout', { method: 'POST' })
      user.value = null
    }
    
    return {
      user,
      isLoggedIn,
      login,
      logout
    }
  }
  ```
  ``` vue
  <script setup>
  const { user, isLoggedIn, login } = useAuth()

  const email = ref('')
  const password = ref('')

  const handleLogin = async () => {
    try {
      await login(email.value, password.value)
      navigateTo('/dashboard')
    } catch (error) {
      alert('登录失败')
    }
  }
  </script>
  ```
  ---
  **4. 本地存储封装**

  ``` ts
  // composables/useLocalStorage.ts
  export default function <T>(key: string, defaultValue: T) {
    const state = ref<T>(defaultValue)
    
    // 从 localStorage 读取初始值
    if (process.client) {
      const stored = localStorage.getItem(key)
      state.value = stored ? JSON.parse(stored) : defaultValue
    }
    
    // 监听变化并存储
    watch(state, (newValue) => {
      if (process.client) {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    }, { deep: true })
    
    return state
  }
  ```
  ``` vue
  <script setup>
  // 使用示例
  const darkMode = useLocalStorage('dark-mode', false)

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
  }
  </script>
  ```
  ---
:::
  
::: details 问题补充
  
  **1. 命名冲突问题**

  当多个 composable 同名时，Nuxt 会按以下优先级处理：

  > - 1: 具体路径的函数（如 features/useProduct.ts）
  > - 2: 顶层的函数（如 useProduct.ts）

  **解决方案：**

  > - 使用目录结构避免同名
  > - 使用更具体的函数名
  > - 使用命名导出, 这样的好处是不用创建太多的文件，按照项目而定
  ``` ts
  // composables/product.ts
  export const useProductSearch = () => { /* ... */ }
  export const useProductDetail = () => { /* ... */ }

  // 组件中使用
  const { search } = useProductSearch()
  ```
  ---
  **2. 自动导入不工作**  

  **常见原因：**

  > - 文件不在 composables 目录
  > - 没有默认导出
  > - 文件名包含特殊字符（应使用 camelCase）
  > - Nuxt 服务未重启

  
  **检查方法：**
  
  > - 列出所有自动导入的函数，可以检查出哪些函数并没有导入成功
  ``` ts
  // 打印所有自动导入的函数
  console.log(Object.keys(useNuxtApp()))
  ```
  ---
  **3. 服务端渲染 (SSR) 注意事项**  
  > - 1: **浏览器 API：** 使用前检查 `process.client`
  ``` ts
  if (process.client) {
    // 使用 window, document 等
  }
  ```
  > - 2: **状态共享：** 使用 `useState` 代替 `ref` 用于跨请求状态
  ``` ts
  // 错误：在 SSR 中会共享
  const count = ref(0)

  // 正确：每个请求独立状态
  const count = useState('count', () => 0)
  ```
  > - 3: **异步数据：** 使用 `useAsyncData` 处理异步操作
  ``` ts
  const { data } = useAsyncData('products', () => 
    $fetch('/api/products')
  )
  ```
  ---
  **4. 与 Vue 的 composables 区别**  
  |  **特性**  |  **Nuxt composables**  |  **Vue composables**  |
  |  ---  |  ---  |  ---  |
  |  自动导入  |  ✓  |  ✗ (需手动导入)  |
  |  SSR 支持  |  ✓ (自动处理)  |  ✗ (需手动实现)  |
  |  状态共享  |  通过 useState  |  需自行实现  |
  |  路由集成  |  通过 useRouter  |  需手动获取  |
  |  适合场景  |  Nuxt 项目  |  通用 Vue 项目  |
  ---
  **5. 性能优化**  
  > - 1: **按需加载：** 对于大型 composable，使用动态导入
  ``` ts
  const { data } = useAsyncData('heavy', () => 
    import('~/composables/useHeavyLogic').then(m => m.default())
  )
  ```
  > - 2: **计算属性缓存：** 使用 `computed` 避免重复计算
  ``` ts
  const total = computed(() =>
      items.value.reduce((sum, item) => sum + item.price, 0
  ))
  ```
  > - 3: **防抖节流：** 高频操作使用防抖
  ``` ts
  import { debounce } from 'lodash-es'

  const search = debounce((query) => {
    // 搜索逻辑
  }, 300)
  ```
  ---
  **7. 最佳实践**

  1.**命名规范：** 
  > - 文件名：camelCase（如 `useCounter.ts`）
  > - 函数名：useXxx（如 `useCounter()`）

  2.**单一职责：**
  > - 每个 composable 只关注一个功能
  > - 避免创建"上帝函数"

  3.**参数设计：**
  > - 使用可选参数提供灵活性
  > - 使用对象参数便于扩展
  ```ts
  export default function (options = { delay: 300 }) {
    // 具体逻辑
  }
  ```

  4.**返回值：**
  > - 返回 ref 和计算属性
  > - 返回方法供外部调用
  > - 使用 TypeScript 定义返回类型

  5.**错误处理：**
  > - 抛出错误而非静默失败
  > - 提供错误状态
  ```ts
  const { data, error, execute } = useAsyncData(/* 具体逻辑 */)
  ```

  ---
  **8. 常见问题解决方案**

  1.**函数未定义：**
  > - 检查文件是否在 composables 目录
  > - 确保使用默认导出
  > - 重启 Nuxt 开发服务器

  2.**响应式丢失：**
  > - 使用 `ref` 或 `reactive` 包装原始值
  > - 使用 `toRefs` 解构响应式对象：
  ``` ts
  const state = reactive({ count: 0 })
  return { ...toRefs(state) }
  ```

  3.**SSR 报错：**
  > - 检查是否在服务端访问浏览器 API
  > - 使用 `onMounted` 生命周期钩子
  > - 使用 Nuxt 提供的 `useFetch` 替代直接 fetch

  4.**状态不更新：**
  > - 确保使用 `.value` 访问 ref 值
  > - 检查是否意外修改了原始对象而非响应式对象
  > - 使用 `watch` 或 `watchEffect` 监听变化

  ---
:::
  