# 基本知识

## 一、 选项式 API vs 组合式 API

  **Vue2 选项式 API (完整组件)**
  ::: details **代码示例**
  ```vue
  <!-- Vue2OptionsAPI.vue -->
  <script>
    export default {
      data() {
        return {
          count: 0,
          message: 'Hello Vue2!'
        }
      },
      methods: {
        increment() {
          this.count++
        }
      },
      computed: {
        doubledCount() {
          return this.count * 2
        }
      },
      mounted() {
        console.log('组件已挂载 - Vue2')
      }
    }
  </script>

  <template>
    <div class="vue2-demo">
      <h2>Vue2 选项式 API</h2>
      <p>{{ message }}</p>
      <p>计数: {{ count }}</p>
      <p>双倍计数: {{ doubledCount }}</p>
      <button @click="increment">增加</button>
    </div>
  </template>

  <style scoped>
    .vue2-demo {
      padding: 20px;
      border: 2px solid #e74c3c;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    button {
      padding: 8px 16px;
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
  ```
  :::

  **Vue3 组合式 API (完整组件)**
  ::: details **代码示例**
  ```vue
  <!-- Vue3CompositionAPI.vue -->
  <script setup lang="ts">
    import { ref, computed, onMounted } from 'vue'

    const count = ref(0)
    const message = ref('Hello Vue3!')

    const increment = () => {
      count.value++
    }

    const doubledCount = computed(() => count.value * 2)

    onMounted(() => {
      console.log('组件已挂载 - Vue3')
    })
  </script>

  <template>
    <div class="vue3-demo">
      <h2>Vue3 组合式 API</h2>
      <p>{{ message }}</p>
      <p>计数: {{ count }}</p>
      <p>双倍计数: {{ doubledCount }}</p>
      <button @click="increment">增加</button>
    </div>
  </template>

  <style scoped>
    .vue3-demo {
      padding: 20px;
      border: 2px solid #42b883;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    button {
      padding: 8px 16px;
      background-color: #42b883;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
  ```
  :::
  ---
  **主要区别对比**
  |  **特性**  |  **Vue2 (选项式)**  |  **Vue3 (组合式)**  |  **注意事项**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  **代码组织**  |  按功能类型分组  |  按功能逻辑分组  |  组合式更适合复杂组件  |
  |  **代码复用**  |  Mixins  |  自定义组合函数  |  Mixins 容易导致命名冲突  |
  |  **逻辑复用**  |  较困难  |  更灵活简单  |  组合函数可独立测试  |
  |  **this 使用**  |  必需  |  不需要  |  组合式避免 this 绑定问题  |
  |  **类型支持**  |  一般  |  更好的 TS 支持  |  组合式有更完善的类型推断  |
  |  **学习曲线**  |  较低  |  较高  |  组合式需要理解响应式原理  |
  |  **适用场景**  |  简单组件  |  复杂/大型应用  |  Vue3 同时支持两种写法  |

