<template>
  <ListTable
    v-bind="$attrs"
    :records="records"
    :options="options"
    :ref="(el) => (refElModel = el)"
    @onDragSelectEnd="onDragSelectEnd"
    @onCheckboxStateChange="onCheckboxStateChange"
    @onChangeCellValue="onChangeCellValue"
    @onDropdownMenuClick="onDropdownMenuClick"
    @onKeyDown="onKeyDown"
  >
    <slot></slot>
  </ListTable>
</template>
<script setup>
import { ListTable, VTable } from "@visactor/vue-vtable";
// import { createText, createGroup } from "@visactor/vtable/es/vrender";
import { ElMessage } from "element-plus";
import { pauseTracking, enableTracking } from "@vue/reactivity";
import {
  ref,
  computed,
  nextTick,
  provide,
  watchPostEffect,
  onUnmounted
} from "vue";
import { cloneDeep, range } from "lodash-es";
import { parseBool, where } from "./utils/index";

const emits = defineEmits([
  "onDeleteRecord",
  "onChangeCellValue",
  "onChangeRow"
]);

const props = defineProps({
  nodeKey: String,
  loading: Boolean,
  records: Array
});
const rowEditedState = {
  No_Change: 0,
  Add: 2,
  Remove: 4,
  Edited: 8,
  add(a, b) {
    return (a ?? 0) | b;
  },
  has(a, b) {
    return ((a ?? 0) & b) === b;
  },
  dev(a, b) {
    return (a ?? 0) & ~b;
  },
  hasRemove(a) {
    return ((a ?? 0) & rowEditedState.Remove) === rowEditedState.Remove;
  }
};

const refElModel = defineModel("refEl");
const changeCellValueBeforeRecodes = [];
const beforeChangedRecordsMap = new Map();
const columns = ref([]);

const records = computed(() => {
  return props.records.slice();
});

const columnsSort = computed(() => {
  return columns.value
    .sort((a, b) => (a.useId < b.useId ? -1 : 1))
    .map((v) => v.config);
});

provide("VListTable", refElModel);
provide("VListTableColumns", {
  watchColumn: (column) => {
    pauseTracking();
    const index = columns.value.findIndex((v) => v.useId === column.useId);
    if (index >= 0) {
      columns.value[index] = column;
    } else {
      columns.value.push(column);
    }
    enableTracking();
  }
});

watchPostEffect(() => {
  if (!refElModel.value?.vTableInstance) return;
  const vTableInstance = refElModel.value?.vTableInstance;
  vTableInstance.options.emptyTip.text = props.loading
    ? "加载中..."
    : "暂无数据";

  vTableInstance.options.customCellStyle = [
    {
      id: "errorRow",
      style: {
        bgColor: "red"
      }
    }
  ];
  vTableInstance.options.columns = columnsSort.value;
  refElModel.value.vTableInstance.updateOption(vTableInstance.options);
});

/**
 * https://visactor.io/vtable/guide/Event/event_list 事件文档
 *
 *
 * https://visactor.io/vtable/demo/basic-functionality/frozen-col 冻结列 rightFrozenColCount右冻结
 */
const options = {
  menu: {
    contextMenuItems: ["删除"]
  },
  canvasHeight: 'auto',
  widthMode: "standard",
  // autoFillWidth: true,
  columnResizeMode: "header",
  rowSeriesNumber: {
    title: "序号",
    sort: true,
    width: "80px",
    style: {
      textAlign: "center"
    }
  },
  theme: VTable.themes.DEFAULT.extends({
    scrollStyle: {
      barToSide: true,
      visible: "always"
    }
  }),
  tooltip: {
    isShowOverflowTextTooltip: true
  },
  emptyTip: {
    text: "暂无数据"
  },
  keyboardOptions: {
    copySelected: true,
    pasteValueToCell: true,
    disableRowSeriesNumberSelect: true
  }
};

//-----框选结束时改为选中满行
function onDragSelectEnd() {
  // const vTableInstance = modelValue.value.vTableInstance;
  // const startSelectCellRange = vTableInstance.getSelectedCellRanges()[0];
  // vTableInstance.clearSelected();
  // const colRange = vTableInstance.getBodyVisibleColRange();
  // setTimeout(() => {
  //   vTableInstance.selectCells([
  //     {
  //       start: {
  //         col: colRange.colStart,
  //         row: startSelectCellRange.start.row
  //       },
  //       end: {
  //         col: colRange.colEnd,
  //         row: startSelectCellRange.end.row
  //       }
  //     }
  //   ]);
  //   //下两针之后
  // }, 32);
}

