<template>
  <MyContainer>
    <div class="config-content">
      <div class="subtitle">所属公司</div>
      <MyForm
        ref="formRef"
        :formItems="formItems"
        :rules="formRules"
        :formData="formData"
        :labelWidth="150"
        @submitForm="submitForm"
        @onFormItemChange="onFormItemChange"
      >
      </MyForm>

      <div class="subtitle">参数配置</div>
      <el-tabs
        v-model="activeName"
        type="card"
        class="demo-tabs"
        @tab-click="handleClick"
      >
        <el-tab-pane label="厂内物流设置" name="1"></el-tab-pane>
        <el-tab-pane label="单据业务模块配置" name="2"></el-tab-pane>
        <el-tab-pane label="短倒" name="3"></el-tab-pane>
        <el-tab-pane label="中化室配置" name="4"></el-tab-pane>
        <el-tab-pane label="超载控制" name="5"></el-tab-pane>
        <el-tab-pane label="调度" name="6"></el-tab-pane>
      </el-tabs>

      <div v-show="activeName=='1'" class="tab-content" >
        <MyForm
          ref="formRef"
          :formItems="formItems1"
          :rules="formRules"
          :formData="formData1"
          :labelWidth="150"
          @submitForm="submitForm"
          @onFormItemChange="onFormItemChange"
        >
        </MyForm>
      </div>
      <div v-show="activeName=='2'" class="tab-content">
        <MyForm
          ref="formRef"
          :formItems="formItems2"
          :rules="formRules"
          :formData="formData2"
          :labelWidth="150"
          @submitForm="submitForm"
          @onFormItemChange="onFormItemChange"
        >
        <template v-slot:printRules>
          <div class="printRules">
            <div>未设置</div>
            <div class="operation" @click="onPrintRules">设置></div>
          </div>
        </template>
        </MyForm>
      </div>
      <div v-show="activeName=='3'" class="tab-content">
        <MyForm
          ref="formRef"
          :formItems="formItems3"
          :rules="formRules"
          :formData="formData3"
          :labelWidth="150"
          @submitForm="submitForm"
          @onFormItemChange="onFormItemChange"
        >
        </MyForm>
      </div>
      <div v-show="activeName=='4'" class="tab-content">
        <MyForm
          ref="formRef"
          :formItems="formItems4"
          :rules="formRules"
          :formData="formData4"
          :labelWidth="150"
          @submitForm="submitForm"
          @onFormItemChange="onFormItemChange"
        >
        </MyForm>
      </div>
      <div v-show="activeName=='5'" class="tab-content">
        <MyForm
          ref="formRef"
          :formItems="formItems5"
          :rules="formRules"
          :formData="formData5"
          :labelWidth="150"
          @submitForm="submitForm"
          @onFormItemChange="onFormItemChange"
        >
        </MyForm>
      </div>
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </div>

  </MyContainer>

  <el-dialog
    v-model="printRulesVisible"
    title="设置打印单据规则"
    width="750px"
    @close="printRulesVisible=false"
    :close-on-click-modal="false"
  >
    <div class="printRules-content">
      <el-form :model="printRulesFormData" label-width="120px">
        <el-form-item label="磅单：">
          <div class="content-item">
            <el-select v-model="value" style="width:200px;margin-right: 12px;">
              <el-option
                v-for="item in []"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input 
              style="width:200px;margin-right: 12px;"
              v-model="printRulesFormData.name" placeholder="不限">
              <template #append>次</template>
            </el-input>
            <el-checkbox v-model="checked1" label="Option 1">
              添加补字
            </el-checkbox>
          </div>   
        </el-form-item>
        <el-form-item label="合格证：">
          <div class="content-item">
            <el-select v-model="value" style="width:200px;margin-right: 12px;">
              <el-option
                v-for="item in []"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input 
              style="width:200px;margin-right: 12px;"
              v-model="printRulesFormData.name" placeholder="不限">
              <template #append>次</template>
            </el-input>
            <el-checkbox v-model="checked1" label="Option 1">
              添加补字
            </el-checkbox>
          </div> 
        </el-form-item>
        <el-form-item label="质量报告单：">
          <div class="content-item">
            <el-select v-model="value" style="width:200px;margin-right: 12px;">
              <el-option
                v-for="item in []"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input 
              style="width:200px;margin-right: 12px;"
              v-model="printRulesFormData.name" placeholder="不限">
              <template #append>次</template>
            </el-input>
            <el-checkbox v-model="checked1" label="Option 1">
              添加补字
            </el-checkbox>
          </div> 
        </el-form-item>
        <el-form-item label="提货单：">
          <div class="content-item">
            <el-select v-model="value" style="width:200px;margin-right: 12px;">
              <el-option
                v-for="item in []"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-input 
              style="width:200px;margin-right: 12px;"
              v-model="printRulesFormData.name" placeholder="不限">
              <template #append>次</template>
            </el-input>
            <el-checkbox v-model="checked1" label="Option 1">
              添加补字
            </el-checkbox>
          </div> 
        </el-form-item>
      </el-form>
    </div>
    

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="printRulesVisible=false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>


