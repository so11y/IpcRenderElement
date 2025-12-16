import { createApp } from "vue";
import router from "./router";
import App from "./App.vue";
const app = createApp(App);
app.use(i18n);
app.use(router);
app.mount("#app");
