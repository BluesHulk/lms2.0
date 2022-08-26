<template>
  <MyContainer>
    <template v-slot:header>
      <el-button @click="onCancel()">作废</el-button>
    </template>
    <template v-slot:header-right>
      <MySearch
        v-if="!advancedFilterShow"
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        @onSearch="onFuzzySearch"
      />
      <el-button-group style="margin-left:12px">
        <el-button >导入</el-button>
        <el-button >导出</el-button>
      </el-button-group>
      <el-button-group style="margin-left: 24px">
        <el-button @click="onAdvancedStatus"
          ><i class="iconfont icon-share1" />{{
            Object.keys(searchParams).length
          }}项</el-button
        >
        <el-button @click="() => {}"
          ><i class="iconfont icon-install"
        /></el-button>
      </el-button-group>
    </template>
    <div class="content">
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      ></MyTable>
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
      <MyDrawer
        :drawerShow="detailShow"
        title="销售发货单详情"
        @onUpdateDrawerStatus="onCloseDetail"
      >
        <JDetailCard
          :detailItems="detailItems"
          :detailData="detailData"
        />
        <template #footer>
          <div class="btns">
            <el-button @click="onCloseDetail">关闭</el-button>
          </div>
        </template>

      </MyDrawer>
    </div>
  </MyContainer>
  <teleport to="#filter-aside" v-if="advancedFilterShow">
    <FilterDrawer
      :visible="advancedFilterShow"
      :data="{ ...searchParams }"
      @onSearch="onSearch"
      @onClose="onAdvancedStatus"
    />
  </teleport>
</template>

<script>
import { ref, reactive, toRefs, onMounted } from "vue";
import { useStore } from "vuex";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import MyDrawer from "@/components/MyDrawer.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import JDetailCard from '@/components/JDetailCard.vue';
import { saleInvoiceApi } from "@/request/services/saleMgt"
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";
import FilterDrawer from "./components/FilterDrawer.vue";


