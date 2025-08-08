# utils
::: details 理论阐述
  
  **1. 什么是 utils 目录？**
  > - `utils` 目录是用于存放项目通用工具函数和辅助方法的自定义目录。它包含可复用的纯函数、数据处理工具、格式转换方法等与业务逻辑解耦的实用程序代码。
  ---
  **2. 有什么用？**
  > - **代码复用**：避免重复编写相同功能的代码
  > - **逻辑抽象**：将复杂操作封装成简单函数
  > - **业务解耦**：分离核心业务逻辑和辅助功能
  > - **统一管理**：集中存放工具函数便于维护
  > - **类型共享**：为常用函数提供统一的类型定义
  ---
  **3. 常见存放内容**
  > - **数据处理函数（日期格式化、金额格式化）**
  > - **字符串操作工具**
  > - **验证工具（邮箱、密码验证）**
  > - **数学计算函数**
  > - **浏览器存储操作（localStorage、cookies）**
  > - **环境判断工具**
  > - **第三方服务封装（支付、地图等）**
  ---
  **4. 目录结构建议**
  > 当然在实际开发的项目中是由具体的项目而定，这里只是给个参考
  ``` text
  utils/
    ├── date.ts          # 日期处理工具
    ├── string.ts        # 字符串处理工具
    ├── validation.ts    # 验证工具
    ├── storage.ts       # 存储操作工具
    ├── dom.ts           # DOM操作工具
    ├── math.ts          # 数学计算工具
    ├── payment.ts       # 支付相关工具
    └── index.ts         # 统一导出入口
  ```
  ---
  **5. 需要引入才能使用吗？**
  > - **需要**。utils 中的函数需要显式导入才能使用  
  可以通过以下方式：
  > - 手动导入：`import { formatDate } from '~/utils/date'`
  > - 自动导入（需配置）：在 <mark>nuxt.config.ts</mark> 中配置自动导入
  ---
  **6.  与 composables 目录的区别：**

  |  **特性**  |  **utils 目录**  |  **composables 目录**  |
  |  ---  |  ---  |  ---  |
  |  设计目的  |  存放纯函数和工具方法  |  存放基于 Composition API(组合式) 的逻辑  |
  |  状态管理  |  无状态（不包含响应式状态）  |  可包含响应式状态和副作用  |
  |  使用场景  |  通用工具函数  |  组件逻辑复用  |
  |  Nuxt集成  |  无特殊支持  |  支持自动导入（auto-imports）  |
  |  典型内容  |  格式化函数、验证函数、计算函数  |  useFetch, useLocalStorage  |
  ---
  **7. 配置相关：**

  在 <mark>nuxt.config.ts</mark> 中配置自动导入：
  ```ts
  export default defineNuxtConfig({
    imports: {
      dirs: [
        'utils/**/*.ts'  // 自动导入utils目录下的所有函数
      ]
    }
  })
  ```
  ---
:::
  
::: details 代码示例
  
  **1. 日期格式化工具**

  **`utils/date.ts`：**

  ```ts
  /**
  * 格式化日期
  * @param date - 日期对象或字符串
  * @param format - 格式字符串，默认 'YYYY-MM-DD'
  * @returns 格式化后的日期字符串
  */
  export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
    const d = new Date(date);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day);
  }

  /**
  * 计算日期差
  * @param start - 开始日期
  * @param end - 结束日期
  * @returns 相差的天数
  */
  export function dateDiff(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
  ```
  ---
  **2. 金额格式化工具**

  **`tils/string.ts`：**

  ```ts
  /**
  * 格式化金额
  * @param amount - 金额数值
  * @param decimals - 小数位数，默认2
  * @param currencySymbol - 货币符号，默认'¥'
  * @returns 格式化后的金额字符串
  */
  export function formatCurrency(
    amount: number, 
    decimals = 2, 
    currencySymbol = '¥'
  ): string {
    const fixedAmount = amount.toFixed(decimals);
    return `${currencySymbol}${fixedAmount}`;
  }

  /**
  * 截断字符串
  * @param str - 原始字符串
  * @param maxLength - 最大长度
  * @param suffix - 后缀，默认'...'
  * @returns 截断后的字符串
  */
  export function truncateString(
    str: string, 
    maxLength: number, 
    suffix = '...'
  ): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + suffix;
  }
  ```
  ---
  **3. 本地存储操作**

  **``utils/storage.ts``：**

  ```ts
  /**
  * 安全获取localStorage项
  * @param key - 存储键名
  * @returns 存储值或null
  */
  export function getLocalStorage(key: string): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  /**
  * 安全设置localStorage项
  * @param key - 存储键名
  * @param value - 存储值
  */
  export function setLocalStorage(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  /**
  * 移除localStorage项
  * @param key - 存储键名
  */
  export function removeLocalStorage(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
  ```
  ---
  **4. 验证函数**

  **`utils/validation.ts`：**

  ```ts
  /**
  * 验证邮箱格式
  * @param email - 邮箱字符串
  * @returns 是否有效
  */
  export function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
  * 验证手机号（中国大陆）
  * @param phone - 手机号字符串
  * @returns 是否有效
  */
  export function isValidPhone(phone: string): boolean {
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  }

  /**
  * 验证密码强度
  * @param password - 密码字符串
  * @returns 强度等级（1-4）
  */
  export function passwordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }
  ```
  ---
  **5. 统一导出入口**

  **`utils/index.ts`：**

  ```ts
  export * from './date';
  export * from './string';
  export * from './storage';
  export * from './validation';
  // 导出其他工具...
  ```
  ---
  **6. 在组件中使用**
  ```vue
  <script setup lang="ts">
  // 手动导入（如果未配置自动导入）
  import { formatDate, formatCurrency } from '~/utils';

  // 自动导入（如果配置了自动导入）
  const today = new Date();
  const formattedDate = formatDate(today, 'YYYY年MM月DD日');

  const amount = 1234.567;
  const formattedAmount = formatCurrency(amount);
  </script>

  <template>
    <div>
      <p>日期: {{ formattedDate }}</p>
      <p>金额: {{ formattedAmount }}</p>
    </div>
  </template>
  ```
  ---
