<template>
  <div class="poundEdit-container">

    <div class="subtitle">原订单信息</div>
    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :formItems="formItemsGroup[0]"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />
    <MyTable
      ref="formRef"
      :tableData="tableData"
      :columns="tableColumns"
      :selection="false"
    />

    <div class="subtitle">新订单信息</div>
    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :formItems="formItemsGroup[0]"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />
    <MyTable
      ref="formRef"
      :tableData="tableData"
      :columns="tableColumns"
      :selection="false"
    />


  </div>
</template>

<script>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';
import MyTable from '@/components/MyTable.vue';
import JDetailCard from '@/components/JDetailCard.vue';
import MyForm from "@/components/MyForm.vue";

export default {
  components: {
    MyForm,
    JDetailCard,
    MyTable,
  },
  props: {
    totalItems: {
      type: Array,
      default: () => [],
    },
    totalData: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit }) {


    const formRecord = reactive({
      formRef: null,
      formData: {},
    })
    const formItemsGroup = [
      [
        {
          type: "input",
          label: "订单号",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "业务类型",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "发货单位",
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
          label: "经销商",
          paramName: "retailInvestors",
          span: 8,
        },
      ]
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
      { label: "物料名称", prop: "num", },
      { label: "物料分类", prop: "status" },
      { label: "计量单位", prop: "accountFlag"},
      { label: "单价", prop: "accountFlag"},
      { label: "开单工厂", prop: "accountFlag"},
    ]

    const onSubmit = () => {
      console.log('订单数据')
    }
   
    

  
    return {
      ...toRefs(formRecord),
      formItemsGroup,
      ...toRefs(tableRecord),
      tableColumns,
      onSubmit,
    }
  }
}
</script>

<style lang="scss" scoped>
.poundEdit-container {
  .subtitle {
    width: calc(100% + 24px);
    height: 40px;
    background: #F0F5FF;
    border-left: 3px solid #3C82FE;
    margin: 0 -24px 24px;
    padding-left: 21px;
    color: #092D5C;
    line-height: 40px;
    font-size: 16px;
    font-weight: 600;  
  }
  .search-btn {
    background-color: #409eff;
    color: #fff;
  }
  .pound-form {
    ::v-deep {
      .el-form-item__label {
        color: #5A78A0;
      }
    }
    
  }

}
  
</style>