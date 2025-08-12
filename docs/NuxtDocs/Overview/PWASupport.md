# PWA 支持

## 一、PWA 模块安装与配置

  1.**安装依赖**
  ```bash
  npm install @vite-pwa/nuxt workbox-window
  ```
  ---
  2.**基础配置**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    modules: ['@vite-pwa/nuxt'],
    
    pwa: {
      registerType: 'autoUpdate', // 自动更新策略
      manifest: {
        name: '我的Nuxt应用',
        short_name: 'NuxtPWA',
        description: '渐进式Web应用示例',
        theme_color: '#1867C0',
        background_color: '#FFFFFF',
        display: 'standalone', // 全屏独立应用体验
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // 适配不同设备
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}']
      },
      client: {
        installPrompt: true, // 启用安装提示
        periodicSyncForUpdates: 3600 // 每小时检查更新
      }
    }
  })
  ```
  ---
  3.**文件结构准备**
  ```text
  public/
    |- icons/
      |- pwa-192x192.png
      |- pwa-512x512.png
    |- favicon.ico
  ```

  **注意事项：**

  - 图标尺寸必须包含 192x192 和 512x512
  - 主题色应与应用设计一致
  - 首次安装需要 HTTPS 环境（本地开发可用 localhost）

## 二、manifest.json 深度配置

  1.**完整配置示例**
  ```json
  {
    "name": "Nuxt电商应用",
    "short_name": "NuxtShop",
    "description": "基于Nuxt3的PWA电商应用",
    "start_url": "/?utm_source=pwa",
    "scope": "/",
    "display": "standalone",
    "orientation": "portrait-primary",
    "theme_color": "#1867C0",
    "background_color": "#FFFFFF",
    "icons": [
      {
        "src": "icons/pwa-64x64.png",
        "sizes": "64x64",
        "type": "image/png"
      },
      {
        "src": "icons/pwa-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "icons/pwa-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable any"
      }
    ],
    "screenshots": [
      {
        "src": "screenshots/home-800x600.png",
        "sizes": "800x600",
        "type": "image/png",
        "form_factor": "wide"
      }
    ],
    "categories": ["shopping", "business"],
    "shortcuts": [
      {
        "name": "最新商品",
        "short_name": "新品",
        "description": "查看最新上架商品",
        "url": "/new-arrivals",
        "icons": [{ "src": "icons/new.png", "sizes": "96x96" }]
      }
    ]
  }
  ```
  ---
  2.**平台特定配置**
  ```ts
  // nuxt.config.ts
  pwa: {
    manifest: {
      /* 基础配置 */
    },
    // iOS 特定配置
    apple: {
      capable: true,
      statusBarStyle: 'black-translucent',
      startupImage: [
        {
          href: '/icons/apple-splash-2048x2732.png',
          media: '(device-width: 1024px) and (device-height: 1366px)'
        }
      ]
    },
    // Windows 磁贴配置
    msTile: {
      color: '#ffffff',
      square150x150Logo: '/icons/ms-tile-150x150.png'
    }
  }
  ```
## 三、服务工作线程配置

  1.**自定义 Service Worker**
  ```ts
  // sw.ts (根目录)
  import { precacheAndRoute } from 'workbox-precaching'
  import { registerRoute } from 'workbox-routing'
  import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

  // 自动注入预缓存清单
  declare const self: ServiceWorkerGlobalScope
  precacheAndRoute(self.__WB_MANIFEST)

  // 自定义路由策略
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        {
          cacheWillUpdate: async ({ response }) => {
            // 只缓存成功的响应
            return response.status === 200 ? response : null
          }
        }
      ]
    })
  )

  // API请求缓存策略
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new StaleWhileRevalidate({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 3 // 超时后使用缓存
    })
  )
  ```
  ---
  2.**配置 Workbox**
  ```ts
  // nuxt.config.ts
  pwa: {
    workbox: {
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30天
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-stylesheets'
          }
        }
      ],
      cleanupOutdatedCaches: true,
      navigateFallback: '/offline' // 离线回退页面
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html}'],
      swSrc: 'sw.ts' // 自定义SW入口
    }
  }
  ```
## 四、离线支持与缓存策略

  1.**离线页面实现**
  ```vue
  <!-- pages/offline.vue -->
  <template>
    <div class="offline-container">
      <h1>您处于离线状态</h1>
      <p>请检查网络连接后重试</p>
      <button @click="retry">重试连接</button>
    </div>
  </template>

  <script setup>
  const retry = () => window.location.reload()
  </script>
  ```
  ---
  2.**高级缓存策略**
  |  **策略类型**  |  **适用场景**  |  **代码示例**  |
  |  ---  |  ---  |  ---  |
  |  Cache First  |  静态资源（图片、字体）  |  new CacheFirst()  |
  |  Network First  |  关键API请求  |  new NetworkFirst()  |
  |  Stale While Revalidate  |  频繁更新内容（新闻、价格）  |  new StaleWhileRevalidate()  |
  |  Cache Only  |  完全静态资源  |  new CacheOnly()  |
  |  Network Only  |  必须实时数据（支付）  |  new NetworkOnly()  |
  ---
  3.**动态内容缓存**
  ```ts
  // sw.ts
  import { BackgroundSyncPlugin } from 'workbox-background-sync'

  // 后台同步插件
  const bgSyncPlugin = new BackgroundSyncPlugin('apiQueue', {
    maxRetentionTime: 24 * 60 // 重试24小时
  })

  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/submit'),
    new NetworkOnly({
      plugins: [bgSyncPlugin]
    }),
    'POST'
  )
  ```
## 五、更新通知与处理

  1.**更新检测逻辑**
  ```ts
  // composables/usePWA.ts
  import { Workbox } from 'workbox-window'

  export function usePWA() {
    const updateAvailable = ref(false)
    const registration = ref<ServiceWorkerRegistration | null>(null)
    
    onMounted(() => {
      if ('serviceWorker' in navigator) {
        const wb = new Workbox('/sw.js')
        
        // 检测到更新
        wb.addEventListener('waiting', (event) => {
          updateAvailable.value = true
          registration.value = event.target as ServiceWorkerRegistration
        })
        
        wb.register()
      }
    })
    
    // 激活更新
    const activateUpdate = async () => {
      if (registration.value?.waiting) {
        registration.value.waiting.postMessage({ type: 'SKIP_WAITING' })
        
        // 重载页面应用更新
        window.location.reload()
      }
    }
    
    return { updateAvailable, activateUpdate }
  }
  ```
  ---
  2.**更新通知组件**
  ```vue
  <!-- components/PWAUpdate.vue -->
  <template>
    <div v-if="show" class="pwa-update-banner">
      <p>新版本可用，点击更新</p>
      <button @click="update">立即更新</button>
      <button @click="dismiss">稍后</button>
    </div>
  </template>

  <script setup>
  const { updateAvailable, activateUpdate } = usePWA()
  const show = ref(false)

  watch(updateAvailable, (available) => {
    if (available) {
      show.value = true
    }
  })

  const update = () => {
    activateUpdate()
    show.value = false
  }

  const dismiss = () => {
    show.value = false
  }
  </script>
  ```
  ---
  3.**自定义更新策略**
  ```ts
  // sw.ts
  self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting()
    }
  })

  // 控制更新检查频率
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-updates') {
      event.waitUntil(checkForUpdates())
    }
  })

  async function checkForUpdates() {
    const cache = await caches.open('api-cache')
    const keys = await cache.keys()
    // 自定义更新逻辑
  }
  ```
## 六、高级功能实现

  1.**推送通知**
  ```ts
  // 请求通知权限
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // 发送通知
  const showNotification = (title: string, options?: NotificationOptions) => {
    if ('serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/icons/notification.png',
          vibrate: [200, 100, 200],
          ...options
        })
      })
    }
  }

  // 后台事件处理 (sw.ts)
  self.addEventListener('push', (event) => {
    const data = event.data?.json()
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        data: { url: data.url }
      })
    )
  })

  self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  })
  ```
  ---
  2.**后台数据同步**
  ```ts
  // sw.ts
  self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-cart') {
      event.waitUntil(syncCartData())
    }
  })

  async function syncCartData() {
    const cache = await caches.open('sync-cart')
    const requests = await cache.keys()
    
    for (const request of requests) {
      try {
        const response = await fetch(request.url, {
          method: 'POST',
          body: await request.json()
        })
        
        if (response.ok) {
          await cache.delete(request)
        }
      } catch (err) {
        console.error('Sync failed', err)
      }
    }
  }
  ```
## 七、调试与测试

  1.**开发工具调试**
  ```bash
  # 1. 打开Chrome开发者工具
  # 2. 进入 Application > Service Workers
  # 3. 勾选 "Update on reload" 实时更新
  # 4. 使用 "Offline" 模拟离线状态
  ```
  ---
  2.**Lighthouse 审计**
  ```bash
  # 安装工具
  npm install -g lighthouse

  # 运行审计
  lighthouse http://localhost:3000 --view
  ```
  
  **PWA核心指标：**

  - ✅ 可安装性
  - ✅ 离线支持
  - ✅ 快速加载
  - ✅ 安全连接(HTTPS)
  ---
  3.**真实设备测试清单**

  - 添加到主屏幕功能正常
  - 离线访问核心内容
  - 推送通知权限请求
  - 后台同步功能
  - 更新提示机制

## 八、最佳实践与注意事项

  1.**缓存策略指南**
  |  **资源类型**  |  **推荐策略**  |  **缓存时间**  |
  |  ---  |  ---  |  ---  |
  |  HTML  |  NetworkFirst  |  短(10分钟)  |
  |  CSS/JS  |  StaleWhileRevalidate  |  长(1年)  |
  |  图片/字体  |  CacheFirst  |  很长(1年+)  |
  |  API数据  |  NetworkFirst  |  短(5分钟)  |
  |  用户生成内容  |  NetworkOnly  |  不缓存  |
  ---
  2.**版本控制策略**
  ```ts
  // nuxt.config.ts
  pwa: {
    workbox: {
      // 每次构建生成唯一版本ID
      cacheId: `${process.env.npm_package_name}-${process.env.npm_package_version}`,
      // 跳过等待阶段
      skipWaiting: true,
      clientsClaim: true
    }
  }
  ```
  ---
  3.**安全注意事项**

  - **HTTPS 强制**：生产环境必须使用 HTTPS

  - **内容安全策略(CSP)**：

  ```ts
  // nuxt.config.ts
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'", "https://api.example.com"]
      }
    }
  }
  ```
  - **敏感数据**：不在 Service Worker 中缓存认证令牌
  ---
  4.**性能优化**

  - **预缓存关键资源**：

  ```ts
  workbox: {
    globPatterns: [
      '**/*.{js,css}',
      // 预缓存关键页面
      { url: '/', revision: null },
      { url: '/offline', revision: null }
    ]
  }
  ```
  - **资源压缩**：确保所有缓存的资源经过 Gzip/Brotli 压缩
  - **缓存清理**：定期清理过期缓存

## 九、常见问题解决方案

  1.**更新不生效问题**
  ```ts
  // 在应用入口添加
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            // 提示用户更新
          }
        });
      });
    });
    
    // 强制刷新所有客户端
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
  ```
  ---
  2.**缓存污染问题**
  ```ts
  // 使用版本化缓存名称
  const version = 'v2';
  const cacheName = `app-cache-${version}`;

  // 清理旧版本缓存
  self.addEventListener('activate', event => {
    event.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(
          keys.filter(key => key !== cacheName)
            .map(key => caches.delete(key))
      })
    );
  });
  ```
  ---
  3.**离线分析工具**
  ```ts
  // 记录离线事件
  self.addEventListener('fetch', event => {
    if (!navigator.onLine) {
      reportOfflineEvent({
        url: event.request.url,
        timestamp: Date.now()
      })
    }
  });

  // 发送到分析平台
  const reportOfflineEvent = (data) => {
    // 暂存到IndexedDB
    const dbRequest = indexedDB.open('offlineAnalytics');
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('events', 'readwrite');
      const store = tx.objectStore('events');
      store.add(data);
    };
    
    // 网络恢复后发送
    window.addEventListener('online', () => {
      sendCachedAnalytics();
    });
  };
  ```
## 总结

  Nuxt3 PWA 实施关键点：

  1.**核心配置：**

  - 完整的 manifest.json
  - 合理的 Service Worker 策略
  - 多平台适配（iOS/Android/Windows）
  ---
  2.**离线体验：**

  - 关键资源预缓存
  - 智能回退策略
  - 后台数据同步
  ---
  3.**更新管理**：

  - 自动更新检测
  - 用户友好提示
  - 平滑更新过渡
  ---
  4.**高级功能：**

  - 推送通知系统
  - 后台数据同步
  - 离线分析
  ---
  性能与体验指标：

  - **首次加载时间**：< 3秒 (3G网络)
  - **可交互时间**：< 5秒
  - **离线可用性**：核心功能100%可用
  - **安装率**：> 20% (通过提示优化)
  ---
  最后建议：

  - 使用 Lighthouse 定期审计
  - 在不同网络条件下测试（离线/慢速3G）
  - 监控真实用户的 PWA 使用指标
  - 提供明确的安装引导和更新提示