:::
  
::: details 问题补充
  
  **1. 自动导入配置**

  在 `nuxt.config.ts` 中配置自动导入后，utils 中的函数可在组件中直接使用：

  ```ts
  export default defineNuxtConfig({
    imports: {
      dirs: [
        'utils/**/*.ts'  // 自动导入utils目录下的所有函数
      ]
    }
  });
  ```

  组件中无需导入：

  ```vue
  <script setup>
    const today = formatDate(new Date()); // 自动导入
  </script>
  ```
  ---
  **2. 类型安全**
  
  创建 `utils/types.ts` 或使用 JSDoc 确保类型安全：

  ```ts
  // 在工具函数中使用TypeScript
  export function sum(a: number, b: number): number {
    return a + b;
  }

  // 使用JSDoc提供类型提示
  /**
  * @param {string} input
  * @returns {number}
  */
  export function stringToNumber(input) {
    return Number(input);
  }
  ```
  ---
  **3. 服务端兼容性**

  确保工具函数在服务端渲染(SSR)环境下安全：

  ```ts
  export function getWindowWidth(): number {
    // 避免在服务端访问window
    if (typeof window === 'undefined') return 0;
    return window.innerWidth;
  }
  ```
  ---
  **4. 与 Composables 的协作**

  在 Composables 中使用工具函数：

  ```ts
  // composables/useUser.ts
  import { isValidEmail } from '~/utils/validation';

  export function useUser() {
    const validateUserEmail = (email: string) => {
      return isValidEmail(email);
    };
    
    return { validateUserEmail };
  }
  ```
  ---
  **5. 性能优化**
  > - 避免在工具函数中执行重型操作
  > - 对计算密集型函数使用缓存
  > - 使用 Tree-shaking 友好的导出方式
  ---
  **6. 最佳实践**
  > - **单一职责**：每个函数只做一件事
  > - **纯函数**：相同输入总是返回相同输出，无副作用
  > - **全面测试**：为关键工具函数编写单元测试
  > - **详细文档**：使用 JSDoc 提供函数说明
  > - **类型导出**：为函数提供 TypeScript 类型定义
  > - **避免依赖**：尽量减少外部依赖，保持轻量
  ---
  **7. 常见错误**

  1.**SSR 不兼容：**

  ```ts
  // 错误：在服务端访问浏览器API
  export function getCookie() {
    return document.cookie; // ❌ 服务端会报错
  }
  ```

  2.**状态管理污染：**

  ```ts
  // 错误：工具函数包含状态
  let counter = 0;
  export function count() {
    return counter++; // ❌ 有状态，不是纯函数
  }
  ```

  3.**类型不安全：**

  ```ts
  // 错误：缺少类型约束
  export function add(a, b) {
    return a + b; // ❌ 可能被错误类型调用
  }
  ```

  4.**循环依赖：**

  ```ts
  // utils/a.ts
  import { funcB } from './b';

  // utils/b.ts
  import { funcA } from './a'; // ❌ 循环依赖
  ```

  5.**过度封装：**

  ```ts
  // 错误：简单功能没必要封装
  export function double(n: number) {
    return n * 2; // ❌ 过于简单，直接写组件中更好
  }
  ```
  ---
  **8. 高级技巧**
  1. **柯里化与函数组合**
  ```ts
  // 柯里化示例
  export const multiply = (a: number) => (b: number) => a * b;

  // 函数组合
  export const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);
  ```

  2. **性能优化技术**
  ```ts
  // 记忆函数（缓存结果）
  export function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map();
    return function(...args: any[]) {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn(...args);
      cache.set(key, result);
      return result;
    } as T;
  }
  ```

  3. **链式操作**
  ```ts
  // 创建链式工具对象
  export const stringUtils = {
    value: '',
    trim() {
      this.value = this.value.trim();
      return this;
    },
    toUpperCase() {
      this.value = this.value.toUpperCase();
      return this;
    },
    getValue() {
      return this.value;
    }
  };

  // 使用
  const result = (stringUtils.value = ' hello ').trim().toUpperCase().getValue();
  ```

  4. **工具函数工厂**
  ```ts
  // 创建可配置的工具函数
  export function createLogger(prefix: string) {
    return function(message: string) {
      console.log(`[${prefix}] ${message}`);
    };
  }

  // 使用
  const apiLogger = createLogger('API');
  apiLogger('Request sent');
  ```

  5. **类型工具**
  ```ts
  // 创建通用类型工具
  export type Nullable<T> = T | null;

  // 在工具函数中使用
  export function safeParse<T>(json: string): Nullable<T> {
    try {
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }
  ```
  ---
:::
  