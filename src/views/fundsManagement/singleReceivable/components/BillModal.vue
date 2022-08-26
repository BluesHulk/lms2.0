<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="modalShow"
    :visible="modalShow"
    :title="modalTitle"
    :width="1233"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <div class="text">
        应收单：<span class="num">{{ modalData.money }}</span
        ><span class="unit">元</span>
      </div>
      <div class="search-box">
        <div class="info">
          收款单：
          <span v-if="selectedRow"
            >已选<span class="num">1</span>，共计<span class="price">{{
              selectedRow.money
            }}</span
            >元</span
          >
        </div>
        <MyFilter
          :formItems="filterItems"
          :formData="searchData"
          :labelWidth="'0px'"
          :colStyle="'max-width: 246px'"
          @searchForm="searchForm"
          @clearSearchForm="clearSearchForm"
        />
      </div>
      <MyTable
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :radioSelection="true"
        @handleRadioChange="handleRadioChange"
      />
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button
        type="primary"
        @click="onVerification"
        :disabled="!(selectedRow && selectedRow.id)"
        :loading="btnLoading"
      >
        确定核销
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { reactive, toRefs } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyFilter from "@/components/MyFilter.vue";
import { singleReceivableApi } from "@/request/services/fundsManagement";
import { transformArrayData } from "@/utils/index";
import moment from "moment";

export default {
  components: {
    MyDialog,
    MyTable,
    MyPagination,
    MyFilter,
  },
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: "应收单核销",
    },
    modalData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const filterRecord = reactive({
      filterItems: [
        {
          type: "rangePicker",
          label: "",
          paramName: "time",
          placeholder: "请输入应用名",
        },
      ],
      searchData: {},
    });

    const searchForm = (val) => {
      let params = {};
      if(val.time) {
        params = {
          startTime: moment(val.time[0]).format('YYYY-MM-DD 00:00:00'),
          endTime: moment(val.time[1]).format('YYYY-MM-DD 23:59:59'),
          ...val,
        }
      }
      filterRecord.searchData = params;
      getTableData();
    }

    const clearSearchForm = () => {
      filterRecord.searchData = {};
      getTableData();
    }

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      selectedRow: {},
    });

    const getTableData = () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        customerId: props.modalData.customerId,
        tenantId: props.modalData.tenantId,
        ...filterRecord.searchData,
      };
      delete params.time;
      singleReceivableApi.getDetailTableData(params).then((res) => {
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
      });
    };
    getTableData();

    const tableColumns = [
      { label: "收款单号", prop: "id", fixed: "left", width: 160 },
      { label: "收款主体", prop: "tenantName" },
      { label: "收款对象", prop: "customerName", width: 150 },
      { label: "收款业务类型", prop: "businessTypeName" },
      { label: "未核销金额(元)", prop: "unVerifyMoney", width: 120 },
      {
        label: "结算方式",
        prop: "payType",
        formatter: (row) =>
          ({
            1: "企业网银",
            2: "银行承兑汇票-纸质",
            3: "银行承兑汇票-电子",
            4: "商业承兑汇票-纸质",
            5: "商业承兑汇票-电子",
            6: "陕建筑信通",
            7: "现金",
          }[row.payType]),
      },
      { label: "单据时间", prop: "createTime", width: 150 },
    ];

    const handleRadioChange = (val) => {
      tableRecord.selectedRow = val;
    };

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = () => {
      emit("onClose", false);
    };

    const onVerification = () => {
      ElMessageBox.confirm(
        `<strong>核销提示</strong><br/>
          确定核销收款单${tableRecord.selectedRow.id}？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        singleReceivableApi
          .onVerify({
            id: props.modalData.id,
            receiptRecordId: tableRecord.selectedRow.id,
          })
          .then((res) => {
            if (res && res.code == 0) {
              emit("onClose", false);
              emit("onRefresh");
              ElMessage.success("操作成功！");
            } else {
              ElMessage.error(res.message);
            }
          });
      });
    };

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      tableColumns,
      onUpdateDialogStatus,
      handleRadioChange,
      onModalClose,
      onVerification,
      searchForm,
      clearSearchForm,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 24px;

  .text {
    font-size: 16px;
    color: $color-text;

    .num {
      font-size: 28px;
      font-family: HelveticaNeue-Bold, HelveticaNeue;
      font-weight: bold;
    }
    .unit {
      color: #5a78a0;
    }
  }
  .search-box {
    display: flex;
    margin-top: 20px;
    .info {
      display: flex;
      width: 50%;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      color: $color-text;
      align-items: baseline;

      span {
        color: #5a78a0;
      }
      .num {
        color: $color-blue;
      }
      .price {
        font-size: 28px;
        font-family: HelveticaNeue-Bold, HelveticaNeue;
        font-weight: bold;
        color: $color-blue;
      }
    }
  }
}
</style>