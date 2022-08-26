<template>
  <MyContainer>
    <div class="search-container">
      <div style="padding: 0 20px;">
        <!-- <MyForm
          ref="formRef"
          labelPosition="left"
          :formItems="formItems"
          :rules="formRules"
          :formData="formData"
          @onFormItemChange="onFormItemChange"
          @submitForm="submitForm"
        >
        
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
    </div>

    <MyTable
      className="custom-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
      :selection="false"
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
    :width="1233"
    :className="'reback-money'"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="borrow">
      <span>借款金额：</span>
      <p>
        {{ borrowMoney }}
        <span>元</span>
      </p>
    </div>
    <div class="receive">
      <span>收款单：</span>
      <p v-if="multipleSelectionDia.length">
        <span>
          已选
          <i>{{ multipleSelectionDia.length }}</i>
          单,共计
        </span>
        {{ sumbyReceiveMoney }}
        <span>元</span>
      </p>
    </div>
    <div style="padding: 0 20px;">
      <el-row :gutter="20">
        <el-col :span="2">
          <div>单据时间：</div>
        </el-col>
        <el-col :span="9">
          <el-date-picker
            v-model="time"
            type="datetimerange"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="onSearchRecords">查询</el-button>
          <el-button @click="resetRecorads">重置</el-button>
        </el-col>
      </el-row>
    </div>
    <MyTable
      className="custom-table"
      ref="tableRefDia"
      :tableData="tableDataDia"
      :columns="tableColumnsDia"
      :selection="true"
      @handleSelectionChange="handleSelectionChangeDia"
    />
    <MyPagination
      :total="tableTotalDia"
      :queryData="pageParamsDia"
      @paginationChange="paginationChangeDia"
    />
    <template v-slot:footer>
      <el-button @click="onClose">取消</el-button>
      <el-button
        type="primary"
        @click="onSubmit"
        :disabled="multipleSelectionDia.length < 1"
        :loading="subLoading"
      >
        确定核销
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { reactive, ref, toRefs, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import moment from 'moment'
import commonApi from '@/request/services/common'
import _ from 'lodash'
import { creditApi } from '@/request/services/creditManagement'
import { singleReceivableApi } from '@/request/services/fundsManagement'
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
    MyDialog,
    MyMultipleFilter,
    CustomerSelect,
  },
  setup() {
    const router = useRouter()
    const tenantList = ref([])
    const formRecord = reactive({
      formRef: null,
      formData: {},
      formItems: [
        {
          type: 'select',
          label: '账户主体',
          paramName: 'tenantId',
          options: tenantList,
          span: 8,
        },
        {
          type: 'labelBlank',
          label: '客户名称',
          paramName: 'customerId',
          slotName: 'customerId',
          span: 8,
          formItemClass: 'form-margin-right',
        },
        {
          type: 'datetimePicker',
          label: '借款时间',
          paramName: 'loanTime',
          span: 8,
        },
        {
          type: 'select',
          label: '状态',
          span: 8,
          paramName: 'loanStatus',
          options: [
            { label: '未还款', value: '0' },
            { label: '已还款', value: '1' },
          ],
        },
      ],
    })

    const tableRecord = reactive({
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      selectedRows: [],
      multipleSelection: [],
      borrowMoney: '',
      selectedId: '',
    })
    const tableColumns = [
      { label: '序号', prop: 'num', width: 60, fixed: 'left' },
      {
        label: '记录编号',
        prop: 'id',
        fixed: 'left',
      },
      {
        label: '借款时间',
        prop: 'loanTime',
        formatter: (row) => {
          if (row.loanTime) {
            return `<span>${moment(row.loanTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )}</span>`
          } else {
            return `<span>——</span>`
          }
        },
      },
      { label: '账户主体', prop: 'tenantName' },
      { label: '所在供应商', prop: 'customerName' },
      { label: '借款金额（元）', prop: 'loanMoney' },
      {
        label: '状态',
        prop: 'loanStatus',
        formatter: (row) =>
          `<span class="status-label" style="background: ${
            row.loanStatus == 1 ? '#32D231' : '#FF3B30'
          };"></span>${{ 1: '已还款', 0: '未还款' }[row.loanStatus]}`,
      }, //状态 0未还款 1已还款,可用值:0,1
      {
        label: '支付方式',
        prop: 'loanType',
        formatter: (row) => {
          if (row.loanType == 1) {
            return `<span>现金</span>`
          } else if (row.loanType == 2) {
            return `<span>银行承兑</span>`
          } else {
            return `<span>——</span>`
          }
        },
      },
      {
        label: '还款时间',
        prop: 'repayTime',
        formatter: (row) => {
          if (row.repayTime) {
            return `<span>${moment(row.repayTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )}</span>`
          } else {
            return `<span>——</span>`
          }
        },
      },
      {
        label: '操作',
        width: 120,
        fixed: 'right',
        operatetion: (row) => {
          if (row.loanStatus == 1) {
            return []
          } else if (row.loanStatus == 0) {
            return [
              // {
              //   name: '还款',
              //   style: { color: '#239cff' },
              //   onClick: onRebackMoney.bind(this, row),
              // },
            ]
          }
        },
      },
    ]

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
    const getTenantList = async () => {
      const res = await commonApi.getCompany()
      if (res && res.code == 0) {
        res.data.map((item) => {
          item.label = item.name
          item.value = item.id
        })
        tenantList.value = res.data
      }
    }
    getTenantList()
    //过滤筛选项
    const filterSearch = () => {
      let data = {}
      Object.keys(formRecord.formData).forEach((key) => {
        if (key == 'loanTime') {
          console.log(formRecord.formData)

          data['loanStartTime'] = formRecord.formData[key]
            ? moment(formRecord.formData[key][0]).format('YYYY-MM-DD HH:mm:ss')
            : ''
          data['loanEndTime'] = formRecord.formData[key]
            ? moment(formRecord.formData[key][1]).format('YYYY-MM-DD HH:mm:ss')
            : ''
        } else {
          if (formRecord.formData[key]) {
            data[key] = formRecord.formData[key]
          }
        }
      })
      return data
    }
    const getTableData = async (param = {}) => {
      let params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        type:1,
        ...filterSearch(),
        ...param,
      }
      console.log(params, 'tableParams')
      //接口todo
      const res = await creditApi.creditLoanpage(params)
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
          type: 'success',
          message: message,
        })
      }
    }
    const handleSelectionChange = (rows, ref) => {
      if (rows.length > 1) {
        var newRows = rows.filter((it, index) => {
          if (index == rows.length - 1) {
            //  tableRecord.tableRef.toggleRowSelection(it, true)
            ref.toggleRowSelection(it, true)
            return true
          } else {
            ref.toggleRowSelection(it, false)
            return false
          }
        })

        tableRecord.multipleSelection = newRows
      } else {
        tableRecord.multipleSelection = rows
        // tableRecord.borrowMoney
      }
    }
    const dialogFromData = reactive({
      ModalShow: false,
      subLoading: false,
      dialogTitle: '信用借款还款',
      tableDataDia: [],
      tableTotalDia: 0,
      pageParamsDia: {
        currentPage: 1,
        pageSize: 10,
      },
      multipleSelectionDia: [],
      customerId: '',
      tenantId: '',
      startTime: '',
      endTime: '',
      time: '',
      sumbyReceiveMoney: '',
    })
    const tableColumnsDia = [
      {
        label: '收款单号',
        prop: 'id',
        fixed: 'left',
      },
      { label: '收款主体', prop: 'tenantName' },
      { label: '收款对象', prop: 'customerName' },

      {
        label: '收款业务类型',
        prop: 'businessTypeName',
      },
      { label: '未核销金额(元）', prop: 'unVerifyMoney' },
      {
        label: '结算方式', // 1.企业网银 2.银行承兑汇票-纸质 3.银行承兑汇票-电子 4.商业承兑汇票-纸质 5.商业承兑汇票-电子 6.陕建筑信通 7.现金
        prop: 'payType',
        formatter: (row) => {
          if (row.payType == 1) {
            return `<span>企业网银</span>`
          } else if (row.payType == 2) {
            return `<span>银行承兑汇票-纸质</span>`
          } else if (row.payType == 3) {
            return `<span>银银行承兑汇票-电子</span>`
          } else if (row.payType == 4) {
            return `<span>商业承兑汇票-纸质</span>`
          } else if (row.payType == 5) {
            return `<span>商业承兑汇票-电子</span>`
          } else if (row.payType == 6) {
            return `<span>陕建筑信通</span>`
          } else if (row.payType == 7) {
            return `<span>现金</span>`
          } else {
            return `<span>——</span>`
          }
        },
      },
      {
        label: '单据时间',
        prop: 'createTime',
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
    ]
    const onSubmit = () => {
      ElMessageBox.confirm(
        `<strong>还款提示</strong><br/>
          确定还款?`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      )
        .then(() => {
          creditApi
            .creditLoanrepay({
              id: tableRecord.selectedId,
              receiptRecordId: dialogFromData.multipleSelectionDia[0].id,
            })
            .then((res) => {
              const { code, message } = res
              if (code == 0) {
                ElMessage({
                  type: 'success',
                  message: message,
                })
              } else {
                ElMessage({
                  type: 'error',
                  message: message,
                })
              }
            })
        })
        .catch(() => {})
    }
    const onClose = () => {
      dialogFromData.ModalShow = false
      dialogFromData.multipleSelectionDia = []
    }
    const onUpdateDialogStatus = (status) => {
      console.log(status, 'status')
      dialogFromData.ModalShow = status
      if (!status) {
        onClose()
      }
      // dialogFromData.formRef.clearForm()
    }
    const onRebackMoney = (row) => {
      dialogFromData.ModalShow = true
      dialogFromData.customerId = row.customerId
      dialogFromData.tenantId = row.tenantId
      getVoucherTableData()

      tableRecord.borrowMoney = row.loanMoney
      tableRecord.selectedId = row.id
    }
    const paginationChangeDia = (data) => {
      const { currentPage, pageSize } = dialogFromData.pageParamsDia
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return
      }
      dialogFromData.pageParams = { ...data }
      // getTableData()
    }
    const handleSelectionChangeDia = (rows, ref) => {
      if (rows.length > 1) {
        var newRows = rows.filter((it, index) => {
          if (index == rows.length - 1) {
            //  tableRecord.tableRef.toggleRowSelection(it, true)
            ref.toggleRowSelection(it, true)
            return true
          } else {
            ref.toggleRowSelection(it, false)
            return false
          }
        })
        dialogFromData.multipleSelectionDia = newRows
      } else {
        dialogFromData.multipleSelectionDia = rows
        dialogFromData.sumbyReceiveMoney = _.sumBy(
          dialogFromData.multipleSelectionDia,
          'money',
        )
      }
    }
    const getVoucherTableData = () => {
      const params = {
        current: dialogFromData.pageParamsDia.currentPage,
        size: dialogFromData.pageParamsDia.pageSize,
        customerId: dialogFromData.customerId,
        tenantId: dialogFromData.tenantId,
        startTime: dialogFromData.startTime,
        endTime: dialogFromData.endTime,
      }
      //收款单明细-分页查询
      singleReceivableApi.getDetailTableData(params).then((res) => {
        if (res && res.code == 0) {
          // dialogFromData.tableTotalDia = res.data.total
          // dialogFromData.tableDataDia = res.data.records
          dialogFromData.tableTotalDia = res.data.total
          dialogFromData.tableDataDia = res.data.records
          transformArrayData(
            dialogFromData.tableDataDia,
            true,
            true,
            dialogFromData.pageParamsDia.currentPage,
            dialogFromData.pageParamsDia.pageSize,
          )
        }
      })
    }
    onMounted(async () => {
      await getTableData()
    })
    const selectedCustomer = (val) => {
      formRecord.formData.customerId = val.id
    }
    const onSearchRecords = () => {
      dialogFromData.pageParamsDia.currentPage = 1
      if (dialogFromData.time && dialogFromData.time.length) {
        dialogFromData.startTime = moment(dialogFromData.time[0]).format(
          'YYYY-MM-DD 00:00:00',
        )
        dialogFromData.endTime = moment(dialogFromData.time[1]).format(
          'YYYY-MM-DD 23:59:59',
        )
        // delete val.loanTime
      }
      getVoucherTableData()
    }
    const resetRecorads = () => {
      dialogFromData.time = ''
      dialogFromData.startTime = ''
      dialogFromData.endTime = ''
      dialogFromData.pageParamsDia.currentPage = 1
      dialogFromData.pageParamsDia.pageSize = 10
      getVoucherTableData()
    }

    return {
      ...toRefs(formRecord),
      ...toRefs(tableRecord),
      ...toRefs(dialogFromData),
      tableColumns,
      tableColumnsDia,
      paginationChange,
      onSearchRecords,
      paginationChangeDia,
      resetRecorads,
      onSearch,
      onClose,
      onSubmit,
      onUpdateDialogStatus,
      handleSelectionChange,
      handleSelectionChangeDia,
      selectedCustomer,
    }
  },
}
</script>
<style lang="scss" scoped>
.bt-space {
  display: flex;
  justify-content: space-between;
}
.reback-money {
  .borrow {
    padding: 10px 20px;
    height: 35px;
    span:first-child {
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #092d5c;
      line-height: 22px;
    }
    p {
      display: inline-block;
      font-size: 28px;
      font-family: HelveticaNeue-Bold, HelveticaNeue;
      font-weight: bold;
      color: #092d5c;
      line-height: 34px;
      span {
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #5a78a0;
      }
    }
  }
  .receive {
    padding: 10px 20px;
    height: 35px;
    span:first-child {
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #092d5c;
      line-height: 22px;
    }
    p {
      display: inline-block;
      font-size: 28px;
      font-family: HelveticaNeue-Bold, HelveticaNeue;
      font-weight: bold;
      color: #3c82fe;
      line-height: 34px;
      span {
        font-size: 16px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #5a78a0;
        i {
          font-size: 16px;
          font-family: HelveticaNeue-Bold, HelveticaNeue;
          font-weight: bold;
          color: #3c82fe;
          font-style: normal;
        }
      }
    }
  }
}
</style>
