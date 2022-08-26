<template>
  <MyContainer>
    <template #header>
      <el-button type="primary" @click="onDrawShow('新增')">新增运单</el-button>
      <el-button @click="onBatchDelete">批量取消</el-button>
    </template>
    <template #header-right>
      <MySearch
        :searchCondition="searchCondition"
        :initConditionValue="initConditionValue"
      />
      <AdvancedFilterBtn
        @getBtnStatus="seniorcheckBtn"
        style="margin: 0 24px 0 24px;"
      />
      <span>
        <span class="export-in">导入</span>
        <span class="export-in">导出</span>
      </span>
    </template>
    <div class="content">
      <MyMultipleFilter
        ref="formRef"
        v-if="checkboxis"
        :formItems="filterItems"
        @onSearch="onSearch"
      />
      <MyTable
        className="receipt-voucher-table "
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:freight="data">
          <el-popover placement="top" trigger="click" width="380">
            <el-form class="waybill-form" label-width="auto" label-position="left">
              <el-form-item label="货主运价:">￥255</el-form-item>
              <el-form-item label="计价单位:">吨</el-form-item>
              <el-form-item label="扣损免赔方案:">按数量（签收量低于发货量N吨免赔）</el-form-item>
              <el-form-item label="运费抹零方案:">不抹零</el-form-item>
              <el-form-item label="运量取值方式:">发货量、到货量取小</el-form-item>
            </el-form>
            <template #reference>
              <span class="num-label blue-text">￥{{data.data.num}}</span>
            </template>
          </el-popover>
        </template>
        <template v-slot:carriage="data">
          <el-popover :placement="(data.data.order-1)%10>2?'top':'bottom' " trigger="click" width="530px">
            <div class="waybill-pop-content">
              <div class="waybill-pop-rules">
                <div class="calc-title">计算规则：</div>
                <div class="calc-rules">总计运费 = 货主运价 * 运量 - 扣损额 - 其他扣款 + 其他补款</div>
                <div class="calc-tips">再根据运费抹零方案生成最终总计运费</div>
                <div class="calc-rules">扣损额 = 扣损量 * 货值单价</div>
              </div>
              <el-form class="waybill-pop-form" label-width="auto" label-position="left">
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="货主运价：">200元/吨</el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="运量：">32.21吨</el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="扣损额：">￥100（0.5*200）</el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="其他扣款：">￥30</el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="其他补款：">￥0</el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="运费：">￥6543</el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="运费抹零：">不抹零</el-form-item>
                  </el-col>
                </el-row>
              </el-form>
              <div class="freight-total">总计运费：<span>￥6123</span></div>
              {{$index}}
            </div>
            <template #reference>
              <span class="num-label green-text">￥{{data.data.num}}</span>
            </template>
          </el-popover>
        </template>
      </MyTable>
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>
  </MyContainer>
</template>