## 二、组件通信方式

  **父子组件通信**
  ::: details **`Vue2`代码示例**
  ```vue
  <!-- ParentComponentV2.vue -->
  <script>
    import ChildComponentV2 from './ChildComponentV2.vue'

    export default {
      components: { ChildComponentV2 },
      data() {
        return {
          parentMessage: '来自父组件的消息(Vue2)'
        }
      },
      methods: {
        handleChildNotify(message) {
          console.log('收到子组件消息:', message)
          alert(`父组件收到: ${message}`)
        }
      }
    }
  </script>

  <template>
    <div class="parent-v2">
      <h2>Vue2 父组件</h2>
      <ChildComponentV2 
        :message="parentMessage" 
        @notify="handleChildNotify" 
      />
    </div>
  </template>

  <style scoped>
    .parent-v2 {
      padding: 20px;
      border: 2px solid #e74c3c;
      border-radius: 8px;
      margin-bottom: 20px;
    }
  </style>
  ```

  ```vue
  <!-- ChildComponentV2.vue -->
  <script>
    export default {
      props: ['message'],
      methods: {
        sendMessageToParent() {
          this.$emit('notify', '来自子组件的问候(Vue2)')
        }
      }
    }
  </script>

  <template>
    <div class="child-v2">
      <h3>Vue2 子组件</h3>
      <p>父组件消息: {{ message }}</p>
      <button @click="sendMessageToParent">通知父组件</button>
    </div>
  </template>

  <style scoped>
    .child-v2 {
      padding: 15px;
      margin-top: 10px;
      border: 1px dashed #e74c3c;
      border-radius: 6px;
    }
    button {
      padding: 6px 12px;
      background-color: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
  ```
  :::
  ---
  ::: details **`Vue3`代码示例**
  ```vue
  <!-- ParentComponentV3.vue -->
  <script setup lang="ts">
    import { ref } from 'vue'
    import ChildComponentV3 from './ChildComponentV3.vue'

    const parentMessage = ref('来自父组件的消息(Vue3)')

    const handleChildNotify = (message: string) => {
      console.log('收到子组件消息:', message)
      alert(`父组件收到: ${message}`)
    }
  </script>

  <template>
    <div class="parent-v3">
      <h2>Vue3 父组件</h2>
      <ChildComponentV3 
        :message="parentMessage" 
        @notify="handleChildNotify" 
      />
    </div>
  </template>

  <style scoped>
    .parent-v3 {
      padding: 20px;
      border: 2px solid #42b883;
      border-radius: 8px;
      margin-bottom: 20px;
    }
  </style>
  ```

  ```vue
  <!-- ChildComponentV3.vue -->
  <script setup lang="ts">
    import { defineProps, defineEmits } from 'vue'

    const props = defineProps<{
      message: string
    }>()

    const emit = defineEmits<{
      (e: 'notify', message: string): void
    }>()

    const sendMessageToParent = () => {
      emit('notify', '来自子组件的问候(Vue3)')
    }
  </script>

  <template>
    <div class="child-v3">
      <h3>Vue3 子组件</h3>
      <p>父组件消息: {{ message }}</p>
      <button @click="sendMessageToParent">通知父组件</button>
    </div>
  </template>

  <style scoped>
    .child-v3 {
      padding: 15px;
      margin-top: 10px;
      border: 1px dashed #42b883;
      border-radius: 6px;
    }
    button {
      padding: 6px 12px;
      background-color: #42b883;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
  ```
  :::
  ---
  **爷孙组件通信**
  ::: details **`Vue2`代码示例**
  ```vue
  <!-- GrandParentV2.vue -->
  <script>
    import ParentV2 from './ParentV2.vue'

    export default {
      components: { ParentV2 },
      provide() {
        return {
          grandpaData: '来自爷爷的数据(Vue2)'
        }
      }
    }
  </script>

  <template>
    <div class="grandparent-v2">
      <h1>Vue2 爷爷组件</h1>
      <ParentV2 />
    </div>
  </template>

  <style scoped>
    .grandparent-v2 {
      padding: 25px;
      border: 3px solid #e74c3c;
      border-radius: 10px;
      margin-bottom: 20px;
    }
  </style>
  ```

  ```vue
  <!-- GrandChildV2.vue -->
  <script>
    export default {
      inject: ['grandpaData']
    }
  </script>

  <template>
    <div class="grandchild-v2">
      <h4>Vue2 孙子组件</h4>
      <p>爷爷的数据: {{ grandpaData }}</p>
    </div>
  </template>

  <style scoped>
    .grandchild-v2 {
      padding: 10px;
      border: 1px dotted #e74c3c;
      border-radius: 4px;
      margin-top: 10px;
    }
  </style>
  ```
  :::
  ---
  ::: details **`Vue3`代码示例**
  ```vue
  <!-- GrandParentV3.vue -->
  <script setup lang="ts">
    import { provide, ref } from 'vue'
    import ParentV3 from './ParentV3.vue'

    const grandpaData = ref('来自爷爷的数据(Vue3)')
    provide('grandpaData', grandpaData)

    const updateData = () => {
      grandpaData.value = `更新后的数据 ${Date.now()}`
    }
  </script>

  <template>
    <div class="grandparent-v3">
      <h1>Vue3 爷爷组件</h1>
      <button @click="updateData">更新数据</button>
      <ParentV3 />
    </div>
  </template>

  <style scoped>
    .grandparent-v3 {
      padding: 25px;
      border: 3px solid #42b883;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    button {
      padding: 8px 16px;
      background-color: #42b883;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 15px;
    }
  </style>
  ```

  ```vue
  <!-- GrandChildV3.vue -->
  <script setup lang="ts">
    import { inject } from 'vue'

    const grandpaData = inject('grandpaData', '默认值')
  </script>

  <template>
    <div class="grandchild-v3">
      <h4>Vue3 孙子组件</h4>
      <p>爷爷的数据: {{ grandpaData }}</p>
    </div>
  </template>

  <style scoped>
    .grandchild-v3 {
      padding: 10px;
      border: 1px dotted #42b883;
      border-radius: 4px;
      margin-top: 10px;
    }
  </style>
  ```
  :::
  ---
  **通信方式对比总结**
  |  **通信方式**  |  **Vue2 实现**  |  **Vue3 实现**  |  **适用场景**  |  **注意事项**  |
  |  ---  |  ---  |  ---  |  ---  |  ---  |
  |  **Props/Emits**  |  `this.$emit`  |  `defineEmits`  |  父子组件  |  Vue3 有更好的类型支持  |
  |  **v-model**  |  `.sync` 修饰符  |  多个 v-model  |  表单输入  |  Vue3 更灵活  |
  |  **`$attrs`**  |  `v-bind="$attrs"`  |  自动继承  |  属性透传  |  Vue3 包含 class/style  |
  |  **provide/inject**  |  选项式 provide  |  `provide` 函数  |  跨级组件  |  Vue3 支持响应式  |
  |  **事件总线**  |  `new Vue()`  |  mitt 库  |  任意组件  |  注意事件清理  |
  |  **Vuex**  |  Vuex 3  |  Vuex 4  |  状态管理  |  Vue3 推荐 Pinia  |
  |  **Pinia**  |  不支持  |  Pinia  |  状态管理  |  Vue3 首选方案  |
