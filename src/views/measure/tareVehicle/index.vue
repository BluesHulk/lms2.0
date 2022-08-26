<template>
  <MyContainer>

    <template #header>
      <el-button type="primary" @click="onEdit('add')">新增</el-button>
    </template>

    <template #header-right>
      <el-input
        v-model="searchParams.licensePlate"
        placeholder="请输入车牌号"
        style="margin-right: 12px"
      ></el-input>
      <el-button type="primary" @click="onSearch">搜索</el-button>
      <el-button @click="onReset">重置</el-button>
    </template>
  
    <!-- <MyMultipleFilter
      :formItems="filterItems"
      @onSearch="onSearch"
      :formData="searchParams"
    >
    </MyMultipleFilter> -->
  
    <MyTable
      className="custom-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
      @handleSelectionChange="handleSelectionChange"
    />
    <MyPagination
      :total="tableTotal"
      :queryData="pageParams"
      @paginationChange="paginationChange"
    />
    
  </MyContainer>

  <MyDialog
    :visible="formShow"
    :title="formTitle"
    :width="568"
    @onUpdateDialogStatus="onClose"
  >
    <div class="form-content">
      <MyForm
        ref="formRef"
        :formItems="formItems"
        :rules="formRules"
        :formData="formData"
        @submitForm="submitForm"
        @onFormItemChange="onFormItemChange"
      >
        <template v-slot:licensePlate>
          <el-input
            v-model="formData.licensePlate"
            @click="openCarModal" 
            readonly
          >
            <template #suffix>
              <i class="iconfont icon-a-16search"></i>
            </template>
          </el-input>
        </template>
        <template v-slot:driverName>
          <el-input
            v-model="formData.driverName"
            @click="openDriverModal" 
            readonly
          >
            <template #suffix>
              <i class="iconfont icon-a-16search"></i>
            </template>
          </el-input>
        </template>
      </MyForm>
    </div>
    <template v-slot:footer>
      <el-button type="primary" @click="onSubmit" :loading="subLoading">
        提交
      </el-button>
      <el-button @click="onClose">取消</el-button>
    </template>
  </MyDialog>

  <CarModal 
    :visible="carModalVisible"
    @onClose="closeCarModal"
    @onSelected="selectedCarModal"
  />
  <DriverModal 
    :visible="driverModalVisible"
    @onClose="closeDriverModal"
    @onSelected="selectedDriverModal"
  />

</template>

