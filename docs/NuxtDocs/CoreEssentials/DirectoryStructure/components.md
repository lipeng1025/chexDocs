# components
::: details 理论阐述
  
  **1. 什么是 components 目录？**
  > - `components` 目录是存放项目中可复用 Vue 组件的地方。这个目录下的组件会自动被 Nuxt3 注册，让你可以在整个项目中直接使用它们，不需要手动导入。
  ---
  **2. 有什么用？**
  > - **自动组件注册：** 组件无需手动导入，开箱即用
  > - **按需加载：** 组件只在需要时加载，优化性能
  > - **统一管理：** 集中存放所有可复用组件
  > - **命名简化：** 文件名直接作为组件名使用
  ---
  **3. 核心特性**
  > - **自动导入：** 无需手动引入，直接在模板中使用
  > - **命名规则：** 文件名自动转换为 PascalCase 组件名
  > - **嵌套结构：** 支持子目录组织组件
  > - **动态导入：** 默认支持代码分割
  ---
  **4. 目录结构建议&组件命名规则**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  components/
    ├── Button.vue
    ├── base/             # 基础组件 (Button, Input, Card等)
    │   ├── Button.vue
    │   └── Input.vue
    ├── ui/               # UI组件 (Modal, Dropdown, Tabs等)
    │   ├── Modal.vue
    │   └── Tabs.vue
    ├── layout/           # 布局相关组件
    │   ├── Header.vue
    │   └── Footer.vue
    ├── icons/            # 图标组件
    │   └── LogoIcon.vue
    └── global/           # 全局组件 (需要全局注册的)
        └── Toast.vue
  ```
  |  **文件位置**  |  **组件名**  |  **使用方式**  |
  |  ---  |  --- |  --- |
  |  `Button.vue`  |  `<Button>`  |  直接使用  |
  |  `base/Input.vue`  |  `<BaseInput>`  |  目录名作为前缀  |
  |  `ui/modal/ConfirmModal.vue`  |  `<UiModalConfirmModal>`  |  多级目录组合前缀  |
  ---
  **6. 需要手动导入吗？**  
  > - **不需要！** 这是 `components` 目录最大的优势。你只需要：  
  > 1：在 `components` 目录创建 `.vue` 文件  
  > 2：在模板中直接使用组件名  
  > 3：Nuxt3 会自动处理导入和注册  
  ---

:::
  

::: details 代码示例
  
  **1. 基础组件使用**
  ``` vue
  <!-- components/Button.vue -->
  <template>
    <button>
      <slot />
    </button>
  </template>
  ```
  > `pages/` 是Nuxt3主要的目录之一,存放的是项目主要的页面
  ``` vue
  <!-- pages/index.vue -->
  <template>
    <div>
      <!-- 直接使用组件 -->
      <Button>点击我</Button>
    </div>
  </template>
  <!-- 不需要在 script 中导入 -->
  ```
  ---
  **2. 带前缀的组件**
  ``` vue
  <!-- components/base/Input.vue -->
  <template>
      <input 
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />
  </template>

  <script setup>
      // defineProps: 用于接收父组件传递的参数
      // defineEmits: 用于子组件修改父组件的参数
      //              也可以理解为事件传递，事件传递到父组件之后
      //              除了可以修改参数，也可以做其他的逻辑处理
      defineProps(['modelValue'])
      defineEmits(['update:modelValue'])
  </script>
  ```
  ```vue
  <!-- pages/contact.vue -->
  <template>
      <form>
        <!-- 使用带前缀的组件 -->
        <BaseInput v-model="name" placeholder="请输入姓名" />
        <Button>提交</Button>
      </form>
  </template>

  <script setup>
      const name = ref('')
  </script>
  ```
  ---
  **3. 嵌套组件**
  ``` vue
  <!-- components/ui/Tabs.vue -->
  <template>
    <div class="tabs">
      <div class="tabs-header">
        <button 
          v-for="(tab, index) in tabs" 
          :key="index"
          @click="activeTab = index"
        >
          {{ tab.title }}
        </button>
      </div>
      <div class="tabs-content">
        <slot :name="`tab-${activeTab}`" />
      </div>
    </div>
  </template>

  <script setup>
  const tabs = [
    { title: '基本信息' },
    { title: '详细信息' },
    { title: '设置' }
  ]
  const activeTab = ref(0)
  </script>
  ```
  ```vue
  <!-- pages/profile.vue -->
  <template>
    <UiTabs>
      <template #tab-0>
        <ProfileBasic />
      </template>
      <template #tab-1>
        <ProfileDetails />
      </template>
      <template #tab-2>
        <ProfileSettings />
      </template>
    </UiTabs>
  </template>
  ```
  ---
  **4. 动态组件**
  ``` vue
  <!-- pages/dashboard.vue -->
  <template>
    <component :is="currentComponent" />
  </template>

  <script setup>
  // 动态加载组件
  const components = {
    stats: defineAsyncComponent(() => import('~/components/dashboard/StatsCard')),
    activity: defineAsyncComponent(() => import('~/components/dashboard/ActivityFeed')),
    notifications: defineAsyncComponent(() => import('~/components/dashboard/Notifications'))
  }

  const currentComponent = ref('stats')
  </script>
  ```
  ---
  **5. 全局组件配置**
  ``` vue
  <!-- components/global/Toast.vue -->
  <template>
    <div v-if="show" class="toast">
      {{ message }}
    </div>
  </template>

  <script setup>
  const show = ref(false)
  const message = ref('')

  const showToast = (msg) => {
    message.value = msg
    show.value = true
    setTimeout(() => show.value = false, 3000)
  }

  // 提供方法供全局组件使用
  provide('toast', showToast)
  </script>
  ```
  > `layouts/` 是Nuxt3主要目录之一,存放的是项目所有的布局页面  
  > default.vue是默认页面，跟pages下面的index.vue一样，是必须的
  ``` vue
  <!-- layouts/default.vue -->
  <template>
    <div>
      <Header />
      <slot />

      <Toast />

      <Footer />
    </div>
  </template>
  ```
  ``` vue
  <!-- 任意组件中使用 -->
  <script setup>
  const { $toast } = useNuxtApp()

  const saveData = async () => {
    try {
      await api.save()
      // 执行components/global/Toast.vue组件注册的方法
      $toast('保存成功！')
    } catch (error) {
      $toast('保存失败：' + error.message)
    }
  }
  </script>
  ```
  ---
:::
  
::: details 问题补充
  
  **1. 组件命名冲突问题**  
  
  当多个组件同名时，Nuxt 会按以下优先级处理：
  > - 1: 具体路径的组件（如 `base/Button.vue`）
  > - 2: 全局组件（如 `Button.vue`）  

  **解决方案：**
  > - 使用目录结构避免同名
  > - 使用 prefix 配置添加前缀
  > - 明确指定路径, 在<mark>nuxt.config.ts</mark> 中配置：
  ``` ts
  export default defineNuxtConfig({
    components: [
      { path: '~/components/base/Button.vue', prefix: 'Base' },
      { path: '~/components/ui/Button.vue', prefix: 'Ui' }
    ]
  })
  ```
  ---
  **2. 自动导入的组件找不到**  

  **常见原因：**
  > - 文件不在 `components` 目录
  > - 文件名包含特殊字符（应使用 `kebab-case` 或 `PascalCase`）
  > - Nuxt 服务未重启（开发时修改配置后需要重启）

  **检查方法：**
  > - 列出所有自动导入的组件，可以检查出哪些组件并没有导入成功
  ``` vue
  <template>
      <!-- 临时添加 -->
      <div v-for="c in components">{{ c }}</div>
  </template>

  <script setup>
      // 查看所有自动导入的组件
      const components = Object.keys(useNuxtApp().vueApp._context.components)
  </script>
  ```
  ---
  **3. 性能优化建议**  
  
  > - **大型组件：** 使用动态导入，只有用的地方才导入，提高性能
  ``` vue
  <script setup>
      const HeavyComponent = defineAsyncComponent(
        () => import('~/components/HeavyComponent.vue')
      )
  </script>
  ```
  > - **按需加载：** 对于不常用的组件，使用动态导入而非自动导入，减少项目体积
  > - **组件分割：** 将大组件拆分为小组件
  ---
  **4. 与插件(plugins)中的组件注册区别**  
  |  **特性**  |  **components 目录**  |  **插件注册**  |
  |  ---  |  ---  |  ---  |
  |  自动导入  |  ✓  |  ✗ (需要手动注册)  |
  |  代码分割  |  ✓ (默认)  |  ✗ (除非手动实现)  |
  |  命名控制  |  通过文件名和目录|  完全自定义  |
  |  适合场景  |  普通组件  |  需要特殊处理的组件  |
  |  全局注册  |  可配置  |  默认全局  |
  ---
  **5. 与 composables 的配合**  
  
  组件可以配合 `composables` 实现逻辑复用：
  > `composables/` 是Nuxt3主要的目录之一,存放的是项目中的方法  
  > 也是自动导入，组件可以直接使用

  ``` ts
  // composables/useCounter.ts
  // 这里没有名字，那么文件名就是方法名
  // 如果有名字例如：export default addCount () => {}
  // 那么组件里使用的时候就是addCount
  export default () => {
    const count = ref(0)
    const increment = () => count.value++
    return { count, increment }
  }
  ```
  ``` vue
  <!-- components/Counter.vue -->
  <template>
      <div>
        <button @click="increment">+</button>
        <span>{{ count }}</span>
      </div>
  </template>

  <script setup>
      const { count, increment } = useCounter()
  </script>
  ```
  ---
  **6. 最佳实践**  
  
  1. **命名规范：**  
  > - 文件名：PascalCase (如 UserCard.vue)  
  > - 目录名：kebab-case (如 user-management)  
  2. **组件设计：**  
  > - 保持组件单一职责  
  > - 使用 props 和 emit 进行通信  
  > - 为复杂组件提供清晰的文档注释  
  3. **目录组织：**  
  > - 按功能或领域分组  
  > - 避免过深的嵌套（不超过3层）  
  > - 通用组件放在顶层或 base 目录  
  4. **性能考虑：**  
  > - 大型列表使用虚拟滚动  
  > - 复杂计算使用 computed 属性  
  > - 避免不必要的全局组件  
  ---
  **7. 常见错误解决方案**  
  
  1. **组件未注册：**  
  > - 检查文件是否在 components 目录  
  > - 检查文件名是否正确  
  > - 重启 Nuxt 开发服务器  
  2. **props 未生效：**  
  > - 确保使用 defineProps 声明 props  
  > - 检查 prop 名称大小写（HTML 中是 kebab-case）  
  3. **样式冲突：**  
  > - 使用 scoped 样式（只在当前组件生效，不影响其他）  
  > - 或使用 CSS Modules：  
  ``` vue
  <style module>
    .button { color: red }
  </style>

  <template>
    <button :class="$style.button">按钮</button>
  </template>
  ```
  4. **服务端渲染问题：**  
  > - 避免在 setup 中使用 window/document  
  > - 使用 onMounted 钩子处理浏览器API  
  > - 使用 Nuxt 提供的 useFetch 替代 axios  
  ---

:::
  