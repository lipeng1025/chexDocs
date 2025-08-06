# 目录结构

<DirectoryStructureTreeData />

## 功能模块
### assets
<CustomSection name="理论阐述" color="blue">
  
  **1. 什么是 assets 目录？**  
  > - `assets` 目录是存放项目中需要构建处理的静态资源的地方。这些文件在项目构建时会被处理、优化，然后打包到最终产物中。
    
  ---
  **2. 有什么用？**  
  > - 存放需要被构建工具`（Vite/Webpack）`处理的静态资源
  > - 支持别名 `~/assets` 方便引用
  > - 文件会经过优化处理（如：图片压缩、样式预编译等）
  > - 适合存放需要转换或优化的资源
    
  ---
  **3. 常见存放内容：**  
  > - 样式文件`（CSS、SCSS、Less、Stylus）`
  > - 需要优化的图片`（PNG、JPG、SVG等）`
  > - 字体文件`（.woff, .ttf）`
  > - SVG图标`（可转换为Vue组件）`
  > - 其他需要构建处理的资源`（如数据JSON）`
    
  ---
  **4. 目录结构建议：**  
  ``` text
  assets/
    ├── images/       # 存放图片
    ├── styles/       # 存放样式文件（全局样式、变量等）
    ├── fonts/        # 存放字体文件
    ├── icons/        # 存放图标（SVG文件）
    └── data/         # 存放静态数据（如数据JSON）
  ```
  ---
  **5. 需要引入才能使用吗？**  
  > - 是的，`assets`目录中的文件需要引入才能在组件、页面或工具类中使用。不能像`public`目录那样直接通过路径访问。
    
  ---
  **6. 与public目录的区别：**  
  |  特性  |  assets 目录  |  public 目录  |
  |  ----  |  ----  |  ----  |
  |  构建处理  |  ✓ (编译/优化)  |  ✗ (原样复制)  |
  |  引用方式  |  `~/assets/path`  |  `/filename` (比如: `/favicon.ico`)  |
  |  适用场景  |  样式/字体/图片/视频/需优化资源  |  直接暴露的静态文件（比如: 项目Logo）  |
  |  路径变化  |  构建后路径会变化（可能出现上线的项目静态资源不显示，比如: 图片）  |  保持原路径  |
  
  ---
  **7. 配置相关：**  
  &nbsp;&nbsp;在 <mark>nuxt.config.ts</mark> 中，可以配置资源处理方式：  
  ``` ts
    export default defineNuxtConfig({
      // 配置Vite处理资源
      vite: {
        // 这里的配置用处是全局引入scss定义的常量，
        // 在组件内可以直接使用，无需再引入
        css: {
          preprocessorOptions: {
            scss: {
              additionalData: `@use "~/assets/styles/variables.scss" as *;`
            }
          }
        }
      }
    })
  ```
</CustomSection>