<script>
import { reactive, ref, toRefs, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import commonApi from '@/request/services/common'
import { tareVehicleApi } from '@/request/services/messure'
import { transformArrayData } from '@/utils/index';
import MyContainer from '@/components/MyContainer.vue';
import MyTable from '@/components/MyTable.vue';
import MyPagination from '@/components/MyPagination.vue';
import MyDrawer from '@/components/MyDrawer.vue';
import MyForm from '@/components/MyForm.vue';
import MyDialog from '@/components/MyDialog.vue';
import MyMultipleFilter from '@/components/MyMultipleFilter.vue';
import CustomerSelect from '@/components/CustomerSelect.vue';
import CarModal from '@/components/commonModal/CarModal.vue';
import DriverModal from '@/components/commonModal/DriverModal.vue';
import config from "@/utils/config";
import { ElMessage, ElMessageBox } from "element-plus";
import moment from 'moment';


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
    CarModal,
    DriverModal,
  },
  setup() {
    const router = useRouter()

    const carModalVisible = ref(false)
    const openCarModal = () => {
      carModalVisible.value = true
    }
    const closeCarModal = () => {
      carModalVisible.value = false
    }
    const selectedCarModal =(val) => {
      formRecord.formData.licensePlate = val.licensePlate
    }
    const driverModalVisible = ref(false)
    const openDriverModal = () => {
      driverModalVisible.value = true
    }
    const closeDriverModal = () => {
      driverModalVisible.value = false
    }
    const selectedDriverModal =(val) => {
      formRecord.formData.driverName = val.driverName
    }

    const filterRecord = reactive({
      searchParams: {},
      // filterItems: [
      //   {
      //     type: "input",
      //     label: "车牌号",
      //     paramName: "licensePlate",
      //     span: 8,
      //   },
      // ],
    })

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      // filterRecord.searchParams = val;
      getTableData()
    }
    const onReset = () => {
      tableRecord.pageParams.currentPage = 1;
      filterRecord.searchParams={}
      getTableData()
    }

    const formRecord = reactive({
      formShow: false,
      formType: 'add',
      formTitle: '新增',
      formRef: null,
      formData: {},
      formItems: [
        {
          // type: 'input',
          type: 'labelBlank',
          label: '车牌号',
          paramName: 'licensePlate',
          slotName: "licensePlate",
        },
        {
          // type: 'input',
          type: 'labelBlank',
          label: '司机',
          paramName: 'driverName',
          slotName: "driverName",
        },
        {
          type: 'input',
          label: '历史皮重（吨）',
          paramName: 'tareWeight',
        },
      ],
      formRules: {
        licensePlate: [
          config.rules({type: 'required'}),
        ],
        driverName: [
          config.rules({type: 'required'}),
        ],
        tareWeight: [
          {pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/,message:'数字，保留两位小数',trigger:'blur'}
        ]
      }
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
      { label: '序号', prop: 'num', width: 60, fixed:'left' },
      { label: '车牌号', prop: 'licensePlate' },
      { label: '司机', prop: 'driverName' },
      { label: '车辆皮重（吨）', prop: 'tareWeight' },
      { label: '创建人', prop: 'createUserName' },
      { label: '创建时间', prop: 'createTime',
        formatter: (row) => {
          return moment(row.createTime).format('YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        label: '操作',
        width: 150,
        fixed: 'right',
        operatetion: (row) => {
          return [
            { 
              name: '编辑', 
              style: {color: '#239cff'}, 
              onClick: onEdit.bind(this, 'edit',row) 
            },
            { 
              name: '删除', 
              style: {color: '#239cff'}, 
              onClick: onDelete.bind(this, row.id) 
            },
          ]
        }
      },
    ];

    
    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return
      }
      tableRecord.pageParams = { ...data }
      getTableData()
    }

    const getTableData = async(data={}) => {
      let params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchParams,
        ...data
      }
      const res = await tareVehicleApi.getTableData(params)
      if (res && res.code == 0) {
        tableRecord.tableTotal = res.data.total;
        tableRecord.tableData = transformArrayData(
          res.data.records,
          true,
          true,
          tableRecord.pageParams.currentPage,
          tableRecord.pageParams.pageSize,
        )
      }
    }


    onMounted(async()=>{
      await getTableData()
    })

    const onEdit = (type, row) => {
      formRecord.formShow= true
      formRecord.formType= type
      formRecord.formTitle = type=='edit'? '编辑':'新增'

      if(type=='edit') {
        formRecord.formData = {
          id: row.id,
          licensePlate: row.licensePlate,
          driverName: row.driverName,
          tareWeight: row.tareWeight,
        }
      } else {
        formRecord.formData ={}
      }
    }
    const onDelete = async(id) => {
      const result = await ElMessageBox.confirm(
        `<strong>提示</strong><br/>
          确定要删除此条数据吗？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result=="confirm") {
        const res = await tareVehicleApi.deleteItem(id)
        if(res.code==0) {
          ElMessage.success("操作成功！");
          getTableData()
        } else {
          ElMessage.error(res.message);
        }
      }
    }

    const toParmas = () => {
      let params = formRecord.formData
      return params

    }

    const onSubmit = async() => {
      const result = await formRecord.formRef.submitForm()
      if(!result) return 
      const params = toParmas()
      let res = null
      if(formRecord.formType == 'edit') {
        res = await tareVehicleApi.editItem(params)
      } else {
        res = await tareVehicleApi.addItem(params)
      }
      if(res && res.code == 0) {
        ElMessage.success("操作成功！");
        formRecord.formShow= false
        getTableData()
      } else {
        ElMessage.error(res.message);
      }
    }

    const onClose = () => {
      formRecord.formShow= false
    }

    

    return {
      ...toRefs(formRecord),
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      tableColumns,
      paginationChange,
      onSearch,
      onReset,
      onEdit,
      onSubmit,
      onClose,
      carModalVisible,
      openCarModal,
      closeCarModal,
      selectedCarModal,
      driverModalVisible,
      openDriverModal,
      closeDriverModal,
      selectedDriverModal,
    }

  }
}
</script>

<style lang="scss" scoped>
  .form-content {
    padding: 0 24px;
    box-sizing: border-box;
  }
</style>