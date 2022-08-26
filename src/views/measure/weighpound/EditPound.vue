<template>
  <div class="poundEdit-container">

    <div class="subtitle">派车单信息</div>

    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :labelWidth="108"
      :formItems="formItemsTop"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    >
      <template #sendCar>
        <el-input v-model="input2" placeholder="请选择">
          <template #append>
            <el-button class="search-btn" @click="onDispatch">
              <i class="iconfont icon-sousuo"></i>
            </el-button>
          </template>
        </el-input>
      </template>
    </MyForm>
    

    <JDetailCard
      :detailItems="detailItems"
      :detailData="detailData"
    />

    <div class="subtitle">计量信息</div>

    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :labelWidth="108"
      :formItems="formItems"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />

    <DispatchSelect
      :visible="sendCarShow"
      @onClose="sendCarShow=false"
      @onSelected="onDispatchSelected"
    ></DispatchSelect>


    
  </div>
</template>

<script>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';
import JDetailCard from '@/components/JDetailCard.vue';
import MyForm from "@/components/MyForm.vue";
import DispatchSelect from "./components/DispatchSelect.vue";

export default {
  components: {
    MyForm,
    JDetailCard,
    DispatchSelect
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


    const detailRecord = reactive({
      detailData: {},
    })
    const detailItems = [
      {label:'派车单状态：', prop: 'id'},
      {label:'车牌号：', prop: 'id'},
      {label:'司机：', prop: 'id'},
      {label:'司机身份证号：', prop: 'id'},
      {label:'客户：', prop: 'id'},
      {label:'物料：', prop: 'id'},
      {label:'经销商：', prop: 'id'},
      {label:'预发量：', prop: 'id'},
      {label:'订单号：', prop: 'id'},
      {label:'派车时间：', prop: 'id'},
    ]

    const formRecord = reactive({
      formRef: null,
      formData: {},
    })
    const formItemsTop = [
      {
        type: "labelBlank",
        label: "派车单号",
        paramName: "customerId",
        slotName: "sendCar",
        span: 8,
      },
    ]
    const formItems = [
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
        label: "净重",
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
        type: "datePicker",
        label: "进厂时间",
        paramName: "billDate",
        span: 8,
      },
      {
        type: "datePicker",
        label: "出厂时间",
        paramName: "billDate",
        span: 8,
      },
      {
        type: "input",
        label: "批次号",
        paramName: "retailInvestors",
        span: 8,
      },
      {
        type: "input",
        label: "说明",
        paramName: "retailInvestors",
        span: 8,
      },
      
    ]

    const sendCarShow = ref(false)

    const onDispatch = () => {
      sendCarShow.value = true
    }
    const onDispatchSelected = (val) => {
      console.log(val)
    }

    const onSubmit = () => {
      console.log('补单数据')
    }
    

  
    return {
      ...toRefs(detailRecord),
      detailItems,
      ...toRefs(formRecord),
      formItemsTop,
      formItems,
      onDispatch,
      sendCarShow,
      onDispatchSelected,
      onSubmit
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