<template>
  <MyContainer>
    <div class="config-content">
      <div class="subtitle">所属公司</div>
      <MyForm
        ref="formRef"
        :formItems="formItems"
        :rules="formRules"
        :formData="formData"
        :labelWidth="180"
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
        <el-tab-pane label="厂内物流设置" :name="0"></el-tab-pane>
        <el-tab-pane label="单据业务模块配置" :name="1"></el-tab-pane>
        <el-tab-pane label="短倒" :name="2"></el-tab-pane>
        <el-tab-pane label="中化室配置" :name="3"></el-tab-pane>
        <el-tab-pane label="超载控制" :name="4"></el-tab-pane>
        <el-tab-pane label="调度" :name="5"></el-tab-pane>
      </el-tabs>


      <div class="tab-content-wrap">
        <div class="tab-content">
          <MyForm
            ref="formRef"
            :formItems="formGroupItems[activeName]"
            :rules="formRules"
            :formData="formGroupData"
            :labelWidth="180"
            @submitForm="submitForm"
            @onFormItemChange="onFormItemChange"
          >
          </MyForm>
        </div>
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
import { reactive, ref, toRefs, onMounted, watch,computed } from 'vue';
import { useStore } from "vuex";
import MyContainer from '@/components/MyContainer.vue';
import MyTable from '@/components/MyTable.vue';
import MyPagination from '@/components/MyPagination.vue';
import MyDrawer from '@/components/MyDrawer.vue';
import MyForm from '@/components/MyForm.vue';
import MyDialog from '@/components/MyDialog.vue';
import MyMultipleFilter from '@/components/MyMultipleFilter.vue';
import CustomerSelect from '@/components/CustomerSelect.vue';
import { ElMessage, ElMessageBox } from "element-plus";
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

    const store = useStore();

    const tenantList = ref(computed(() => {
      if(store.state.common.tenantList.length) {
        return store.state.common.tenantList;
      } else {
        store.dispatch('common/getTenantList');
      }
    }));
    const activeName = ref(0)

    const defaultType = [
      'weigh', //厂内物流设置
      'business', //
      'order', // 
      'assay', //中化
      'overload_control', //超载控制
      'dispatch', //调度
    ]

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
      formRef: null,
      formData: {
        tenantId: homeInfo.tenantId ? homeInfo.tenantId * 1 : '' 
      },
      formItems: [
        {
          type: 'select',
          label: '所属公司',
          paramName: 'tenantId',
          options: tenantList,
          span: 12,
          disabled: true,
        },
      ],
      formGroupItems: [],
      formGroupData: {},
      formGroupCache: [],
    })


    const getDetail = async() => { 
      let params = {
        tenantId: formRecord.formData.tenantId,
      }
      const res = await paramConfigApi.getDetail(params)

      initItems(res.data.data)
    }

    

    const initItems = (arr=[]) => {
      let data = {}
      let group = []
      let cache = []
      arr.forEach(item => {
        let formItem = null
        if(item.settingType == 'select') {
          formItem = {
            type: 'select',
            label: item.settingText,
            paramName: item.settingKey,
            options: getOptions(item),
            span: 12,
          }
        }
        if(item.settingType == 'text') {
          formItem = {
            type: 'input',
            label: item.settingText,
            paramName: item.settingKey,
            span: 12,
          }
        }
        if(item.settingType == 'number') {
          formItem = {
            type: 'number',
            label: item.settingText,
            paramName: item.settingKey,
            span: 12,
          }
        }
        if(item.settingType == 'switch') {
          const op = getOptions(item)
          let activeText = '开'
          let inactiveText = '关'
          if(op[1] && op[1].label) {
            activeText= op[0].label.substr(0,1)
            inactiveText = op[1].label.substr(0,1)
          } else {
            return
          }
          formItem = {
            type: 'switch',
            label: item.settingText,
            paramName: item.settingKey,
            activeText: activeText,
            inactiveText: inactiveText,
            activeValue: op[0].value,
            inactiveValue: op[1].value,
            inlinePrompt: true,
            span: 12,
          }
        }
        if(item.settingType == 'checkbox') {
          formItem = {
            type: 'checkbox',
            label: '选择开单工厂',
            paramName: 'chose_bill_factory',
            options: getOptions(item),
            span: 12,
          }
        }


        if(formItem) {
          const index = defaultType.findIndex(i => i == item.type)
          if(index>-1) {
            if(group[index]) {
              group[index].push(formItem)
              cache[index].push(item)
            } else {
              group[index]=[formItem]
              cache[index] = [item]
            }
            
          }
        }
        data[item.settingKey] = item.settingValue
      })
      formRecord.formGroupItems = group
      formRecord.formGroupData = data
      formRecord.formGroupCache = cache
    }

    const getOptions = (data={}) => {
      const { settingReadyText, settingReadyValue } = data
      const text = settingReadyText.split(',') || []
      const value = settingReadyValue.split(',') || []
      const op = text.map((i,idx) => {
        return{label: i,value:value[idx] }
      })
      return op
    }


    onMounted(async()=>{
      await getDetail()
    })

    watch(()=>formRecord.formData.tenantId, (val) => {
      getDetail()
    })

    const onSubmit = async() => {
      const params = toParams()

      const res = await paramConfigApi.saveFiledBatch(params)
      if(res && res.code ==0) {
        ElMessage.success('保存成功')
      }else {
        ElMessage.error(res.message)
      }
      
    }

    const toParams = (formData={}) => {
      const currItems = formRecord.formGroupCache[activeName.value]
      const params = currItems.map(item => {
        item.settingValue = formRecord.formGroupData[item.settingKey]
        return item
      })
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
    .tab-content-wrap {
      margin-left:-24px;
      margin-right:-24px;
      margin-bottom: 14px;
      padding: 0 24px;
      height: calc(100vh - 440px);
      max-height: calc(100vh - 440px);
      overflow-y: auto;
    }
    .tab-content {

    }
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