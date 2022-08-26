<template>
  <JDetailContainer>
    <JDetailCard
      title="应付单详情"
      :detailItems="detailItems"
      :detailData="detailData"
    />
    <div class="line" />
    <MyTable
      className="custom-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
    >
      <template v-slot:operation="slotProps">
        <el-button type="text" @click="onVerification(slotProps.data)">
          {{ slotProps.data.verifyStatus == 0 ? "核销" : "取消核销" }}
        </el-button>
      </template>
    </MyTable>
    <div class="footer">
      <el-button type="primary" @click="onAuditStatusChange">{{
        detailData.checkStatus == 0 ? "审核" : "弃审"
      }}</el-button>
    </div>
  </JDetailContainer>
  <BillModal v-if="modalShow" :modalShow="modalShow" :modalData="modalData" @onClose="onClose" @onRefresh="getDetail" />
</template>

<script>
import { reactive, toRefs } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { billsPayableApi } from "@/request/services/fundsManagement";
import MyTable from "@/components/MyTable.vue";
import JDetailContainer from "@/components/JDetailContainer.vue";
import JDetailCard from "@/components/JDetailCard.vue";
import BillModal from "./components/BillModal.vue";
import { transformArrayData } from "@/utils/index";

export default {
  components: {
    MyTable,
    JDetailContainer,
    JDetailCard,
    BillModal,
  },
  setup(props, { emit }) {
    const route = useRoute();

    const detailRecord = reactive({
      detailItems: [
        {
          label: "单据号：",
          prop: "id",
        },
        {
          label: "创建人：",
          prop: "createUserName",
        },
        {
          label: "创建时间：",
          prop: "createTime",
        },
        {
          label: "审核状态：",
          prop: "checkStatusName",
        },
        {
          label: "审核人",
          prop: "checkUserName",
        },
        {
          label: "审核时间：",
          prop: "checkTime",
        },
        // {
        //   label: "核销状态：",
        //   prop: "verifyStatusName",
        // },
        // {
        //   label: "核销人",
        //   prop: "verifyUserName",
        // },
        // {
        //   label: "核销时间：",
        //   prop: "verifyTime",
        // },
        {
          label: "单据日期：",
          prop: "createTime",
        },
        {
          label: "最后修改人：",
          prop: "updateUserName",
        },
        {
          label: "修改时间：",
          prop: "updateTime",
        },
        {
          label: "付款主体：",
          prop: "tenantName",
        },
        { label: "" },
        {
          label: "备注：",
          prop: "remark",
          span: 16,
        },
      ],
      detailData: {},
    });

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
    });
    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left"  },
      { label: "付款对象", prop: "customerName", width: 160, fixed: "left" },
      { label: "付款交易类型", prop: "tradeTypeName", width: 160 },
      { label: "物料", prop: "productName", width: 120 },
      { label: "数量", prop: "num", width: 120 },
      { label: "单价(元)", prop: "price", width: 120 },
      { label: "总价金额(元)", prop: "money", width: 120 },
      { label: "利率", prop: "taxRate", width: 120 },
      { label: "税额(元)", prop: "tax", width: 120 },
      { label: "发票号", prop: "billNum", width: 120 },
      { label: "业务单据类型", prop: "businessBillTypeName", width: 120 },
      { label: "业务单号", prop: "businessBillNum", width: 120 },
      { label: "收款摘要", prop: "payRemark", width: 180 },
      {
        label: "核销状态",
        prop: "verifyStatus",
        width: 120,
        formatter: (row) => ({ 0: "未核销", 1: "已核销" }[row.verifyStatus]),
      },
      { label: "操作", slotName: "operation", width: 100, fixed: "right" },
    ];

    const getDetail = () => {
      billsPayableApi.getDetail(route.query.id).then((res) => {
        if (res && res.code == 0) {
          res.data.checkStatusName = { 0: "未审核", 1: "已审核" }[
            res.data.checkStatus
          ];
          res.data.verifyStatusName = { 0: "未审核", 1: "已审核" }[
            res.data.verifyStatus
          ];
          detailRecord.detailData = res.data;
          tableRecord.tableData = transformArrayData(
            res.data.payableRecords,
            true,
            true
          );
        }
      });
    };
    getDetail();

    const onAuditStatusChange = () => {
      if (detailRecord.detailData.checkStatus == 0) {
        ElMessageBox.confirm(
          `<strong>审核通过</strong><br/>
          该付款单信息无误，确定审核通过？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          billsPayableApi.onAudit(detailRecord.detailData.id).then((res) => {
            if (res && res.code == 0) {
              ElMessage.success("操作成功！");
              getDetail();
            } else {
              ElMessage.error(res.message);
            }
          });
        });
      } else {
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          确定弃审该付款单？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          billsPayableApi
            .onCancelAudit(detailRecord.detailData.id)
            .then((res) => {
              if (res && res.code == 0) {
                ElMessage.success("操作成功！");
                getDetail();
              } else {
                ElMessage.error(res.message);
              }
            });
        });
      }
    };

    const modalRecord = reactive({
      modalShow: false,
      modalData: {},
    });

    const onClose = () => {
      modalRecord.modalShow = false;
      modalRecord.modalData = {};
    };

    const onVerification = (record) => {
      if (record.verifyStatus == 0) {
        modalRecord.modalShow = true;
        modalRecord.modalData = record;
      } else {
        ElMessageBox.confirm(
          `<strong>取消提示</strong><br/>
          确定取消核销？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          billsPayableApi.onCancelVerify(record.id).then((res) => {
            if (res && res.code == 0) {
              ElMessage.success("操作成功！");
              getDetail();
            } else {
              ElMessage.error(res.message);
            }
          });
        });
      }
    };

    return {
      ...toRefs(detailRecord),
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      tableColumns,
      onAuditStatusChange,
      onVerification,
      onClose,
      getDetail,
    };
  },
};
</script>

<style lang="scss" scoped>
.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 24px;
  width: 100%;
  border-top: 1px solid $color-border;
  box-sizing: border-box;
}
</style>