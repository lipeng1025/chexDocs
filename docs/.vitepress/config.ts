import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Nuxt3 技术知识库',
  description: 'Nuxt3 开发指南与最佳实践',
  lang: 'zh-CN',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '核心概念', link: '/core-concepts/' },
      { text: 'API 参考', link: '/api-reference/' }
    ],
    
    sidebar: [
      {
        text: '核心概念',
        items: [
          { text: '项目初始化', link: '/core-concepts/initialization' },
          { text: '路由系统', link: '/core-concepts/routing' },
          { text: '数据获取', link: '/core-concepts/data-fetching' }
        ]
      },
      {
        text: 'API 参考',
        items: [
          { text: 'useFetch', link: '/api-reference/use-fetch' },
          { text: 'useState', link: '/api-reference/use-state' }
        ]
      }
    ],
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
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