## 三、watch、computed 和生命周期

  ::: details **`Vue2`实现代码示例**
  ```vue
  <!-- LifecycleV2.vue -->
  <script>
    export default {
      data() {
        return {
          count: 0,
          user: {
            name: '张三',
            age: 25
          },
          searchQuery: ''
        }
      },
      computed: {
        userInfo() {
          return `${this.user.name} - ${this.user.age}岁`
        },
        filteredList() {
          // 模拟过滤逻辑
          return this.searchQuery 
            ? `过滤结果: ${this.searchQuery}` 
            : '无过滤条件'
        }
      },
      watch: {
        count(newVal, oldVal) {
          console.log(`count变化: ${oldVal} -> ${newVal}`)
        },
        user: {
          handler(newVal) {
            console.log('用户信息变化:', newVal)
          },
          deep: true
        },
        searchQuery(newVal) {
          console.log('搜索条件变化:', newVal)
        }
      },
      beforeCreate() {
        console.log('beforeCreate - Vue2')
      },
      created() {
        console.log('created - Vue2')
      },
      beforeMount() {
        console.log('beforeMount - Vue2')
      },
      mounted() {
        console.log('mounted - Vue2')
      },
      beforeUpdate() {
        console.log('beforeUpdate - Vue2')
      },
      updated() {
        console.log('updated - Vue2')
      },
      beforeDestroy() {
        console.log('beforeDestroy - Vue2')
      },
      destroyed() {
        console.log('destroyed - Vue2')
      },
      methods: {
        increment() {
          this.count++
        },
        updateUser() {
          this.user.age++
        }
      }
    }
  </script>

  <template>
    <div class="lifecycle-v2">
      <h2>Vue2 生命周期、Watch 和 Computed</h2>
      
      <div>
        <p>计数: {{ count }}</p>
        <button @click="increment">增加计数</button>
      </div>
      
      <div>
        <p>用户信息: {{ userInfo }}</p>
        <button @click="updateUser">更新用户</button>
      </div>
      
      <div>
        <input v-model="searchQuery" placeholder="搜索...">
        <p>{{ filteredList }}</p>
      </div>
    </div>
  </template>

  <style scoped>
    .lifecycle-v2 {
      padding: 20px;
      border: 2px solid #e74c3c;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    button, input {
      margin: 10px;
      padding: 8px 12px;
    }
  </style>
  ```
  :::
  ---
  ::: details **`Vue3`实现代码示例**
  ```vue
  <!-- LifecycleV3.vue -->
  <script setup lang="ts">
    import { 
      ref, 
      reactive, 
      computed, 
      watch, 
      onBeforeMount, 
      onMounted,
      onBeforeUpdate,
      onUpdated,
      onBeforeUnmount,
      onUnmounted
    } from 'vue'

    const count = ref(0)
    const user = reactive({ name: '张三', age: 25 })
    const searchQuery = ref('')

    // 计算属性
    const userInfo = computed(() => `${user.name} - ${user.age}岁`)
    const filteredList = computed(() => 
      searchQuery.value ? `过滤结果: ${searchQuery.value}` : '无过滤条件'
    )

    // watch 监听
    watch(count, (newVal, oldVal) => {
      console.log(`count变化: ${oldVal} -> ${newVal}`)
    })

    watch(
      () => ({ ...user }), 
      (newVal) => {
        console.log('用户信息变化:', newVal)
      },
      { deep: true }
    )

    watch(searchQuery, (newVal) => {
      console.log('搜索条件变化:', newVal)
    })

    // 生命周期
    console.log('setup 相当于 created - Vue3')

    onBeforeMount(() => console.log('onBeforeMount - Vue3'))
    onMounted(() => console.log('onMounted - Vue3'))
    onBeforeUpdate(() => console.log('onBeforeUpdate - Vue3'))
    onUpdated(() => console.log('onUpdated - Vue3'))
    onBeforeUnmount(() => console.log('onBeforeUnmount - Vue3'))
    onUnmounted(() => console.log('onUnmounted - Vue3'))

    const increment = () => count.value++
    const updateUser = () => user.age++
  </script>

  <template>
    <div class="lifecycle-v3">
      <h2>Vue3 生命周期、Watch 和 Computed</h2>
      
      <div>
        <p>计数: {{ count }}</p>
        <button @click="increment">增加计数</button>
      </div>
      
      <div>
        <p>用户信息: {{ userInfo }}</p>
        <button @click="updateUser">更新用户</button>
      </div>
      
      <div>
        <input v-model="searchQuery" placeholder="搜索...">
        <p>{{ filteredList }}</p>
      </div>
    </div>
  </template>

  <style scoped>
    .lifecycle-v3 {
      padding: 20px;
      border: 2px solid #42b883;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    button, input {
      margin: 10px;
      padding: 8px 12px;
    }
  </style>
  ```
  :::
  ---
  **生命周期对比表**
  |  **Vue2 生命周期**  |  **Vue3 生命周期**  |  **Vue3 组合式 API**  |  **触发时机**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  beforeCreate  |  beforeCreate  |  ❌  |  组件初始化前  |
  |  created  |  created  |  ❌  |  组件初始化后  |
  |  beforeMount  |  beforeMount  |  onBeforeMount  |  DOM 挂载前  |
  |  mounted  |  mounted  |  onMounted  |  DOM 挂载后  |
  |  beforeUpdate  |  beforeUpdate  |  onBeforeUpdate  |  数据更新前  |
  |  updated  |  updated  |  onUpdated  |  数据更新后  |
  |  beforeDestroy  |  beforeUnmount  |  onBeforeUnmount  |  组件销毁前  |
  |  destroyed  |  unmounted  |  onUnmounted  |  组件销毁后  |
  |  activated  |  activated  |  onActivated  |  keep-alive 激活  |
  |  deactivated  |  deactivated  |  onDeactivated  |  keep-alive 停用  |
  |  errorCaptured  |  errorCaptured  |  onErrorCaptured  |  错误捕获  |
