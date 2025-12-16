import {
  createText,
  createGroup,
  createRect
} from "@visactor/vtable/es/vrender";
// import {TextMeasure} from "@visactor/vutils/es/graphics/text/measure/textMeasure"

function Button(options) {
  const defaultOptions = Object.assign(
    {
      backgroundColor: "#409eff",
      color: "#fff",
      borderRadius: 4,
      state: {
        hover: {
          backgroundColor: "#66b1ff"
        },
        click: {
          backgroundColor: "rgb(51.2, 126.4, 204)"
        }
      }
    },
    options
  );
  switch (options.type) {
    case "primary":
      defaultOptions.backgroundColor = "#409eff";
      defaultOptions.state.hover.backgroundColor = "#66b1ff";
      defaultOptions.state.click.backgroundColor = "rgb(51.2, 126.4, 204)";
      break;
    case "danger":
      defaultOptions.backgroundColor = "#f56c6c";
      defaultOptions.state.hover.backgroundColor = "#f78989";
      defaultOptions.state.click.backgroundColor = "rgb(196, 86.4, 86.4)";
      break;
    case "success":
      defaultOptions.backgroundColor = "#67c23a";
      defaultOptions.state.hover.backgroundColor = "#85ce61";
      defaultOptions.state.click.backgroundColor = "rgb(82.4, 155.2, 46.4)";
      break;
    case "warning":
      defaultOptions.backgroundColor = "#e6a23c";
      defaultOptions.state.hover.backgroundColor = "#ebb563";
      defaultOptions.state.click.backgroundColor = "rgb(184, 129.6, 48)";
      break;
  }

  const button = new createGroup({
    width: this.table.measureText(defaultOptions.text, 12).width + 20,
    height: 26,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fill: defaultOptions.backgroundColor,
    cornerRadius: defaultOptions.borderRadius,
    cursor: "pointer"
  });

  button.stateProxy = (stateName) => {
    if (stateName === "hover") {
      return {
        fill: defaultOptions.state.hover.backgroundColor
      };
    } else if (stateName === "click") {
      return {
        fill: defaultOptions.state.click.backgroundColor
      };
    }
  };

  button.addEventListener("mouseenter", () => {
    button.addState("hover", true, false);
    this.table.scenegraph.updateNextFrame();
  });
  button.addEventListener("mouseleave", () => {
    button.removeState("hover", false);
    this.table.scenegraph.updateNextFrame();
  });
  button.addEventListener("pointerdown", () => {
    button.addState("click", false);
    this.table.scenegraph.updateNextFrame();
  });
  button.addEventListener("pointerup", () => {
    button.removeState("click", false);
    this.table.scenegraph.updateNextFrame();
  });
  button.addEventListener("click", () => {
    defaultOptions?.onClick(this.table.getRecordByCell(this.col, this.row));
  });

  button.add(
    new createText({
      text: defaultOptions.text,
      fontSize: 12,
      fill: defaultOptions.color,
      cursor: "pointer",
      interactive: true
    })
  );
  return button;
}

export function vButtonRender(options) {
  return function Group(arg) {
    const { width, height } = arg.rect;
    const container = new createGroup({
      width,
      height,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    });

    options.forEach((v, index) => {
      container.add(Button.call(arg, v));
      if (index !== options.length - 1) {
        container.add(
          new createRect({
            width: 10,
            pickable: false
          })
        );
      }
    });

    return {
      rootContainer: container,
      renderDefault: false
    };
  };
}