<CustomSection name="代码示例" color="purple">
  
  **1. 在Vue组件中使用图片**  
  ``` vue
  <template>
      <!-- 方式1：直接使用路径（需要require） -->
      <img :src="require('~/assets/images/logo.png')" alt="Logo">

      <!-- 方式2：导入后使用 -->
      <img :src="logo" alt="Logo">

      <!-- 方式3：动态路径 -->
      <img :src="getImage('banner')" alt="Banner">
  </template>

  <script setup>
      // 导入静态图片
      import logo from '~/assets/images/logo.png'

      // 动态获取图片路径
      const getImage = (name) => {
          return require(`~/assets/images/${name}.jpg`)
      }
  </script>
  ```
  ---
  **2. 使用样式文件**  
  ``` vue
  <script setup>
      // 导入全局样式
      import '~/assets/styles/global.css'
  </script>

  <style scoped>
      /* 在样式中引用assets资源 */
      .header {
          background-image: url('~/assets/images/header-bg.jpg');
          font-family: 'CustomFont', sans-serif;
      }
  </style>
  ```
  ---
  **3. 使用Scss/Less**  
  ``` scss
  // 在 assets/styles/variables.scss 文件中定义常量
  $primary-color: #3b82f6;
  $secondary-color: #10b981;
  ```
  
  ``` vue
  <style lang="scss" scoped>
  // 在上面的scss中已经定义了两个常量，这里在组件内引入使用
  // 注意：这里是局部引入，想要全局引入请参考 👉 [理论阐述->7. 配置相关]
  @use "~/assets/styles/variables" as vars;

  .button {
      background-color: vars.$primary-color;
      color: white;
      
      &:hover {
        background-color: darken(vars.$primary-color, 10%);
      }
  }
  </style>
  ```
  ---
  **4. 使用字体文件**  
  ``` css
  /* assets/styles/fonts.css */
  @font-face {
    font-family: 'CustomFont';
    src: url('~/assets/fonts/custom-font.woff2') format('woff2'),
        url('~/assets/fonts/custom-font.woff') format('woff');
    font-weight: 400;
    font-style: normal;
  }
  ```
  
  ``` vue
  <script setup>
      // 在组件中导入字体
      import '~/assets/styles/fonts.css'
  </script>

  <template>
      <!-- 使用fonts.css中自定义的类名 -->
      <h1 class="custom-font">使用自定义字体</h1>
  </template>
  ```
  ---
  **5. 使用SVG图标**  
  ``` vue
  <script setup>
      // 导入SVG作为组件
      // 当然你也可以将SVG图标引入之后放到img标签的src中使用
      // 相关用法可以参考 👉 [1. 在Vue组件中使用图片]
      import LogoIcon from '~/assets/icons/logo.svg?component'
  </script>

  <template>
      <LogoIcon />
  </template>
  ```
  ---
  **6. 使用JSON数据**  
  ``` vue
  <script setup>
      // 导入JSON数据
      import productData from '~/assets/data/products.json'

      // ref 是Vue3中定义一个响应式的变量所使用的函数
      const products = ref(productData)
  </script>

  <template>
      <div v-for="product in products" :key="product.id">
        <h3>{{ product.name }}</h3>
        <p>{{ product.description }}</p>
      </div>
  </template>
  ```
  ---
</CustomSection>

<CustomSection name="问题补充" color="amber">
  
  **1. 图片优化注意事项**  
  - 大图片（>4KB）建议放在`assets`进行优化
  - 小图标（<4KB）可以考虑放在`public`目录或内联为`Base64`
  ---
  **2. 样式文件全局导入**  
  可以在 <mark>nuxt.config.ts</mark> 中全局导入样式文件：  
  ``` ts
  export default defineNuxtConfig({
    css: [
      '~/assets/styles/main.css',
      '~/assets/styles/variables.scss'
    ]
  })
  ```
  > 注意：由于全局导入，所有相关的样式都会受到影响
  ---
  **3. 动态路径问题**  
  由于构建工具需要知道所有资源路径，动态路径不能直接使用别名：  
  ``` vue
  <template>
      <!-- 错误：动态路径不能这样使用 -->
      <img :src="`~/assets/images/${imageName}.png`">
      
      <!-- 正确：使用require或import.meta.url -->
      <img :src="getImage(imageName)">
  </template>

  <script setup>
      const getImage = (name) => {
          return require(`~/assets/images/${name}.png`)
          // 或
          // return new URL(`./assets/images/${name}.png`, import.meta.url).href
      }
  </script>
  ```
  > 注意：避免项目构建发布之后，图片不显示的一些异常问题
  ---
  **4. SVG使用建议**  
  - 使用`?component`后缀将SVG转换为Vue组件
  - 安装`vite-svg-loader`可以简化使用：
  ``` bash
  npm install vite-svg-loader
  ```
  在<mark>nuxt.config.ts</mark> 中配置：
  ``` ts
  export default defineNuxtConfig({
    vite: {
      plugins: [
        svgLoader()
      ]
    }
  })
  ```
  ---
  **5. 构建结果**  
  构建后，`assets`中的文件会被处理并输出到 `_nuxt` 目录下，文件名会包含哈希值用于缓存：
  ``` text
  /_nuxt/
  ├── images/
  │   └── logo.123abc.png
  ├── fonts/
  │   └── custom-font.456def.woff2
  └── styles/
      └── main.789ghi.css
  ```
  ---
  **6. 最佳实践**  
  1. **图片**：  
      - 需要优化的图片 → assets  
      - 直接使用的静态文件 → public  
  2. **样式**：  
      - 全局样式 → 通过nuxt.config全局导入  
      - 组件样式 → 使用scoped CSS  
      - 变量/混合 → 放在assets/styles  
  3. **字体**：  
      - 使用WOFF2格式（现代浏览器）  
      - 提供WOFF作为备选  
  4. **数据**：  
      - 小型静态数据 → assets/data  
      - 大型数据 → 考虑放在public或使用API  
  5. **SVG图标**：  
      - 常用图标 → 转换为Vue组件  
      - 偶尔使用 → 放在public或内联  
  ---
  **7. 常见错误**  
  - **404错误**：路径错误，确保使用`~/assets/`前缀
  - **构建失败**：检查文件是否存在，路径是否正确
  - **样式未生效**：检查是否正确定义和导入
  - **图片未优化**：确认文件在`assets`目录而非`public`
  ---

