import { createRouter, createWebHistory } from "vue-router";
import Main from "../views/Main.vue";

const routes = [
  {
    path: "/",
    component: Main,
    meta: { requiresAuth: true },
  },
  { 
    path: "/login",
    component: () => import("../views/Login.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth && !token) {
    next("/login"); // ❌ token yo‘q → login
  } else if (to.path === "/login" && token) {
    next("/"); // ✅ token bor → home
  } else {
    next();
  }
});
export default router;
