<template>
  <MyDialog
    :visible="visible"
    :title="title"
    :width="750"
    @onUpdateDialogStatus="onClose"
  >
    <div style='padding: 0 32px'>
      <el-form 
        ref="formRef"
        :model="formModel"
        :rules="formRules"
        label-width ="124px"
        label-position='left'
        class="combineForm"
      >
        <div v-if="type=='account'">
          <!-- <el-form-item label="子账户类型：" prop="accountType">
            <el-select 
              v-model="formModel.accountType" 
              placeholder="请选择"
            >
              <el-option label="客户子账户" value="2" />
              <el-option label="私有子账户" value="3" />
            </el-select>
          </el-form-item> -->
          <el-form-item 
            v-if="formModel.accountType=='3'" 
            label="子账户名称：" prop="accountName">
            <el-input v-model="formModel.accountName" placeholder="请输入"/>
          </el-form-item>
          <el-form-item v-else formModel label="客户名称：" prop="customerName">
            <CustomerSelect
              @selectedCustomer="customerSelectChange"
            ></CustomerSelect> 
          </el-form-item>
          
          <el-form-item label="分配额度：" prop="money">
            <el-input v-model="formModel.money" 
              placeholder="≤通用账户中“可用金额”"
            >
              <template #suffix>元</template>
            </el-input>
            <!-- <span 
              v-if="formModel.accountType=='2'" 
              class="money">可用金额 {{detailData.money}}</span> -->
            <span class="money">可用金额 {{detailData.money}}</span>
              
          </el-form-item>
        </div>

        <div v-if="type=='loan'">
          <el-form-item label="所在供应商：" >
            <el-input v-model="detailData.tenantName" disabled/>
          </el-form-item>
          <el-form-item label="信用总额：" >
            <el-input v-model="detailData.creditTotalMoney" disabled/>
          </el-form-item>
          <el-form-item label="已用信用额度：" >
            <el-input v-model="detailData.creditUseMoney" disabled/>
          </el-form-item>
          <el-form-item label="可用信用额度：" >
            <el-input v-model="detailData.creditMoney" disabled/>
          </el-form-item>
          <el-form-item label="借款额度：" prop="loanMoney">
            <el-input 
              v-model="formModel.loanMoney" 
              placeholder="≤通用账户中“可用金额”"
            >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="支付方式：" prop="loanType">
            <el-select 
              v-model="formModel.loanType" 
              placeholder="请选择"
            >
              <el-option label="现金" :value="1" />
              <el-option label="企业网银" :value="2" />
              <el-option label="银行承兑汇票-电子" :value="3" />
            </el-select>
          </el-form-item>
        </div>

        <div v-if="type=='quota'">
          <el-form-item label="子账户编号：">
            {{rowData.id}}
          </el-form-item>
          <el-form-item label="子账户类型：" >
            {{accountTypeMap.get(rowData.accountType)}}
          </el-form-item>
          <el-form-item label="子账户名称："  >
            {{rowData.accountName}}
          </el-form-item>
          <el-form-item label="调后总额：" prop="changeCreditMoney">
            <template #label>
              调后总额:
              <el-tooltip
                effect="dark"
                content="调整额度区间：不少于【锁定金额】不大于【总金额】+【可用金额】"
                placement="top-start"
              >
                <span class="tips">?</span>
              </el-tooltip>
            </template>
            <el-input 
              v-model="formModel.changeCreditMoney"
              style="width: 400px"
            >
              <template #suffix>元</template>
            </el-input>
            <span class="money">当前总额 {{rowData.money}}</span>
          </el-form-item>
          <el-form-item label="锁定金额："  >
            <el-input v-model="rowData.lockMoney" disabled >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
          <el-form-item label="可用金额："  >
            <el-input v-model="rowData.money" disabled >
              <template #suffix>元</template>
            </el-input>
          </el-form-item>
        </div>

        <div v-if="type=='permissions'">
          <el-form-item label="子账户编号：">
            {{rowData.id}}
          </el-form-item>
          <el-form-item label="子账户类型：">
            {{accountTypeMap.get(rowData.accountType)}}
          </el-form-item>
          <el-form-item label="子账户名称：">
            {{rowData.accountName}}
          </el-form-item>
          <el-form-item label="总金额：">
            {{rowData.totalMoney}} 元
          </el-form-item>
          <el-form-item label="账户权限用户：">
            <el-input
              v-if="permissionsShowData"
              v-model="permissionsShowData"
              readonly
              style="margin-right: 8px"
            />
            <span class="edit"
              @click="editPermissions"
            ><i class="iconfont icon-bianji" />编辑</span>
            
          </el-form-item>
        </div>

      </el-form>

    </div>
    
    <template v-slot:footer>
    <el-button
      type="primary"
      @click="onSubmit"
    >
      提交
    </el-button>
    <el-button @click="onClose">取消</el-button>
  </template>
  </MyDialog> 
  
  <AccountAuthorityDialog 
    :visible="permissionsDialog"
    @handleOk="permissionsHanldeOk"
    @handleClose="permissionsHanldeClose"
  />