</CustomSection>

---

### components
<CustomSection name="理论阐述" color="blue">
  
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

</CustomSection>

<CustomSection name="代码示例" color="purple">
  
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
</CustomSection>
<CustomSection name="问题补充" color="amber">
  
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

</CustomSection>

---

### composables
<CustomSection name="理论阐述" color="blue">
  
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
</CustomSection>
<CustomSection name="代码示例" color="purple">
  
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
</CustomSection>
<CustomSection name="问题补充" color="amber">
  
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
</CustomSection>

---
### layouts
<CustomSection name="理论阐述" color="blue">
  
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
</CustomSection>
<CustomSection name="代码示例" color="purple">
  
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
</CustomSection>
<CustomSection name="问题补充" color="amber">
  
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
</CustomSection>

---
### middleware
<CustomSection name="理论阐述" color="blue">
  
  **1. 什么是 middleware 目录？**
  > - `middleware` 目录用于存放路由中间件文件。这些文件在页面渲染前执行，可拦截路由、修改请求/响应、执行认证检查等操作。中间件在服务端和客户端均可运行。
  ---
  **2. 有什么用？**
  > - **路由守卫**：控制页面访问权限
  > - **全局逻辑**：执行跨页面共享的逻辑
  > - **数据预处理**：提前获取页面所需数据
  > - **请求修改**：修改请求头或响应头
  > - **错误处理**：统一处理路由错误
  ---
  **3. 常见使用场景**
  > - **用户身份验证**
  > - **权限控制**
  > - **日志记录**
  > - **A/B测试**
  > - **地理定位检查**
  > - **维护模式切换**
  ---
  **4. 目录结构建议**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  middleware/
    ├── auth.global.ts    # 全局中间件（自动运行）
    ├── admin.ts          # 管理员权限检查
    ├── guest.ts          # 访客限制
    ├── log.ts            # 访问日志记录
    └── maintenance.ts    # 维护模式检查
  ```
  ---
  **5. 需要引入才能使用吗？**
  > - **全局中间件**（`.global`后缀）自动应用于所有路由
  > - **命名中间件**需要在页面中通过 `definePageMeta` 显式调用
  ---
  **6. 与插件（plugins）的区别：**

  |  **特性**  |  **middleware**  |  **plugins**  |
  |  ---  |  ---  |  ---  |
  |  执行时机  |  路由导航前（客户端或服务端）  |  Nuxt应用初始化时（客户端和服务端）  |
  |  使用场景  |  路由相关的逻辑  |  应用初始化、全局功能注入  |
  |  访问上下文  |  访问路由对象 (to, from)  |  访问Nuxt应用实例  |
  |  多次执行  |  每次路由变化  |  仅一次（或每次热更新）  |
  ---
  **7. 配置相关：**

  在 <mark>nuxt.config.ts</mark> 中可配置中间件行为：
  ```ts
  export default defineNuxtConfig({
    routeRules: {
      '/admin/**': { 
        middleware: ['auth', 'admin'] // 路由级中间件
      }
    }
  })
  ```
  ---
</CustomSection>
<CustomSection name="代码示例" color="purple">
  
  **1. 全局身份验证中间件**

  **`/middleware/auth.global.ts`**
  ```ts
  export default defineNuxtRouteMiddleware((to) => {
    const { isAuthenticated } = useAuthStore()
    
    // 重定向到登录页
    if (!isAuthenticated && !to.path.startsWith('/login')) {
      return navigateTo('/login?redirect=' + to.fullPath)
    }
    
    // 已登录时禁止访问登录页
    if (isAuthenticated && to.path === '/login') {
      return navigateTo('/dashboard')
    }
  })
  ```
  ---
  **2. 命名中间件（管理员检查）**

  **`/middleware/admin.ts`**
  ```ts
  export default defineNuxtRouteMiddleware((to) => {
    const user = useUserStore()
    
    if (!user.isAdmin) {
      // 中止导航并显示错误
      return abortNavigation({
        statusCode: 403,
        message: 'Requires admin privileges'
      })
    }
  })
  ```

  在页面中使用：
  ```vue
  <script setup>
    definePageMeta({
      middleware: ['admin'] // 使用中间件
    })
  </script>
  ```
  ---
  **3. 维护模式中间件**

  **`/middleware/maintenance.ts`**
  ```ts
  export default defineNuxtRouteMiddleware(() => {
    const { maintenanceMode } = useRuntimeConfig().public
    
    if (maintenanceMode) {
      // 重定向到维护页面
      return navigateTo('/maintenance', { redirectCode: 503 })
    }
  })
  ```
  ---
  **4. 异步数据预取**

  **`/middleware/data-prefetch.ts`**
  ```ts
  export default defineNuxtRouteMiddleware(async (to) => {
    const productId = to.params.id
    if (productId) {
      // 预取产品数据
      await useProductStore().fetchProduct(productId as string)
    }
  })
  ```
  ---
  **5. 多中间件组合使用**

  ```vue
  <script setup>
    definePageMeta({
      middleware: [
        'auth',    // 先验证登录
        'admin',   // 再验证管理员权限
        'log'      // 最后记录访问日志
      ]
    })
  </script>
  ```
  ---
</CustomSection>
<CustomSection name="问题补充" color="amber">
  
  **1. 执行顺序规则**
  > - 1: 全局中间件（按文件名顺序）
  > - 2: 布局（layout）中定义的中间件
  > - 3: 页面中定义的中间件
  ---
  **2. 服务端 vs 客户端执行**
  > - **首次访问**：在服务端执行
  > - **客户端导航**：在客户端执行
  > - **强制服务端执行**：
  ```ts
  defineNuxtRouteMiddleware(to => {
      if (process.server) {
        // 仅服务端逻辑
      }
  })
  ```
  ---
  **3. 动态添加中间件**
  ```ts
  // 在插件或组件中动态添加
  addRouteMiddleware('tracking', (to) => {
    useTrackPageView(to.path)
  }, { global: true })
  ```
  ---
  **4. 错误处理最佳实践**
  ```ts
  export default defineNuxtRouteMiddleware(() => {
      try {
        // 业务逻辑
      } catch (error) {
        // 统一错误处理
        showError({
          statusCode: 500,
          message: 'Middleware error'
        })
        // 或中止导航
        return abortNavigation(error)
      }
  })
  ```
  ---
  **5. 中间件类型定义**
  ```ts
  // 增强类型安全
  interface MiddlewareContext {
    to: RouteLocationNormalized
    from: RouteLocationNormalized
    next?: () => void
  }

  export default defineNuxtRouteMiddleware((context: MiddlewareContext) => {
    // 逻辑处理
  })
  ```
  ---
  **6. 性能优化建议**
  > - 避免在中间件中执行重型同步操作
  > - 对数据预取使用 `lazy: true` 选项
  > - 使用 `watch: false` 防止重复执行：
  ```ts
  definePageMeta({
    middleware: ['auth', { path: '/dashboard', watch: false }]
  })
  ```
  ---
  **7. 性能优化建议**

  1.**命名规范：**
  > - 全局中间件：[name].global.ts
  > - 局部中间件：[name].ts

  2.**安全实践：**
  ```ts
  // 防止敏感信息泄露
  if (process.client) {
    deleteHeaders(['X-Secret-Token'])
  }
  ```

  3.**中间件复用：**
  ```ts
  // 创建可配置中间件
  export const createAuthMiddleware = (options) => {
    return defineNuxtRouteMiddleware((to) => {
      // 使用options配置
    })
  }
  ```

  4.**组合式函数集成：**
  ```ts
  // 复用组合式逻辑
  export default defineNuxtRouteMiddleware(() => {
    const { validate } = useAuth()
    return validate()
  })
  ```

  5.**避免副作用：**
  > - 不要在中间件中直接修改组件状态
  > - 通过状态管理（Pinia）共享数据
  ---
  **8. 常见错误**
  
  1.**循环重定向：**
  ```ts
  // 错误示例：未设置排除路径
  if (!isAuth) return navigateTo('/login')
  ```

  2.**服务端客户端不一致：**
  ```ts
  // 错误：在服务端使用window
  if (window.localStorage.token) // ❌
  ```

  3.**未处理异步：**
  ```ts
  // 错误：未等待异步操作
  fetchData() // ❌ 可能未完成就继续导航
  ```
  4.**路径硬编码：**
  ```ts
  // 错误
  navigateTo('/en/login') // ❌ 应使用i18n路径
  ```
  5.**中间件顺序错误：**
  ```ts
  definePageMeta({
    middleware: ['log', 'auth'] // ❌ 应先执行auth
  })
  ```
  ---
</CustomSection>

---
### pages
<CustomSection name="理论阐述" color="blue">
  
  **1. 什么是 pages 目录？**
  > - `pages` 目录是 Nuxt3 的核心目录，用于存放应用的路由页面。该目录中的每个 Vue 文件都会自动映射为应用的一个路由，遵循基于文件系统的路由规则。
  ---
  **2. 有什么用？**
  > - **自动路由生成**：根据目录结构自动创建路由配置
  > - **动态路由支持**：通过方括号语法 `[param].vue` 创建动态路由
  > - **嵌套路由**：通过子目录和 `<NuxtPage>` 组件实现嵌套视图
  > - **布局集成**：支持页面级布局配置
  > - **路由元数据**：通过 `definePageMeta` 定义路由特定信息
  ---
  **3. 常见使用场景**
  > - **页面组件（.vue 文件）**
  > - **动态路由参数文件（如 `[id].vue`）**
  > - **嵌套路由目录结构**
  > - **错误页面（`error.vue`）**
  > - **自定义 404 页面（`[...slug].vue）`**
  ---
  **4. 目录结构建议**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  ages/
    ├── index.vue            # 首页路由：/
    ├── about.vue            # /about
    ├── products/
    │   ├── index.vue        # /products
    │   ├── [id].vue         # /products/:id
    │   └── category/
    │       └── [slug].vue   # /products/category/:slug
    ├── dashboard/
    │   ├── index.vue        # /dashboard
    │   └── settings.vue     # /dashboard/settings
    ├── blog/
    │   ├── index.vue        # /blog
    │   └── [...slug].vue    # /blog/* (捕获所有路由)
    ├── contact.vue          # /contact
    └── error.vue            # 自定义错误页面
  ```
  ---
  **5. 需要引入才能使用吗？**
  > - **不需要**。Nuxt 会自动扫描 `pages` 目录并生成路由配置。页面组件会自动注册为路由。
  ---
  **6.  与 layouts 目录的区别：**

  |  **特性**  |  **pages 目录**  |  **layouts 目录**  |
  |  ---  |  ---  |  ---  |
  |  目的  |  定义路由页面内容  |  定义页面通用框架  |
  |  路由影响  |  直接影响 URL 路径  |  不影响 URL，只影响渲染  |
  |  嵌套  |  通过目录结构实现路由嵌套  |  通过 `<slot>` 实现内容嵌套  |
  |  动态路由  |  支持动态参数  |  不支持动态参数  |
  |  自动注册  |  自动生成路由  |  需在页面中指定使用  |
  ---
  **7. 配置相关：**

  在 <mark>nuxt.config.ts</mark> 中可配置页面行为：
  ```ts
  export default defineNuxtConfig({
    pages: true, // 启用基于文件的路由（默认）
    routeRules: {
      '/old-page': { redirect: '/new-page' } // 路由重定向
    }
  })
  ```
  ---
