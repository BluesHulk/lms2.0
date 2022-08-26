<template>
  <template v-if="currentRow.id && !operatingRecordShow">
    <div class="table-header">
      <el-button
        class="operating-record-btn"
        @click="onOperationBtnClick(currentRow.id)"
        >操作记录</el-button
      >
      <div class="title">
        <i class="iconfont icon-biaoge" />订单{{ currentRow.orderNum }}
      </div>
      <el-input
        class="search-input"
        v-model="filterText"
        placeholder="物料名称"
      >
        <template #suffix>
          <i class="iconfont icon-sousuo"></i>
        </template>
      </el-input>
      <div class="close-btn" @click="onDeliteClose">
        <i class="iconfont icon-biaogeguanbi" />
      </div>
    </div>
    <MyTable
      className="purchase-order-detail-table"
      ref="detailTableRef"
      :tableData="filterTableData"
      :columns="detailTableColumns"
      :showSummary="true"
      :selection="false"
      @getSummaries="getSummaries"
      @arraySpanMethod="arraySpanMethod"
    >
      <template #operation="slotProps">
        <el-button type="text" @click="onSendCar(slotProps.data)"
          >派车</el-button
        >
      </template>
    </MyTable>
  </template>

  <template v-if="operatingRecordShow">
    <div class="table-header">
      <div>
        <el-button type="text" @click="() => (operatingRecordShow = false)">{{
          currentRow.orderNum
        }}</el-button>
        > 操作记录 （{{ currentRow.orderNum }}）
      </div>
      <div class="close-btn" @click="onDeliteClose">
        <i class="iconfont icon-biaogeguanbi" />
      </div>
    </div>
    <MyTable
      className="operating-record-table"
      ref="operatetionTableRef"
      :tableData="operatetionTableData"
      :columns="operatetionTableColumns"
      :selection="false"
    />
  </template>

  <SendCarModal
    :visible="sendCarModalShow"
    type="purchase"
    @onClose="sendCarModalShow = false"
    @getData="onSendCarData"
  >
    <template #header>
      <div class="blue-bg">
        <JDetailCard
          :detailItems="sendCarModalDetailitems"
          :detailData="sendCarModalDetailData"
        />
      </div>
    </template>
  </SendCarModal>
</template>

<script>
import { reactive, toRefs, watch, ref } from "vue";
import { transformArrayData } from "@/utils/index";
import moment from "moment";
import MyTable from "@/components/MyTable.vue";
import JDetailCard from "@/components/JDetailCard.vue";
import SendCarModal from "@/components/commonModal/SendCarModal.vue";
// import { purchaseOrderApi } from "@/request/services/purchasingManagement";
import { saleOrderApi} from "@/request/services/saleMgt";
import { ElMessage } from "element-plus";

