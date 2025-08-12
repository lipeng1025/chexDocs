# 部署适配

## 一、部署模式概述

  Nuxt3 支持的部署模式：
  |  **部署模式**  |  **适用场景**  |  **特点**  |  **命令**  |
  |  ---  |  ---  |  ---  |  ---  |
  |  Node.js 服务器  |  全动态内容应用  |  完整SSR支持，实时渲染  |  `nuxi build` + `node .output/server/index.mjs`  |
  |  静态站点 (SSG)  |  内容为主网站  |  预渲染HTML，CDN分发  |  `nuxi generate`  |
  |  Serverless 函数  |  弹性扩展应用  |  按需执行，自动扩缩容  |  `nuxi build` + 平台部署  |
  |  边缘计算  |  全球用户应用  |  低延迟，就近处理  |  `nuxi build` + 边缘平台部署  |
  |  混合渲染  |  复杂业务场景  |  动静结合，智能路由  |  配置 `routeRules`  |
## 二、Node.js 服务器部署

  1.**标准部署流程**
  ```bash
  # 构建应用
  npx nuxi build

  # 启动生产服务器
  node .output/server/index.mjs
  ```

  2.**PM2 进程管理**
  ```bash
  # 安装 PM2
  npm install pm2 -g

  # 启动应用
  pm2 start .output/server/index.mjs --name "nuxt-app"

  # 保存配置
  pm2 save

  # 设置开机启动
  pm2 startup
  ```

  3.**Nginx 反向代理配置**
  ```nginx
  # /etc/nginx/conf.d/nuxt-app.conf
  server {
      listen 80;
      server_name yourdomain.com;
      
      location / {
          proxy_pass http://localhost:3000; # Nuxt 默认端口
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      }
      
      # 静态资源直接服务
      location /_nuxt/ {
          alias /path/to/app/.output/public/_nuxt/;
          expires 1y;
          add_header Cache-Control "public, immutable";
      }
  }
  ```

  4.**性能优化配置**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      compressPublicAssets: true,
      minify: true,
      prerender: {
        crawlLinks: true,
        routes: ['/sitemap.xml']
      }
    },
    routeRules: {
      '/api/**': { cache: { maxAge: 60 * 60 } } // 缓存API响应
    }
  })
  ```
## 三、静态站点部署 (SSG)

  1.**基础生成命令**
  ```bash
  # 生成静态站点
  npx nuxi generate

  # 输出目录
  .output/public
  ```

  2.**增量静态生成 (ISR)**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    routeRules: {
      // 每60秒重新验证
      '/products/**': { swr: 60 },
      
      // 每天凌晨重新生成
      '/blog/**': { static: true, prerender: true },
      
      // 动态页面
      '/dashboard': { ssr: false }
    }
  })
  ```

  3.**部署到常见平台**

  GitHub Pages:
  ```bash
  # 设置 baseURL
  // nuxt.config.ts
  export default defineNuxtConfig({
    app: {
      baseURL: process.env.NODE_ENV === 'production' ? '/repo-name/' : '/'
    }
  })

  # 部署脚本
  npx nuxi generate
  git add .output/public
  git commit -m "Static deployment"
  git subtree push --prefix .output/public origin gh-pages
  ```

  Netlify:
  ```netlify.toml
  [build]
    command = "npm run generate"
    publish = ".output/public"

  [context.production.environment]
    NUXT_APP_BASE_URL = "/"
  ```
  
  Vercel:
  ```json
  // vercel.json
  {
    "builds": [
      {
        "src": "nuxt.config.ts",
        "use": "@nuxtjs/vercel-builder",
        "config": {
          "generateStaticRoutes": true
        }
      }
    ],
    "routes": [
      { "src": "/_nuxt/.+", "headers": { "Cache-Control": "max-age=31536000" } }
    ]
  }
  ```
## 四、Serverless 部署

  1.**AWS Lambda 部署**
  ```bash
  # 安装适配器
  npm install @nuxtjs/aws-lambda

  # 配置 nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      preset: 'aws-lambda'
    }
  })

  # 构建
  npx nuxi build

  # 部署
  aws lambda update-function-code --function-name my-function --zip-file fileb://.output/server.zip
  ```

  2.**Vercel Serverless**
  ```ts
  // vercel.json
  {
    "version": 2,
    "builds": [
      {
        "src": "nuxt.config.ts",
        "use": "@nuxtjs/vercel-builder",
        "config": {
          "serverFiles": ["server/**"]
        }
      }
    ]
  }
  ```

  3.**Netlify Functions**
  ```toml
  # netlify.toml
  [build]
    command = "npm run build"
    functions = "netlify/functions"
    publish = ".output/public"

  [functions]
    node_bundler = "esbuild"
  ```
