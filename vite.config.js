import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import test from "./p/index";
import { NodeTypes, ElementTypes } from "@vue/compiler-core";
// import { templateCompilerOptions } from "@tresjs/core";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
    // test()
  ],
  server: {
    headers: {
      // 允许所有域名跨域访问
      "Access-Control-Allow-Origin": "*"
    }
  }
});