## 四、ref 和 reactive

  ::: details **`Vue2`响应式实现**
  ```vue
  <!-- ReactivityV2.vue -->
  <script>
    export default {
      data() {
        return {
          count: 0,
          user: {
            name: '张三',
            age: 25,
            address: {
              city: '北京'
            }
          }
        }
      },
      methods: {
        incrementCount() {
          this.count++
        },
        updateUser() {
          // Vue2 中直接修改对象属性是响应式的
          this.user.age = 30
          
          // 添加新属性需要使用 Vue.set
          this.$set(this.user, 'job', '工程师')
          
          // 修改嵌套对象
          this.user.address.city = '上海'
        }
      },
      mounted() {
        console.log('Vue2 响应式原理基于 Object.defineProperty')
      }
    }
  </script>

  <template>
    <div class="reactivity-v2">
      <h2>Vue2 响应式 (基于 Object.defineProperty)</h2>
      
      <div>
        <p>计数: {{ count }}</p>
        <button @click="incrementCount">增加计数</button>
      </div>
      
      <div>
        <p>姓名: {{ user.name }}</p>
        <p>年龄: {{ user.age }}</p>
        <p>工作: {{ user.job || '暂无' }}</p>
        <p>城市: {{ user.address.city }}</p>
        <button @click="updateUser">更新用户信息</button>
      </div>
      
      <div class="limitations">
        <h3>Vue2 响应式限制:</h3>
        <ul>
          <li>无法检测对象属性的添加/删除</li>
          <li>数组变化需要特殊方法 (push, pop, splice等)</li>
          <li>对 Map、Set 等集合类型支持有限</li>
        </ul>
      </div>
    </div>
  </template>

  <style scoped>
    .reactivity-v2 {
      padding: 20px;
      border: 2px solid #e74c3c;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    button {
      margin: 10px;
      padding: 8px 12px;
    }
    .limitations {
      margin-top: 20px;
      padding: 10px;
      background-color: #f8d7da;
      border-radius: 6px;
    }
  </style>
  ```
  :::
  ---
  ::: details **`Vue3`响应式实现**
  ```vue
  <!-- ReactivityV3.vue -->
  <script setup lang="ts">
    import { ref, reactive, isRef, isReactive, toRefs } from 'vue'

    // ref 用于基本类型和对象引用
    const count = ref(0)
    const userRef = ref({
      name: '张三',
      age: 25,
      address: {
        city: '北京'
      }
    })

    // reactive 用于对象
    const userReactive = reactive({
      name: '李四',
      age: 30,
      address: {
        city: '上海'
      }
    })

    // 解构 reactive 对象会失去响应性
    // 使用 toRefs 保持响应性
    const { name, age } = toRefs(userReactive)

    const incrementCount = () => count.value++
    const updateRefUser = () => {
      userRef.value.age += 1
      userRef.value.address.city = userRef.value.address.city === '北京' ? '上海' : '北京'
      
      // 动态添加属性 - 直接生效
      userRef.value.job = '工程师'
    }
    const updateReactiveUser = () => {
      userReactive.age += 1
      userReactive.address.city = userReactive.address.city === '上海' ? '北京' : '上海'
      
      // 动态添加属性 - 直接生效
      userReactive.job = '设计师'
    }

    const checkTypes = () => {
      console.log('count is ref:', isRef(count)) // true
      console.log('userRef is ref:', isRef(userRef)) // true
      console.log('userRef is reactive:', isReactive(userRef)) // false
      console.log('userReactive is ref:', isRef(userReactive)) // false
      console.log('userReactive is reactive:', isReactive(userReactive)) // true
    }
  </script>

  <template>
    <div class="reactivity-v3">
      <h2>Vue3 响应式 (基于 Proxy)</h2>
      
      <div class="section">
        <h3>ref 示例</h3>
        <p>计数: {{ count }}</p>
        <button @click="incrementCount">增加计数</button>
        
        <p>用户(Ref): {{ userRef.name }}, {{ userRef.age }}岁, {{ userRef.address.city }}</p>
        <p v-if="userRef.job">工作: {{ userRef.job }}</p>
        <button @click="updateRefUser">更新Ref用户</button>
      </div>
      
      <div class="section">
        <h3>reactive 示例</h3>
        <p>用户(Reactive): {{ userReactive.name }}, {{ age }}岁, {{ userReactive.address.city }}</p>
        <p v-if="userReactive.job">工作: {{ userReactive.job }}</p>
        <button @click="updateReactiveUser">更新Reactive用户</button>
      </div>
      
      <div class="section">
        <h3>类型检查</h3>
        <button @click="checkTypes">检查响应式类型</button>
      </div>
      
      <div class="advantages">
        <h3>Vue3 响应式优势:</h3>
        <ul>
          <li>全面检测对象/数组的各种变化</li>
          <li>支持 Map、Set 等集合类型</li>
          <li>动态添加属性自动响应</li>
          <li>更好的性能表现</li>
        </ul>
      </div>
    </div>
  </template>

  <style scoped>
    .reactivity-v3 {
      padding: 20px;
      border: 2px solid #42b883;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .section {
      margin: 15px 0;
      padding: 10px;
      border-left: 3px solid #42b883;
    }
    button {
      margin: 10px 5px 10px 0;
      padding: 8px 12px;
      background-color: #42b883;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .advantages {
      margin-top: 20px;
      padding: 10px;
      background-color: #d1e7dd;
      border-radius: 6px;
    }
  </style>
  ```
  :::
  ---
  **ref 和 reactive 对比**
  |  **特性**  |  **ref**  |  **reactive**  |  **建议使用场景**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  **创建方式**  |  `ref(value)`  |  `reactive(object)`  |  基本类型用 ref，对象用 reactive  |
  |  **访问值**  |  `.value` 属性  |  直接访问  |  模板中 ref 自动解包  |
  |  **类型支持**  |  支持所有类型  |  仅对象/数组  |  基本类型只能用 ref  |
  |  **解构响应**  |  需保持 `.value`  |  使用 `toRefs`  |  推荐使用 `toRefs` 解构  |
  |  **性能**  |  略低  |  略高  |  差异不大  |
  |  **TS 支持**  |  更好的类型推断  |  稍弱  |  复杂类型用 ref 更易类型定义  |
  |  **原理**  |  创建响应式引用  |  创建响应式代理  |  底层都是基于 Proxy  |
