<template>
  <MyDialog
    :visible="visible"
    title="派车单选择"
    :width="900"
    @onUpdateDialogStatus="handleDialogClose"
    :closeOnCloseModal="false"
  >
    <div class="dispatchSelect-content">
      <MyForm
        ref="formRef"
        labelPosition="left"
        class="pound-form"
        :labelWidth="90"
        :formItems="formItems"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitForm"
      >
        <template #btns>
          <el-button type="primary" @click="onSearch">搜索</el-button>
        </template>
      </MyForm>
      <MyTable
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="false"
      />
    </div>
    <template v-slot:footer>
      <el-button @click="handleDialogClose">取消</el-button>
      <el-button type="primary" @click="handleOk">确定</el-button>
    </template>
  </MyDialog>

</template>

<script>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';
import JDetailCard from '@/components/JDetailCard.vue';
import MyForm from "@/components/MyForm.vue";
import MyTable from "@/components/MyTable.vue";
import MyDialog from '@/components/MyDialog.vue';

export default {
  components: {
    MyForm,
    JDetailCard,
    MyTable,
    MyDialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {

    const formRecord = reactive({
      formRef: null,
      formData: {},
    })
    const formItems = [
      {
        type: "input",
        label: "派车单号",
        paramName: "retailInvestors",
        span: 8,
      },
      {
        type: "input",
        label: "订单号",
        paramName: "retailInvestors",
        span: 8,
      },
      {
        type: "input",
        label: "计划单号",
        paramName: "retailInvestors",
        span: 8,
      },
      {
        type: "input",
        label: "物料",
        paramName: "retailInvestors",
        span: 8,
      },
      {
        type: "input",
        label: "车牌号",
        paramName: "retailInvestors",
        span: 8,
      },
      {
        type: "input",
        label: "收货单位",
        paramName: "retailInvestors",
        span: 8,
      },
      {
        type: "input",
        label: "出厂时间",
        paramName: "billDate",
        span: 8,
      },
      {
        type: "datePicker",
        label: "派单日期",
        paramName: "retailInvestors",
        span: 8,
      },
      {
        type: "blank",
        slotName: 'btns',
        span: 8,
      },
    ]

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

    const tableColumns = [
      { label: "序号", prop: "num", },
      { label: "操作", prop: "status" },
      { label: "时间", prop: "accountFlag"},
      { label: "操作人", prop: "accountFlag"},
      { label: "数据", prop: "accountFlag"},
      { label: "说明", prop: "accountFlag"},
    ]

    const handleDialogClose = (val) => {
      emit('onClose',false)
    }
    const handleOk = () => {
      emit('onSelected', "派车单数据")
      handleDialogClose()
    }
  
    return {
      ...toRefs(tableRecord),
      tableColumns,
      ...toRefs(formRecord),
      formItems,
      handleDialogClose,
      handleOk
    }
  }
}
</script>

<style lang="scss" scoped>
.dispatchSelect-content {
  padding: 0 24px;
}
  
</style>