</template>

<script>
import { reactive, ref, toRefs, onMounted, watch } from 'vue';
import { saleApi } from '@/request/services/accountMangement';
import { ElMessage, ElMessageBox } from "element-plus";
import config from '@/utils/config';
import MyForm from '@/components/MyForm.vue';
import MyDialog from '@/components/MyDialog.vue';
import CustomerSelect from '@/components/CustomerSelect.vue';
import AccountAuthorityDialog from '@/components/AccountAuthorityDialog.vue';

export default {
  components: {
    MyForm,
    MyDialog,
    CustomerSelect,
    AccountAuthorityDialog,
  },
  props: {
    type: {
      type: String,
      default: 'account',
    },
    visible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: {}
    },
    row: {
      type: Object,
      default: {}
    },
    isEdit: {
      type: Boolean,
      default: false
    }

  },
  setup(props,{emit}) {
    const typeMap = new Map([
      ['account','新增子账户'],
      ['loan','信用借款'],
      ['quota','调整额度申请'],
      ['permissions','分配账户权限'],
    ])
    const accountTypeMap = new Map([
      ["1","通用账户"],
      ["2","客户子账户"],
      ["3","私有子账户"],
    ])

    const dialogRecord = reactive({
      visible: props.visible,
      title: '',
      type: '',
      detailData: {},
      rowData: {},
      permissionsDialog: false,
      permissionsData:[],
      permissionsShowData:''
    })


    // watch(()=>props.visible,(val)=> {
    //   dialogRecord.visible = val
      
    // })
    // watch(()=>props.type, (val)=> {
    //   dialogRecord.type = val
    //   dialogRecord.title = typeMap.get(val)
    //   if(val == 'account') {
    //     formRecord.formModel = formRecord.accountModel
    //     formRecord.formRules = formRules_account
    //   }
    //   if(val == 'loan') {
    //     formRecord.formModel = formRecord.loanModel
    //     formRecord.formRules = formRules_loan
    //   }
    //   if(val == 'quota') {
    //     formRecord.formModel = formRecord.quotaModel
    //     formRecord.formRules = formRules_quota
    //   }
    // })
    // watch(()=>props.data, (val)=> {
    //   dialogRecord.detailData= val
    // })
    // watch(()=>props.row, (val)=> {
    //   dialogRecord.rowData= val
    // })
    

    const formRecord = reactive({
      formRef: null,
      formRules: {},
      formModel: {},
      accountModel: {
        accountType:'3',
        customerName: '',
        customerId: '',
        accountName: '',
        money: '',
      },
      loanModel: {
        loanMoney: '',
        loanType: 1
      },
      quotaModel: {
        changeCreditMoney:''
      },
    })

    const formRules_account = {
      accountType: [
        config.rules({type: 'required'})
      ],
      accountName: [
        config.rules({type: 'required'})
      ],
      customerName: [
        config.rules({type: 'required'})
      ],
      money: [
        config.rules({type: 'required'}),
        config.rules({type: 'price'})
      ]
    }
    const formRules_loan = {
      loanMoney: [
        config.rules({type: 'required'}),
        config.rules({type: 'price'})
      ]
    }
    const formRules_quota ={
      changeCreditMoney: [
        config.rules({type: 'required'}),
      ]
    }

    const init = () => {
      dialogRecord.rowData= props.row
      dialogRecord.detailData= props.data
      dialogRecord.type = props.type
      dialogRecord.title = typeMap.get(props.type)
      if(props.type == 'account') {
        formRecord.formModel = formRecord.accountModel
        formRecord.formRules = formRules_account
      }
      if(props.type == 'loan') {
        formRecord.formModel = formRecord.loanModel
        formRecord.formRules = formRules_loan
      }
      if(props.type == 'quota') {
        if(props.isEdit) {
          formRecord.quotaModel.changeCreditMoney=props.row.newTotalMoney
        }
        formRecord.formModel = formRecord.quotaModel
        formRecord.formRules = formRules_quota
        
      }

      dialogRecord.visible = props.visible
    }



    onMounted(() => {
      init()
    })  

    const customerSelectChange = (row) => {
      formRecord.formModel.customerId = row.id
      formRecord.formModel.customerName = row.name
    }

    const onClose = () => {
      emit('onClose', false)
    }

    const toParams = () => {
      let params ={}

      if(dialogRecord.type == 'account') {
        params ={
          ...formRecord.formModel,
          money: Number(formRecord.formModel.money),
        }
        params.id = props.data.id
      }
      if(dialogRecord.type == 'loan') {
        params ={
          loanMoney: Number(formRecord.formModel.loanMoney),
          loanType: Number(formRecord.formModel.loanType),
        }
        params.accountId = props.data.id
      }
      if(dialogRecord.type == 'quota') {
        if(props.isEdit) {
          params.newTotalMoney = formRecord.formModel.changeCreditMoney
          params.id = props.data.id
        } else {
          params.newTotalMoney = formRecord.formModel.changeCreditMoney
          params.subAccountId = dialogRecord.rowData.id
          params.accountId = props.data.id
        }
        
      }
      if(dialogRecord.type == 'permissions') {
        const qos = dialogRecord.permissionsData.map(item => {
          return {
            accessId: item.id,
            accessName: item.label,
            accountId: props.data.id
          }
        })
        params = qos
      }
      console.log(params,'params')
      return params
    }


    const onSubmit = async() => {
      
      const result = await formRecord.formRef.validate()
      if(!result) return 

      let params = toParams()
      let res = null
      // return
      if(dialogRecord.type == 'account') {
        res = await saleApi.addSubAccount(params)
      }
      if(dialogRecord.type == 'loan') {
        res = await saleApi.addLoan(params)
      }
      if(dialogRecord.type == 'quota') {
        if(props.isEdit) {
          res = await saleApi.quotaUpdate(params)
        } else {
          res = await saleApi.addQuota(params)
        } 
      }
      if(dialogRecord.type == 'permissions') {
        res = await saleApi.addPermissions(params)
      }

      if(res.code=='0') {
        ElMessage.success("操作成功！");
        onClose()
        emit('refresh')
      } else {
        ElMessage.error(res.message);
      }
    }


    const editPermissions = () => {
      dialogRecord.permissionsDialog = true
    }
    const permissionsHanldeOk = (val) => {
      dialogRecord.permissionsData = val
      dialogRecord.permissionsShowData = val.map(i=>i.label).join()
      dialogRecord.permissionsDialog = false
    }
    const permissionsHanldeClose = () => {
      dialogRecord.permissionsDialog = false
    }
   
  
    return {
      ...toRefs(dialogRecord),
      ...toRefs(formRecord),
      onSubmit,
      customerSelectChange,
      onClose,
      editPermissions,
      permissionsHanldeOk,
      permissionsHanldeClose,
      accountTypeMap,
    }

  }
}
</script>

<style lang="scss" scoped>
.combineForm {
  .money {
    display: inline-block;
    font-size: 14px;
    font-weight: 400;
    color: #3C82FE;
    line-height: 20px;
    margin-left: 8px;
  }
  .edit {
    display: inline-block;
    font-size: 14px;
    font-weight: 400;
    color: #3C82FE;
    line-height: 20px;
    margin-left: 8px;
    cursor: pointer;
  }
  .tips {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 1px solid #606266;
    border-radius: 7.5px;
    box-sizing: border-box;
    margin-left: 8px;
    text-align: center;
    line-height: 13px;
    margin-top: 8px;
    font-size: 12px;
  }
  ::v-deep {
    .el-select {
      width: 400px;
    }
    .el-input { 
      width: 400px;
    }
  }
  
}
</style>