<script>
import MyContainer from "@/components/MyContainer.vue";
import { useRouter } from 'vue-router';
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import { ref, toRefs, reactive } from 'vue'
export default {
  name: 'Freight',
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    AdvancedFilterBtn,
  },
  setup() {
    const router = useRouter()
    const filterItems = [
      {
        type: "input",
        label: "运单编号",
        paramName: "id ",
        span: 8,
      },
      {
        type: "input",
        label: "关联单据",
        paramName: "time",
        span: 8,
      },
      {
        type: "select",
        label: "单据类型",
        paramName: "customerName",
        options: [
          { value: 0, label: "未审核" },
          { value: 1, label: "已审核" },
        ],
        span: 8,
      },
      {
        type: "input",
        label: "承运商",
        paramName: "tenantId",
        span: 8,
      },
      {
        type: "input",
        label: "发货地",
        paramName: "checkStatus",
        span: 8,
      },
      {
        type: "input",
        label: "收货地",
        paramName: "checkStatus",
        span: 8,
      },
    ];
    const checkboxis = ref(false)
    const state = reactive({
      tableTotal: 100,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
    })
    const paginationChange = (data) => {
      const { currentPage, pageSize } = state.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      state.paginationQueryData = { ...data };
      getTableData();
    };
    const getTableData  = () => {
      console.log(666666666);
    }
    const onBatchDelete  = () => {
      console.log(666666666);
    }
    // 高级筛选
    const seniorcheckBtn = () => {
      checkboxis.value = !checkboxis.value
    }
    const onSearch = (val) => {
      console.log(val, 666666666);
    };
    const onDrawShow = (val) => {
      console.log(val, 666666666);
    };
    const tableData = ref([
      {
        order: 1,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
      {
        order: 2,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
      {
        order: 3,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
      {
        order: 4,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
      {
        order: 5,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
      {
        order: 6,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
      {
        order: 7,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
      {
        order: 8,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
      {
        order: 9,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
      {
        order: 10,
        num:1,
        code: 'YD202206060007',
        memo:'123',
        accountStatus: 1,
        type: '查看磅单',
        num: 577,
      },
    ])
    const initConditionValue = ref('name')
    const searchCondition = [
      {
        label: '运单编号',
        value: 'name',
      },
      {
        label: '发货地',
        value: 'tenantId1',
      },
      {
        label: '收货地',
        value: 'tenantId2',
      },
      {
        label: '承运商',
        value: 'tenantId3',
      },
      {
        label: '司机姓名',
        value: 'tenantId4',
      },
      {
        label: '司机电话',
        value: 'tenantId5',
      },
      {
        label: '车牌号',
        value: 'tenantId6',
      },
    ]
    const onDetail = () => {
      console.log(123)
      router.push({
        name: 'waybillDetail'
      })
    }

    const tableColumns = [
      { label: "序号", prop: "num", width: 74 },
      {
        label: "关联运价",
        prop: "num",
        width: 90,
        slotName: 'freight',
      },
      {
        label: "总计运费",
        prop: "num",
        width: 90,
        slotName: 'carriage',
      },
      {
        label: "运单编号",
        prop: "memo",
        width: 180,
        formatter: (row) =>
          `<span class="type-label lint" >${row.code}</span> `,
        onClick: onDetail,
      },
      { label: "关联单据", width: 180, prop: "memo" },
      { label: "单据类型", width: 140, prop: "memo" },
      { label: "发货地", width: 140, prop: "memo" },
      { label: "收货地", width: 140, prop: "memo" },
      { label: "承运商", width: 140, prop: "memo" },
      { label: "司机姓名", width: 140, prop: "memo" },
      { label: "司机电话", width: 140, prop: "memo" },
      { label: "车牌号 ", width: 140, prop: "memo" },
      {
        label: "磅单类型",
        prop: "type",
        width: 140,
        formatter: (row) =>
          `<span class="type-label" @click="detail">${row.type}</span>`,
      },
      {
        label: "运单状态",
        prop: "accountStatus",
        width: 140,
        formatter: (row) =>
          `<span class="status-label" style="background: ${row.accountStatus == 1 ? "#32D231" : "#FF3B30"
          };"></span>${{ 1: "待提货", 2: "提货中" }[row.accountStatus]}`,
      },
      {
        label: "操作",
        width: 140,
        operatetion: (row) => {
          return [
            {
              name: "编辑",
              style: { color: "#3C82FE" },
              onClick: onDrawShow.bind(this, "编辑"),
            },
            {
              name: "签收",
              isShow: true,
              style: { color: "#3C82FE" },
              onClick: onDrawShow.bind(this, 2, row),
            },
            {
              name: "取消 ",
              style: { color: "#3C82FE" },
              onClick: onDrawShow.bind(this, row.id),
            },
          ];
        },
      },
    ];

    return {
      filterItems,
      tableColumns,
      searchCondition,
      initConditionValue,
      tableData,
      checkboxis,
      paginationChange,
      ...toRefs(state),
      seniorcheckBtn,
      onDrawShow,
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
.waybill-form{
  :deep(.el-form-item){
    margin-bottom: -2px;
    .el-form-item__label{
      color: #5A78A0;
    }
    .el-form-item__content{
      color: #092D5C;
    }
  }
}
.waybill-pop-form{
  margin-bottom: 8px;
  :deep(.el-form-item){
    margin-bottom: -2px;
    .el-form-item__label{
      color: #5A78A0;
    }
    .el-form-item__content{
      color: #092D5C;
    }
  }
}
.waybill-pop-content{
  padding: 4px;
}
.waybill-pop-form{
  margin-top: 10px;
}
.waybill-pop-rules{
  padding: 16px;
  background-color: #F2F9FF;
  font-size: 14px;
  line-height: 22px;
  .calc-title{
    font-weight: 600;
    color: #092D5C;
    margin-bottom: 8px;
  }
  .calc-title:last-child{
    margin-bottom: 0;
  }
  .calc-rules{
    color: #ff9a00;
    margin-bottom: 8px;
    margin-left: 14px;
    position: relative;
  }
  .calc-rules:before{
    display: block;
    position: absolute;
    content: "";
    top: 8px;
    left: -12px;
    width: 6px;
    height: 6px;
    background-color: #092D5C;
    transform: rotate(45deg);
  }
  .calc-tips{
    color: #5a78a0;
    margin-bottom: 8px;
    margin-left: 14px;
  }
}
.freight-total{
  padding: 11px 16px;
  background: #F2F9FF;
  span{
    font-weight: bold;
    color: #092d5c;
    line-height: 19px;
  }
}
</style>
<style>
.num-label{
  height: 24px;
  text-align: center;
  font-size: 12px;
  border-radius: 4px;
  padding: 3px 7px 3px 8px;
}
.type-label{
  color: #3c82fe;
  text-decoration: underline;
  cursor: pointer;
}
.blue-text{
  color: #3c82fe;
  border: 1px solid rgba(60,130,254,0.2000);
  background: rgba(60,130,254,0.1000);
}
.green-text{
  color: #10AD57;
  background: rgba(19,206,102,0.1000);
  border: 1px solid rgba(19,206,102,0.2000);
}
</style>