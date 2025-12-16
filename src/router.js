import { createWebHashHistory, createRouter } from "vue-router";
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "parent",
      component: () => import("./views/parent.vue")
    },
    {
      path: "/child",
      name: "child",
      component: () => import("./views/child.vue")
    }
  ]
});
