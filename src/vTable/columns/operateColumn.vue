<template></template>
<script setup>
import { useColumn } from "./useColumn";
import { vButtonRender } from "../vButton";
import { useAttrs } from "vue";

const attrs = useAttrs();

const button = vButtonRender(attrs.buttons);

useColumn({
  disableSelect: true,
  customLayout: button,
  title: "操作"
});
</script>