</CustomSection>
<CustomSection name="代码示例" color="purple">
  
  **1. 基本页面创建**

  **`pages/index.vue`**
  ```vue
  <template>
    <div>
      <h1>欢迎来到首页</h1>
      <NuxtLink to="/about">关于我们</NuxtLink>
    </div>
  </template>
  ```
  ---
  **2. 动态路由参数**

  **`pages/products/[id].vue`**
  ```vue
  <template>
    <div>
      <h2>产品详情: {{ product.name }}</h2>
      <p>ID: {{ $route.params.id }}</p>
    </div>
  </template>

  <script setup>
  const route = useRoute()
  const { data: product } = await useFetch(`/api/products/${route.params.id}`)
  </script>
  ```
  ---
  **3. 嵌套路由**

  **`pages/parent/index.vue`**
  ```vue
  <template>
    <div>
      <h1>父页面</h1>
      <!-- 子路由出口 -->
      <NuxtPage />
    </div>
  </template>
  ```

  **`pages/parent/child.vue`**
  ```vue
  <template>
    <div>
      <h2>子页面内容</h2>
    </div>
  </template>
  ```
  ---
  **4. 路由参数验证**

  **`pages/user/[id].vue`**
  ```vue
  <script setup>
    definePageMeta({
      validate: async (route) => {
        // 验证ID是否为数字
        return /^\d+$/.test(route.params.id)
      }
    })
  </script>
  ```
  ---
  **5. 页面元数据配置**

  **`pages/about.vue`**
  ```vue
  <script setup>
    definePageMeta({
      title: '关于我们',
      layout: 'custom-layout',
      middleware: ['auth'],
      keepalive: true // 开启缓存
    })
  </script>
  ```
  ---
  **6. 捕获所有路由（404页面）**

  **`pages/[...slug].vue`**
  ```vue
  <template>
    <div>
      <h1>页面不存在</h1>
      <p>请求的路径: {{ $route.params.slug.join('/') }}</p>
      <NuxtLink to="/">返回首页</NuxtLink>
    </div>
  </template>

  <script setup>
  definePageMeta({
    layout: 'error'
  })
  </script>
  ```
  ---
