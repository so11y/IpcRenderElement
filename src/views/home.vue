<template>
  <div
    id="test-point"
    ref="rootEl"
    @pointerdown="pointerEvent('pointerdown', $event)"
    @pointermove="pointerEvent('pointermove', $event)"
    @pointerup="pointerUp"
    @wheel="wheel"
    style="
      top: 0;
      left: 0;
      inset: 0;
      position: absolute;
      z-index: 2;
      user-select: none;
    "
  >
    <iframe
      ref="iframeEl"
      style="height: 100%; width: 100%; pointer-events: none"
      src="http://localhost:5173/#/three"
      frameborder="0"
    ></iframe>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";

const iframeEl = ref();
const rootEl = ref();

function log(e) {
  console.log(e);
}

let c = 0;
function pointerUp(event) {
  if (c++ === 2) {
    pointerEvent("pointerup", event);
    pointerEvent("pointerup", event);
    pointerEvent("dblclick", event, "MouseEvent");
    c = 0;
  }
}

function pointerEvent(eventName, e, eventConst = "PointerEvent", options) {
  const { clientX, clientY, button, buttons } = e;
  const rect = rootEl.value.getBoundingClientRect();
  const evnetTarget = {
    cancelable: true,
    clientX: clientX - rect.x,
    clientY: clientY - rect.y,
    button,
    ...options,
    buttons,
    pointerId: 1,
    pointerType: "mouse",
  };
  iframeEl.value.contentWindow.postMessage(
    {
      eventConst,
      eventName,
      evnetTarget,
    },
    "*"
  );
}

function wheel(e) {
  pointerEvent("wheel", e, "WheelEvent", {
    deltaMode: e.deltaMode,
    deltaX: e.deltaX,
    deltaY: e.deltaY,
    deltaZ: e.deltaZ,
    detail: e.detail,
  });
}
// onMounted(async () => {
//   //   const testPoint = document.querySelector("#test-point");
//   //   testPoint?.addEventListener("pointerdown", (e) => {
//   //     console.log(e.clientX, e.clientY);
//   //     const clickEvent = new window.PointerEvent("pointerdown", {
//   //       cancelable: true,
//   //       clientX: e.clientX,
//   //       clientY: e.clientY,
//   //       button: e.button,
//   //       pointerId: 1,
//   //     });
//   //     canvas.dispatchEvent(clickEvent);
//   //   });
// });
</script>
