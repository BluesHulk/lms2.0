<template>
  <div class="poundEdit-container">

    <div class="subtitle">原验收信息</div>
    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :formItems="formItemsGroup[0]"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />

    <div class="subtitle">新验收信息</div>
    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :formItems="formItemsGroup[1]"
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
          label: "供方发货数",
          paramName: "retailInvestors",
          span: 16,
        },
      ],
      [
        {
          type: "input",
          label: "供方发货数",
          paramName: "retailInvestors",
          span: 16,
        },
      ],

    ]

    const onSubmit = () => {
      console.log('more数据')
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