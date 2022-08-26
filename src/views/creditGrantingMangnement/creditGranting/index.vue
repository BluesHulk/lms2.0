<template>
  <MyContainer>
    <div class="search-container">
      <div>
        <!-- <MyForm
          ref="formRef"
          labelPosition="left"
          :formItems="formItems"
          :rules="formRules"
          :formData="formData"
          @onFormItemChange="onFormItemChange"
          @submitForm="submitForm"
        >
 

        <template v-slot:customerId>
          <CustomerSelect
            :placeholder="'请选择'"
            :customerId="formData.customerId"
            @selectedCustomer="selectedCustomer"
          />
        </template>
        </MyForm> -->
        <MyMultipleFilter
          :formItems="formItems"
          @onSearch="onSearch"
          :formData="formData"
          :slotList="['customerId']"
        >
          <template v-slot:customerId>
            <CustomerSelect
              :placeholder="'请选择'"
              :customerId="formData.customerId"
              @selectedCustomer="selectedCustomer"
            />
          </template>
        </MyMultipleFilter>
      </div>
      <!-- <div class="search-container-footer">
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="onReset">清空</el-button>
      </div> -->
    </div>

    <MyTable
      className="custom-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
      :selection="true"
      @handleSelectionChange="handleSelectionChange"
    />
    <MyPagination
      :total="tableTotal"
      :queryData="pageParams"
      @paginationChange="paginationChange"
    />
  </MyContainer>
  <MyDialog
    :visible="ModalShow"
    :title="dialogTitle"
    :width="568"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <MyForm
      class="data-suppley"
      ref="formRefDia"
      style="padding: 0 20px;"
      :formItems="FormItemsDia"
      :rules="dialogRules"
      :formData="FormDataDia"
      @submitForm="submitForm"
      @onFormItemChange="onFormItemChange"
    ></MyForm>
    <template v-slot:footer>
      <el-button type="primary" @click="onSubmit" :loading="subLoading">
        提交
      </el-button>
      <el-button @click="onClose">取消</el-button>
    </template>
  </MyDialog>
</template>

