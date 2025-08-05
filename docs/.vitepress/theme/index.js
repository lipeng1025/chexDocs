import DefaultTheme from 'vitepress/theme'
import DirectoryStructureTreeData from './components/DirectoryStructure.vue'
import CustomSection from './components/CustomSection.vue'
import './style.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('DirectoryStructureTreeData', DirectoryStructureTreeData)
    app.component('CustomSection', CustomSection)
  }
}