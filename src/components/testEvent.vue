<template>
  <div>test</div>
</template>
<script setup>
import { watch, onMounted } from "vue";
const emits = defineEmits(["test"]);

const modelValue = defineModel();
onMounted(() => {
  console.log(2);
  modelValue.value = 11;
  const r = emits("test");
  console.log(r, 3);
});

watch(modelValue, (value) => {
  console.log(value);
});
</script>
