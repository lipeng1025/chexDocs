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
  |  引用方式  |  `~/assets/path`  |  `/filename`  |
  |  适用场景  |  样式/字体/图片/视频/需优化资源  |  直接暴露的静态文件（比如项目Logo）  |
  |  路径变化  |  构建后路径会变化（可能出现上线的项目静态资源不显示，比如图片）  |  保持原路径  |
  
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


---

### composables


---
### layouts


---
### middleware


---
### pages


---
### plugins


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
