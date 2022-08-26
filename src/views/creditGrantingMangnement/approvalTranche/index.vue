<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="tabAdd">新增</el-button>
    </template>
    <template v-slot:header-right>
      <MySearch
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        @onSearch="onFuzzySearch"
      />
      <AdvancedFilterBtn
        style="margin-left: 24px;"
        @getBtnStatus="getAdvancedBtnStatus"
      />
    </template>
    <div class="content">
      <MyMultipleFilter
        v-if="advancedFilterShow"
        :formItems="formItems"
        :formData="searchParams"
        @onSearch="onSearch"
        :slotList="['customerId']"
      >
        <template v-slot:customerId>
          <CustomerSelect
            :placeholder="'请选择'"
            :customerId="searchParams.customerId"
            @selectedCustomer="selectedCustomer"
          />
        </template>
      </MyMultipleFilter>
      <MyTable
        className="receipt-voucher-table"
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
    </div>
  </MyContainer>
  <MyDialog
    :visible="ModalShow"
    :title="dialogTitle"
    :width="568"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <MyForm
      class="data-suppley"
      style="padding:0 20px"
      ref="formRefDia"
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
import { reactive, toRefs, ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import moment from 'moment'
import { creditApi } from '@/request/services/creditManagement'
import { transformArrayData, isNum } from '@/utils/index'
import MyContainer from '@/components/MyContainer.vue'
import MyTable from '@/components/MyTable.vue'
import MyPagination from '@/components/MyPagination.vue'
import MyMultipleFilter from '@/components/MyMultipleFilter.vue'
import MySearch from '@/components/MySearch.vue'
import AdvancedFilterBtn from '@/components/AdvancedFilterBtn.vue'
import MyDrawer from '@/components/MyDrawer.vue'
import MyForm from '@/components/MyForm.vue'
import MyDialog from '@/components/MyDialog.vue'
import CustomerSelect from '@/components/CustomerSelect.vue'
import commonApi from '@/request/services/common'
export default {
  name: 'ReceiptVoucher',
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    AdvancedFilterBtn,
    MyForm,
    MyDialog,
    MyDrawer,
    CustomerSelect,
  },
  setup() {
    const checkNum = (rule, value, cb) => {
      if (isNum(value)) {
        return cb()
      }
      cb(new Error('请输入正确的格式'))
    }
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
          options: tenantList,
          span: 8,
        },
        {
          type: 'number',
          label: '额度审批单号',
          paramName: 'id',
          span: 8,
        },
        {
          type: 'labelBlank',
          label: '客户名称',
          paramName: 'customerId',
          slotName: 'customerId',
          span: 8,
        },
        {
          type: 'datetimePicker',
          label: '单据日期',
          paramName: 'loanTime',
          span: 8,
        },
        {
          type: 'select',
          label: '审核状态',
          span: 8,
          paramName: 'checkStatus',
          options: [
            { label: '未审核', value: '0' },
            { label: '已审核', value: '1' },
          ],
        },
      ],
    })
    const filterRecord = reactive({
      conditionValue: 'id',
      searchCondition: [
        {
          label: '额度审批单号',
          value: 'id',
          ele: 'number',
        },
      ],
      advancedFilterShow: false,
      searchParams: {},
    })

    const getAdvancedBtnStatus = (status) => {
      filterRecord.advancedFilterShow = status
    }

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
   const selectedCustomer = (val) => {
    console.log(val)
      filterRecord.searchParams.customerId = val.id;
    }
    const getTableData = async (param = {}) => {
       console.log(filterRecord.searchParams)
      let params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
         type:2,
        ...filterRecord.searchParams,
      }
      //接口todo
      const res = await creditApi.capitalAccountCreditQuotapage(params)
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
        // tableRecord.tableTotal = res.data.total
        // tableRecord.tableData = res.data.records
      } else {
        ElMessage({
          type: 'error',
          message: message,
        })
      }
    }
    getTableData()

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1
      console.log(val, 'val')

      if (val.loanTime && val.loanTime.length) {
        val.startTime = moment(val.loanTime[0]).format('YYYY-MM-DD 00:00:00')
        val.endTime = moment(val.loanTime[1]).format('YYYY-MM-DD 23:59:59')
      }
      filterRecord.searchParams = val
      // delete  filterRecord.searchParams.loanTime

      getTableData()
    }

    const onFuzzySearch = (val) => {
      tableRecord.pageParams.currentPage = 1
      filterRecord.searchParams = val
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

    const tableColumns = [
      { label: '序号', prop: 'num', width: 60, fixed: 'left' },
      {
        label: '额度审批单号',
        // prop: 'collectionId',
        prop: 'id',
        width: 150,
        fixed: 'left',
      },
      {
        label: '单据日期',
        prop: 'createTime',
        width: 150,
        formatter: (row) => {
          if (row.createTime) {
            return `<span>${moment(row.createTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )}</span>`
          } else {
            return `<span>——</span>`
          }
        },
      },
      { label: '授信主体', width: 180, prop: 'tenantName' },
      { label: '客户名称', width: 180, prop: 'customerName' },
      { label: '总信用额度(元）', width: 150, prop: 'oldCreditTotalMoney' },
      { label: '剩余可用额度(元)', width: 150, prop: 'oldCreditMoney' },
      { label: '调整额度(元）', width: 150, prop: 'changeCreditMoney' },
      { label: '新总信用额度(元）', width: 150, prop: 'newCreditTotalMoney' },
      { label: '新剩余可用额度(元）', width: 160, prop: 'newCreditMoney' },
      {
        label: '审核状态',
        prop: 'checkStatus',
        width: 120,
        formatter: (row) =>
          `<span class="status-label" style="background: ${
            row.checkStatus == 1 ? '#32D231' : '#FF3B30'
          };"></span>${{ 1: '已审核', 0: '未审核' }[row.checkStatus]}`,
      },
      { label: '审核人', width: 120, prop: 'checkUserName' },

      {
        label: '操作',
        fixed: 'right',
        width: 180,
        operatetion: (row) => {
          if (row.checkStatus == 1) {
            return [
              {
                name: '弃审',
                style: { color: '#239cff' },
                onClick: onRebackMoney.bind(this, row, 'check'),
              },
            ]
          } else if (row.checkStatus == 0) {
            return [
              {
                name: '编辑',
                style: { color: '#239cff' },
                onClick: onRebackMoney.bind(this, row, 'edit'),
              },
              {
                name: '审批',
                style: { color: '#239cff' },
                onClick: onRebackMoney.bind(this, row, 'check'),
              },
              {
                name: '删除',
                style: { color: '#239cff' },
                onClick: onRebackMoney.bind(this, row, 'del'),
              },
            ]
          }
        },
      },
    ]
    const onRebackMoney = (row, type) => {
      if (type == 'del') {
        //删除
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          确定删除?`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
          .then(() => {
            creditApi.creditQuotadelete({ id: row.id }).then((result) => {
              const { code, message } = result
              if (code == 0) {
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
              }
            })
          })
          .catch(() => {})
      } else if (type == 'edit') {
        //编辑
        dialogFromData.dialogTitle = '编辑'
        dialogFromData.ModalShow = true
        diaFormData(type)
        dialogFromData.FormDataDia = {
          tenantName: row.tenantName,
          customerName: row.customerName,
          tenantId: row.tenantId,
          customerId: row.customerId,
          oldCreditTotalMoney: row.oldCreditTotalMoney,
          oldCreditMoney: row.oldCreditMoney,
          changeCreditMoney: row.changeCreditMoney,
          newCreditTotalMoney: row.newCreditTotalMoney,
          newCreditMoney: row.newCreditMoney,
          id: row.id,
          creditId: row.creditId,
        }
      } else if (type == 'check') {
        //审核
        const checkStatus = row.checkStatus
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          确定${checkStatus == 0 ? '审批通过' : '弃审'}?`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
          .then(() => {
            if (checkStatus == 0) {
              creditApi
                .creditQuotacheck({
                  content: '',
                  id: row.id,
                })
                .then((result) => {
                  const { code, message } = result
                  if (code == 0) {
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
                  }
                })
            } else {
              creditApi
                .creditQuotacancelCheck({
                  id: row.id,
                })
                .then((result) => {
                  const { code, message } = result
                  if (code == 0) {
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
                  }
                })
            }
          })
          .catch(() => {})
      }
    }

    const onReset = () => {
      formRecord.formRef.clearForm()
      getTableData()
    }
    const diaFormData = (type) => {
      dialogFromData.FormItemsDia = [
        {
          type: 'select',
          label: '授信主体',
          placeholder: '授信主体',
          paramName: 'tenantName',
          options: tenantList,
          disabled: type == 'add' ? false : true,
        },
        {
          type: 'select',
          label: '客户名称',
          placeholder: '客户名称',
          paramName: 'customerName',
          options: clientList,
          disabled: type == 'add' ? false : true,
        },
        {
          type: 'input',
          label: '总信用额度',
          placeholder: '总信用额度',
          paramName: 'oldCreditTotalMoney',
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
          label: '调整额度',
          placeholder: '调整额度（元）',
          paramName: 'changeCreditMoney',
          disabled: false,
        },
        {
          type: 'input',
          label: '调整后总额',
          paramName: 'newCreditTotalMoney',
          disabled: true,
        },
        {
          type: 'input',
          label: '调整后可用额度',
          paramName: 'newCreditMoney',
          disabled: true,
        },
      ]
    }
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
        changeCreditMoney: [
          { required: true, message: '请输入调整额度', trigger: 'blur' },
          { validator: checkNum, trigger: 'blur' },
        ],
      },
      FormDataDia: {},
      FormItemsDia: [],
    })
    const tabAdd = (val) => {
      dialogFromData.ModalShow = true
      dialogFromData.dialogTitle = '新增'
      diaFormData('add')
    }
    const editForm = (val) => {
      creditApi
        .creditQuotaupdate({
          changeCreditMoney: val.changeCreditMoney,
          creditId: val.creditId,
          id: val.id,
        })
        .then((result) => {
          const { code, message } = result
          if (code == 0) {
            ElMessage({
              type: 'success',
              message: message,
            })
            dialogFromData.ModalShow = false
            dialogFromData.subLoading = false
            getTableData()
          } else {
            dialogFromData.subLoading = false
            ElMessage({
              type: 'error',
              message: message,
            })
          }
        })
    }
    const submitForm = (val) => {
      dialogFromData.subLoading = true
      if (dialogFromData.dialogTitle == '新增') {
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          确定新增该条额度审批?`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
          .then(() => {
            creditApi
              .creditQuotasave({
                changeCreditMoney: val.changeCreditMoney,
                creditId: val.creditId,
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

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      clientList,
      tenantList,
      onSearch,
      getAdvancedBtnStatus,
      onFuzzySearch,
      paginationChange,
      ...toRefs(formRecord),
      ...toRefs(tableRecord),
      ...toRefs(dialogFromData),
      tableColumns,
      paginationChange,
      onReset,
      submitForm,
      onClose,
      onSubmit,
      onUpdateDialogStatus,
      tabAdd,
      onFormItemChange,
      selectedCustomer
    }
  },
}
</script>
