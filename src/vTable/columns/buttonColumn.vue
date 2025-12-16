<template></template>
<script setup>
import { useColumn } from "./useColumn";
import { vButtonRender } from "../vButton";
import { useAttrs } from "vue";
const props = defineProps({
  onClick: Function,
  type: {
    type: String,
    default: "primary"
  }
});
const attrs = useAttrs();

const button = vButtonRender([
  {
    text: attrs.title,
    type: attrs.type,
    onClick(row) {
      props.onClick?.(row);
    }
  }
]);

useColumn({
  disableSelect: true,
  customLayout: button
});
</script>
