<template>
  <MyContainer>
    <template #top>
      <div class="tab-box">
        <BaseTabs :data="tabList" @onTabsClick="onTabsClick" :tabKey="tabKey" />
      </div>
    </template>
    <template v-slot:header>
      <el-button type="primary" @click="onAdd">新增订单</el-button>
      <!-- <el-button v-if="tabKey == 0" @click="onChangeStatus('batch')">批量审批</el-button> -->
      <el-button v-if="tabKey == 1" @click="onChangeStatus('batchWithdraw')">批量撤回</el-button>
      <el-button v-if="tabKey == 2" @click="onChangeStatus('batchSuspend')">批量暂停</el-button>
      <el-button v-if="tabKey == 4 || tabKey == 5" 
        @click="onChangeStatus('batchOpen')">批量启用</el-button>
      <el-button v-if="tabKey == 6" @click="onChangeStatus('batchSubmit')">批量提交</el-button>
      <el-button v-if="tabKey == 6" @click="onChangeStatus('batchDelete')">批量删除</el-button>
    </template>
    <template v-slot:header-right>
      <MySearch
        v-if="!advancedFilterShow"
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        @onSearch="onFuzzySearch"
      />
      <el-button style="margin-left:12px">导入</el-button>
      <el-button-group style="margin-left: 12px">
        <el-button @click="onAdvancedStatus"
          ><i class="iconfont icon-share1" />{{Object.keys(searchParams).length}}项</el-button
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
        :showSummary="true"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
        @onRowClick="onRowClick"
        @sortChange="sortChange"
        @getSummaries="getSummaries"
        @arraySpanMethod="arraySpanMethod"
      >
        <template #status="slotProps">
          <div class="status-box">
            <i class="iconfont icon-bianji3" />
            {{
              {
                0: "草稿",
                1: "审批中",
                2: "审批通过",
                3: "审批不通过",
                4: "暂停",
                5: "关闭"
              }[slotProps.data.status]
            }}>
          </div>
        </template>

        <template v-slot:operation="slotProps">
          
          <span v-if="tabKey == 1">
            <!-- <el-button type="text" @click="onApproval(slotProps.data)">审批</el-button> -->
            <el-button type="text" @click="onChangeStatus('withdraw',slotProps.data)">撤回</el-button>
            <el-button type="text" @click="onJump('detail',slotProps.data)">详情</el-button>
          </span>
          <div v-if="tabKey == 2">
            <el-button type="text" @click="onJump('revision',slotProps.data)">修订</el-button>
            <el-button type="text" @click="onJump('detail',slotProps.data)">详情</el-button>
            <el-dropdown>
            <span class="el-dropdown-more">
              更多
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="onChangeStatus('suspend',slotProps.data)"
                    >暂停</el-dropdown-item
                  >
                  <el-dropdown-item @click="onChangeStatus('close',slotProps.data)"
                    >关闭</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-if="tabKey == 3">
            <el-button type="text" @click="onJump('detail',slotProps.data)">详情</el-button>
            <el-button type="text" @click="onChangeStatus('close',slotProps.data)">关闭</el-button>
          </div>
          <div v-if="tabKey == 4 || tabKey == 5">
            <el-button type="text" @click="onChangeStatus('open',slotProps.data)">启用</el-button>
            <el-button type="text" @click="onJump('detail',slotProps.data)">详情</el-button>
          </div>
          <div v-if="tabKey == 6">
            <el-button type="text" @click="onChangeStatus('submit',slotProps.data)">提交</el-button>
            <el-button type="text" @click="onJump('detail',slotProps.data)">详情</el-button>
            <el-button type="text" @click="onChangeStatus('delete',slotProps.data)">删除</el-button>
          </div>
          
        </template>
        
      </MyTable>
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />


      <MyDialog
        :visible="addTypeVisible"
        title="新增销售订单"
        :width="750"
        @onUpdateDialogStatus="onCloseAddType"
      >
        <div class="add-type-content">
          <div class="add-type-title">选择新增类型</div>
          <div class="add-cards">
            <div class="add-card-item" @click="addTypeSelected=1">
              <img v-show="addTypeSelected==1" src="@/assets/imgs/zzxzactive.png" />
              <img v-show="addTypeSelected!==1" src="@/assets/imgs/zzxz.png" />
            </div>
            <div class="add-card-item" @click="addTypeSelected=2">
              <img v-show="addTypeSelected==2" src="@/assets/imgs/jgdxzactive.png" />
              <img v-show="addTypeSelected!==2" src="@/assets/imgs/jgdxz.png" />
            </div>
          </div>
        </div>
        <template v-slot:footer>
          <el-button @click="onCloseAddType">取消</el-button>
          <el-button type="primary" @click="onConfirmAddType">确定</el-button>
        </template>
      </MyDialog>


      <Subtable
        v-if="currentRow.id"
        :currentRow="currentRow"
        @onDeliteClose="onDeliteClose"
      />

      
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
import { ref, reactive, toRefs, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import MyDrawer from "@/components/MyDrawer.vue";
import MyDialog from "@/components/MyDialog.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import FilterDrawer from "./components/FilterDrawer.vue";
import Subtable from "./components/Subtable.vue";
import BaseTabs from "@/components/BaseTabs.vue";
import commonApi from "@/request/services/common";
import { saleOrderApi } from "@/request/services/saleMgt";
import { receiptVoucherApi } from "@/request/services/fundsManagement";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

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
    MyDialog,
    BaseTabs,
    FilterDrawer,
    Subtable,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    // const tenantList = ref([]);

    const saleOrderKey = sessionStorage.getItem("saleOrderKey")
    ? sessionStorage.getItem("saleOrderKey")*1
    : "";

    const tabKey = ref( saleOrderKey || 1);
    const tabList = ref([
      { label: "审批中", value: 1 },
      { label: "审批通过", value: 2 },
      { label: "审批驳回", value: 3 },
      { label: "暂停", value: 4 },
      { label: "关闭", value: 5 },
      { label: "草稿", value: 6 },
    ]);
    const onTabsClick = (val) => {
      tabKey.value = val;
      getTableData()
    }

    const filterRecord = reactive({
      conditionValue: "orderNum",
      searchCondition: [
        { label: "单据号", value: "orderNum" },
        { label: "扣款客户", value: "deductCustomerName" },
        { label: "开票客户", value: "invoiceCustomerName" },
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


    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      selectedRows: [],
      sortParams: {},
      selectedRows: [],
      currentRow: {},
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


    const settlementTypeMap = new Map([
      [ 0,'现金' ],
      [ 1,'银行承兑' ],
      [ 2,'商业承兑' ],
    ])
    const settlementRuleMap = new Map([
      [ 0,'发货方为准' ],
      [ 1,'收货方为准' ],
      [ 2,'收发货方取小' ],
    ])
    const transportTypeMap = new Map([
      [ 0,'自提' ],
      [ 1,'一票制包运' ],
      [ 2,'流向管控自提' ],
    ])
    const orderStatusMap = new Map([
      [ 0,'草稿' ],
      [ 1,'审批中' ],
      [ 2,'审批通过' ],
      [ 3,'审批不通过' ],
      [ 4,'暂停' ],
      [ 5,'关闭' ],
    ])

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "客户", prop: "customerName", width: 120, fixed: "left", sortable: "custom", },
      { label: "销售公司", prop: "tenantName", width: 160, sortable: "custom", },
      { label: "扣款客户", prop: "deductCustomerName", width: 160, sortable: "custom", },
      { label: "扣款账户", prop: "deductAccountName", width: 160,sortable: "custom", },
      { label: "开票客户", prop: "invoiceCustomerName", width: 160, sortable: "custom", },
      { label: "第三方单据号", prop: "thirdCode", width: 160, sortable: "custom", },
      { label: "单据号", prop: "orderNum", width: 160 ,sortable: "custom", },
      { label: "单据日期", prop: "billDate", width: 180, sortable: "custom",
        formatter: (row) => {
          return row.billDate? 
            moment(row.billDate).format('YYYY-MM-DD HH:mm:ss'): ''
        }
      },
      { label: "结算方式", prop: "settlementType", width: 120, sortable: "custom",
        formatter: (row)=> {
          return settlementTypeMap.get(row.settlementType)
        }
      },
      { label: "结算规则", prop: "settlementRule", width: 120, sortable: "custom",
        formatter: (row)=> {
          return settlementRuleMap.get(row.settlementRule)
        }
      },
      { label: "运输方式", prop: "transportType", width: 120, sortable: "custom",
        formatter: (row)=> {
          return transportTypeMap.get(row.transportType)
        }
      },
      { label: "部门", prop: "deptName", sortable: "custom", },
      { label: "业务员", prop: "salesmanName", width: 120, sortable: "custom", }, 
      { label: "总数量", prop: "totalAmount", width: 120, sortable: "custom", },
      { label: "价税合计", prop: "totalTaxPrice", width: 120,sortable: "custom", }, 
      { label: "创建人", prop: "createUserName", width: 120,sortable: "custom", }, 
      { label: "创建时间", prop: "createTime", width: 180, sortable: "custom",
        formatter: (row) => {
          return row.createTime? 
            moment(row.createTime).format('YYYY-MM-DD HH:mm:ss'): ''
        }
      },
      { label: "更新人", prop: "updateUserName", width: 180, sortable: "custom", },
      { label: "最后更新", prop: "updateTime", width: 180, sortable: "custom",
        formatter: (row) => {
          return row.updateTime? 
            moment(row.updateTime).format('YYYY-MM-DD HH:mm:ss'): ''
        }
      },
      // {
      //   label: "订单状态",
      //   prop: "status",
      //   width: 120,
      //   fixed: "right",
      //   formatter: (row) => {
      //     return orderStatusMap.get(row.status)
      //   }
      // },
      {
        label: "订单状态",
        prop: "status",
        slotName: "status",
        width: 145,
        fixed: "right",
      },
      { label: "操作", prop: "operation", slotName: "operation", width: 170, fixed: "right" },
    ];

    const getSummaries = (params, callback) => {
      const { columns, data } = params;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (
          column.property == "totalAmount" ||
          column.property == "totalTaxPrice"
        ) {
          const values = data.map((item) => Number(item[column.property]));
          sums[index] = values.reduce((prev, curr) => {
            return prev + curr;
          }, 0);
          sums[index] = sums[index].toFixed(2);
        }
      });
      callback && callback(sums);
    };

    const arraySpanMethod = () => {
      if (tableRecord.tableRef.$el) {
        const current = tableRecord.tableRef.$el
          .querySelector(".el-table__footer-wrapper")
          .querySelector(".el-table__footer");
        const cell = current.rows[0].cells;
        if (cell.length) {
          cell[0].colSpan = "3";
          cell[1].style.display = "none";
          cell[2].style.display = "none";
        }
      }
    };

    const sortChange = (val) => {
      if (val.prop) {
        tableRecord.sortParams = {
          orderByField: val.prop.replace(/([A-Z])/g, "_$1").toLowerCase(),
          orderByRule: { ascending: "asc", descending: "desc" }[val.order],
        };
      } else {
        tableRecord.sortParams = {};
      }
      getTableData();
    };

    const onRowClick = (val, column) => {
      // console.log(column,"xxx")
      if (column.property !== "status" && column.property !== "operation") {
        tableRecord.currentRow = val;
      }
    };
    const onDeliteClose = () => {
      tableRecord.currentRow = {};
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


    const getTableData = async() => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        statusList: tabKey.value==6 ? 0: tabKey.value,
        ...handleFilterData({ ...filterRecord.searchParams }),
        ...tableRecord.sortParams,
      };
      delete params.time;

      const res = await saleOrderApi.getTableData(params)
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

    // const getTenantList = async() => {
    //   const res = await commonApi.getCompany()
    //   if (res && res.code == 0) {
    //     res.data.map((item) => {
    //       item.label = item.name;
    //       item.value = item.id;
    //     });
    //     tenantList.value = res.data;
    //   }
    // }

    const handleSelectionChange = (val) => {
      tableRecord.selectedRows = val
    }


    onMounted(async()=>{
    
    // if(sessionStorage.getItem("saleOrderKey")) {
    //   tabKey.value = sessionStorage.getItem("saleOrderKey")*1
    //   console.log(tabKey,"tabkey")
    // }

      await getTableData();
      // await getTenantList()
    })

    const addTypeRecord = reactive({
      addTypeVisible: false,
      addTypeSelected: 1
    })
    const onAdd = () => {
      addTypeRecord.addTypeVisible = true
    }
    const onCloseAddType = () => {
      addTypeRecord.addTypeVisible = false
      addTypeRecord.addTypeSelected = 1
    }
    const onConfirmAddType = () => {
      router.push({
        name: "saleOrderEdit",
        query: {
          temp: addTypeRecord.addTypeSelected,
          tab: tabKey.value,
        }
      })
    }


    const onChangeStatus = async(type, row) => {
      let ids = []
      if(type.substr(0, 5) == 'batch') { //批量操作
        if(tableRecord.selectedRows.length==0) {
          return ElMessage.warning('请至少选择一项')
        } 
        tableRecord.selectedRows.forEach(item => {
          ids.push(item.id)
        })     
      } else {
        ids = [row.id]
      }

      const result = await ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确认操作`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result !== 'confirm') return
          
      let res = null
      if(type=='withdraw' || type=='batchWithdraw') {
        res = await saleOrderApi.orderWithdraw(ids)
      }
      if(type=='suspend' || type=='batchSuspend') {
        res = await saleOrderApi.orderSuspend(ids)
      }
      if(type=='close') {
        res = await saleOrderApi.orderClose({id:row.id})
      }
      if(type=='open' || type=='batchOpen') {
        res = await saleOrderApi.orderOpen(ids)
      }
      if(type=='submit' || type=='batchSubmit') {
        res = await saleOrderApi.orderSubmit(ids)
      }
      if(type=='delete' || type=='batchDelete') {
        res = await saleOrderApi.orderDelete(ids)
      }

      if(res && res.code =='0') {
        ElMessage.success('操作成功')
        getTableData()
      } else {
        ElMessage.error(res.message)
      }
    }

  
    const onJump = (type, record = {}) => {
      if(type=='detail') {
        router.push({
          name:'saleOrderDetail',
          query: {
            id: record.id,
            tab: tabKey.value,
          }
        })
      }
      if(type=='revision') {
        router.push({
          name:'saleOrderRevision',
          query: {
            id: record.id,
            tab: tabKey.value,
          }
        })
      }
    };

    onUnmounted(() => {
      sessionStorage.removeItem("saleOrderKey");
    });



    return {
      tabKey,
      tabList,
      onTabsClick,
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(addTypeRecord),
      tableColumns,
      onSearch,

      onFuzzySearch,
      paginationChange,
      handleSelectionChange,
      onJump,
      onAdd,
      onCloseAddType,
      onConfirmAddType,

      onChangeStatus,
      getSummaries,
      arraySpanMethod,
      onRowClick,
      onDeliteClose,
      sortChange,
      onAdvancedStatus,
    };
  },
};
</script>

<style lang="scss" scoped>
.tab-box {
  padding: 0 24px;
  background: #fff;
}
.el-dropdown-more {
  margin-left: 12px;
  height: 30px;
  color: #5a78a0;
  line-height: 30px;
}
.add-type-content {
  text-align: center;
  padding: 0 24px;
  .add-type-title {
    font-size: 20px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #092D5C;
    line-height: 28px;
    margin-bottom: 24px;
    text-align: center;
  }
  .add-cards {
    display: flex;
    justify-content: center;
    .add-card-item {
      width: 230px;
      height: 112px;
      margin-right: 56px;
      cursor: pointer;
      // background-color: #eee;
    }
    .add-card-item:last-child {
      margin-right: 0;
    }
  }
}
.status-box {
  display: inline-flex;
  padding: 0 8px;
  height: 24px;
  color: $color-orange;
  background: rgba(247, 186, 42, 0.1);
  border-radius: 4px;
  border: 1px solid rgba(247, 186, 42, 0.2);
  align-items: center;
  cursor: pointer;

  .iconfont {
    margin-right: 8px;
    font-size: 10px;
  }
}
.el-dropdown-more {
  margin-left: 12px;
  height: 30px;
  color: #5a78a0;
  line-height: 30px;
}

</style>