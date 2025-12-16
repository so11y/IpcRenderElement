import { createWebHashHistory, createRouter } from "vue-router";
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: () => import("./views/home.vue")
    },
    {
      path: "/three",
      name: "three",
      component: () => import("./views/three.vue")
    },
    {
      path: "/postmessageRender/child",
      name: "postmessageRenderChild",
      component: () => import("./views/postmessageRender/child.vue")
    },
    {
      path: "/postmessageRender/parent",
      name: "postmessageRenderParent",
      component: () => import("./views/postmessageRender/parent.vue")
    }
  ]
});
