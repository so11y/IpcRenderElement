<template></template>
<script setup>
import { useColumn } from "./useColumn";
import { vCheckboxRender } from "../vCheckbox";

const vCheckbox = vCheckboxRender();

useColumn({
  editor: "",
  bool: true,
  customLayout: vCheckbox
});
</script>
