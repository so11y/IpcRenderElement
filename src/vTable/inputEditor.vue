<template></template>
<script setup>
import { VTable } from "@visactor/vue-vtable";
import { InputEditor } from "@visactor/vtable-editors";
import { ElMessage } from "element-plus";

class ValidateInputEditor extends InputEditor {
  validateValue(newValue, oldValue, editCell, table) {
    //copy的话没有table和editCell
    if (!editCell && !table) {
      return true;
    }

    const layoutMap = table.internalProps.layoutMap;
    const col =
      table.columns[editCell.col - layoutMap.leftRowSeriesNumberColumnCount];

    if ((col.required || "required" in col) && !newValue) {
      ElMessage.warning(col.title + "不能为空");
      return false;
    }
    if (col.validate) {
      return col.validate(newValue, oldValue, editCell, table);
    }
    return true;
  }
}

VTable.register.editor("inputEditor", new ValidateInputEditor());
</script>