export default {
  name: "Subtable",
  components: {
    MyTable,
    JDetailCard,
    SendCarModal,
  },
  props: {
    currentRow: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const detailTableRecord = reactive({
      detailTableRef: null,
      detailTableData: [],
      filterTableData: [],
      filterText: "",
    });

    const getDetailTableData = (id) => {
      if (!id) return;
      saleOrderApi.getMaterialTableData({ id }).then((res) => {
        if (res && res.code == 0) {
          detailTableRecord.detailTableData = transformArrayData(
            res.data,
            true,
            true
          );
          detailTableRecord.filterTableData = transformArrayData(
            res.data,
            true,
            true
          );
        }
      });
    };

    const arraySpanMethod = () => {
      if (detailTableRecord.detailTableRef.$el) {
        const current = detailTableRecord.detailTableRef.$el
          .querySelector(".el-table__footer-wrapper")
          .querySelector(".el-table__footer");
        const cell = current.rows[0].cells;
        if (cell.length) {
          cell[0].colSpan = "2";
          cell[1].style.display = "none";
        }
      }
    };

    const getSummaries = (params, callback) => {
      const { columns, data } = params;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        const arr = [
          "amount",
          "dispatchAmount",
          "takeAmount",
          "executedAmount",
          "unsettledAmount",
          "settledAmount",
          "invoiceAmount",
        ];
        const arr1 = ["taxPrice", "settledPrice", "invoicePrice"];
        if (arr.indexOf(column.property) > -1) {
          const values = data.map((item) => Number(item[column.property]));
          sums[index] = values.reduce((prev, curr) => {
            return prev + curr;
          }, 0);
          sums[index] = sums[index];
        }
        if (arr1.indexOf(column.property) > -1) {
          const values = data.map((item) => Number(item[column.property]));
          sums[index] = values.reduce((prev, curr) => {
            return prev + curr;
          }, 0);
          sums[index] = sums[index].toFixed(2);
        }
      });
      callback && callback(sums);
    };

    watch(
      () => detailTableRecord.filterText,
      (val) => {
        detailTableRecord.filterTableData =
          detailTableRecord.detailTableData.filter((item) => {
            return item.productName.includes(val);
          });
      }
    );

    const onOperationBtnClick = (id) => {
      operatetionTableRecord.operatingRecordShow = true;
      getOperatingRecordData(id);
    };

    const onDeliteClose = () => {
      emit("onDeliteClose");
      operatetionTableRecord.operatingRecordShow = false;
    };

    const operatetionTableRecord = reactive({
      operatetionTableRef: null,
      operatetionTableData: [],
      operatingRecordShow: false,
    });

    const getOperatingRecordData = (id) => {
      saleOrderApi
        .getRecordById({ orderType: 1, orderId: id })
        .then((res) => {
          if (res && res.code == 0) {
            operatetionTableRecord.operatetionTableData = transformArrayData(
              res.data,
              true,
              true
            );
          }
        });
    };

    

    const sendCarModalRecord = reactive({
      currRow: {},
      sendCarModalShow: false,
      sendCarModalDetailData: {},
      sendCarModalDetailitems: [
        {
          label: "采购公司:",
          prop: "tenantName",
          span: 12,
        },
        {
          label: "供应商：",
          prop: "customerName",
          span: 12,
        },
        {
          label: "物料：",
          prop: "productName",
          span: 12,
        },
        {
          label: "可派车数量：",
          prop: "dispatchAmount",
          span: 12,
        },
      ],
    });

    const onSendCar = (row) => {
      sendCarModalRecord.sendCarModalDetailData = {
        tenantName: props.currentRow.tenantName,
        customerName: props.currentRow.customerName,
        productName: row.productName,
        dispatchAmount: row.dispatchAmount,
      };
      sendCarModalRecord.sendCarModalShow = true;
      sendCarModalRecord.currRow = row;
    };

    const onSendCarData = (val = []) => {
      const data = val.map((item) => {
        return {
          orderGoodsId: sendCarModalRecord.currRow.id,
          ...item,
        };
      });
      saleOrderApi.orderDispatch(data).then((res) => {
        if (res && res.code == 0) {
          ElMessage.success(`派车成功，已生成${data.length}张发货单`);
          sendCarModalRecord.sendCarModalShow = false;
        } else {
          ElMessage.error(res.message);
        }
      });
    };

    const detailTableColumns =  ref([])
    const detailTableColumnsTemp1 = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料名称", prop: "productName", width: 120, fixed: "left" },
      { label: "物料编码", prop: "productCode", width: 120 },
      { label: "规格", prop: "specification", width: 120 },
      { label: "型号", prop: "modelMaterial", width: 120 },
      { label: "计量单位", prop: "amountUnitName", width: 120 },
      { label: "总数量", prop: "amount", width: 120 },
      { label: "出厂价", prop: "outPrice", width: 120 },
      { label: "价税合计", prop: "taxPrice", width: 120 },
      { label: "可派车数量", prop: "dispatchAmount", width: 120 },
      { label: "待提货数量", prop: "takeAmount", width: 120 },
      { label: "累计已执行数量", prop: "executedAmount", width: 140 },
      { label: "待结算数量", prop: "unsettledAmount", width: 120 },
      { label: "累计已结算数量", prop: "settledAmount", width: 140 },
      { label: "累计已开票数量", prop: "invoiceAmount", width: 140 },
      { label: "累计已结算金额", prop: "settledPrice", width: 140 },
      { label: "累计已开票金额", prop: "invoicePrice", width: 140 },
      { label: "备注", prop: "remark", width: 140 },
    ]
    const detailTableColumnsTemp2 = [
      { label: "操作", slotName: "operation", width: 80, fixed: "right" },
    ]



    const operatetionTableColumns = [
      { label: "序号", prop: "num", width: 60 },
      { label: "操作类型", prop: "operateType" },
      { label: "操作人", prop: "createUserName" },
      {
        label: "操作时间",
        prop: "createTime",
        formatter: (row) =>
          moment(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      { label: "操作结果", prop: "result" },
      { label: "备注", prop: "remark" },
    ];

    watch(
      () => props.currentRow,
      (val) => {
        if (val.id) {
          getDetailTableData(val.id);
        }
        operatetionTableRecord.operatingRecordShow = false;
        if(val.status==2) {
          detailTableColumns.value = [
            ...detailTableColumnsTemp1,
            ...detailTableColumnsTemp2,
          ]
        } else {
          detailTableColumns.value = detailTableColumnsTemp1
        }
      },
      {
        immediate: true,
      }
    );

    return {
      ...toRefs(detailTableRecord),
      ...toRefs(operatetionTableRecord),
      ...toRefs(sendCarModalRecord),
      detailTableColumns,
      operatetionTableColumns,
      onDeliteClose,
      onOperationBtnClick,
      arraySpanMethod,
      getSummaries,
      onSendCar,
      onSendCarData,
    };
  },
};
</script>

<style lang="scss" scoped>
.table-header {
  position: relative;
  display: flex;
  margin-top: 24px;
  padding: 0 50px 0 16px;
  height: 58px;
  background: #e5e9f2;
  border: 1px solid #c0c5cf;
  justify-content: space-between;
  align-items: center;

  .operating-record-btn {
    width: 88px;
    height: 36px;
    background: #ffffff;
    border-radius: 18px;
  }
  .title {
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: $color-text;
    .iconfont {
      margin-right: 5px;
    }
  }
  .search-input {
    width: 246px;
  }

  .close-btn {
    position: absolute;
    top: 11px;
    right: 11px;
    width: 16px;
    height: 16px;
    color: #5a78a0;
    cursor: pointer;
  }
}
.purchase-order-detail-table,
.operating-record-table {
  margin-top: 0;
}
.blue-bg {
  width: 100%;
  background: #f0f5ff;
  border-radius: 4px;
  margin-bottom: 24px;
  padding: 16px 16px 0;
  box-sizing: border-box;
}
</style>