<template>
  <div>
    <input
      type="text"
      placeholder="回车搜索"
      v-model="searchInput"
      @keydown.enter="searchApi()"
    />
    <span>{{ searchForMat }}</span>
    <button @click="searchApi('next')">下一个</button>
    <button @click="searchApi('prev')">上一个</button>
  </div>
</template>
<script setup>
import { SearchComponent } from "@visactor/vtable-search";
import { computed, ref } from "vue";

const props = defineProps({
  vTableInstance: Object
});

const searcHResult = ref();
const searchInput = ref("");

const searchImpl = computed(() => {
  return new SearchComponent({
    table: props.vTableInstance,
    autoJump: true // 搜索完成后是否自动跳转到搜索结果的第一条
  });
});

const searchForMat = computed(() => {
  return `${searcHResult.value?.index ?? 0}/${
    searcHResult.value?.results.length ?? 0
  }`;
});

function searchApi(api = "search") {
  console.log(33);
  searcHResult.value = searchImpl.value[api](searchInput.value);
}
</script>
