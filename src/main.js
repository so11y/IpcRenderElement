// import App from "./App.vue";
import { createApp } from "vue";
// import ElementPlus from "element-plus";
import router from "./router";
import App from "./App3.vue";
// import "element-plus/dist/index.css";
import { i18n } from "./i18";
// import "./style.css";
const app = createApp(App);
// app.use(ElementPlus)
app.use(i18n);
app.use(router);
app.mount("#app");

// import("http://localhost:5173/src/main.js")
//   .then((module) => {
//     console.log("模块加载成功:", module);
//   })
//   .catch((error) => {
//     console.log("模块加载失败:", error);
//   });