</template>

<script>
import { reactive, ref, toRefs, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'
import commonApi from '@/request/services/common'
import { ladderErrorApi } from '@/request/services/messure'
import { transformArrayData } from '@/utils/index';
import MyContainer from '@/components/MyContainer.vue';
import MyTable from '@/components/MyTable.vue';
import MyPagination from '@/components/MyPagination.vue';
import MyDrawer from '@/components/MyDrawer.vue';
import MyForm from '@/components/MyForm.vue';
import MyDialog from '@/components/MyDialog.vue';
import MyMultipleFilter from '@/components/MyMultipleFilter.vue';
import CustomerSelect from '@/components/CustomerSelect.vue';
import config from "@/utils/config";
import { ElMessage, ElMessageBox } from "element-plus";
import moment from 'moment';
import { paramConfigApi } from '@/request/services/messure';

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyDrawer,
    MyDialog,
    MyForm,
    MyMultipleFilter,
    CustomerSelect,
  },
  setup() {


    const tenantList = ref([])
    const activeName = ref('1')

    const handleClick = (tab, event) => {
      console.log(tab, event)
    }


    const printRulesRecord = reactive({
      printRulesVisible: false,
      printRulesFormData: {}

    })

    const onPrintRules = () => {
      printRulesRecord.printRulesVisible = true
    }

    const homeInfo = sessionStorage.getItem("homeInfo") &&
        JSON.parse(sessionStorage.getItem("homeInfo")) ||
      {}

    const formRecord = reactive({
      dataCache:[],
      formRef: null,
      formData: {
        tenantId: homeInfo.tenantId ? homeInfo.tenantId * 1 : '' 
      },
      formData1: {},
      formData2: {},
      formData3: {},
      formData4: {},
      formData5: {},
      formRules: {},
      formItems: [
        {
          type: 'select',
          label: '所属公司',
          paramName: 'tenantId',
          options: tenantList,
          span: 12,
        },
      ],
      formItems1: [
        {
          type: 'switch',
          label: '验证叫号',
          paramName: 'call_number',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: 'switch',
          label: '自动叫号',
          paramName: 'auto_call_number',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: "input",
          label: "空秤值",
          paramName: "empty_scale",
          span: 12,
        },
        {
          type: 'switch',
          label: '历史皮重控制',
          paramName: 'truck_tare_ctrl',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: "input",
          label: "历史皮重误差",
          paramName: "truck_tare_err_value",
          span: 12,
        },
        {
          type: "input",
          label: "最低净重限制",
          paramName: "min_net_err_value",
          span: 12,
        },
        {
          type: "input",
          label: "空车出厂净重限制",
          paramName: "empty_tare_err_value",
          span: 12,
        },
        {
          type: 'switch',
          label: '计量上传第三方',
          paramName: 'weigh_2_upload',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: "input",
          label: "允许重复过磅时间",
          paramName: "cover_weigh",
          span: 12,
        },
        {
          type: "input",
          label: "装卸料上传地址",
          paramName: "load_up_url",
          span: 12,
        },
        {
          type: 'select',
          label: '国标等级',
          paramName: 'GB18352',
          options: [],
          span: 12,
        },
        {
          type: 'switch',
          label: '环保等级控制',
          paramName: 'switch_gb18352',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: 'switch',
          label: '车牌校验',
          paramName: 'cc',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: 'switch',
          label: '发卡清除卡号占用',
          paramName: 'cc',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: "input",
          label: "海康服务地址",
          paramName: "priceListName",
          span: 12,
        },
        {
          type: 'switch',
          label: '环保等级校验(hik)',
          paramName: 'cc',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: 'select',
          label: '许可入厂环保等级',
          paramName: 'tenantId',
          options: [],
          span: 12,
        },
        {
          type: 'switch',
          label: '进厂车牌校验',
          paramName: 'cc',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
      ],
      formItems2: [
        {
          type: "input",
          label: "NC接口地址",
          paramName: "nc_endpoint",
          span: 12,
        },
        {
          type: "input",
          label: "GPS平台账号",
          paramName: "gps_app_key",
          span: 12,
        },
        {
          type: "input",
          label: "Gps平台钥匙",
          paramName: "gps_app_secret",
          span: 12,
        },
        {
          type: "input",
          label: "最低净重限制",
          paramName: "min_net_err_value",
          span: 12,
        },
        {
          type: 'switch',
          label: '是否选择开单工厂',
          paramName: 'bill_factory',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: 'checkbox',
          label: '选择开单工厂',
          paramName: 'chose_bill_factory',
          options: [],
          span: 12,
        },
        {
          type: "input",
          label: "采购订单预警量",
          paramName: "warning_amount_purchase",
          span: 12,
        },
        {
          type: "input",
          label: "销售订单预警量",
          paramName: "warning_amount_purchase",
          span: 12,
        },
        {
          type: "input",
          label: "G7装货地编码",
          paramName: "priceListName",
          span: 12,
        },
        {
          type: "input",
          label: "要求提货时间",
          paramName: "priceListName",
          suffix: 'h',
          span: 12,
        },
        {
          type: "input",
          label: "要求卸货时间",
          paramName: "priceListName",
          suffix: 'h',
          span: 12,
        },
        {
          span: 12,
        },
        {
          type: "labelBlank",
          label: "打印单据规则",
          slotName: "printRules",
          // paramName: "priceListName",
          span: 12,
        },
      ],
      formItems3: [
        {
          type: "input",
          label: "最短单次过磅时间",
          paramName: "single_minimum_time",
          span: 12,
        },
      ],
      formItems4: [
        {
          type: 'switch',
          label: '自动批次号',
          paramName: 'auto_batch',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
      ],
      formItems5: [
        {
          type: 'switch',
          label: '超载上限',
          paramName: 'overload_control_open',
          activeText:'开',
          inactiveText:'关',
          inlinePprompt: true,
          span: 12,
        },
        {
          type: "input",
          label: "超载上限百分比",
          paramName: "overload_control",
          span: 12,
        },
      ],
      
    })


    const getTenantList = async() => {
      const res =await commonApi.getCompany()
      if (res && res.code == 0) {
        res.data.map((item) => {
          item.label = item.name
          item.value = item.id
        })
        tenantList.value = res.data
      }
    }
    const getDetail = async() => { 
      let params = {
        tenantId: formRecord.formData.tenantId,
      }
      const res = await paramConfigApi.getDetail(params)
      console.table(res.data.data)
      toData(res.data.data)
    }
    const toData = (arr=[]) => {
      const its=[
        'formItems1',
        'formItems2',
        'formItems3',
        'formItems4',
        'formItems5',
      ]
      const datas = [
        'formData1',
        'formData2',
        'formData3',
        'formData4',
        'formData5',
      ]
      its.forEach((it,itdx) => {
        formRecord[it].forEach((item, index) => {
          const obj = arr.find(i => i.settingKey == item.paramName)
          if(!obj) return
          formRecord.dataCache.push(obj)
          if(item.type=='switch') {
            const vals = obj.settingReadyValue.split(',') || []
            formRecord[it][index].activeValue = vals[0]
            formRecord[it][index].inactiveValue = vals[1]
          }
          if(item.type=='select'){
            const texts = obj.settingReadyText.split(',')
            const vals = obj.settingReadyValue.split(',')
            const op = vals.map((i,idx)=> {
              return{label: texts[idx],value:i }}
            )
            formRecord[it][index].options = op
          }
          if(item.type=='checkbox') {
            const texts = obj.settingReadyText.split(',')
            const vals = obj.settingReadyValue.split(',')
            const op = vals.map((i,idx)=> {
              return{label: texts[idx],value:i }}
            )
            formRecord[it][index].options = op
          }

          if(item.type=='checkbox') {
            formRecord[datas[itdx]][item.paramName] = 
              obj.settingValue?obj.settingValue.split(','):[]
          } else {
            formRecord[datas[itdx]][item.paramName] = obj.settingValue
          }
        })
      })
      
    }

    onMounted(async()=>{
      await getTenantList()
      await getDetail()
    })

    watch(()=>formRecord.formData.tenantId, (val) => {
      getDetail()
    })

    const onSubmit = async() => {

      let params = {}
      if(activeName.value=='1') {
        params = toParams(formRecord.formData1)
      }
      if(activeName.value=='2') {
        params = toParams(formRecord.formData2)
      }
      if(activeName.value=='3') {
        params = toParams(formRecord.formData3)
      }
      if(activeName.value=='4') {
        params = toParams(formRecord.formData4)
      }
      if(activeName.value=='5') {
        params = toParams(formRecord.formData5)
      }

      const res = await paramConfigApi.saveFiledBatch(params)
      if(res && res.code ==0) {
        ElMessage.success('保存成功')
      }else {
        ElMessage.error(res.message)
      }
      
    }

    const toParams = (formData={}) => {
      let params = []
      Object.keys(formData).forEach(key => {
        let obj = formRecord.dataCache.find(i => i.settingKey == key)
        if(Array.isArray(formData[key])) {
          obj.settingValue = formData[key].join(',')
        } else {
          obj.settingValue = formData[key]
        }
        
        params.push(obj)
      })
      // console.log(params,"pam")
      return params
    }


    
 
    return {
      activeName,
      ...toRefs(formRecord),
      onSubmit,
      ...toRefs(printRulesRecord),
      onPrintRules,
    }

  }
}
</script>

<style lang="scss" scoped>

  .config-content {
    background-color: #fff;
    padding: 24px;
    .subtitle {
      position: relative;
      margin-bottom: 16px;
      padding-left: 12px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: $color-text;
      line-height: 22px;

      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        display: inline-block;
        width: 4px;
        height: 16px;
        background: #3c82fe;
        border-radius: 2px;
        transform: translateY(-50%);
      }
      &::after {
        content: "";
        position: absolute;
        top: 50%;
        right: 0;
        width: calc(100% - 100px);
        height: 1px;
        background: $color-border;
        transform: translateY(-50%);
      }
    }

    .printRules {
      display: flex;
      justify-content: space-between;
      color: #a8abb2;
      .operation {
        color: #409eff;
        cursor: pointer;
      }
    }
  }
  .printRules-content {
    padding: 0 24px;
    .content-item {
      display: flex;
    }
  }
</style>