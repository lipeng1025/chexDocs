import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Chex 技术知识库',
  description: 'Chex 开发指南与最佳实践',
  titleTemplate: ':title',
  lang: 'zh-CN',
  base: '/chexDocs/',
  head: [
    // 设置浏览器标签的标题
    ['meta', { name: 'theme-color', content: '#42b983' }],
    // 设置 favicon 图标
    ['link', { rel: 'icon', href: '/chexDocs/favicon.ico' }]
  ],
  themeConfig: {
    logo: '/favicon.ico',
    nav: [
      { text: '首页', link: '/' },
      { text: 'Vue3', link: '/VueDocs/', activeMatch: '/VueDocs/' },
      { text: 'Nuxt3', link: '/NuxtDocs/', activeMatch: '/NuxtDocs/' },
      { text: 'Laravel12', link: '/LaravelDocs/', activeMatch: '/LaravelDocs/' }
    ],
    
    sidebar: {
      '/': [
        {
          text: '欢迎',
          items: [
            { text: '简介', link: '/' }
          ]
        }
      ],
      
      '/VueDocs/': [
        {
          text: '📌 Vue3: 核心',
          items: [
            { text: '基本知识', link: '/VueDocs/CoreEssentials/BasicKnowledge' },
          ]
        }
      ],

      '/NuxtDocs/': [
        {
          text: '📌 Nuxt3: 目录结构',
          collapsed: true,    // 默认折叠
          items: [
              { text: '.nuxt', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/nuxt' },
              { text: '.output', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/output' },
              {
                text: '📌 app',
                collapsed: true,    // 默认折叠
                items: [
                  { text: 'assets', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/assets' },
                  { text: 'components', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/components' },
                  { text: 'composables', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/composables' },
                  { text: 'layouts', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/layouts' },
                  { text: 'middleware', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/middleware' },
                  { text: 'pages', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/pages' },
                  { text: 'plugins', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/plugins' },
                  { text: 'utils', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/utils' },
                  { text: 'app.vue', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/appvue' },
                  { text: 'app.config.ts', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/appconfigts' },
                  { text: 'error.vue', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/errorvue' },
                ]
              },
              { text: 'content', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/content' },
              { text: 'modules', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/modules' },
              { text: 'node_modules', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/node_modules' },
              { text: '📌 public', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/public' },
              { text: '📌 server', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/server' },
              { text: 'shared', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/shared' },
              { text: '📌 .env', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/env' },
              { text: '📌 .gitignore', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/gitignore' },
              { text: '.nuxtignore', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/nuxtignore' },
              { text: '.nuxtrc', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/nuxtrc' },
              { text: '📌 nuxt.config.ts', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/nuxtconfigts' },
              { text: '📌 package.json', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/packagejson' },
              { text: 'ts.config.json', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/tsconfigjson' },
          ]
        },
        {
          text: '📌 Nuxt3: 核心',
          collapsed: true,    // 默认折叠
          items: [
            { text: '项目配置', link: '/NuxtDocs/CoreEssentials/ProjectConfiguration' },
            { text: '路由系统', link: '/NuxtDocs/CoreEssentials/Routing' },
            { text: '数据获取', link: '/NuxtDocs/CoreEssentials/DataFetch' },
            { text: '状态管理', link: '/NuxtDocs/CoreEssentials/StateManagement' },
            { 
              text: '常用API',
              collapsed: true,    // 默认折叠
              items: [
                  { text: 'ComponentsApi', link: '/NuxtDocs/CoreEssentials/NuxtApi/ComponentsApi' },
                  { text: 'ComposablesApi', link: '/NuxtDocs/CoreEssentials/NuxtApi/ComposablesApi' },
                  { text: 'UtilsApi', link: '/NuxtDocs/CoreEssentials/NuxtApi/UtilsApi' }
              ]
            },
          ]
        },
        {
          text: 'Nuxt3: 了解',
          collapsed: true,    // 默认折叠
          items: [
            { text: '渲染模式差异', link: '/NuxtDocs/Overview/RenderingModes' },
            { text: 'SEO 与 Meta 管理', link: '/NuxtDocs/Overview/SEOMeta' },
            { text: '错误处理与调试', link: '/NuxtDocs/Overview/ErrorHandling', },
            { text: '-------------------------------', link: '' },
            { text: '构建优化', link: '/NuxtDocs/Overview/BuildOptimization' },
            { text: '部署适配', link: '/NuxtDocs/Overview/DeploymentAdaptation' },
            { text: '缓存策略', link: '/NuxtDocs/Overview/CachingStrategies' },
            { text: '-------------------------------', link: '' },
            { text: '国际化', link: '/NuxtDocs/Overview/Internationalization' },
            { text: 'TypeScript 深度集成', link: '/NuxtDocs/Overview/TypeScriptIntegration' },
            { text: 'PWA 支持', link: '/NuxtDocs/Overview/PWASupport' },
            { text: '-------------------------------', link: '' },
            { text: '插件与模块开发', link: '/NuxtDocs/Overview/PluginModuleDevelopment' },
          ]
        }
      ],
      
      '/LaravelDocs/': [
        {
          text: '📌 Laravel12: 核心',
          collapsed: true,
          items: [
            // 基础与环境
            {
              text: '🚀 基础与环境',
              collapsed: true,
              items: [
                { text: '环境与基础', link: '/LaravelDocs/CoreEssentials/EnvironmentFundamentals' },
                { text: '配置与环境', link: '/LaravelDocs/CoreEssentials/ConfigurationEnv' },
                { text: '服务容器与DI', link: '/LaravelDocs/CoreEssentials/ServiceContainerDI' }
              ]
            },
            // 路由与控制器
            {
              text: '🛣️ 路由与控制器',
              collapsed: true,
              items: [
                { text: '路由', link: '/LaravelDocs/CoreEssentials/Routing' },
                { text: '控制器', link: '/LaravelDocs/CoreEssentials/Controllers' }
              ]
            },
            // 数据处理
            {
              text: '💾 数据处理',
              collapsed: true,
              items: [
                { text: 'Eloquent ORM核心', link: '/LaravelDocs/CoreEssentials/EloquentCore' },
                { text: '数据库迁移与填充', link: '/LaravelDocs/CoreEssentials/MigrationsSeeders' },
                { text: 'API资源', link: '/LaravelDocs/CoreEssentials/ApiResources' }
              ]
            },
            // 请求处理
            {
              text: '📨 请求处理',
              collapsed: true,
              items: [
                { text: '请求与响应', link: '/LaravelDocs/CoreEssentials/RequestsResponses' },
                { text: '表单请求验证', link: '/LaravelDocs/CoreEssentials/FormRequestValidation' },
                { text: '中间件', link: '/LaravelDocs/CoreEssentials/Middleware' }
              ]
            },
            // 系统与安全
            {
              text: '🔐 系统与安全',
              collapsed: true,
              items: [
                { text: 'API认证', link: '/LaravelDocs/CoreEssentials/ApiAuthentication' },
                { text: '文件存储基础', link: '/LaravelDocs/CoreEssentials/FileStorage' },
                { text: '缓存基础', link: '/LaravelDocs/CoreEssentials/Caching' },
                { text: '日志', link: '/LaravelDocs/CoreEssentials/Logging' },
                { text: '错误处理', link: '/LaravelDocs/CoreEssentials/ErrorHandling' }
              ]
            },
            // 团队协作
            {
              text: '👥 团队协作',
              link: '/LaravelDocs/CoreEssentials/TeamCollaboration'
            }
          ]
        },
        {
          text: 'Laravel12: 了解',
          collapsed: true,
          items: [
            // 进阶ORM
            {
              text: '🧩 进阶ORM',
              collapsed: true,
              items: [
                { text: 'Eloquent进阶', link: '/LaravelDocs/Overview/EloquentAdvanced' },
                { text: '数据库迁移进阶', link: '/LaravelDocs/Overview/MigrationsAdvanced' }
              ]
            },
            // 后台任务
            {
              text: '⏳ 后台任务',
              collapsed: true,
              items: [
                { text: '队列系统', link: '/LaravelDocs/Overview/Queues' },
                { text: '队列进阶', link: '/LaravelDocs/Overview/QueuesAdvanced' },
                { text: '任务调度', link: '/LaravelDocs/Overview/TaskScheduling' }
              ]
            },
            // 事件与通信
            {
              text: '📡 事件与通信',
              collapsed: true,
              items: [
                { text: '事件系统', link: '/LaravelDocs/Overview/EventsListeners' },
                { text: '实时广播', link: '/LaravelDocs/Overview/Broadcasting' }
              ]
            },
            // 安全与授权
            {
              text: '🛡️ 安全与授权',
              collapsed: true,
              items: [
                { text: '授权策略', link: '/LaravelDocs/Overview/Authorization' },
                { text: '高级认证', link: '/LaravelDocs/Overview/AuthenticationAdvanced' }
              ]
            },
            // 通知与本地化
            {
              text: '🌍 通知与本地化',
              collapsed: true,
              items: [
                { text: '邮件与通知', link: '/LaravelDocs/Overview/MailNotifications' },
                { text: '本地化', link: '/LaravelDocs/Overview/Localization' }
              ]
            },
            // 测试与优化
            {
              text: '🧪 测试与优化',
              collapsed: true,
              items: [
                { text: '测试', link: '/LaravelDocs/Overview/Testing' },
                { text: '性能优化', link: '/LaravelDocs/Overview/PerformanceOptimization' }
              ]
            },
            // 存储与缓存
            {
              text: '💽 存储与缓存',
              collapsed: true,
              items: [
                { text: '文件存储进阶', link: '/LaravelDocs/Overview/FileStorageAdvanced' },
                { text: '缓存进阶', link: '/LaravelDocs/Overview/CachingAdvanced' }
              ]
            },
            // 高级主题
            {
              text: '⚙️ 高级主题',
              collapsed: true,
              items: [
                { text: '服务容器进阶', link: '/LaravelDocs/Overview/ServiceContainerAdvanced' },
                { text: '包开发', link: '/LaravelDocs/Overview/PackageDevelopment' }
              ]
            }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lipeng1025' }
    ],

    // 修改侧边栏目录标题
    outlineTitle: '页面导航',
    
    // 修改上一页/下一页文本
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    search: {
      provider: 'local'
    },
    
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2023-present Your Team'
    },
  },
  
  markdown: {
    theme: {
      light: 'min-light',
      dark: 'nord'
    },
    lineNumbers: true,
  }
})