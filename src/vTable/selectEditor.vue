<template></template>
<script setup>
import { inject } from "vue";
import { SelectListEditor } from "./editor/select";

import { VTable } from "@visactor/vue-vtable";

const listTableRef = inject("VListTable");

const params = {
  table: listTableRef
};

VTable.register.editor("selectEditor", new SelectListEditor(params));
</script>
