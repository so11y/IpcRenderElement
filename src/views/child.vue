<template>
  <div>
    <button @click="testFn.createDiv">createElement(div)</button>

    <button @click="testFn.createStyles">createStyles</button>
  </div>
</template>
<script setup>
import { isFunction } from "lodash-es";
import { IPCPostMessage } from "../util/ipc";
import { append, toChildrenArray } from "../util/collection";

const childIPC = new IPCPostMessage("*", "my-app");

childIPC.on("message", (event) => IpcHostElement.notifyDomEvent(event));

class IpcHostElement {
  static IpcId = 0;
  static eventELMap = new Map();

  static idNodeMap = new Map();

  static notifyDomEvent(event) {
    const data = event.data;
    const elEvent = IpcHostElement.eventELMap.get(data.targetEl);
    elEvent.DOMLevel2Events[data.key](data.args);
  }

  constructor(options) {
    this._id = IpcHostElement.IpcId++;
    this._options = options;
    this._mountedPromise = Promise.withResolvers();
    this.isDestroyed = false;
    this._curPromise = Promise.resolve();
    if (options?.targetEl) {
      this._mountedPromise.resolve();
    }
  }

  toRaw() {
    return this.__raw__ ?? this;
  }

  getTargetEL() {
    if (this._options?.targetEl) {
      return this._options.targetEl;
    }
    return this._id;
  }

  async withPendingTask(callback) {
    return this._mountedPromise.promise.then(() => {
      if (callback) {
        this._curPromise = this._curPromise.then(() => callback());
      }
      return this._curPromise;
    });
  }

  createElement(type) {
    const self = this.toRaw();
    self.nodeName = type;
    IpcHostElement.idNodeMap.set(self._id, self);
    childIPC.send(
      window.parent,
      "ipcDom",
      {
        targetEl: "document",
        id: self._id,
        api: "createElement",
        args: type
      },
      this._mountedPromise.resolve
    );
    return this;
  }

  querySelector(selector) {
    return this.template(async (resolve, self) => {
      await Promise.allSettled(
        toChildrenArray(self).map((child) => child.toRaw().withPendingTask())
      );
      childIPC.send(
        window.parent,
        "ipcDom",
        {
          targetEl: self.getTargetEL(),
          api: "querySelector",
          args: [selector]
        },
        (value) => {
          resolve(IpcHostElement.idNodeMap.get(parseInt(value)));
        }
      );
    });
  }

  append(...nodes) {
    this.template(async (resolve, self) => {
      await Promise.all(nodes.map((v) => v.withPendingTask()));

      append(
        self,
        nodes.map((v) => v.toRaw())
      );

      childIPC.send(
        window.parent,
        "ipcDom",
        {
          targetEl: self.getTargetEL(),
          api: "append",
          args: nodes.map((v) => v._id)
        },
        resolve
      );
    });
  }

  insertBefore(child, anchor) {
    this.template(async (resolve, self) => {
      insertBefore(self, child.toRaw(), anchor.toRaw());

      childIPC.send(
        window.parent,
        "ipcDom",
        {
          targetEl: self.getTargetEL(),
          api: "insertBefore",
          args: [child.getTargetEL(), anchor?.getTargetEL() ?? null]
        },
        resolve
      );
    });
  }

  removeChild(child) {
    this.template(async (resolve, self) => {
      //代表child不proxy,不是proxy的话就是比如子卸载的时候通知父级 ->    self.parentNode?.removeChild(self);
      //不是用户api操作的
      if (child === child.toRaw() || !self.children) {
        resolve();
        return;
      }
      removeChild(self, child.toRaw());
      IpcHostElement.idNodeMap.delete(child._id);
      childIPC.send(
        window.parent,
        "ipcDom",
        {
          targetEl: this.getTargetEL(),
          api: "removeChild"
        },
        resolve
      );
    });
  }

  remove() {
    return this.template(async (resolve, self) => {
      self.isDestroyed = true;
      self.parentNode?.removeChild(self);

      if (self.children) {
        await childIPC.pauseTracking(() =>
          Promise.allSettled(
            toChildrenArray(self).map((child) => {
              IpcHostElement.idNodeMap.delete(child._id);
              child.toRaw().remove();
            })
          )
        );
        self.children = null;
      }

      IpcHostElement.eventELMap.delete(self.getTargetEL());
      childIPC.send(
        window.parent,
        "ipcDom",
        {
          targetEl: this.getTargetEL(),
          api: "remove"
        },
        resolve
      );
    });
  }

  template(callback) {
    if (this.isDestroyed) {
      console.warn("Element is destroyed");
      return;
    }
    return this.withPendingTask(() => {
      const resolvePromise = Promise.withResolvers();
      callback(resolvePromise.resolve, this.toRaw());
      return resolvePromise.promise;
    });
  }
}
class HostDocument extends IpcHostElement {
  constructor() {
    super({ targetEl: "document" });
    this.head = HostElement({
      targetEl: "document.head"
    });
    this.body = HostElement({
      targetEl: "document.body"
    });
  }
  createElement(type) {
    return new HostElement().createElement(type);
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
      if (key === "__raw__") {
        return target;
      }
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

const document = new HostDocument();

const testFn = {
  createDiv() {
    const div = document.createElement("div");

    const span = document.createElement("span");

    const input = document.createElement("input");

    input.value = 3252;

    div.onclick = function () {
      alert("clicked");
    };

    //阻止冒泡
    input.onclick_stop = function () {};

    input.oninput = function (el) {
      span.textContent = el.target.value;
      div.style.backgroundColor = "yellow";
    };

    div.append(span, input);

    document.append(div);

    //没办法同步
    div.querySelector("input").then((v) => {
      console.log(v, "d-x");
    });
  },
  async createStyles() {
    const style = document.createElement("style");

    style.textContent = `
      .my-box {
        width: 200px;
        height: 100px;
        background: lightblue;
        border: 2px solid blue;
        padding: 10px;
        margin: 10px;
      }

      .my-button {
        background: red;
        color: white;
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
      }
    `;

    document.head.append(style);

    const box = await document.createElement("div");
    box.className = "my-box";
    box.textContent = "应用了样式的div";

    const button = document.createElement("button");
    button.className = "my-button";
    button.textContent = "红色按钮";

    button.onclick = function () {
      alert("按钮被点击了！");
    };

    // 添加到页面
    box.append(button);
    document.body.append(box);
  }
};
</script>
