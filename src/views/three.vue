<template>
  <div style="height: 100%; width: 100%">
    <TresCanvas
      window-size
      clear-color="#82DBC5"
      ref="canvas1"
    >
      <!-- <OrbitControls /> -->
      <Controls ref="controlsRef" />
      <TresMesh
        :position="[0, 0, 0]"
        cast-shadow
        @double-click="fitToBox"
      >
        <TresBoxGeometry :args="[1, 1, 1]" />
        <TresMeshToonMaterial color="#4F4F4F" />
      </TresMesh>
      <TresDirectionalLight
        :position="[0, 2, 4]"
        :intensity="1.2"
        cast-shadow
      />
    </TresCanvas>
    <div
      id="test-point"
      style="height: 100vh; width: 100vw; position: absolute; z-index: 2"
    ></div>
  </div>
</template>
<script setup>
import {
  TresCanvas,
  useTres,
  useTresContext,
  useRaycaster
} from "@tresjs/core";
import {
  OrbitControls,
  CameraControls,
  BaseCameraControls
} from "@tresjs/cientos";
import Controls from "../components/Controls.vue";
import { onMounted, ref, computed } from "vue";

const canvas1 = ref();

const controlsRef = ref();
// function delay() {
//   return new Promise((r) => {
//     setTimeout(r, 16);
//   });
// }

function fitToBox(e) {
  const { object } = e;
  const current = object;
  console.log(controlsRef.value, "d-");
  controlsRef.value.cameraRef?.instance.fitToBox(current, true);
}

onMounted(async () => {
  console.log(canvas1, "d-d-");
  const canvas = document.querySelector("canvas");
  window.addEventListener("message", (e) => {
    const { evnetTarget, eventName, eventConst } = e.data;
    if (evnetTarget && eventName) {
      const clickEvent = new window[eventConst](eventName, evnetTarget);
      // console.log(clickEvent.clientX + "<:>" + clickEvent.clientY);
      // console.log(eventName, "--d");

      if (eventName === "pointermove") {
        canvas.ownerDocument.dispatchEvent(clickEvent);
      }
      canvas.dispatchEvent(clickEvent);
    }
  });

  // setTimeout(() => {
  //   // const pd = new PointerEvent("pointerdown", {
  //   //   clientX: 592,
  //   //   clientY: 418,
  //   //   button: 0,
  //   //   pointerId: 1,
  //   //   pointerType: "mouse",
  //   //   // buttons: 1,
  //   // });
  //   // const pmove = new PointerEvent("pointermove", {
  //   //   clientX: 592,
  //   //   clientY: 418,
  //   //   button: 0,
  //   //   pointerId: 1,
  //   //   pointerType: "mouse",
  //   // });
  //   // const pup = new PointerEvent("pointerup", {
  //   //   clientX: 592,
  //   //   clientY: 418,
  //   //   button: 0,
  //   //   pointerId: 1,
  //   //   pointerType: "mouse",
  //   //   // buttons: 1,
  //   // });
  //   // const pup1 = new PointerEvent("pointerup", {
  //   //   clientX: 592,
  //   //   clientY: 418,
  //   //   button: 0,
  //   //   pointerId: 1,
  //   //   pointerType: "mouse",
  //   // });
  //   // const db = new MouseEvent("dblclick", {
  //   //   clientX: 592,
  //   //   clientY: 418,
  //   //   button: 0,
  //   //   pointerId: 1,
  //   //   pointerType: "mouse",
  //   // });
  //   // canvas.dispatchEvent(pmove);
  //   // canvas.dispatchEvent(pd);
  //   // canvas.dispatchEvent(pup);
  //   // canvas.dispatchEvent(pup1);
  //   // canvas.dispatchEvent(db);
  //   // console.log("click");
  // }, 3000);
  // const canvas = document.querySelector("canvas");
  // const testPoint = document.querySelector("#test-point");
  // testPoint?.addEventListener("pointerdown", (e) => {
  //   // console.log(e.clientX, e.clientY);
  //   const clickEvent = new window.PointerEvent("pointerdown", {
  //     cancelable: true,
  //     clientX: e.clientX,
  //     clientY: e.clientY,
  //     button: e.button,
  //     pointerId: 1
  //   });
  //   canvas.setPointerCapture(1);
  //   canvas.dispatchEvent(clickEvent);
  // });
  {
    //   // x: 859;
    //   // y: 353;
    const [s, e] = [528, 58];
    setTimeout(async () => {
      //   document.addEventListener("pointermove", (a) => {
      //     console.log(a, "--", a.deltaX);
      //   });
      //   const clickEvent = new window.PointerEvent("pointerdown", {
      //     cancelable: true,
      //     clientX: s, //151,
      //     clientY: e, //155,
      //     button: 2,
      //     buttons: 2,
      //     pointerId: 1,
      //     pointerType: "mouse",
      //   });
      //   canvas.dispatchEvent(clickEvent);
      //   for (let index = e + 1; index < 300; index++) {
      //     await delay();
      //     const clickEvent = new window.PointerEvent("pointermove", {
      //       cancelable: true,
      //       clientX: s,
      //       clientY: index,
      //       button: 2,
      //       buttons: 2,
      //       pointerId: 1,
      //       pointerType: "mouse",
      //     });
      //     console.log(index);
      //     canvas.ownerDocument.dispatchEvent(clickEvent);
      //   }
    }, 2000);
  }
});

function onPointerEnter(ev) {
  // const { object } = ev;
  // const color = object.material.color;
  console.log(111);
  // ev.object.material.color.set("red"); // = "red";
}
</script>