function onDropdownMenuClick(args) {
  const vTableInstance = refElModel.value.vTableInstance;
  switch (args.menuKey) {
    case "删除":
      {
        const startSelectCellRange = vTableInstance.getSelectedCellRanges()[0];
        if (!startSelectCellRange) {
          ElMessage.warning("请选择要删除的数据");
          return;
        }
        vTableInstance.clearSelected();
        const recordStartIndex = vTableInstance.getRecordShowIndexByCell(
          startSelectCellRange.start.col,
          startSelectCellRange.start.row
        );
        const recordEndIndex = vTableInstance.getRecordShowIndexByCell(
          startSelectCellRange.end.col,
          startSelectCellRange.end.row
        );
        const deleteRange = range(recordStartIndex, recordEndIndex + 1);

        for (let index = 0; index < deleteRange.length; index++) {
          onChangeCellValue({
            col: recordStartIndex,
            row: deleteRange[index] + 1,
            callback(recordRowData, rawRowData) {
              const operateState = rowEditedState.add(
                recordRowData.operateState,
                rowEditedState.Remove
              );
              recordRowData.operateState = operateState;
              rawRowData.operateState = operateState;
            }
          });
        }

        vTableInstance.deleteRecords(deleteRange);
      }
      break;
  }
}

function onChangeCellValue(params) {
  const vTableInstance = refElModel.value.vTableInstance;
  const records = props.records;
  //减去序号
  const col = vTableInstance.columns[Math.max(params.col - 1, 0)];
  const rawRowIndex = vTableInstance.getRecordIndexByCell(0, params.row);
  const rawRowData = records[rawRowIndex];

  const recordRowData = where(
    beforeChangedRecordsMap.has(rawRowIndex),
    () => beforeChangedRecordsMap.get(rawRowIndex),
    () => {
      const rowData = cloneDeep(rawRowData);
      beforeChangedRecordsMap.set(rawRowIndex, rowData);
      return rowData;
    }
  );
  if (!params.callback) {
    const field = params.field || col.field;
    recordRowData[field] = where(
      "bool" in col,
      () => parseBool(params.currentValue),
      params.currentValue
    );

    rawRowData[field] = where(
      "bool" in col,
      () => parseBool(params.changedValue),
      params.changedValue
    );
    rawRowData.operateState = recordRowData.operateState = rowEditedState.add(
      recordRowData.operateState,
      rowEditedState.Edited
    );
  } else {
    params.callback(recordRowData, rawRowData);
  }

  nextTick(() => {
    if (beforeChangedRecordsMap.size) {
      const rows = Array.from(beforeChangedRecordsMap.values());
      changeCellValueBeforeRecodes.push(cloneDeep(beforeChangedRecordsMap));
      emits("onChangeRow", rows, Array.from(beforeChangedRecordsMap.keys()));
      beforeChangedRecordsMap.clear();
    }
  });
}

function onCheckboxStateChange(params) {
  onChangeCellValue({
    col: params.col,
    row: params.row,
    currentValue: !params.checked,
    changedValue: params.checked
  });
}

function onKeyDown(e) {
  const vTableInstance = refElModel.value.vTableInstance;
  if (e.event.ctrlKey && e.keyCode === 90) {
    const beforeChangedRecordsMap = changeCellValueBeforeRecodes.pop();

    if (!beforeChangedRecordsMap) return;

    const keys = Array.from(beforeChangedRecordsMap.keys());
    const values = Array.from(beforeChangedRecordsMap.values());

    if (keys.length === 0) return;
    if (values.some((v) => rowEditedState.hasRemove(v.operateState))) {
      props.records.forEach((v) => {
        if (values.some((vv) => vv[props.nodeKey] === v[props.nodeKey])) {
          rowEditedState.dev(v.operateState, rowEditedState.Remove);
        }
      });

      values.forEach((v, index) => {
        rowEditedState.dev(v.operateState, rowEditedState.Remove);
        vTableInstance.addRecord(v, keys[index]);
      });
    } else {
      vTableInstance.updateRecords(values, keys);
    }

    emits("onChangeRow", values, keys);
  }
}
</script>
