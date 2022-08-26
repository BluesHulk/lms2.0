<template>
  <JDetailContainer>
    <JDetailCard
      title='收款单详情'
      :detailItems="detailItems"
      :detailData="detailData"
    />
    <div class="line" />
    <MyTable
      className="custom-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
    />
    <div class="footer">
      <el-button type="primary" @click="onAuditStatusChange">{{detailData.checkStatus == 0 ? '审核' : '弃审'}}</el-button>
    </div>
  </JDetailContainer>

</template>

<script>
import { reactive, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { receiptVoucherApi } from "@/request/services/fundsManagement";
import MyTable from '@/components/MyTable.vue';
import JDetailContainer from '@/components/JDetailContainer.vue';
import JDetailCard from '@/components/JDetailCard.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { transformArrayData } from "@/utils/index";

export default {
  components: {
    MyTable,
    JDetailContainer,
    JDetailCard,
  },
  setup() {
    const route = useRoute()

    const detailRecord = reactive({
      detailItems: [
        {
          label:'单据号：', 
          prop: 'id',
        },
        {
          label:'创建人：', 
          prop: 'createUserName'
        },
        {
          label:'创建时间：', 
          prop: 'createTime'
        },
        {
          label:'审核状态：', 
          prop: 'checkStatusName',
        },
        {
          label:'审核人', 
          prop: 'checkUserName'
        },
        {
          label:'审核时间：', 
          prop: 'checkTime',
        },
        {
          label:'单据日期：', 
          prop: 'createTime',
        },
        {
          label:'最后修改人：', 
          prop: 'updateUserName',
        },
        {
          label:'修改时间：', 
          prop: 'updateTime',
        },
        {
          label:'收款主体：', 
          prop: 'tenantName',
        },
        {
          label:'支付日期：', 
          prop: 'payTime',
        },
        {
          label:'备注：', 
          prop: 'remark',
          span: 16
        },
      ],
      detailData: {},
    })

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
    })
    const tableColumns = [
      { label: "序号", prop: "num", width: 60 },
      { label: "收款对象", prop: "customerName" },
      { label: "收款业务类型", prop: "businessTypeName" },
      { label: "金额(元)", prop: "money" },
      { label: "已核销金额(元)", prop: "verifyMoney" },
      { label: "未核销金额(元)", prop: "unVerifyMoney" },
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
      {
        label: "票据类型",
        prop: "billType",
        formatter: (row) => ({ 2: "银行承兑汇票-纸质", 3: "银行承兑汇票-电子" }[row.billType]),
      },
      { label: "票据号", prop: "billNum" },
      { label: "收款账户", prop: "collectAccount" },
    ];

    const getDetail = () => {
      receiptVoucherApi.getDetail(route.query.id)
        .then(res => {
          if(res && res.code == 0) {
            res.data.checkStatusName = { 0: '未审核', 1: '已审核' }[res.data.checkStatus]
            detailRecord.detailData = res.data
            tableRecord.tableData = transformArrayData(res.data.receiptRecords, true, true)
          }
        })
    }
    getDetail();

    const onAuditStatusChange = () => {
      if (detailRecord.detailData.checkStatus == 0) {
        ElMessageBox.confirm(
          `<strong>审核通过</strong><br/>
          该收款单信息无误，确定审核通过？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          receiptVoucherApi.onAudit(detailRecord.detailData.id).then((res) => {
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
          确定弃审该收款单？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          receiptVoucherApi.onCancelAudit(detailRecord.detailData.id).then((res) => {
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
      tableColumns,
      onAuditStatusChange
    }
  }
}
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