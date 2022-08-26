<template>
  <MyContainer>
    <div style="padding: 20px; background: #fff;">
      <el-row :gutter="20">
        <el-col :span="14"></el-col>
        <el-col :span="18">
          <MyForm
            ref="formRef"
            :formItems="formItems"
            :rules="formRules"
            :formData="formData"
            :labelWidth="90"
            @submitForm="submitForm"
            @onFormItemChange="onFormItemChange"
          ></MyForm>
        </el-col>

        <el-col :span="5">
          <div class="search-container-footer">
            <el-button type="primary" @click="onSearch">搜索</el-button>
            <el-button @click="onReset">重置</el-button>
            <el-button @click="importIn">导入</el-button>
            <el-button @click="exportOut">导出</el-button>
          </div>
        </el-col>
      </el-row>
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
  <ImportDialog
    :modalShow="importModalShow"
    :subTitle="'磁卡管理'"
    :templateApi="{
      url: '/tenant-lms-meter-provide/lms/meter/calculate/card/download',
      method: 'post',
    }"
    @onImportFile="onImportFile"
    @onClose="onModalClose('import')"
  />
</template>

<script>
import { reactive, ref, toRefs, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { messureApi } from '@/request/services/messure'
import commonApi from '@/request/services/common'
import { transformArrayData } from '@/utils/index'
import MyContainer from '@/components/MyContainer.vue'
import MyTable from '@/components/MyTable.vue'
import MyPagination from '@/components/MyPagination.vue'
import MyDrawer from '@/components/MyDrawer.vue'
import MyForm from '@/components/MyForm.vue'
import ImportDialog from '@/components/ImportDialog.vue'
import moment from 'moment'
export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyDrawer,
    MyForm,
    ImportDialog,
  },
  setup() {
    const router = useRouter()
    const tenantList = ref([])
    const importModalShow = ref(false)
    const selectRowcount = ref(0)

    const formRecord = reactive({
      formRef: null,
      formData: {
        cardNo: '',
      },
      formItems: [
       {
          type: 'select',
          label: '所属公司',
          paramName: 'tenantId',
          options: tenantList,
          span: 8,
        },
        {
          type: 'input',
          label: '磁卡号',
          paramName: 'cardNo',
          span: 8,
          formItemClass: 'form-margin-right',
        },

         {
          type: 'select',
          label: '磁卡状态',
          paramName: 'status',
          options: [{
            label:'空闲',
            value:'1'
          },{
            label:'使用中',
            value:'2'
          },{
            label:'冻结',
            value:'3'
          },{
            label:'损毁遗失',
            value:'4'
          }],
  
          span: 8,
        },
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
        label: '所属公司',
        prop: 'tenantName',
        fixed: 'left',
      },
      {
        label: '磁卡号',
        prop: 'cardNo',
      },
      {
        label: '射频卡号',
        prop: 'cardIdNo',
      },
      {
        label: 'IC卡号',
        prop: 'cardIcNo',
      },
      {
        label: '业务类型',
        prop: 'businessType',
        formatter: (row) => {
          if (row.businessType == 1) {
            return `<span>销售</span>`
          } else if (row.businessType == 2) {
            return `<span>采购</span>`
          } else if (row.businessType == 3) {
            return `<span>短倒</span>`
          } else if (row.businessType == 4) {
            return `<span>其他</span>`
          } else {
            return `<span>——</span>`
          }
        },
      },
      {
        label: '创建人',
        prop: 'createUserName',
      },
      {
        label: '创建时间',
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
      {
        label: '使用人',
        prop: 'useUserName',
      },
      {
        label: '使用时间',
        prop: 'useTime',
        formatter: (row) => {
          if (row.useTime) {
            return `<span>${moment(row.useTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )}</span>`
          } else {
            return `<span>——</span>`
          }
        },
      },
      { label: '修改人', prop: 'updateUserName' },
      {
        label: '修改时间',
        prop: 'updateTime',
        formatter: (row) => {
          if (row.updateTime) {
            return `<span>${moment(row.updateTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )}</span>`
          } else {
            return `<span>——</span>`
          }
        },
      },
      {
        label: '磁卡状态',
        prop: 'status',
        formatter: (row) => {
          if (row.status == 1) {
            return `<span>空闲</span>`
          } else if (row.status == 2) {
            return `<span>使用中</span>`
          } else if (row.status == 3) {
            return `<span>冻结</span>`
          } else if (row.status == 4) {
            return `<span>损毁遗失</span>`
          } else {
            return `<span>——</span>`
          }
        },
      },
      {
        label: '操作',
        width: 180,
        fixed: 'right',
        operatetion: (row) => {
          if (row.status == 1) {
            return [
              {
                name: '冻结',
                style: { color: '#3C82FE' },
                onClick: onOperater.bind(this, row, 'freeze'),
              },
              {
                name: '置为空闲',
                isDisabled: true,
                style: { color: '#ccc' },
              },
              {
                name: '删除',
                style: { color: '#3C82FE' },
                onClick: onOperater.bind(this, row, 'del'),
              },
            ]
          } else if (row.status == 2) {
            return [
              {
                name: '冻结',
                style: { color: '#3C82FE' },
                onClick: onOperater.bind(this, row, 'freeze'),
              },
              {
                name: '置为空闲',
                style: { color: '#3C82FE' },
                onClick: onOperater.bind(this, row, 'free'),
              },
              {
                name: '删除',
                style: { color: '#3C82FE' },
                onClick: onOperater.bind(this, row, 'del'),
              },
            ]
          } else if (row.status == 3) {
            return [
              {
                name: '解冻',
                style: { color: '#3C82FE' },
                onClick: onOperater.bind(this, row, 'unfreeze'),
              },
              {
                name: '置为空闲',
                isDisabled: true,
                style: { color: '#ccc' },
              },
              {
                name: '删除',
                style: { color: '#3C82FE' },
                onClick: onOperater.bind(this, row, 'del'),
              },
            ]
          } else if (row.status == 4) {
            return [
              {
                name: '冻结',
                style: { color: '#3C82FE' },
                onClick: onOperater.bind(this, row, 'freeze'),
              },
              {
                name: '置为空闲',
                style: { color: '#3C82FE' },
                onClick: onOperater.bind(this, row, 'free'),
              },
              {
                name: '删除',
                isDisabled: true,
                style: { color: '#ccc' },
              },
            ]
          }
        },
      },
    ]
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
    const onOperater = (row, type) => {
      if (type == 'del') {
        ElMessageBox.confirm(
          `<strong>删除提示</strong><br/>
          确定删除?`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
          .then(() => {
            messureApi.calculateCardDel({ id: row.id }).then((result) => {
              const { code, message } = result
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
      } else {
        var status = ''
        if (type == 'freeze') {
          status = '冻结'
        } else if (type == 'unfreeze') {
          status = '解冻'
        } else if (type == 'free') {
          status = '置为空闲'
        }
        ElMessageBox.confirm(
          `<strong>${status}提示</strong><br/>
          确定${status}?`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
          .then(() => {
            messureApi
              .calculateEditStatus({
                id: row.id,
                status: type == 'freeze' && type != 'del' ? 3 : 1,
              })
              .then((result) => {
                const { code, message } = result
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
    }

    const onSearch = () => {
      getTableData()
    }
    const onReset = () => {
      // formRecord.formRef.clearForm()
      formRecord.formData = {
        cardNo: '',
      }
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
      let params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterSearch(),
        ...param,
      }
      console.log(params, 'tableParams')
      //接口todo
      const res = await messureApi.calculateCardList(params)
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

    const importIn = () => {
      importModalShow.value = true
    }
    const exportOut = () => {
      if (!selectRowcount.value.length) {
        ElMessage.warning('请选择要导出的数据')
        return
      }
      ElMessageBox.confirm(
        `<strong>导出磁卡管理数据</strong><br/>
        是否导出选中的磁卡管理数据?`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '导出',
          cancelButtonText: '取消',
          type: 'warning',
          [`close-on-click-modal`]: false,
        },
      )
        .then(async () => {
          const time = moment().format('YYYY-MM-DD HH:mm:ss')
          const ids = selectRowcount.value.map((item) => item.id)
          const res = await messureApi.calculatedownload(ids)
          let fileName = '磁卡管理'
          const _res = res
          let blob = new Blob([_res], {
            type: 'application/vnd.ms-excel;charset=utf-8',
          })
          let downloadElement = document.createElement('a')
          let href = window.URL.createObjectURL(blob) //创建下载的链接
          downloadElement.href = href
          downloadElement.download = time + `${fileName}.xls` //下载后文件名
          document.body.appendChild(downloadElement)
          downloadElement.click() //点击下载
          document.body.removeChild(downloadElement) //下载完成移除元素
          window.URL.revokeObjectURL(href) //释放掉blob对象
        })
        .catch(() => {})
    }
    const onImportFile = (params) => {
      let fd = new FormData()
      fd.append('file', params.file)
      messureApi.calculateimport(fd).then((res) => {
        if (res && res.code == 0) {
          ElMessage.success('导入成功！')
          getTableData()
        } else {
          ElMessage.error(res.message)
        }
      })
    }
    const onModalClose = (type) => {
      if (type == 'import') {
        importModalShow.value = false
      }
    }
    // 多选
    const handleSelectionChange = (val) => {
      selectRowcount.value = val
      console.log(selectRowcount.value.length)
    }
    return {
      ...toRefs(formRecord),
      ...toRefs(tableRecord),
      tableColumns,
      importModalShow,
      paginationChange,
      onSearch,
      onReset,
      importIn,
      onModalClose,
      exportOut,
      onImportFile,
      handleSelectionChange,
    }
  },
}
</script>