</CustomSection>
<CustomSection name="问题补充" color="amber">
  
  **1. 动态路由匹配规则**
  > - `[param].vue` → 单参数（/product/123）
  > - `[...slug].vue` → 捕获所有路由（/foo/bar/baz）
  > - `[[...slug]].vue` → 可选捕获（可匹配 / 或 /foo/bar）
  ---
  **2. 路由中间件使用**
  ```vue
  <script setup>
    definePageMeta({
      middleware: [
        'auth', // 命名中间件
        function (to) { // 内联中间件
          if (!userStore.isAdmin) return '/'
        }
      ]
    })
  </script>
  ```
  ---
  **3. 页面缓存配置**
  ```vue
  <script setup>
    definePageMeta({
      keepalive: {
        exclude: ['Modal'] // 排除特定组件
      }
    })

    // 手动控制缓存
    const { $keepalive } = useNuxtApp()
    $keepalive.refresh('ProductPage')
  </script>
  ```
  ---
  **4. 错误页面处理**

  **`error.vue`**：

  ```vue
  <template>
    <div class="error-container">
      <h1>{{ error.statusCode }}</h1>
      <p>{{ error.message }}</p>
      <button @click="clearError">返回首页</button>
    </div>
  </template>

  <script setup>
    const props = defineProps(['error'])
    const clearError = () => clearError({ redirect: '/' })
  </script>
  ```
  ---
  **5. 布局系统集成**
  ```vue
  <script setup>
      // 指定使用的布局
      definePageMeta({
        layout: 'admin'
      })
  </script>

  <template>
      <div>
        <!-- 页面内容 -->
      </div>
  </template>
  ```
  **6. 页面特殊钩子**
  ```vue
  <script setup>
    // 服务端异步数据获取
    const { data } = await useAsyncData('page-data', () => $fetch('/api/page'))

    // 路由切换前处理
    onBeforeRouteLeave((to, from) => {
      if (formDirty) return confirm('确定离开吗？')
    })

    // 仅客户端执行的代码
    onMounted(() => {
      trackPageView()
    })
  </script>
  ```
  ---
  **7. 最佳实践**

  1.**命名规范**：
  > - 文件：小写字母 + 连字符（user-profile.vue）
  > - 目录：复数形式（products/）

  2.**性能优化**：
  ```vue
  <script setup>
    // 懒加载组件
    definePageMeta({
      layout: () => import('~/layouts/dynamic-layout.vue')
    })
  </script>
  ```

  3.**API 集成**：
  ```vue
  <script setup>
    // 并行请求优化
    const [user, posts] = await Promise.all([
      useFetch('/api/user'),
      useFetch('/api/posts')
    ])
  </script>
  ```

  4.**国际化路由**：
  ```text
  pages/
    ├── [lang]/
    │   ├── index.vue
    │   └── about.vue
  ```

  5.**分组路由**：
  ```vue
  <script setup>
    definePageMeta({
      group: 'admin'
    })
  </script>
  ```
  ---
  **8. 常见错误**

  1.**动态路由命名冲突**：
  ```text
  pages/
    ├── [id].vue
    └── index.vue    # ❌ 冲突：应改为 users/index.vue
  ```

  2.**无效的嵌套路由**：
  ```vue
  <!-- 父页面忘记添加 <NuxtPage> -->
  <template>
    <div>父页面内容</div>
    <!-- 缺少子路由出口 -->
  </template>
  ```

  3.**路由参数未处理**：
  ```vue
  <script setup>
  // 错误：未处理异步数据加载状态
  const { data } = await useFetch('/api/data')
  </script>

  <template>
    {{ data.name }} <!-- 可能为undefined -->
  </template>
  ```

  4.**布局无限循环**：
  ```vue
  <!-- 错误：布局内引用自身 -->
  <template>
    <NuxtLayout name="self-layout">
      <slot />
    </NuxtLayout>
  </template>
  ```

  5.**未处理404错误**：

  ``` ts
  // 错误：缺少全局捕获路由
  // 应添加 pages/[...slug].vue
  ```
  ---
  **高级技巧**

  1.**路由过渡效果**

  **`app.vue`：**
  ```vue
  <template>
    <NuxtPage :transition="{
      name: 'page',
      mode: 'out-in'
    }" />
  </template>

  <style>
    .page-enter-active,
    .page-leave-active {
      transition: opacity 0.3s;
    }
    .page-enter-from,
    .page-leave-to {
      opacity: 0;
    }
  </style>
  ```

  2.**编程式导航**
  ```vue
  <script setup>
    const router = useRouter()

    function navigate() {
      router.push({
        path: '/product/123',
        query: { ref: 'home' },
        hash: '#section'
      })
    }
  </script>
  ```

  3.**路由别名**
  ```vue
  <script setup>
    definePageMeta({
      alias: ['/old-path', '/v2/new-path']
    })
  </script>
  ```

  4.**页面滚动行为**

  **`nuxt.config.ts`**：
  ```ts
  export default defineNuxtConfig({
    app: {
      scrollBehavior(to) {
        if (to.hash) {
          return { 
            el: to.hash,
            behavior: 'smooth'
          }
        }
        return { top: 0 }
      }
    }
  })
  ```

  5.**路由守卫集成**
  ```ts
  // plugins/router.ts
  export default defineNuxtPlugin(() => {
    const router = useRouter()
    
    router.beforeEach((to) => {
      // 全局前置守卫
    })
    
    router.afterEach((to) => {
      // 全局后置守卫
    })
  })
  ```
  ---
</CustomSection>

---
### plugins
<CustomSection name="理论阐述" color="blue">
  
</CustomSection>
<CustomSection name="代码示例" color="purple">
  
</CustomSection>
<CustomSection name="问题补充" color="amber">
  
</CustomSection>

---
### utils
<CustomSection name="理论阐述" color="blue">
  
</CustomSection>
<CustomSection name="代码示例" color="purple">
  
</CustomSection>
<CustomSection name="问题补充" color="amber">
  
</CustomSection>

---

## 应用文件
### appvue


---
### appconfigts


---
### errorvue


---

## 核心目录
### .nuxt


---
### .output


---
### public


---
### server


---
### shared


---

## 配置目录
### content


---
### modules


---

## 根目录文件
### .env


---
### .gitignore


---
### .nuxtrc


---
### nuxtconfigts


---
### nodemodules


---
### packagejson


---
### tsconfigjson


---