## 五、边缘计算部署

  1.**Cloudflare Workers**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      preset: 'cloudflare'
    }
  })

  // 入口文件
  export default {
    async fetch(request: Request, env: Env) {
      return await getAssetFromKV(request, env)
    }
  }
  ```

  2.**Vercel Edge**
  ```ts
  // app.vue
  export default defineNuxtConfig({
    routeRules: {
      '/': { edge: true },
      '/api/**': { edge: true }
    }
  })

  // 中间件
  export default defineEventHandler((event) => {
    event.context.edge = true
  })
  ```

  3.**Netlify Edge Functions**
  ```ts
  // netlify/edge-functions/hello.js
  export default async (request, context) => {
    return new Response('Hello from the edge!', {
      headers: { 'content-type': 'text/html' }
    })
  }

  // netlify.toml
  [[edge_functions]]
    path = "/hello"
    function = "hello"
  ```
## 六、Docker 容器化部署

  1.**基础 Dockerfile**
  ```Dockerfile
  # 使用官方 Node 镜像
  FROM node:18-alpine

  # 设置工作目录
  WORKDIR /app

  # 复制依赖定义
  COPY package*.json ./

  # 安装依赖
  RUN npm ci

  # 复制项目文件
  COPY . .

  # 构建应用
  RUN npm run build

  # 暴露端口
  EXPOSE 3000

  # 启动命令
  CMD ["node", ".output/server/index.mjs"]
  ```

  2.**多阶段构建优化**
  ```Dockerfile
  # 构建阶段
  FROM node:18-alpine as builder
  WORKDIR /app
  COPY . .
  RUN npm ci
  RUN npm run build

  # 生产镜像
  FROM node:18-alpine
  WORKDIR /app
  COPY --from=builder /app/.output ./
  COPY --from=builder /app/node_modules ./node_modules
  EXPOSE 3000
  CMD ["node", "server/index.mjs"]
  ```

  3.**Docker Compose 配置**
  ```yaml
  version: '3.8'
  services:
    app:
      build: .
      ports:
        - "3000:3000"
      environment:
        - NUXT_APP_BASE_URL=/
        - DATABASE_URL=postgres://user:pass@db:5432/mydb
      depends_on:
        - db
        
    db:
      image: postgres:14
      environment:
        POSTGRES_USER: user
        POSTGRES_PASSWORD: pass
        POSTGRES_DB: mydb
      volumes:
        - pgdata:/var/lib/postgresql/data

  volumes:
    pgdata:
  ```
## 七、环境变量与配置管理

  1.**环境变量优先级**

  - `.env` 文件
  - 运行时配置 (Runtime Config)
  - 环境变量 (process.env)
  - 应用配置 (App Config)

  2.**安全配置实践**
  ```ts
  // nuxt.config.ts
  export default defineNuxtConfig({
    runtimeConfig: {
      // 仅服务端可用
      apiSecret: process.env.API_SECRET,
      
      // 客户端和服务端都可用
      public: {
        apiBase: process.env.API_BASE || '/api'
      }
    }
  })
  ```

  3.**多环境管理**
  ```text
  .env
  .env.development
  .env.staging
  .env.production
  ```

  ```bash
  # 指定环境
  NODE_ENV=staging npx nuxi build
  ```
## 八、部署优化策略

  1.**性能优化**
  |  **优化点**  |  **实现方式**  |  **效果**  |
  |  ---  |  ---  |  ---  |
  |  资源压缩  |  `nitro.compressPublicAssets: true`  |  减少传输体积30-70%  |
  |  CDN分发  |  配置CDN缓存静态资源  |  全球加速，减少延迟  |
  |  缓存策略  |  `Cache-Control: public, max-age=31536000`  |  减少重复请求  |
  |  HTTP/2推送  |  配置服务器推送关键资源  |  加速页面渲染  |

  2.**安全加固**
  ```nginx
  # Nginx 安全配置
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-XSS-Protection "1; mode=block";
  add_header X-Content-Type-Options "nosniff";
  add_header Content-Security-Policy "default-src 'self' https:";
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  ```

  3.**监控与日志**
  ```ts
  // 集成Sentry监控
  export default defineNuxtConfig({
    modules: ['@nuxtjs/sentry'],
    sentry: {
      dsn: process.env.SENTRY_DSN,
      config: {
        environment: process.env.NODE_ENV
      }
    }
  })
  ```
## 九、平台特定适配

  1.**Vercel 适配**
  ```ts
  // vercel.json
  {
    "build": {
      "env": {
        "NODE_ENV": "production"
      }
    },
    "routes": [
      { "src": "/sw.js", "dest": "/_nuxt/dist/client/sw.js" },
      { "src": "/(.*)", "dest": "/" }
    ]
  }
  ```

  2.**Netlify 适配**
  ```toml
  # netlify.toml
  [build]
    command = "npm run build"
    publish = ".output/public"

  [context.production]
    environment = { NUXT_APP_BASE_URL = "/" }

  [[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
  ```

  3.**AWS Amplify 适配**
  ```yaml
  # amplify.yml
  version: 1
  frontend:
    phases:
      preBuild:
        commands:
          - npm ci
      build:
        commands:
          - npm run build
    artifacts:
      baseDirectory: .output/public
      files:
        - '**/*'
    cache:
      paths:
        - node_modules/**/*
  ```
## 十、部署工作流最佳实践

  1.**CI/CD 流水线示例**
  ```yaml
  # GitHub Actions 示例
  name: Deploy Nuxt App

  on:
    push:
      branches: [main]

  jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v3
          
        - name: Setup Node
          uses: actions/setup-node@v3
          with:
            node-version: 18
            
        - name: Install dependencies
          run: npm ci
          
        - name: Build application
          run: npm run build
          env:
            NUXT_APP_BASE_URL: /
            
        - name: Deploy to production
          uses: appleboy/ssh-action@master
          with:
            host: ${{ secrets.SSH_HOST }}
            username: ${{ secrets.SSH_USER }}
            key: ${{ secrets.SSH_KEY }}
            script: |
              cd /var/www/myapp
              git pull
              npm ci
              pm2 restart nuxt-app
  ```

  2.**零停机部署策略**
  ```bash
  # 1. 构建新版本
  npm run build

  # 2. 启动新实例
  pm2 start .output/server/index.mjs --name "nuxt-app-v2"

  # 3. 流量切换
  pm2 reload nuxt-app-v2

  # 4. 停止旧实例
  pm2 stop nuxt-app-v1
  ```
## 十一、常见问题解决方案

  1. 路由404问题
  ```ts
  // 确保所有动态路由有回退
  // nuxt.config.ts
  export default defineNuxtConfig({
    nitro: {
      prerender: {
        failOnError: false,
        crawlLinks: true,
        routes: ['/', '/404']
      }
    }
  })
  ```

  2. 环境变量未注入
  ```bash
  # 使用运行时配置而非process.env
  const { data } = useFetch('/api/data', {
    headers: {
      Authorization: `Bearer ${useRuntimeConfig().apiSecret}`
    }
  })
  ```

  3. 静态资源加载失败
  ```ts
  // 配置baseURL
  export default defineNuxtConfig({
    app: {
      baseURL: process.env.NODE_ENV === 'production' ? '/sub-path/' : '/'
    }
  })
  ```

  4. 内存泄漏处理
  ```bash
  # 使用--max-old-space-size限制内存
  NODE_OPTIONS="--max-old-space-size=1024" pm2 start index.mjs
  ```
## 十二、部署检查清单

  部署前检查：

  - 确认 `nuxi typecheck` 通过
  - 验证生产环境构建 NODE_ENV=production nuxi build
  - 测试关键功能在生产模式下的表现
  - 检查环境变量是否完整配置

  部署后验证：

  - 访问主页检查状态码
  - 测试API路由功能
  - 验证静态资源加载
  - 检查控制台错误日志
  - 运行Lighthouse性能测试

  监控配置：

  - 错误监控（Sentry/Bugsnag）
  - 性能监控（New Relic/Datadog）
  - 日志收集（ELK/Pino）
  - 健康检查端点

  ```ts
  // server/api/healthz.get.ts
  export default defineEventHandler(() => ({ status: 'ok' }))
  ```
## 总结：部署策略选择指南

  决策矩阵：
  |  **考虑因素**  |  **Node服务器**  |  **静态站点**  |  **Serverless**  |  **边缘计算**  |
  |  ---  |  ---  |  ---  |  ---  |  ---  |
  |  内容动态性  |  高  |  低  |  中-高  |  中-高  |
  |  流量波动  |  中  |  低  |  高  |  高  |
  |  全球分布需求  |  低  |  高  |  中  |  高  |
  |  冷启动延迟  |  无  |  无  |  可能有  |  极低  |
  |  运维复杂度  |  高  |  低  |  低  |  低  |
  |  成本效益  |  中  |  高  |  按需  |  按需  |
  ---
  最佳实践建议：

  - 内容型网站：静态站点生成 + CDN（Vercel/Netlify）
  - 企业应用：Node服务器 + Docker + 负载均衡
  - 电商平台：混合渲染 + 边缘计算
  - 内部系统：Serverless函数 + API网关
  - 全球应用：边缘计算部署（Cloudflare Workers）
  ---
  关键注意事项：

  - 环境一致性：确保开发、测试、生产环境一致
  - 配置安全：敏感信息使用运行时配置或密钥管理服务
  - 版本控制：部署包包含版本信息便于回滚
  - 渐进式部署：使用金丝雀发布降低风险
  - 监控先行：部署前设置好监控系统
  ---
  通过合理选择部署策略和优化配置，Nuxt3应用可以实现：

  - 99.95%+ 的可用性
  - 全球用户 <100ms 的延迟
  - 毫秒级冷启动时间
  - 自动弹性伸缩能力
  - 高效的成本控制

  > **最终建议**：根据业务需求选择最适合的部署方式，并定期审查部署策略以适应业务发展。