<script>
import { reactive, ref, toRefs, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, onBeforeRouteUpdate } from 'vue-router'
import { saleApi } from '@/request/services/accountMangement'
import commonApi from '@/request/services/common'
import { creditApi } from '@/request/services/creditManagement'
import { transformArrayData } from '@/utils/index'
import MyContainer from '@/components/MyContainer.vue'
import MyTable from '@/components/MyTable.vue'
import MyPagination from '@/components/MyPagination.vue'
import MyDrawer from '@/components/MyDrawer.vue'
import MyForm from '@/components/MyForm.vue'
import MyDialog from '@/components/MyDialog.vue'
import MyMultipleFilter from '@/components/MyMultipleFilter.vue'
import CustomerSelect from '@/components/CustomerSelect.vue'
export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyDrawer,
    MyForm,
    MyMultipleFilter,
    MyDialog,
    CustomerSelect,
  },
  setup() {
    const router = useRouter()
    const tenantList = ref([])
    const clientList = ref([])
    const formRecord = reactive({
      formRef: null,
      formData: {},
      formItems: [
        {
          type: 'select',
          label: '授信主体',
          paramName: 'tenantId',
          span: 8,
          options: tenantList,
          formItemClass: 'form-margin-right',
        },
        {
          type: 'labelBlank',
          label: '客户名称',
          paramName: 'customerId',
          slotName: 'customerId',
          span: 8,
          formItemClass: 'form-margin-right',
        },
        // {
        //   type: 'rangePicker',
        //   label: '有效时间',
        //   paramName: 'productName',
        //   span: 8,
        //   formItemClass: 'form-margin-right',
        // },
      ],
    })

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      selectedRows: [],
    })
    const tableColumns = [
      { label: '序号', prop: 'num', width: 60, fixed: 'left' },
      {
        label: '授信主体',
        prop: 'tenantName',
        fixed: 'left',
      },
      {
        label: '客户名称',
        prop: 'customerName',
      },
      { label: '总信用额度(元）', prop: 'creditTotalMoney' },
      { label: '已使用额度(元）', prop: 'creditUseMoney' },
      { label: '剩余可用额度(元）', prop: 'creditMoney' },
      {
        label: '操作',
        width: 120,
        fixed: 'right',
        operatetion: (row) => {
          return [
            {
              name: '信用借款',
              style: { color: '#3C82FE' },
              onClick: onDetail.bind(this, row),
            },
          ]
        },
      },
    ]
    const selectedCustomer = (val) => {
      formRecord.formData.customerId = val.id
    }
    const onDetail = (row) => {
      dialogFromData.ModalShow = true
      dialogFromData.dialogTitle = '信用借款'
      creditApi
        .capitalAccountCreditdetail({
          customerId: row.customerId,
          tenantId: row.tenantId,
        })
        .then((res) => {
          const { code, message, data } = res
          if (code == 0) {
            dialogFromData.FormDataDia.oldCreditTotalMoney =
              data.creditTotalMoney
            dialogFromData.FormDataDia.oldCreditMoney = data.creditTotalMoney
            dialogFromData.FormDataDia.changeCreditMoney = data.creditMoney
            dialogFromData.FormDataDia.creditId = data.id
            dialogFromData.FormDataDia.tenantId = data.tenantId
             dialogFromData.FormDataDia.creditUseMoney = data.creditUseMoney

            dialogFromData.FormDataDia.tenantName = data.tenantName
            dialogFromData.FormDataDia.customerId = data.customerId
            dialogFromData.FormDataDia.customerName = data.customerName
          } else {
            ElMessage({
              type: 'error',
              message: message,
            })
          }
        })
    }

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1
      formRecord.formData = val
      getTableData()
    }
    const onReset = () => {
      formRecord.formRef.clearForm()
      getTableData()
    }
    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return
      }
      tableRecord.pageParams = { ...data }
      getTableData()
    }
    //过滤筛选项
    const filterSearch = () => {
      let data = {}
      Object.keys(formRecord.formData).forEach((key) => {
        if (formRecord.formData[key]) {
          data[key] = formRecord.formData[key]
        }
      })
      return data
    }

    const getTableData = async (param = {}) => {
      //  console.log(proxy)
      let params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        type: 2,
        ...filterSearch(),
        ...param,
      }
      console.log(params, 'tableParams')
      //接口todo
      const res = await creditApi.capitalAccountCreditpage(params)
      console.log(res)
      const { code, message, data } = res
      if (code == 0) {
        tableRecord.tableTotal = res.data.total
        tableRecord.tableData = transformArrayData(
          res.data.records,
          true,
          true,
          tableRecord.pageParams.currentPage,
          tableRecord.pageParams.pageSize,
        )
      } else {
        ElMessage({
          type: 'error',
          message: message,
        })
      }
    }
    getTableData()
    // onMounted(async () => {
    //   await getTableData()
    // })
    const getTenantList = () => {
      commonApi.getCompany().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name
            item.value = item.id
          })
          tenantList.value = res.data
        }
      })
    }
    getTenantList()

    const getClientList = () => {
      commonApi.getCustomer({ type: 1 }).then((res) => {
        const { code, data } = res
        if (code == 0) {
          data.map((item) => {
            item.label = item.name
            item.value = item.id
          })
          clientList.value = data
        }
      })
    }
    getClientList()

    const dialogFromData = reactive({
      ModalShow: false,
      subLoading: false,
      formRefDia: null,
      dialogTitle: '',
      dialogRules: {
        tenantName: [
          { required: true, message: '请选择公司名称', trigger: 'blur' },
        ],
        customerName: [
          { required: true, message: '请选择客户名称', trigger: 'blur' },
        ],
        loanMoney: [
          { required: true, message: '请输入借款额度', trigger: 'blur' },
        ],
        loanType: [
          { required: true, message: '请选择结算方式', trigger: 'blur' },
        ],
      },
      FormDataDia: {},
      FormItemsDia: [
        {
          type: 'select',
          label: '所在供应商',
          placeholder: '所在供应商',
          paramName: 'tenantName',
          options: tenantList,
          disabled: true,
        },
        {
          type: 'input',
          label: '信用总额',
          placeholder: '信用总额',
          paramName: 'oldCreditTotalMoney',
          disabled: true,
        },
        {
          type: 'input',
          label: '已用信用额度',
          placeholder: '已用信用额度',
          paramName: 'creditUseMoney',
          disabled: true,
        },
        {
          type: 'input',
          label: '可用信用额度',
          placeholder: '可用信用额度',
          paramName: 'oldCreditMoney',
          disabled: true,
        },
        {
          type: 'input',
          label: '借款额度',
          placeholder: '0≤额度≤可用信用额度（元）',
          paramName: 'loanMoney',
          disabled: false,
        },
        {
          type: 'select',
          label: '结算方式',
          placeholder: '结算方式',
          paramName: 'loanType',
          options: [
            {
              label: '现金',
              value: 1,
            },
            {
              label: '企业网银',
              value: 2,
            },
            {
              label: '银行承兑汇票-电子',
              value: 3,
            },
          ],
          disabled: false,
        },
      ],
    })
    const submitForm = (val) => {
      dialogFromData.subLoading = true
      if (dialogFromData.dialogTitle == '信用借款') {
        console.log(val, '信用借款')
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
           信用借款`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
          .then(() => {
            // creditApi
            //   .creditQuotasave({
            //     changeCreditMoney: val.changeCreditMoney,
            //     creditId: val.creditId,
            //   })
            // .then((res) => {
            //   const { code, message, data } = res
            //   if (code == 0) {
            //     dialogFromData.subLoading = false
            //     dialogFromData.formRefDia.clearForm()
            //     dialogFromData.ModalShow = false
            //     ElMessage({
            //       type: 'success',
            //       message: message,
            //     })
            //     getTableData()
            //   } else {
            //     ElMessage({
            //       type: 'error',
            //       message: message,
            //     })
            //     getTableData()
            //   }
            // })
            saleApi
              .addLoan({
                loanMoney: val.loanMoney,
                loanType: val.loanType,
              })
              .then((res) => {
                const { code, message, data } = res
                if (code == 0) {
                  dialogFromData.subLoading = false
                  dialogFromData.formRefDia.clearForm()
                  dialogFromData.ModalShow = false
                  ElMessage({
                    type: 'success',
                    message: message,
                  })
                  getTableData()
                } else {
                  ElMessage({
                    type: 'error',
                    message: message,
                  })
                  getTableData()
                }
              })
          })
          .catch(() => {
            dialogFromData.subLoading = false
          })
      } else if (dialogFromData.dialogTitle == '编辑') {
        console.log(val, '编辑')
        editForm(val)
      }
    }
    const onSubmit = () => {
      dialogFromData.formRefDia.submitForm()
    }
    const onClose = () => {
      dialogFromData.ModalShow = false
      dialogFromData.subLoading = false
      dialogFromData.FormDataDia = {}
      dialogFromData.formRefDia.clearForm()
    }
    const onUpdateDialogStatus = (status) => {
      console.log(status, 'status')
      dialogFromData.ModalShow = status
      if (!status) {
        onClose()
      }
      // dialogFromData.FormDataDia = {}
      // dialogFromData.formRefDia.clearForm()
    }
    const onFormItemChange = (data, paramName) => {
      if (paramName == 'tenantName') {
        tenantList.value.map((item) => {
          if (item.value == data.tenantName) {
            dialogFromData.FormDataDia.tenantName = item.label
            dialogFromData.FormDataDia.tenantId = item.value
          }
        })
        if (data.tenantName && data.customerName) {
          creditApi
            .capitalAccountCreditdetail({
              tenantId: data.tenantId,
              customerId: data.customerId,
            })
            .then((res) => {
              const { code, message, data } = res
              if (code == 0) {
                dialogFromData.FormDataDia.oldCreditTotalMoney =
                  data.creditTotalMoney
                dialogFromData.FormDataDia.oldCreditMoney =
                  data.creditTotalMoney
                dialogFromData.FormDataDia.changeCreditMoney = data.creditMoney
                dialogFromData.FormDataDia.creditId = data.id
              } else {
                ElMessage({
                  type: 'error',
                  message: message,
                })
              }
            })
        }
      }
      if (paramName == 'customerName') {
        clientList.value.map((item) => {
          if (item.value == data.customerName) {
            dialogFromData.FormDataDia.customerName = item.label
            dialogFromData.FormDataDia.customerId = item.value
          }
        })
        if (data.tenantName && data.customerName) {
          creditApi
            .capitalAccountCreditdetail({
              tenantId: data.tenantId,
              customerId: data.customerId,
            })
            .then((res) => {
              const { code, message, data } = res
              if (code == 0) {
                dialogFromData.FormDataDia.oldCreditTotalMoney =
                  data.creditTotalMoney
                dialogFromData.FormDataDia.oldCreditMoney =
                  data.creditTotalMoney
                dialogFromData.FormDataDia.changeCreditMoney = data.creditMoney
                dialogFromData.FormDataDia.creditId = data.id
              } else {
                ElMessage({
                  type: 'error',
                  message: message,
                })
              }
            })
        }
      }
    }

    return {
      ...toRefs(formRecord),
      ...toRefs(tableRecord),
      ...toRefs(dialogFromData),
      tableColumns,
      paginationChange,
      onSearch,
      onReset,
      clientList,
      tenantList,
      submitForm,
      onClose,
      onSubmit,
      onUpdateDialogStatus,
      onFormItemChange,
      selectedCustomer,
    }
  },
}
</script>
