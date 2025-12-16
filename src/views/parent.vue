<template>
  <div>
    <iframe
      :src="`${location}child`"
      frameborder="0"
      ref="iframeRef"
    ></iframe>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { IPCPostMessage } from "../util/ipc";
import { get, set } from "lodash-es";
const iframeRef = ref();

const location = window.location;

const parentIPC = new IPCPostMessage("*", "my-app");

const IpcDomMap = new Map();

function getTargetEL(data) {
  if (IpcDomMap.has(data.targetEl)) {
    return IpcDomMap.get(data.targetEl).realDom;
  }
  return get(window, data.targetEl);
}

function createArgs(args) {
  return {
    type: args.type,
    timestamp: args.timeStamp,
    target: {
      value: args.target?.value,
      checked: args.target?.checked,
      tagName: args.target?.tagName
    },
    // 基础事件属性
    bubbles: args.bubbles,
    cancelable: args.cancelable,
    defaultPrevented: args.defaultPrevented,
    // 鼠标事件
    clientX: args.clientX,
    clientY: args.clientY,
    offsetX: args.offsetX,
    offsetY: args.offsetY,
    // 键盘事件
    key: args.key,
    code: args.code,
    ctrlKey: args.ctrlKey,
    altKey: args.altKey,
    shiftKey: args.shiftKey,
    metaKey: args.metaKey,
    // 输入事件
    data: args.data,
    inputType: args.inputType
  };
}

const handle = {
  api(data, event) {
    switch (data.api) {
      case "createElement": {
        if (!IpcDomMap.has(data.id)) {
          IpcDomMap.set(data.id, {
            ipcArgs: data,
            realDom: document.createElement(data.args)
          });
          event.respond();
        }
        break;
      }

      case "append": {
        const realDomList = data.args.map((id) => IpcDomMap.get(id).realDom);
        getTargetEL(data).append(...realDomList);
        event.respond();
        break;
      }
      default:
        break;
    }
  },
  proxy(data, event) {
    const el = getTargetEL(data);
    switch (data.proxy) {
      case "set": {
        if (data.isFnValue) {
          el[data.key] = function (args) {
            parentIPC.send(
              iframeRef.value.contentWindow,
              "ipcDom_DOMLevel2Events",
              {
                targetEl: data.targetEl,
                key: data.key,
                args: createArgs(args)
              }
            );
          };
        } else {
          set(el, data.key, data.value);
        }

        break;
      }
    }
    event.respond();
  }
};

parentIPC.on("message", (event) => {
  const data = event.data;
  console.log(data);
  if (event.type !== "ipcDom") {
    return;
  }
  if (data.api) {
    handle.api(data, event);
  } else if (data.proxy) {
    handle.proxy(data, event);
  }
});
</script>
