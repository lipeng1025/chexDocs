# 状态管理

## 一、Pinia 安装与配置

  1.**安装步骤**
  ```bash
  npm install pinia @pinia/nuxt
  ```
  ---
  2.**Nuxt 配置**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: [
      '@pinia/nuxt'
    ],
    pinia: {
      autoImports: [
        'defineStore', // 自动导入 defineStore
        ['defineStore', 'definePiniaStore'] // 别名导入
      ]
    }
  })
  ```
  ---
  3.**注意事项**

  - 自动创建 `stores` 目录（项目根目录下）
  - 自动注册所有 `stores` 目录下的文件
  - 服务端渲染(SSR)支持开箱即用

## 二、定义 Store

  1.**基本结构(选项式 API 风格)**
  ```ts
  // stores/counter.ts
  import { defineStore } from 'pinia'

  export const useCounterStore = defineStore('counter', {
    state: () => ({
      count: 0,
      user: null as User | null
    }),
    
    getters: {
      doubleCount: (state) => state.count * 2,
      // 带参数的计算属性
      multiplyCount: (state) => (factor: number) => state.count * factor
    },
    
    actions: {
      increment() {
        this.count++
      },
      async fetchUser(userId: number) {
        const { data } = await useFetch(`/api/users/${userId}`)
        this.user = data.value
      }
    }
  })
  ```
  ---
  2.**组合式 API 风格**
  ```ts
  // stores/user.ts
  export const useUserStore = defineStore('user', () => {
    const token = ref(localStorage.getItem('token') || '')
    const profile = ref<UserProfile | null>(null)
    
    const isLoggedIn = computed(() => !!token.value)
    
    async function login(credentials: LoginData) {
      const { data } = await useFetch('/api/login', {
        method: 'POST',
        body: credentials
      })
      token.value = data.value.token
      localStorage.setItem('token', token.value)
    }
    
    function logout() {
      token.value = ''
      localStorage.removeItem('token')
    }
    
    return { token, profile, isLoggedIn, login, logout }
  })
  ```
## 三、在组件中使用 Store

  1.**基本使用**
  ```vue
  <script setup>
    import { useCounterStore } from '@/stores/counter'

    const counter = useCounterStore()

    // 访问状态
    console.log(counter.count)

    // 使用计算属性
    console.log(counter.doubleCount)

    // 调用 action
    counter.increment()

    // 带参数的 getter
    console.log(counter.multiplyCount(3))
  </script>

  <template>
    <div>
      <p>Count: {{ counter.count }}</p>
      <p>Double: {{ counter.doubleCount }}</p>
      <button @click="counter.increment()">+1</button>
    </div>
  </template>
  ```
  ---
  2.**响应式解构**
  ```ts
  import { storeToRefs } from 'pinia'

  const counter = useCounterStore()

  // 正确：使用 storeToRefs 保持响应性
  const { count, doubleCount } = storeToRefs(counter)

  // 错误：直接解构会失去响应性
  const { count } = counter // ❌ 非响应式
  ```
## 四、服务端使用 Store (Hydration)

  1.**服务端数据预取**
  ```ts
  // app.vue
  import { useUserStore } from '@/stores/user'

  export default defineComponent({
    async setup() {
      const userStore = useUserStore()
      
      // 只在服务端执行
      if (process.server) {
        await userStore.fetchUser()
      }
      
      return { userStore }
    }
  })
  ```
  ---
  2.**自动状态序列化**

  Nuxt 会自动处理：

  - 服务端初始化 store
  - 序列化状态到 HTML
  - 客户端激活(hydration)
  ---
  3.**注意事项**
  
  - 避免在 `store` 构造函数中访问浏览器 API
  - 使用 `useState` 替代 `ref` 进行服务端安全的状态管理
  ```ts
  // 在 store 中使用
  import { useState } from '#app'

  const token = useState('token', () => '')
  ```
## 五、状态持久化

  1.**使用 pinia-plugin-persistedstate**
  ```bash
  npm install pinia-plugin-persistedstate
  ```
  ---
  2.**配置插件**
  ```ts
  // plugins/pinia-persist.ts
  import { createPinia } from 'pinia'
  import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

  export default defineNuxtPlugin((nuxtApp) => {
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)
    nuxtApp.vueApp.use(pinia)
  })
  ```
  ---
  3.**Store 配置**
  ```ts
  defineStore('cart', {
    state: () => ({
      items: []
    }),
    persist: {
      storage: persistedState.localStorage,
      paths: ['items'] // 只持久化 items 字段
    }
  })
  ```
  ---
  4.**自定义持久化策略**
  ```ts
  persist: {
    storage: {
      getItem(key) {
        return uni.getStorageSync(key)
      },
      setItem(key, value) {
        uni.setStorageSync(key, value)
      }
    }
  }
  ```
## 六、与 useState 的对比与选择

  对比表

  |  **特性**  |  **Pinia**  |  **useState**  |
  |  ---  |  ---  |  ---  |
  |  类型  |  完整状态管理库  |轻量级状态共享  |
  |  适用场景  |  复杂应用状态管理  |简单组件间状态共享  |
  |  开发工具支持  |  ✅ Pinia DevTools  |❌  |
  |  模块化  |  ✅ 多 store 组织  |❌  |
  |  SSR 支持  |  ✅ 自动 hydration  |✅  |
  |  持久化  |  ✅ 通过插件  |❌ 需手动实现  |
  |  学习曲线  |  中等  |简单  |
  |  服务端安全  |  需额外注意  |自动处理  |

  ---
  使用场景建议

  1.**使用 Pinia：**

  - 全局共享状态（用户认证、购物车）
  - 复杂业务逻辑封装
  - 需要状态持久化的场景
  - 需要开发工具调试的状态
  ---
  2.**使用 useState：**

  - 组件间简单状态共享
  - 页面级临时状态
  - 需要最小化依赖的场景
  - 服务端优先的状态管理

  ```vue
  <script setup>
    // useState 示例
    const darkMode = useState('dark-mode', () => false)
  </script>

  // 在组件中使用
  <template>
    <button @click="darkMode = !darkMode">
      {{ darkMode ? '🌙' : '☀️' }}
    </button>
  </template>
  ```
## 七、最佳实践与注意事项

  1.**命名规范：**

  - Store 文件：`stores/user.ts`
  - Store 名称：`useUserStore`
  - State 命名：`camelCase` (如 `userProfile`)
  ---
  2.**安全注意事项：**

  - 敏感数据（token）不要直接存在 store 中
  - 服务端渲染时避免暴露敏感数据

  ```ts
  // 安全示例
  const token = ref('')
  if (process.client) {
    token.value = localStorage.getItem('token') || ''
  }
  ```
  ---
  3.**性能优化：**

  - 大状态对象使用 shallowRef

  ```ts
  const largeData = shallowRef({ /* 大数据对象 */ })
  ```
  ---
  4.**模块化组织：**
  ```text
  stores/
    auth.store.ts
    cart.store.ts
    products/
      product.store.ts
      category.store.ts
  ```
  ---
  5.**TypeScript 支持：**
  ```ts
  interface UserState {
    id: number
    name: string
  }

  defineStore('user', {
    state: (): UserState => ({
      id: 0,
      name: ''
    })
  })
  ```
  ---
  6.**避免过度使用：**

  - 组件内部状态优先使用组件自身的 `ref`/`reactive`
  - 只有真正需要全局共享的状态才放入 store
## 总结

  Pinia 在 Nuxt3 中是官方推荐的状态管理解决方案，特别适合复杂应用：

  - 提供完整的 state/getters/actions 体系
  - 支持服务端渲染和状态 hydration
  - 通过插件实现持久化等高级功能
  - 完善的 TypeScript 支持


