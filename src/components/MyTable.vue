<template>
  <div :class="`my-table-container ${className}`">
    <!-- 
      border：是否带有纵向边框
      header-cell-style： 表头单元格样式
     -->
    <el-table
      ref="commonRef"
      v-loading="loading"
      :data="tableData"
      :border="border"
      :row-key="rowKey || 'id'"
      :height="tableHeight"
      :max-height="maxHeight"
      :tree-props="treeProps || {}"
      :header-cell-style="headerCellStyle"
      :empty-text="emptyText"
      :show-summary="showSummary"
      :summary-method="getSummaries"
      :span-method="arraySpanMethod"
      @selection-change="handleSelectionChange"
      @current-change="handleRadioChange"
      @row-click="onRowClick"
      @sort-change="sortChange"
    >
      <!-- :height="tableHeight" -->

      <!-- 是否需要多选框，selection控制 -->
      <!-- selectable 当前行是否可选，通过tableData disabled判断 -->
      <el-table-column
        v-if="selection"
        type="selection"
        fixed
        width="56"
        align="center"
        :selectable="selectable"
      ></el-table-column>
      <!-- 是否需要单选框，radioSelection控制， tableData需要有num字段 -->
      <el-table-column v-if="radioSelection" fixed width="56" align="center">
        <template #default="scope">
          <el-radio v-model="defaultRadio" :label="scope.row.num">
            {{ scope.row.num }}
          </el-radio>
        </template>
      </el-table-column>
      <!-- 
        operatetion：操作栏
       -->
      <template v-for="col in columns" :key="col.prop">
        <el-table-column
          v-if="col.operatetion"
          :label="col.label"
          :prop="col.prop"
          :align="col.align || 'left'"
          :fixed="col.fixed"
          :width="col.width"
        >
          <template #default="scope">
            <template
              v-for="(o, oIndex) in col.operatetion(scope.row)"
              :key="oIndex"
            >
              <el-button
                v-if="o.isShow == undefined ? true : o.isShow"
                :style="o.style || {}"
                :disabled="o.isDisabled == undefined ? false : o.isDisabled"
                type="text"
                @click="o.onClick(scope.row, scope.$index)"
                >{{ o.name }}</el-button
              >
            </template>
          </template>
        </el-table-column>
        <el-table-column
          v-else-if="col.slotName"
          :label="col.label"
          :prop="col.prop"
          :align="col.align || 'left'"
          :fixed="col.fixed"
          :width="col.width"
          :min-width="col.minWidth"
        >
          <template #header v-if="col.headerSlotName">
            <slot :name="col.headerSlotName"></slot>
          </template>
          <template #default="scope">
            <slot
              :name="col.slotName"
              :data="scope.row"
              :index="scope.$index"
            ></slot>
          </template>
        </el-table-column>
        <!-- 
          prop：字段名称
          label：展示名称
          width：对应列宽度
          fixed：是否需要固定列(left, right)
         -->
        <el-table-column
          v-else
          :show-overflow-tooltip="overflowTooltip"
          :label="col.label"
          :prop="col.prop"
          :width="col.width"
          :min-width="col.minWidth || null"
          :align="col.align || 'left'"
          :fixed="col.fixed"
          :sortable="col.sortable"
        >
          <template #header v-if="col.headerSlotName">
            <slot :name="col.headerSlotName"></slot>
          </template>
          <!-- 是否需要处理数据格式，formatter控制 -->
          <template #default="scope" v-if="col.formatter">
            <div
              class="formatter-box"
              v-if="col.onClick"
              v-html="col.formatter(scope.row, scope.$index)"
              @click="col.onClick(scope.row)"
            ></div>
            <div
              class="formatter-box"
              v-else
              v-html="col.formatter(scope.row, scope.$index)"
            ></div>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
export default {
  name: "MyTable",
  props: {
    className: String,
    tableData: {
      type: Array,
      default: () => [],
    },
    treeProps: Object,
    border: {
      type: Boolean,
      default: true,
    },
    heightAuto: {
      type: Boolean,
      default: true,
    },
    tableHeight: {
      type: [String, Number],
    },
    extraHeight: {
      // 计算table最大高度时需要额外减去的高度
      type: Number,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    rowKey: String,
    columns: {
      type: Array,
      default: () => [],
    },
    selection: {
      type: Boolean,
      default: false,
    },
    radioSelection: {
      type: Boolean,
      default: false,
    },
    headerCellStyle: {
      type: Object,
      default: () => ({
        background: "#E5E9F2",
        color: "#092D5C",
        fontWeight: 600,
      }),
    },
    overflowTooltip: {
      type: Boolean,
      default: true,
    },
    //空数据提示
    emptyText: {
      type: String,
      default: "暂无数据",
    },
    // 合计
    showSummary: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const { emit } = context;

    const commonRef = ref(null);
    const defaultRadio = ref();

    const selectable = (row) => {
      if (row.disabled == true) {
        return false;
      } else {
        return true;
      }
    };

    const clearSelectedRows = () => {
      commonRef.value.clearSelection();
    };

    const handleSelectionChange = (val) => {
      console.log(commonRef.value);
      emit("handleSelectionChange", val, commonRef.value);
    };

    const handleRadioChange = (val) => {
      emit("handleRadioChange", val);
      if (val) {
        defaultRadio.value = val.num;
      }
    };

    const onRowClick = (val, column) => {
      emit("onRowClick", val, column);
    };

    const sortChange = (val) => {
      emit("sortChange", val);
    };

    const arraySpanMethod = () => {
      emit("arraySpanMethod");
    }

    const getSummaries = (params) => {
      let sums = [];
      emit("getSummaries", params, (arr) => {
        sums = arr;
      });
      return sums;
    };

    onMounted(() => {
      if (props.heightAuto) {
        setTimeout(() => {
          setTableHeight();
        }, 50);
      }
    });

    const maxHeight = ref(0);

    // 设置表格的高度
    const setTableHeight = () => {
      let height = 0;
      let containerHeight = document.getElementsByClassName("page")[0];
      let btnHeaderHeight = document.getElementsByClassName("handle-header")[0]; // 操作头高度，需要设置固定class
      let tableHeaderHeight =
        document.getElementsByClassName("el-table__header")[0].offsetHeight; // table头高度
      let pageContainer = document.getElementById("my-pagination-container"); // 获取分页的高度
      if (containerHeight) {
        height = containerHeight.offsetHeight;
      }
      if (btnHeaderHeight) {
        height = height - btnHeaderHeight.offsetHeight - 24 * 2;
      }
      if (pageContainer) {
        let pageHeight = pageContainer.offsetHeight;
        height = height - pageHeight;
      }
      if (tableHeaderHeight > 40) {
        height = height - tableHeaderHeight;
      }
      if (props.extraHeight) {
        height = height - props.extraHeight;
      }
      maxHeight.value = height;
    };

    return {
      commonRef,
      maxHeight,
      defaultRadio,
      selectable,
      handleSelectionChange,
      handleRadioChange,
      onRowClick,
      clearSelectedRows,
      sortChange,
      getSummaries,
      arraySpanMethod,
    };
  },
};
</script>

<style lang="scss" scoped>
.my-table-container {
  margin: 24px 0;
}
::v-deep {
  .el-table__header {
    height: 44px;
  }
  .el-table td {
    .cell {
      .el-button {
        padding: 0;
        height: 30px;
        min-height: 0;
      }
    }
    .formatter-box {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .el-radio__label {
    display: none;
  }
}
</style>