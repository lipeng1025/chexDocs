# 缓存策略

## 一、客户端缓存（浏览器缓存）
  
  **是什么**

  > - 让浏览器存储静态文件（JS/CSS/图片等），下次访问时直接使用本地副本

  **怎么用**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    routeRules: {
      // 静态资源缓存1年
      '/_nuxt/**': {
        headers: { 
          'Cache-Control': 'public, max-age=31536000, immutable' 
        }
      },
      // 图片缓存1周
      '/images/**': {
        headers: { 
          'Cache-Control': 'public, max-age=604800' 
        }
      }
    }
  })
  ```

  **注意**

  - 只缓存不会变动的文件（如带哈希的文件名）
  - 用户敏感数据不要缓存
## 二、组件缓存

  **是什么**

  > - 将频繁使用的组件输出缓存起来，避免重复渲染

  **怎么用**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    component: {
      caching: {
        // 缓存商品卡片组件1小时
        ProductCard: {
          maxAge: 3600, // 秒
          max: 100 // 最多缓存100个实例
        }
      }
    }
  })
  ```

  **注意**
  
  - 只缓存纯展示组件（无用户状态）
  - 动态内容多的组件不适合

## 三、API 缓存

  **是什么**

  > - 把后端API的响应结果存起来，下次同样请求直接返回缓存

  **怎么用**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    routeRules: {
      // 商品列表API缓存1小时
      '/api/products': {
        cache: { maxAge: 3600 } 
      },
      // 用户相关API按用户ID缓存5分钟
      '/api/user/*': {
        cache: { 
          maxAge: 300,
          key: req => `user:${req.headers['authorization']}` 
        }
      }
    }
  })
  ```

  **注意**
  
  - 用户私人数据要谨慎（按用户ID区分）
  - 经常变动的数据缓存时间设短些

## 四、页面缓存

  **是什么**

  > - 把整个网页存起来，下次同样请求直接返回整页

  **怎么用**

  静态页面（适合公司介绍等）
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      prerender: {
        routes: ['/', '/about', '/contact'] // 提前生成这些页面
      }
    }
  })
  ```

  动态页面（适合商品详情页）
  ```ts
  // 在server目录下创建中间件
  // server/middleware/page-cache.ts
  const cache = new Map() // 简单内存缓存

  export default defineEventHandler((event) => {
    const url = event.path
    if (cache.has(url)) {
      return cache.get(url) // 返回缓存页面
    }
    
    // 正常渲染页面...
    const html = renderPage(event)
    
    cache.set(url, html) // 缓存10分钟
    return html
  })
  ```

  **注意**

  - 登录用户页面不要缓存
  - 购物车等页面不能缓存

## 五、数据源缓存

  **是什么**

  > - 在数据库查询层面缓存结果

  **怎么用（示例用Redis）**
  ```ts
  // 在API处理中
  import { getStorage } from 'unstorage'
  const storage = getStorage() // 配置了Redis驱动

  export default defineEventHandler(async (event) => {
    const cacheKey = 'products:list'
    const cached = await storage.getItem(cacheKey)
    
    if (cached) {
      return cached // 返回缓存数据
    }
    
    const data = await db.products.findMany() // 数据库查询
    await storage.setItem(cacheKey, data, { ttl: 600 }) // 缓存10分钟
    return data
  })
  ```

  **注意**

  - 数据库更新后要清除相关缓存
  - 用Redis等专业缓存数据库效果更好

## 六、CDN缓存

  **是什么**

  > - 让全球的内容分发网络节点缓存你的静态资源

  **怎么用**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    app: {
      cdnURL: 'https://yourcdn.example.com' // 设置CDN地址
    },
    routeRules: {
      // 告诉CDN如何缓存
      '/_nuxt/**': { 
        headers: { 'CDN-Cache-Control': 'public, max-age=31536000' } 
      }
    }
  })
  ```

  **注意**

  - 需要先购买CDN服务（如Cloudflare）
  - 动态页面谨慎使用CDN缓存

## 七、缓存失效怎么办？

  1.**时间到了自动过期**
  ```ts
  // 设置5分钟有效期
  cache: { maxAge: 300 }
  ```

  2.**手动清除**
  ```ts
  // 当商品更新时
  eventHandler.on('product:updated', (id) => {
    // 清除商品页缓存
    deletePageCache(`/product/${id}`)
    
    // 清除商品API缓存
    deleteAPICache(`/api/product/${id}`)
  })
  ```

  3.**版本号区分**
  ```ts
  const cacheVersion = 'v2'
  const cacheKey = `${cacheVersion}:products`
  ```
## 八、该用哪种缓存？
  |  **场景**  |  **推荐缓存**  |
  |  ---  |  ---  |
  |  图片/CSS/JS文件  |  客户端缓存 + CDN缓存  |
  |  商品展示组件  |  组件缓存  |
  |  商品列表API  |  API缓存（5-10分钟）  |
  |  公司介绍页面  |  页面预渲染  |
  |  用户个人资料  |  不缓存 或 短时间缓存（1分钟）  |
  |  全球用户访问  |  CDN缓存  |
## 最后提醒
  - **先测试后上线**：缓存可能引发页面数据不同步
  - **监控缓存命中率**：太低说明配置不当，太高可能用了旧数据
  - **用户隐私第一**：带用户信息的请求不要缓存
  - **重要数据宁可不用缓存**：如支付页面


