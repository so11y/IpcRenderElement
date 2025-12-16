<template>
  <VSearch :vTableInstance="listTableRef?.vTableInstance" />
  <el-button @click="exitEdit">退出编辑</el-button>
  <div id="main">
    <div>
      <ListTable
        v-model:refEl="listTableRef"
        :records="records"
        :loading="loading"
        nodeKey="Row ID"
        @onDblClickCell="onDblClickCell"
        @onDeleteRecord="onDeleteRecord"
        @onChangeRow="onChangeRow"
      >
        <Column
          field="Order ID"
          title="ID"
          required
          editor=""
          :sort="true"
        />
        <Column
          field="City"
          title="城市"
          width="auto"
          editor="selectEditor"
          :options="options"
        />
        <ButtonColumn
          title="选择颜色"
          width="80"
        />
        <!-- <CheckboxColumn
        field="checkedTest"
        title="年龄"
        width="80"
      />

      <OperateColumn
        title="操作"
        width="140"
        :buttons="operateButton"
      /> -->

        <SelectEditor :options="options" />
        <InputEditor />
      </ListTable>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, shallowRef } from "vue";
import VSearch from "./vTable/search.vue";
import { vButtonRender } from "./vTable/vButton";
import ListTable from "./vTable/listTable.vue";
import SelectEditor from "./vTable/selectEditor.vue";
import InputEditor from "./vTable/inputEditor.vue";
import Column from "./vTable/columns/column.vue";
import ButtonColumn from "./vTable/columns/buttonColumn.vue";
import CheckboxColumn from "./vTable/columns/checkboxColumn.vue";
import OperateColumn from "./vTable/columns/operateColumn.vue";

const options = ["Beijing", "Shanghai", "Guangzhou"];

const operateButton = [
  {
    text: "编辑",
    type: "primary",
    onClick(row) {
      console.log("编辑", row);
    }
  },
  {
    text: "删除",
    type: "danger",
    onClick(row) {
      console.log("删除", row);
    }
  }
];

const records = shallowRef([]);
const listTableRef = ref();
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  // const values = await fetch(
  //   "https://lf9-dp-fe-cms-tos.byteorg.com/obj/bit-cloud/VTable/North_American_Superstore_data.json"
  // )
  //   .then((res) => res.json())
  //   .then((res) =>
  //     res.map((v) => {
  //       return {
  //         ...v,
  //         checkedTest: false
  //       };
  //     })
  //   );
  loading.value = false;
  records.value = [
    {
      "Row ID": "7981",
      "Order ID": "CA-2015",
      "Order Date": "2015/1/3",
      "Ship Date": "2015/1/7",
      "Ship Mode": "Standard Class",
      "Customer ID": "DP-13000",
      "Customer Name": "Darren Powers",
      Segment: "Consumer",
      Country: "United States",
      City: "Houston",
      State: "Texas",
      "Postal Code": "77095",
      Region: "Central",
      "Product ID": "OFF-PA-10000174",
      Category: "Office Supplies",
      "Sub-Category": "Paper",
      "Product Name":
        'Message Book, Wirebound, Four 5 1/2" X 4" Forms/Pg., 200 Dupl. Sets/Book',
      Sales: "16.448",
      Quantity: "2",
      Discount: "0.2",
      Profit: "5.5512"
    },
    {
      "Row ID": "740",
      "Order ID": "CA-2016",
      "Order Date": "2015/1/4",
      "Ship Date": "2015/1/8",
      "Ship Mode": "Standard Class",
      "Customer ID": "PO-19195",
      "Customer Name": "Phillina Ober",
      Segment: "Home Office",
      Country: "United States",
      City: "Naperville",
      State: "Illinois",
      "Postal Code": "60540",
      Region: "Central",
      "Product ID": "OFF-LA-10003223",
      Category: "Office Supplies",
      "Sub-Category": "Labels",
      "Product Name": "Avery 508",
      Sales: "11.784",
      Quantity: "3",
      Discount: "0.2",
      Profit: "4.2717"
    },
    {
      "Row ID": "741",
      "Order ID": "CA-2017",
      "Order Date": "2015/1/4",
      "Ship Date": "2015/1/8",
      "Ship Mode": "Standard Class",
      "Customer ID": "PO-19195",
      "Customer Name": "Phillina Ober",
      Segment: "Home Office",
      Country: "United States",
      City: "Naperville",
      State: "Illinois",
      "Postal Code": "60540",
      Region: "Central",
      "Product ID": "OFF-ST-10002743",
      Category: "Office Supplies",
      "Sub-Category": "Storage",
      "Product Name": "SAFCO Boltless Steel Shelving",
      Sales: "272.736",
      Quantity: "3",
      Discount: "0.2",
      Profit: "-64.7748"
    },
    {
      "Row ID": "742",
      "Order ID": "CA-2018",
      "Order Date": "2015/1/4",
      "Ship Date": "2015/1/8",
      "Ship Mode": "Standard Class",
      "Customer ID": "PO-19195",
      "Customer Name": "Phillina Ober",
      Segment: "Home Office",
      Country: "United States",
      City: "Naperville",
      State: "Illinois",
      "Postal Code": "60540",
      Region: "Central",
      "Product ID": "OFF-BI-10004094",
      Category: "Office Supplies",
      "Sub-Category": "Binders",
      "Product Name": "GBC Standard Plastic Binding Systems Combs",
      Sales: "3.54",
      Quantity: "2",
      Discount: "0.8",
      Profit: "-5.487"
    },
    {
      "Row ID": "1760",
      "Order ID": "CA-2019",
      "Order Date": "2015/1/5",
      "Ship Date": "2015/1/12",
      "Ship Mode": "Standard Class",
      "Customer ID": "MB-18085",
      "Customer Name": "Mick Brown",
      Segment: "Consumer",
      Country: "United States",
      City: "Philadelphia",
      State: "Pennsylvania",
      "Postal Code": "19143",
      Region: "East",
      "Product ID": "OFF-AR-10003478",
      Category: "Office Supplies",
      "Sub-Category": "Art",
      "Product Name":
        "Avery Hi-Liter EverBold Pen Style Fluorescent Highlighters, 4/Pack",
      Sales: "19.536",
      Quantity: "3",
      Discount: "0.2",
      Profit: "4.884"
    }
  ];
  window.rec = records.value;
});

function onDblClickCell() {
  console.log("单元格双击");
}

//行修改
function onChangeRow(params, indexs) {
  debugger;
  const vtable = listTableRef.value.vTableInstance;
  console.log(params, "行修改33", vtable.arrangeCustomCellStyle);
  // // indexs.map(v=> vtable.getCellAddrByFieldRecord())
  // const colRange = vtable.getBodyVisibleColRange();
  // indexs.forEach((element) => {
  //   vtable.arrangeCustomCellStyle(
  //     {
  //       range: {
  //         start: { row: element + 1, col: 0 },
  //         end: { row: element + 1, col: colRange.colEnd }
  //       }
  //     },
  //     "errorRow"
  //   );
  // });

  // setTimeout(() => {
  //   indexs.forEach((element) => {
  //     vtable.arrangeCustomCellStyle({
  //       range: {
  //         start: { row: element + 1, col: 0 },
  //         end: { row: element + 1, col: colRange.colEnd }
  //       }
  //     });
  //   });
  // }, 600);

  // console.log(listTableRef.value, "d-d-", g);
}

function exitEdit() {
  const vtable = listTableRef.value.vTableInstance;
  console.log(333, vtable);
}

function onDeleteRecord(params) {
  console.log(params, "删除行");
}
</script>