## 五、其他 Vue3 重要特性

  ::: details **`Vue3`Teleport 组件**
  ```vue
  <!-- TeleportDemo.vue -->
  <script setup lang="ts">
    import { ref } from 'vue'

    const showModal = ref(false)

    const openModal = () => {
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
    }
  </script>

  <template>
    <div class="teleport-demo">
      <h2>Vue3 Teleport 组件</h2>
      <button @click="openModal">打开模态框</button>
      
      <!-- 将内容渲染到 body 元素 -->
      <Teleport to="body">
        <div v-if="showModal" class="modal">
          <div class="modal-content">
            <h3>模态框标题</h3>
            <p>这是通过 Teleport 渲染到 body 的内容</p>
            <p>解决了 z-index 和布局问题</p>
            <button @click="closeModal">关闭</button>
          </div>
        </div>
      </Teleport>
      
      <div class="explanation">
        <h3>Teleport 解决的问题:</h3>
        <ul>
          <li>模态框、通知等组件需要渲染到 DOM 树顶层</li>
          <li>避免父组件样式影响 (overflow: hidden, z-index 等)</li>
          <li>更符合语义化结构</li>
        </ul>
      </div>
    </div>
  </template>

  <style scoped>
    .teleport-demo {
      padding: 20px;
      border: 2px solid #3498db;
      border-radius: 8px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
      height: 200px;
    }

    button {
      padding: 10px 20px;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 500px;
      width: 80%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .explanation {
      margin-top: 20px;
      padding: 15px;
      background-color: #d6eaf8;
      border-radius: 6px;
    }
  </style>
  ```
  :::
  ---
  ::: details **`Vue3`全局 API 变更**
  ```vue
  <!-- main.ts -->
  <script lang="ts">
    import { createApp } from 'vue'
    import App from './App.vue'

    // Vue2 写法
    // import Vue from 'vue'
    // Vue.component('GlobalComponent', { /* ... */ })
    // Vue.directive('focus', { /* ... */ })
    // new Vue({ render: h => h(App) }).$mount('#app')

    // Vue3 写法
    const app = createApp(App)

    // 全局组件
    app.component('GlobalComponent', {
      template: '<div>全局组件内容</div>'
    })

    // 全局指令
    app.directive('focus', {
      mounted(el) {
        el.focus()
      }
    })

    // 全局属性
    app.config.globalProperties.$apiUrl = 'https://api.example.com'

    // 全局混入
    app.mixin({
      created() {
        console.log('全局混入的 created 钩子')
      }
    })

    app.mount('#app')
  </script>
  ```
  :::
  ---
  **Vue3 其他重要特性**

  1.**Fragments 支持**
  ```vue
  <!-- Vue3 支持多个根元素 -->
  <template>
    <header>标题</header>
    <main>内容</main>
    <footer>页脚</footer>
  </template>
  ```

  2.**Suspense 组件**
  ```vue
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>加载中...</div>
    </template>
  </Suspense>
  ```

  3.**多个 v-model 支持**
  ```vue
  <!-- Vue3 支持多个 v-model -->
  <UserForm
    v-model:name="userName"
    v-model:email="userEmail"
  ></UserForm>
  ```

  4.**自定义渲染器 API**
  ```js
  import { createRenderer } from '@vue/runtime-core'

  const { createApp } = createRenderer({
    // 自定义渲染逻辑
  })
  ```

  5.**更好的 TypeScript 支持**

  - Vue3 完全使用 TypeScript 重写
  - 提供完善的类型定义
  - 组合式 API 天然支持 TS 类型推断
