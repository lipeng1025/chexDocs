<script setup>
import TreeNav from './TreeNav.vue'

const customData = [
    {
      title: "功能模块",
      link: '#FunctionModules',
      children: [
        { title: "assets", link: "#assets" },
        { title: "components", link: "#components" },
        { title: "composables", link: "#composables" },
        { title: "layouts", link: "#layouts" },
        { title: "middleware", link: "#middleware" },
        { title: "pages", link: "#pages" },
        { title: "plugins", link: "#plugins" }
      ]
    },
    {
      title: "应用文件",
      link: '#ApplicationFiles',
      children: [
        { title: "app.vue", link: "#appvue" },
        { title: "app.config.ts", link: "#appconfigts" },
        { title: "error.vue", link: "#errorvue" }
      ]
    },
    {
      title: "核心目录",
      link: '#CoreDirectory',
      children: [
        { title: ".nuxt", link: "#nuxt" },
        { title: ".output", link: "#output" },
        { title: "public", link: "#public" },
        { title: "server", link: "#server" },
        { title: "shared", link: "#shared" }
      ]
    },
    {
      title: "配置目录",
      link: '#ConfigurationDirectory',
      children: [
        { title: "content", link: "#content" },
        { title: "modules", link: "#modules" }
      ]
    },
    {
      title: "根目录文件",
      link: '#RootDirectoryFiles',
      children: [
        { title: ".env", link: "#env" },
        { title: ".gitignore", link: "#gitignore" },
        { title: ".nuxtrc", link: "#nuxtrc" },
        { title: "nuxt.config.ts", link: "#nuxtconfigts" },
        { title: "node_modules", link: "#nodemodules" },
        { title: "package.json", link: "#packagejson" },
        { title: "tsconfig.json", link: "#tsconfigjson" }
      ]
    }
  ]
</script>

<template>
  <TreeNav 
    :treeData="customData"
    :showTitle="true"
    class="custom-style"
  />
</template>

<style>
.custom-style {
  border: 1px solid #eee;
}
</style>