<template>
  <CameraControls
    ref="cameraRef"
    make-default
    v-if="activeCamera"
    :camera="activeCamera"
  />
</template>
<script setup>
import { CameraControls } from "@tresjs/cientos";
import { useTresContext } from "@tresjs/core";
import { getCurrentInstance, ref } from "vue";
const { camera: activeCamera } = useTresContext();

// console.log(getCurrentInstance());

const cameraRef = ref();
defineExpose({ cameraRef });
</script>