## 总结：Vue2 与 Vue3 主要区别

  |  **特性**  |  **Vue2**  |  **Vue3**  |  **优势**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  **API 风格**  |  选项式 API  |  组合式 API + 选项式  |  更灵活的逻辑组织和复用  |
  |  **响应式系统**  |  Object.defineProperty  |  Proxy  |  更好的性能，全面的响应式  |
  |  **生命周期**  |  传统钩子  |  重命名 + 组合式 API  |  更一致的命名，更好的组合  |
  |  **组件通信**  |  this.$emit, Vuex  |  defineEmits, provide/inject  |  更好的类型支持  |
  |  **全局 API**  |  Vue.xxx  |  app.xxx  |  更好的 tree-shaking  |
  |  **新特性**  |  无  |  Teleport, Suspense 等  |  解决特定场景问题  |
  |  **TS 支持**  |  有限支持  |  一流支持  |  完善的类型系统  |
  |  **包大小**  |  较大  |  更小 (tree-shaking)  |  更好的性能  |
  |  **性能**  |  较慢  |  更快 (渲染/更新)  |  更好的用户体验  |

  ---
  **迁移建议：**

  - 新项目推荐直接使用 Vue3 + 组合式 API
  - 大型项目可逐步迁移，先混用两种 API
  - 使用官方迁移工具检查兼容性问题
  - 注意全局 API 和生命周期的变化
  - 状态管理从 Vuex 迁移到 Pinia





