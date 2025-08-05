<template>
  <div 
    class="custom-section"
    :class="colorClass"
    :style="{
      borderLeftColor: props.color
    }"
  >
    <button 
      class="toggle-btn"
      @click="toggleContent"
    >
      {{ isCollapsed ? '展开' : '收起' }}
    </button>
    <h4 class="section-title">{{ props.name }}</h4>
    <div class="content-wrapper" v-show="!isCollapsed">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import { computed, ref } from 'vue'

const { isDark } = useData()

const props = defineProps({
  color: {
    type: String,
    default: 'blue',
    validator: value => ['blue', 'green', 'purple', 'amber'].includes(value)
  },
  isCollapsed: {
    type: Boolean,
    default: true
  },
  name: {
    type: String,
    default: ''
  }
})

// 颜色类名映射
const colorClass = computed(() => {
  const base = `border-l-4 border-${props.color}-500 `
  return base + (isDark.value ? `bg-${props.color}-900/10` : `bg-${props.color}-50`)
})

// 控制内容是否收起
const isCollapsed = ref(props.isCollapsed)

const toggleContent = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.custom-section {
  position: relative;
  margin: 2rem 0;
  padding: 1.5rem;
  border-left-width: 4px;
  border-left-style: solid;
  border-radius: 8px 8px 8px 8px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.custom-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  padding: 0.5rem;
}

.toggle-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #333;
}

.toggle-btn:hover {
  text-decoration: underline;
}

.section-title {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
</style>
