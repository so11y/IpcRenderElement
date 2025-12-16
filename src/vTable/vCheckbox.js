import { createGroup, createImage } from "@visactor/vtable/es/vrender";
import { toRaw } from "vue";
// import {TextMeasure} from "@visactor/vutils/es/graphics/text/measure/textMeasure"

const checkSvg =
  '<svg width="200" height="200" viewBox="0 0 1024 1024" fill="#fff" xmlns="http://www.w3.org/2000/svg"><path d="M877.44815445 206.10060629a64.72691371 64.72691371 0 0 0-95.14856334 4.01306852L380.73381888 685.46812814 235.22771741 533.48933518a64.72691371 64.72691371 0 0 0-92.43003222-1.03563036l-45.82665557 45.82665443a64.72691371 64.72691371 0 0 0-0.90617629 90.61767965l239.61903446 250.10479331a64.72691371 64.72691371 0 0 0 71.19960405 15.14609778 64.33855261 64.33855261 0 0 0 35.08198741-21.23042702l36.24707186-42.71976334 40.5190474-40.77795556-3.36579926-3.49525333 411.40426297-486.74638962a64.72691371 64.72691371 0 0 0-3.88361443-87.64024149l-45.3088404-45.43829334z"></path></svg>';

export function vCheckboxRender() {
  function toggleCheckbox(imageContainer, arg) {
    if (arg.value === true || arg.value === "true") {
      imageContainer.add(
        new createImage({
          width: 10,
          height: 10,
          image: checkSvg,
          cursor: "pointer",
          interactive: true,
          background: "#315efb"
        })
      );
    } else {
      imageContainer.removeAllChild();
    }
  }

  return function Group(arg) {
    const { width, height } = arg.rect;

    const container = new createGroup({
      width,
      height,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    });

    const imageContainer = new createGroup({
      width: 14,
      height: 14,
      stroke: "#dcdfe6",
      cornerRadius: 2,
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    });
    container.add(imageContainer);

    toggleCheckbox(imageContainer, arg);

    imageContainer.addEventListener("click", () => {
      //changeCellValue
      const recodes = toRaw(arg.table.getRecordByCell(arg.col, arg.row));
      // const index = arg.table.getRecordShowIndexByCell(arg.col, arg.row);
      const filed = arg.table.getHeaderField(arg.col, arg.row);

      recodes[filed] = !recodes[filed];

      toggleCheckbox(imageContainer, {
        value: recodes[filed]
      });

      // arg.table.updateRecords([recodes], [index]);

      arg.table.fireListeners("checkbox_state_change", {
        col: arg.col,
        row: arg.row,
        checked: recodes[filed]
      });
      // arg.table.scenegraph.updateNextFrame();
    });
    return {
      rootContainer: container,
      renderDefault: false
    };
  };
}
