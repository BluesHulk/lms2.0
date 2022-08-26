<template>
  <div class="poundEdit-container">

    <div class="subtitle">业务信息</div>
    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :formItems="formItemsGroup[0]"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />

    <div class="subtitle">计量信息</div>
    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :formItems="formItemsGroup[1]"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />

    <div class="subtitle">关联单据信息</div>
    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :formItems="formItemsGroup[2]"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />

  </div>
</template>

<script>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';
import JDetailCard from '@/components/JDetailCard.vue';
import MyForm from "@/components/MyForm.vue";

export default {
  components: {
    MyForm,
    JDetailCard,
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
          label: "车牌号",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "物料名称",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "客户名称",
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
          label: "司机",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "司机身份证",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "磅单编号",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "车辆状态",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "过磅类型",
          paramName: "retailInvestors",
          span: 8,
        },
      ],
      [
        {
          type: "input",
          label: "预发数量",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "毛重",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "毛重时间",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "结算数量",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "皮重",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "皮重时间",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "扣吨",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "净重",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "进厂时间",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "扣杂",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "实发数量",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "出厂时间",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "供方发货数",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "供方发货日期",
          paramName: "retailInvestors",
          span: 8,
        },
      ],
      [
        {
          type: "input",
          label: "派车单号",
          paramName: "retailInvestors",
          span: 8,
        },
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
          label: "水泥批次号",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "IC卡号",
          paramName: "retailInvestors",
          span: 8,
        },
        {
          type: "input",
          label: "ID卡号",
          paramName: "retailInvestors",
          span: 8,
        },
      ]
    ]

    const onSubmit = () => {
      console.log('计量数据')
    }
   
    

  
    return {
      ...toRefs(formRecord),
      formItemsGroup,
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