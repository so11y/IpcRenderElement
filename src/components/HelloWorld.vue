<script setup>
import { ref } from "vue";
import Copy from "./copy.vue";
defineProps({
  msg: String
  // class: String
});

defineOptions({
  inheritAttrs: true
});

const count = ref(0);
</script>

<template>
  {{ $attrs.pp }}
  <!-- <div>{{ $attrs }}--</div>
  <div>
    <dddd>
      <Copy v-bind="$attrs" />
    </dddd>
  </div> -->
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
