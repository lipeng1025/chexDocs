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

      '/NuxtDocs/': [
        {
          text: 'Nuxt3: 目录结构',
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
              { text: 'server', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/server' },
              { text: 'shared', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/shared' },
              { text: '📌 .env', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/env' },
              { text: '📌 .gitignore', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/gitignore' },
              { text: '.nuxtignore', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/nuxtignore' },
              { text: '.nuxtrc', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/nuxtrc' },
              { text: '📌 nuxt.config.ts', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/nuxtconfigts' },
              { text: '📌 package.json', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/packagejson' },
              { text: 'tsconfig.json', link: '/NuxtDocs/CoreEssentials/DirectoryStructure/tsconfigjson' },
          ]
        },
        {
          text: 'Nuxt3: 核心',
          collapsed: true,    // 默认折叠
          items: [
            { text: '项目配置', link: '/NuxtDocs/CoreEssentials/ProjectConfiguration' },
            { text: '路由系统', link: '/NuxtDocs/CoreEssentials/Routing' },
            { text: '数据获取', link: '/NuxtDocs/CoreEssentials/DataFetch' },
            { text: '状态管理', link: '/NuxtDocs/CoreEssentials/StateManagement' },
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
            { text: 'UI 框架集成', link: '/NuxtDocs/Overview/UIFrameworkIntegration' },
            { text: '过渡动画', link: '/NuxtDocs/Overview/Transitions' },
            { text: '-------------------------------', link: '' },
            { text: 'PWA 支持', link: '/NuxtDocs/Overview/PWASupport' },
            { text: '国际化', link: '/NuxtDocs/Overview/Internationalization' },
          ]
        },
        {
          text: 'Nuxt3: 其他',
          items: [
            // { text: 'TypeScript 深度集成', link: '/NuxtDocs/Overview/TypeScriptIntegration' },
            // { text: '插件与模块开发', link: '/NuxtDocs/Overview/PluginModuleDevelopment' },
            // { text: '创建项目', link: '/NuxtDocs/Overview/initProject' },
            // { text: '命令行工具', link: '/NuxtDocs/Overview/CLITools' },
            // { text: '缓存策略', link: '/NuxtDocs/Overview/CachingStrategies' },
            // { text: '部署适配', link: '/NuxtDocs/Overview/DeploymentAdaptation' },
            // { text: '测试策略', link: '/NuxtDocs/Overview/TestingStrategies' },
            // { text: 'API 路由', link: '/NuxtDocs/CoreEssentials/APIRouting' },
          ]
        },
      ],
      
      '/LaravelDocs/': [
        {
          text: '📚 Laravel12: 核心',
          items: [
            { text: '路由系统', link: '/LaravelDocs/CoreEssentials/Routing' },
          ]
        },
        {
          text: '⚙️ Laravel12: 了解',
          items: [
            { text: 'API 路由', link: '/LaravelDocs/Overview/APIRouting' },
          ]
        },
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/lipeng1025' }
    ],
    
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2023-present Your Team'
    }
  },
  
  markdown: {
    theme: {
      light: 'min-light',
      dark: 'nord'
    },
    lineNumbers: true
  }
})