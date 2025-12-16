<template>
  <div>
    <button @click="testFn.createDiv">createElement(div)</button>
  </div>
</template>
<script setup>
import { isFunction } from "lodash-es";
import { IPCPostMessage } from "../util/ipc";

const childIPC = new IPCPostMessage("*", "my-app");

childIPC.on("message", (event) => IpcHostElement.notifyDomEvent(event));

class IpcHostElement {
  static IpcId = 0;
  static eventELMap = new Map();

  static notifyDomEvent(event) {
    const data = event.data;
    const elEvent = IpcHostElement.eventELMap.get(data.targetEl);
    elEvent.DOMLevel2Events[data.key](data.args);
  }

  constructor(options) {
    this._id = IpcHostElement.IpcId++;
    this._options = options;
    this._mountedPromise = Promise.withResolvers();
    if (options?.targetEl) {
      this._mountedPromise.resolve();
    }
  }

  getTargetEL() {
    if (this._options?.targetEl) {
      return this._options.targetEl;
    }
    return this._id;
  }

  withPendingTask() {
    return Promise.all([
      this._curPromise?.promise,
      this._mountedPromise.promise
    ]);
  }

  createElement(type) {
    childIPC.send(
      window.parent,
      "ipcDom",
      {
        targetEl: "document",
        id: this._id,
        api: "createElement",
        args: type
      },
      this._mountedPromise.resolve
    );
    return this;
  }

  append(...nodes) {
    this.template((resolve) => {
      this._mountedPromise.promise.then(async () => {
        await Promise.all(nodes.map((v) => v.withPendingTask()));
        childIPC.send(
          window.parent,
          "ipcDom",
          {
            targetEl: this.getTargetEL(),
            api: "append",
            args: nodes.map((v) => v._id)
          },
          resolve
        );
      });
    });
  }

  template(callback) {
    this.withPendingTask().then(() => {
      this._curPromise = Promise.withResolvers();
      callback(this._curPromise.resolve);
    });
  }
}

function HostElement(options) {
  const el = new IpcHostElement(options);

  const proxySet = function (options) {
    const { target, key, newValue, receiver, synthesis } = options;
    if (!key.startsWith("_")) {
      const isFnValue = isFunction(newValue);
      el.template((resolve) => {
        const targetEl = el.getTargetEL();
        childIPC.send(
          window.parent,
          "ipcDom",
          {
            targetEl,
            proxy: "set",
            key: synthesis ?? key,
            isFnValue,
            value: isFnValue ? null : newValue
          },
          resolve
        );
        if (isFnValue) {
          if (!IpcHostElement.eventELMap.has(targetEl)) {
            IpcHostElement.eventELMap.set(targetEl, {
              DOMLevel2Events: {}
            });
          }
          const { DOMLevel2Events } = IpcHostElement.eventELMap.get(targetEl);
          DOMLevel2Events[key] = newValue.bind(el);
        }
      });
    }
    return Reflect.set(target, key, newValue, receiver);
  };

  return new Proxy(el, {
    get(target, key, receiver) {
      if (key === "style" && !target["style"]) {
        target[key] = {};
        return new Proxy(target[key], {
          set: (styleTarget, styleKey, styleValue, styleReceiver) =>
            proxySet({
              target: styleTarget,
              key: styleKey,
              newValue: styleValue,
              synthesis: `${key}.${styleKey}`,
              receiver: styleReceiver
            })
        });
      }
      return Reflect.get(target, key, receiver);
    },
    set: (target, key, newValue, receiver) =>
      proxySet({
        target,
        key,
        newValue,
        receiver
      })
  });
}

const document = {
  append(...args) {
    return this.body.append(...args);
  },
  createElement(type) {
    return new HostElement().createElement(type);
  },
  body: HostElement({
    targetEl: "document.body"
  })
};

const testFn = {
  createDiv() {
    const div = document.createElement("div");

    const span = document.createElement("span");

    const input = document.createElement("input");

    input.value = 3252;

    input.oninput = function (el) {
      span.textContent = el.target.value;
      div.style.backgroundColor = "yellow";
    };

    div.append(span, input);

    document.append(div);
  }
};
</script>