export default {
  name: "ReceiptVoucher",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    AdvancedFilterBtn,
    MyDrawer,
    JDetailCard,
    FilterDrawer
  },
  setup() {
    const store = useStore();

    const filterRecord = reactive({
      conditionValue: "dpOrderNum",
      searchCondition: [
        { label: "发货单号",value: "dpOrderNum"},
        { label: "扣款客户", value: "deductCustomerName"},
        { label: "开票客户", value: "invoiceCustomerName"},
      ],
      advancedFilterShow: false,
      searchParams: {},
    });

    const onAdvancedStatus = () => {
      filterRecord.advancedFilterShow = !filterRecord.advancedFilterShow;
      store.commit(
        "common/setAsideFilterShow",
        filterRecord.advancedFilterShow
      );
    };

    const handleFilterData = (params) => {
      if (params.settlementTypeList && params.settlementTypeList.length) {
        params.settlementTypeList = params.settlementTypeList.join(",");
      }
      // if (params.salesmanIdList && params.salesmanIdList.length) {
      //   params.salesmanIdList = params.salesmanIdList.join(",");
      // }
      if (params.time && params.time.length) {
        params.billDateStart = moment(params.time[0]).format("YYYY-MM-DD 00:00:00");
        params.billDateEnd = moment(params.time[1]).format("YYYY-MM-DD 23:59:59");
      }
      if (params.time1 && params.time1.length) {
        params.createTimeStart = moment(params.time1[0]).format(
          "YYYY-MM-DD 00:00:00"
        );
        params.createTimeEnd = moment(params.time1[1]).format(
          "YYYY-MM-DD 23:59:59"
        );
      }
      if (params.time2 && params.time2.length) {
        params.updateTimeStart = moment(params.time2[0]).format(
          "YYYY-MM-DD 00:00:00"
        );
        params.updateTimeEnd = moment(params.time2[1]).format(
          "YYYY-MM-DD 23:59:59"
        );
      }
      delete params.time;
      delete params.time1;
      delete params.time2;

      return params;
    };

    const getAdvancedBtnStatus = (status) => {
      filterRecord.advancedFilterShow = status;
    };

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      selectedRows: [],
    });

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      // if (val.time && val.time.length) {
      //   val.startTime = moment(val.time[0]).format("YYYY-MM-DD 00:00:00");
      //   val.endTime = moment(val.time[1]).format("YYYY-MM-DD 23:59:59");
      // }
      filterRecord.searchParams = val;
      getTableData();
    };

    const onFuzzySearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      filterRecord.searchParams = val;
      getTableData();
    };

    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      tableRecord.pageParams = { ...data };
      getTableData();
    };
    

    const detailRecord = reactive({
      detailShow: false,
      detailItems: [
        { label: "客户", prop: "customerName", span:24 },
        { label: "销售公司", prop: "tenantName", span:24 },
        { label: "发货单号", prop: "dpOrderNum", span:24 },
        { label: "单据日期", prop: "billDate", span:24,
          formatter: (row) => {
            return row.billDate?moment(row.billDate).format('YYYY-MM-DD HH:mm:ss'):''
          }
        },
        { label: "单据状态", prop: "status", span:24,
          formatter: (row) => {
            return statusMap.get(row.status)
          }
        },
        { label: "结算方式", prop: "settlementType", span:24,
          formatter: (row)=> {
            return settlementTypeMap.get(row.settlementType)
          }
        },
        { label: "结算规则", prop: "settlementRule", width: 160,
          formatter: (row)=> {
            return settlementRuleMap.get(row.settlementRule)
          }
        },
        { label: "销售类型", prop: "purchaseType", span:24,
          formatter: (row)=> {
            return purchaseTypeMap.get(row.purchaseType)
          }
        },
        { label: "运输方式", prop: "transportType", span:24,
          formatter: (row)=> {
            return transportTypeMap.get(row.transportType)
          }
        },
        { label: "车牌号", prop: "licensePlate", span:24 },
        { label: "司机姓名", prop: "driverName", span:24 },
        { label: "司机电话", prop: "driverPhone", span:24 },
        { label: "物料名称", prop: "productName", span:24 },
        { label: "物料编码", prop: "productCode", span:24 },
        { label: "出厂价", prop: "outPrice", span:24 },
        { label: "折扣单价", prop: "discountUnitPrice", span:24 },
        { label: "结算价", prop: "settlementPrice", span:24 },
        { label: "发货量", prop: "outAmount", span:24 },
        { label: "到货量", prop: "arrivalAmount", span:24 },
        { label: "货损量", prop: "lossAmount", span:24 },
        { label: "结算量", prop: "settlementAmount", span:24 },
        { label: "合理损耗方案", prop: "lossScheme", span:24 },
        { label: "出厂金额", prop: "outMoney", span:24 },
        { label: "折扣金额", prop: "discountMoney", span:24 },
        { label: "结算金额", prop: "settlementMoney", span:24 },
        { label: "货损金额", prop: "lossMoney", span:24 },
        { label: "实际收款金额", prop: "actualCollectionMoney", span:24 },
        { label: "提货状态", prop: "receivingStatus", span:24,
          formatter: (row)=> {
            return receivingStatusMap.get(row.receivingStatus)
          }
        },
        { label: "运输状态", prop: "transportStatus", span:24,
          formatter: (row)=> {
            return transportStatusMap.get(row.transportStatus)
          }
        },
        { label: "结算状态", prop: "settlementStatus", span:24,
          formatter: (row)=> {
            return settlementStatusMap.get(row.settlementStatus)
          }
        },
        { label: "流向管控结果", prop: "flowControlResults", span:24 },
        { label: "销售订单号", prop: "orderNum", span:24 },
        { label: "计量磅单号", prop: "weighNo", span:24 },
        { label: "运单号", prop: "waybillNum", span:24 },
        { label: "扣款客户", prop: "deductCustomerName", span:24 },
        { label: "开票客户", prop: "invoiceCustomerName", span:24 },
        { label: "业务部门", prop: "businessDept", span:24 },
        { label: "业务员", prop: "salesmanName", span:24 },
        { label: "第三方单据号", prop: "thirdCode", span:24 },
        { label: "创建人", prop: "createUserName", span:24 },
        { label: "创建时间", prop: "createTime", span:24, 
          formatter: (row) => {
            return row.createTime?moment(row.createTime).format('YYYY-MM-DD HH:mm:ss'):''
          }
        },
        { label: "最后操作人", prop: "updateUserName", span:24 },
        { label: "最后操作时间", prop: "updateTime", span:24,
          formatter: (row) => {
            return row.updateTime?moment(row.updateTime).format('YYYY-MM-DD HH:mm:ss'):''
          }
        },
      ],
      detailData: {},
    })

    const onCloseDetail =() => {
      detailRecord.detailShow = false
    }

    const settlementTypeMap = new Map([
      [ 0,'现金' ],
      [ 1,'银行承兑' ],
      [ 2,'商业承兑' ],
    ])
    const transportTypeMap = new Map([
      [ 0,'自提' ],
      [ 1,'一票制包运' ],
      [ 2,'流向管控自提' ],
    ])
    const statusMap = new Map([
      [ 0,'启用' ],
      [ 1,'作废' ],
    ])    
    const receivingStatusMap = new Map([
      [ 0,'待收货' ],
      [ 1,'收货中' ],
      [ 2,'已收货' ],
    ])
    const purchaseTypeMap = new Map([
      [ 0,'过磅采购' ],
      [ 1,'自制采购' ],
    ])
    const transportStatusMap = new Map([
      [ 0,'自提' ],
      [ 1,'待运输' ],
      [ 2,'运输中' ],
      [ 3,'待回单' ],
      [ 4,'待签收' ],
      [ 5,'已签收' ],
    ])
    const settlementStatusMap = new Map([
      [ 0,'未结算' ],
      [ 1,'已结算' ],
      [ 2,'已开票' ],
    ])

    const settlementRuleMap = new Map([
      [ 0,'发货方为准' ],
      [ 1,'收货方为准' ],
      [ 2,'收发货方取小' ],
    ])

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "客户", prop: "customerName", width: 160,},
      { label: "销售公司", prop: "tenantName", width: 160 },
      { label: "发货单号", prop: "dpOrderNum", width: 160, },
      { label: "单据日期", prop: "billDate", width: 180,
        formatter: (row) => {
          return row.billDate?moment(row.billDate).format('YYYY-MM-DD HH:mm:ss'):''
        }
      },
      { label: "单据状态", prop: "status", width: 160,
        formatter: (row) => {
          return statusMap.get(row.status)
        }
      },
      { label: "结算方式", prop: "settlementType", width: 160,
        formatter: (row)=> {
          return settlementTypeMap.get(row.settlementType)
        }
      },
      { label: "结算规则", prop: "settlementRule", width: 160,
        formatter: (row)=> {
          return settlementRuleMap.get(row.settlementRule)
        }
      },
      { label: "销售类型", prop: "purchaseType", width: 160,
        formatter: (row)=> {
          return purchaseTypeMap.get(row.purchaseType)
        }
      },
      { label: "运输方式", prop: "transportType", width: 160,
        formatter: (row)=> {
          return transportTypeMap.get(row.transportType)
        }
      },
      { label: "车牌号", prop: "licensePlate", width: 160 },
      { label: "司机姓名", prop: "driverName", width: 160 },
      { label: "司机电话", prop: "driverPhone", width: 160 },
      { label: "物料名称", prop: "productName", width: 160 },
      { label: "物料编码", prop: "productCode", width: 160 },
      { label: "出厂价", prop: "outPrice", width: 120 },
      { label: "折扣单价", prop: "discountUnitPrice", width: 120 },
      { label: "结算价", prop: "settlementPrice", width: 120 },
      { label: "发货量", prop: "outAmount", width: 120 },
      { label: "到货量", prop: "arrivalAmount", width: 120 },
      { label: "货损量", prop: "lossAmount", width: 120 },
      { label: "结算量", prop: "settlementAmount", width: 120 },
      { label: "合理损耗方案", prop: "lossScheme", width: 160 },
      { label: "出厂金额", prop: "outMoney", width: 160 },
      { label: "折扣金额", prop: "discountMoney", width: 160 },
      { label: "结算金额", prop: "settlementMoney", width: 160 },
      { label: "货损金额", prop: "lossMoney", width: 160 },
      { label: "实际收款金额", prop: "actualCollectionMoney", width: 160 },
      { label: "提货状态", prop: "receivingStatus", width: 120,
        formatter: (row)=> {
          return receivingStatusMap.get(row.receivingStatus)
        }
      },
      { label: "运输状态", prop: "transportStatus", width: 120,
        formatter: (row)=> {
          return transportStatusMap.get(row.transportStatus)
        }
      },
      { label: "结算状态", prop: "settlementStatus", width: 120,
        formatter: (row)=> {
          return settlementStatusMap.get(row.settlementStatus)
        }
      },
      { label: "流向管控结果", prop: "flowControlResults", width: 160 },
      { label: "销售订单号", prop: "orderNum", width: 160 },
      { label: "计量磅单号", prop: "weighNo", width: 160 },
      { label: "运单号", prop: "waybillNum", width: 160 },
      { label: "扣款客户", prop: "deductCustomerName", width: 120 },
      { label: "开票客户", prop: "invoiceCustomerName", width: 120 },
      { label: "业务部门", prop: "businessDept", width: 120 },
      { label: "业务员", prop: "salesmanName", width: 120 },
      { label: "第三方单据号", prop: "thirdCode", width: 160 },
      { label: "创建人", prop: "createUserName", width: 120, },
      { label: "创建时间", prop: "createTime", width: 180, 
        formatter: (row) => {
          return row.createTime?moment(row.createTime).format('YYYY-MM-DD HH:mm:ss'):''
        }
      },
      { label: "最后操作人", prop: "updateUserName", width: 120 },
      { label: "最后操作时间", prop: "updateTime", width: 180,
        formatter: (row) => {
          return row.updateTime?moment(row.updateTime).format('YYYY-MM-DD HH:mm:ss'):''
        }
      },
      {
        label: '操作',
        width: 120,
        fixed: 'right',
        operatetion: (row) => {
          return [
            { 
              name: '作废', 
              style: {color: '#239cff'}, 
              onClick: onCancel.bind(this, row) 
            },
            { 
              name: '详情', 
              style: {color: '#239cff'}, 
              onClick: onDetail.bind(this, row) 
            },
          ]
        }
      },
    ];


    const handleSelectionChange = (val) => {
      tableRecord.selectedRows = val
    }


    const getTableData = async () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...handleFilterData({ ...filterRecord.searchParams }),
        // ...filterRecord.searchParams,
      };
      delete params.time;

      const res = await saleInvoiceApi.getTableData(params)
      if (res && res.code == 0) {
        tableRecord.tableTotal = res.data.total;
        tableRecord.tableData = res.data.records;
        transformArrayData(
          tableRecord.tableData,
          true,
          true,
          tableRecord.pageParams.currentPage,
          tableRecord.pageParams.pageSize
        );
      }
    };


    const onCancel = async(record) => {
      const result = await ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确定要作废吗？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result=='confirm') {
        alert('没接口')
        // const res = await saleInvoiceApi.cancel(params)
        // if (res && res.code == 0) {
        //   ElMessage.success("操作成功！");
        //   getTableData();
        // } else {
        //   ElMessage.error(res.message);
        // }
      }
    }

    const onDetail = (row) => {
      detailRecord.detailShow = true
      detailRecord.detailData = row
    }


    onMounted(async()=>{
      getTableData();
    })

    return {
      ...toRefs(filterRecord),
      onAdvancedStatus,
      ...toRefs(tableRecord),
      tableColumns,
      ...toRefs(detailRecord),
      onCloseDetail,
      onSearch,
      getAdvancedBtnStatus,
      onFuzzySearch,
      paginationChange,
      handleSelectionChange,

      onCancel,
      
    };
  },
};
</script>

<style lang="scss" scoped>
.receipt-voucher-table {
  .el-dropdown-more {
    margin-left: 12px;
    height: 30px;
    color: #5a78a0;
    line-height: 30px;
  }
}
.btns {
  text-align: center;
}
</style>