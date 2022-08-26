<template>
  <div class="processEdit-container">

    <div class="content-title">{{title}}</div>
    <MyForm
      ref="formRef"
      labelPosition="left"
      class="pound-form"
      :formItems="formItems"
      :formData="formData"
      :rules="formRules"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />

  </div>
</template>

<script>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';
import JDetailCard from '@/components/JDetailCard.vue';
import MyForm from "@/components/MyForm.vue";
import config from "@/utils/config";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  components: {
    MyForm,
    JDetailCard,
  },
  props: {
    type: {
      type: String,
    },
    data: {
      type: Object,
      default: {}
    }
  },
  setup(props, { emit }) {


    const formRecord = reactive({
      formRef: null,
      formData: {},
    })

    const formItemsGroup = {
      default:[ //默认只有说明
        {
          type: "input",
          label: "说明",
          paramName: "remark",
          span: 24,
        },
      ],
      changeCard: [ //换卡
        {
          type: "input",
          label: "原卡号",
          paramName: "oldCardNo",
          disabled: true,
          span: 24,
        },
        {
          type: "input",
          label: "新卡号",
          paramName: "cardNo",
          span: 24,
        },
        {
          type: "input",
          label: "说明",
          paramName: "remark",
          span: 24,
        },
      ],
      grantCard: [ //发卡
        {
          type: "input",
          label: "卡号",
          paramName: "cardNo",
          span: 24,
        },
        {
          type: "input",
          label: "说明",
          paramName: "remark",
          span: 24,
        },
      ],
      weigh: [ //过磅
        {
          type: "input",
          label: "重量",
          paramName: "weighing",
          suffix: '吨',
          span: 24,
        },
        {
          type: "datetimePicker2",
          label: "过磅时间",
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          paramName: "time",
          span: 24,
        },
        {
          type: "input",
          label: "说明",
          paramName: "remark",
          span: 24,
        },
      ],
      check: [ //验收
        {
          type: "input",
          label: "发货数量",
          paramName: "outAmount",
          span: 24,
        },
        {
          type: "datetimePicker2",
          label: "发货日期",
          paramName: "consignerDate",
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          span: 24,
        },
        {
          type: "input",
          label: "验收地点",
          paramName: "checkAreaName",
          span: 24,
        },
        {
          type: "input",
          label: "扣吨",
          paramName: "deducted",
          span: 24,
        },
        {
          type: "select",
          label: "扣吨事由",
          paramName: "deductedReason",
          options: [],
          span: 24,
        },
        {
          type: "input",
          label: "说明",
          paramName: "remark",
          span: 24,
        },
      ],
    }

    const formRulesGroup = {
      changeCard: {
        cardNo: [
          config.rules({ type: "required" }),
          config.rules({ type: "long" }),
        ],
      },
      grantCard: {
        cardNo: [
          config.rules({ type: "required" }),
          config.rules({ type: "long" }),
        ],
      },
      weigh: {
        weighing: [config.rules({ type: "required" })],
      },
      check: {
        outAmount: [config.rules({ type: "required" })],
        consignerDate: [config.rules({ type: "required" })]
      }

    }

    const processTypeMap = new Map([
      ['back','回退'],
      ['changeCard','换卡'],
      ['outFactoryEmpty','空车出厂'],
      ['enterFactory','进厂'],
      ['grantCard','发卡'],
      ['weigh','过磅'],
      ['startLoad','开始装货'],
      ['endLoad','结束装货'],
      ['check','验收'],
      ['outFactory','出厂'],
      ['recycleCard','收卡'],
      ['outFactoryEmptyOver','空车出厂完结'],
      ['openGate','手工开闸'],
      ['closeGate','手工关闸'],
      ['invalid','作废'],
    ])

    const title = `${props.data.licensePlate} 执行${processTypeMap.get(props.type)}`
    const formItems = formItemsGroup[props.type] || formItemsGroup.default
    const formRules = formRulesGroup[props.type] || {}

    
    onMounted(() => {
      if(props.type === 'changeCard') {
        formRecord.formData = {
          oldCardNo: props.data.cardNo
        }
      }
    })

    
    const onSubmit = async() => {

      const check = await formRecord.formRef.submitForm()
      if(!check) return false

      const confirm = await toConfirm()
      if(!confirm) return false
  
      return toParams()
    }

    const toParams = () => {
      let params = {}
      if(props.type==='changeCard') {
        params = {
          id: props.data.id,
          ...formRecord.formData
        }
      }
      else {
        params = {
          id: props.data.id,
          ...formRecord.formData
        }
      }
      console.log(params)
      return params
    }

    const toConfirm = async() => {
      //文字描述
      let desc = '请确认是否继续？'
      if(props.type=='back') {
        desc =`此操作将使车辆${props.data.licensePlate} 回退至上一状态， 
        请确认是否继续？`
      }
      if(props.type=='changeCard') {
        desc =`此操作将使车辆${props.data.licensePlate}
        绑定卡片${formRecord.formData.cardNo}， 
        原卡片${formRecord.formData.oldCardNo}将置于未启用状态 请确认是否继续？`
      }
      if(props.type=='outFactoryEmpty') {
        desc =`此操作将使车辆${props.data.licensePlate}
        变更为空车出厂状态，此操作不可回退, 
         请确认是否继续？`
      }
      if(props.type=='enterFactory' || props.type=='outFactory' ) {
        desc =`此操作将使车辆${props.data.licensePlate}
        变更为${processTypeMap.get(props.type)}状态， 请确认是否继续？`
      }
      if(props.type=='grantCard' ) {
        desc =`此操作将使车辆${props.data.licensePlate}
        绑定卡片${formRecord.formData.cardNo}， 请确认是否继续？`
      }
      if(props.type=='weigh' ) {
        desc =`此操作将使车辆${props.data.licensePlate}
        重量为${formRecord.formData.weighing}吨。
        过磅时间为${formRecord.formData.time}
        请确认是否继续？`
      }
      if(props.type=='startLoad' || props.type=='endLoad') {
        desc =`此操作将${props.type=='startLoad'?'推送':'结束'}装货信息至装货系统，
        ${props.data.licensePlate}
        PO42.5散装水泥  30吨
        请确认是否继续？`
      }
      if(props.type=='check') {
        desc =`此操作将使车辆${props.data.licensePlate}
        执行验收
        请确认是否继续？`
      }
      if(props.type=='recycleCard') {
        desc =`此操作将使车辆${props.data.licensePlate}，
        卡号${formRecord.formData.cardNo}收卡
        请确认是否继续？`
      }
      if(props.type=='outFactoryEmptyOver') {
        desc =`此操作将使车辆${props.data.licensePlate}的记录变更为完结状态
        请确认是否继续？`
      }
      if(props.type=='invalid') {
        desc =`此操作将使车辆${props.data.licensePlate}的记录变更为作废状态，
        次操作不可回退 
        请确认是否继续？`
      }
      

      let result = false
      result = await ElMessageBox.confirm(
        desc,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result=='confirm') {
        result = true
      }
      return result

    }
   
    

  
    return {
      ...toRefs(formRecord),
      title,
      formItems,
      formRules,
      onSubmit,
    }
  }
}
</script>

<style lang="scss" scoped>
.processEdit-container {
  .content-title {
    font-size: 16px;
    font-weight: 500;
    color: #092D5C;
    line-height: 22px;
    margin-bottom: 24px;
  }
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