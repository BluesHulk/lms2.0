import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/index'
import store from './store'
import App from './App.vue'
import "@/assets/styles/public.scss";
import "@/assets/styles/el-style.scss";
import "@/assets/icon/iconfont.css";

const app = createApp(App);

// app.config.globalProperties.$api = api;
// app.config.globalProperties.$isHavePerms = (info) => {
//     return store.getters.isHavePerms(info)
// };

// 公共组件都注册为全局组件
// const requireComponent = require.context(
//   './components', //组件目录的相对路径
//   false, // 是否查询其子目录
//   /[A-Z]\w+\.(vue|js)$/ // 匹配基础组件文件名正则
// )
// requireComponent.keys().forEach(fileName => {
//   // 获取组件配置
//   const componentConfig = requireComponent(fileName)
//   // 获取组件的 PascalCase 命名
//   const componentName = componentConfig.default.name;
//   // 全局注册组件
//   app.component(
//       componentName,
//       // 如果这个组件选项是通过 `export default` 导出的，
//       // 那么就会优先使用 `.default`，
//       // 否则回退到使用模块的根。
//       componentConfig.default || componentConfig
//   )
// })
window.document.title = "灵鱼";

app.use(router).use(store).use(ElementPlus).mount('#app')
