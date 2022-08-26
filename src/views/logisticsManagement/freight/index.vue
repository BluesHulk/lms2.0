<template>
  <MyContainer>
    <template #header>
      <el-button type="primary" @click="onDrawShow('新增')">新增运价</el-button>
      <el-button @click="onSetDefault">批量撤回</el-button>
    </template>
    <template #header-right>
      
      <span>
        <span class="export-in">导入</span>
        <span class="export-in">导出</span>
      </span>
    </template>
    <div class="content">
      <MyMultipleFilter
        ref="formRef"
        :formItems="filterItems"
        @onSearch="onSearch"
      />
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      />
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>
    <addOne ref="addOne" :visiable="oneVisiable" @next="oneNext" @close="oneClose" />
    <addTwo ref="addTwo" :visiable="twoVisiable" :update="update" @last="twoLast" @close="twoClose" />
  </MyContainer>
</template>

<script>
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import addTwo from "./components/addTwo.vue";
import addOne from "./components/addOne.vue";
import { reactive, ref, toRefs } from 'vue'
export default {
  name: 'Freight',
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    addTwo,
    addOne,
  },
  setup() {
    const filterItems = [
      {
        type: "select",
        label: "所属公司",
        paramName: "id ",
        options: [
          { value: 0, label: "公司1" },
          { value: 1, label: "公司2" },
        ],
        span: 8,
      },
      {
        type: "input",
        label: "承运商",
        paramName: "time",
        span: 8,
      },
      {
        type: "input",
        label: "收货方",
        paramName: "customerName",
        span: 8,
      },
      {
        type: "input",
        label: "发货方",
        paramName: "tenantId",
        span: 8,
      },
      {
        type: "select", 
        label: "托运类型",
        paramName: "checkStatus",
        options: [
          { value: 0, label: "未审核" },
          { value: 1, label: "已审核" },
        ],
        span: 8,
      },
    ];
    const state = reactive({
      addOne: null,
      oneVisiable: false,
      addTwo: null,
      twoVisiable: false,
      freightType: '',
      update: 'add',
    })
    const tableData = ref([{}])
    const onSearch = (val) => {
      console.log(val, 666666666);
    };
    const onDrawShow = (type) => {
      if(type == 'edit') {
        state.update = 'edit'
        state.twoVisiable = true
      }else {
        state.oneVisiable = true
      }
      console.log('qian', state.update)
    }
    const oneClose = () => {
      state.oneVisiable = false
    }
    const twoClose = () => {
      state.twoVisiable = false
    }
    const oneNext = (val) => {
      state.oneVisiable = false
      state.twoVisiable = true
      state.update = 'add'
    };
    const twoLast = (val) => {
      state.oneVisiable = true
      state.twoVisiable = false
      state.update = 'add'
    };
    const statusChange = (val) => {
      // oneVisiable = true
    }
    const onDelete = (val) => {
      // oneVisiable = true
    }
    const tableColumns = [
      { label: "序号", prop: "num", width: 60 },
      { label: "单据号", prop: "accountName" },
      { label: "单据日期", prop: "accountBank" },
      { label: "收款主体", prop: "accountBranch" },
      { label: "收款对象", prop: "accountBranch" },
      { label: "对象类型", prop: "accountBranch" },
      { label: "总金额(元)", prop: "accountBranch" },
      {
        label: "审核状态",
        prop: "accountStatus",
        width: 100,
        formatter: (row) =>
          `<span class="status-label" style="background: ${
            row.accountStatus == 1 ? "#32D231" : "#FF3B30"
          };"></span>${{ 1: "启用", 2: "停用" }[row.accountStatus]}`,
      },
      { label: "审核人", prop: "description", width: 150 },
      { label: "审核时间", prop: "description" },
      {
        label: "操作",
        width: 120,
        operatetion: (row) => {
          return [
            {
              name: "编辑",
              style: { color: "#239cff" },
              onClick: onDrawShow.bind(this, "edit"),
            },
            {
              name: "停用",
              isShow: row.accountStatus == 1,
              style: { color: "#ffa93c" },
              onClick: statusChange.bind(this, 2, row),
            },
            {
              name: "启用",
              isShow: !row.accountStatus || row.accountStatus == 2,
              style: { color: "#239cff" },
              onClick: statusChange.bind(this, 1, row),
            },
            {
              name: "删除",
              style: { color: "#ff3b30" },
              onClick: onDelete.bind(this, row.id),
            },
          ];
        },
      },
    ];

    return {
      filterItems,
      tableColumns,
      tableData,
      ...toRefs(state),
      onDrawShow,
      statusChange,
      oneNext,
      oneClose,
      twoLast,
      twoClose,
      onDelete,
      onSearch,
    };
  },
};
</script>
<style lang="scss" scoped>
  .export-in {
  width: 60px;
  height: 32px;
  background: #ffffff;
  border: 1px solid #dce5ed;
  display: inline-block;
  line-height: 32px;
  text-align: center;
  cursor: pointer;
  box-sizing: border-box;
}
.export-in:hover{
  background-color: #F9FAFC;
}
.export-in:first-child {
  border-right: none;
  border-radius: 6px 0px 0px 6px;
}

.export-in:nth-of-type(2) {
  border-radius: 0px 6px 6px 0px;
}
</style>