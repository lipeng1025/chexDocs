<script setup>
// 定义 Props
const props = defineProps({
  // 树形数据（可选，有默认值）
  treeData: {
    type: Array,
    default: () => [
      {
        title: "默认分组",
        children: [
          { title: "示例项", link: "#demo" }
        ]
      }
    ]
  },
  // 是否显示标题（Boolean 类型示例）
  showTitle: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <div class="tree-nav">
    <div 
      v-for="(group, index) in props.treeData" 
      :key="index"
      class="tree-group"
    >
      <a :href="group.link"><h3 v-if="props.showTitle">{{ group.title }}</h3></a>
      <ul>
        <li v-for="(item, idx) in group.children" :key="idx">
          <a :href="item.link" class="nav-link">{{ item.title }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.tree-nav {
  position: fixed;
  top: 80px;
  right: 20px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 15px;
  background: var(--vp-c-bg-alt);
  border-radius: 8px;
  box-shadow: var(--vp-shadow-2);
  width: 220px;
  z-index: 100;
}

.tree-group {
  margin-bottom: 15px;
}

.tree-group h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  padding-left: 8px;
}

.tree-group ul {
  padding-left: 0;
  list-style: none;
}

.tree-group li {
  margin: 5px 0;
}

.nav-link {
  display: block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--vp-c-gray-soft);
  color: var(--vp-c-brand);
}

@media (max-width: 1200px) {
  .tree-nav {
    display: block; 
    width: 180px;
    max-height: calc(100vh - 160px);
    top: 120px;
  }
}
</style>