import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./style.css"
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import { formatDate } from "./utils/formatter";

const app = createApp(App);

// Global properties
app.config.globalProperties.$dView = formatDate;

app.use(router);
app.use(Toast, {
  timeout: 3000,
  position: "top-right",
});

app.mount("#app");
