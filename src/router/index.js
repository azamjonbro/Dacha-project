import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../views/Main.vue"), // lazy
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    component: () => import("../views/Login.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/* AUTH GUARD */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (!token && to.meta.requiresAuth) {
    return next("/login");
  }

  if (token && to.path === "/login") {
    return next("/");
  }

  next();
});

export default router;
