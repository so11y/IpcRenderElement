import { ElOption, ElSelect } from "element-plus";
import { createApp, shallowRef } from "vue";

export class SelectListEditor {
  root = null;
  element = null;
  container = null;
  constructor({ table, options = [] }) {
    this.table = table;
    this.options = options;
  }
  //感觉还不这里点击往外面抛事件，然后外面的vue文件来处理
  onStart(editorContext) {
    const { container, referencePosition, value, col } = editorContext;
    const table = this.table.value.vTableInstance;
    const layoutMap = table.internalProps.layoutMap;
    const colConfig =
      table.columns[col - layoutMap.leftRowSeriesNumberColumnCount];
    this.container = container;
    this.createElement(value, colConfig.options);
    if (value) this.setValue(value);
    if (referencePosition?.rect) this.adjustPosition(referencePosition.rect);
  }

  createElement(defaultValue, options) {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.width = "100%";
    div.style.padding = "1px";
    div.style.boxSizing = "border-box";
    this.container?.appendChild(div);

    const app = this.createVueApp(defaultValue, options);
    app.mount(div);
    this.root = app;
    this.element = div;
  }

  createVueApp(currentValue, options) {
    const self = this;
    return createApp({
      setup() {
        const modelValue = shallowRef(currentValue);
        return () => (
          <div class="selectEditor">
            <ElSelect
              vModel={modelValue.value}
              popper-class="selectEditorPopper"
              onChange={(value) => self.setValue(value)}
            >
              {{
                default: () =>
                  options.map((option) => (
                    <ElOption
                      key={option}
                      value={option}
                    >
                      {option}
                    </ElOption>
                  ))
              }}
            </ElSelect>
          </div>
        );
      }
    });
  }

  getValue() {
    return this.currentValue;
  }

  setValue(value) {
    this.currentValue = value;
  }

  adjustPosition(rect) {
    if (this.element) {
      this.element.style.top = `${rect.top}px`;
      this.element.style.left = `${rect.left}px`;
      this.element.style.width = `${rect.width}px`;
      this.element.style.height = `${rect.height}px`;
    }
  }

  onEnd() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.element && this.container) {
      this.container.removeChild(this.element);
      this.element = null;
    }
  }

  isEditorElement(target) {
    return this.element?.contains(target) || this.isClickPopUp(target);
  }

  isClickPopUp(target) {
    return target.closest(".selectEditorPopper");
  }
}
