<template>
  <MyContainer>

    <template #header>
      <el-button type="primary" @click="onEdit('add')">新增</el-button>
    </template>

    <template #header-right>
      <el-input-number
        v-model="searchParams.startTonnage"
        placeholder="请输入起始吨位"
        style="margin-right: 12px;min-width: 180px"
        controls-position="right"
        precision="2"
      ></el-input-number>
      <el-select
        v-model="searchParams.tenantId"
        placeholder="请选择所属公司"
        style="margin-right:12px;min-width: 180px"
        clearable
      >
        <el-option
          v-for="item in tenantList"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
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
        <template v-slot:usedRatio>
          <el-checkbox-group v-model="formData.usedRatio">
            <el-checkbox 
              label="E"
              style="margin-left: -130px;"
            >
              按比例计算：按比例计算时0.01即为1%；以KG为单位
            </el-checkbox>
          </el-checkbox-group>
          
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

</template>

<script>
import { reactive, ref, toRefs, onMounted, computed } from 'vue';
import { useStore } from "vuex";
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
    const homeInfo = sessionStorage.getItem('homeInfo')?
      JSON.parse(sessionStorage.getItem('homeInfo')): {}

    const filterRecord = reactive({
      searchParams: {
        tenantId: Number(homeInfo.tenantId)
      },
      // filterItems: [
      //   {
      //     type: "input",
      //     label: "起始吨位",
      //     paramName: "startTonnage",
      //     span: 8,
      //   },
      //   {
      //     type: "select",
      //     label: "公司名称",
      //     paramName: "tenantId",
      //     options: tenantList,
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
      filterRecord.searchParams = {
        tenantId: Number(homeInfo.tenantId)
      }
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
          type: 'select',
          label: '所属公司',
          paramName: 'tenantId',
          options: tenantList,
          disabled: true,
        },
        {
          type: 'input',
          label: '起始吨位',
          maxlength: 10,
          paramName: 'startTonnage',
        },
        {
          type: 'input',
          label: ' 结束吨位',
          maxlength: 10,
          paramName: 'endTonnage',
        },
        {
          type: 'input',
          label: '正误差',
          maxlength: 10,
          paramName: 'errValuePlus',
        },
        {
          type: 'input',
          label: '负误差',
           maxlength: 10,
          paramName: 'errValueMinus',
        },
        {
          type: 'labelBlank',
          slotName: 'usedRatio'
        },
        // {
        //   type: 'checkbox',
        //   label: '按比例计算',
        //   paramName: 'usedRatio',
        //   options: [
        //     {
        //       label: '比例计算时0.01即为1%；以KG为单位',
        //       value: 'E'
        //     },
        //   ]
        // }
      ],
      formRules: {
        tenantId: [
          config.rules({type: 'required'}),
        ],
        startTonnage: [ 
          config.rules({type: 'required'}),
          {pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/,message:'数字，保留两位小数',trigger:'blur'}
        ], 
        endTonnage: [ 
          config.rules({type: 'required'}),
          {pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/,message:'数字，保留两位小数',trigger:'blur'}
        ], 
        errValuePlus: [ 
          config.rules({type: 'required'}),
          config.rules({type: 'intrger'}),
        ], 
        errValueMinus: [ 
          config.rules({type: 'required'}),
          config.rules({type: 'intrger'}),
        ], 
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
      { label: '所属公司', prop: 'tenantName' },
      { label: '起始吨位', prop: 'startTonnage' },
      { label: '结束吨位', prop: 'endTonnage' },
      { label: '正误差', prop: 'errValuePlus' },
      { label: '负误差', prop: 'errValueMinus'},
      { label: '按比例计算', prop: 'usedRatio',
        formatter: (row) => {
          // return row.usedRatio=="E"? '1%': ''
          if(row.usedRatio=="E") {
            return '1%'
          } else {
            return row.usedRatio
          }
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

      // console.log(params,"ppp")

      const res = await ladderErrorApi.getTableData(params)
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
          tenantId: row.tenantId,
          startTonnage: row.startTonnage,
          endTonnage: row.endTonnage,
          errValueMinus: row.errValueMinus,
          errValuePlus: row.errValuePlus,
          usedRatio: row.usedRatio=='E'?['E']:[],
        }
        // console.log(row)
      } else {
        const homeInfoStr = sessionStorage.getItem('homeInfo')
        const homeInfoObj = JSON.parse(homeInfoStr) || {}
        formRecord.formData ={
          tenantId: Number(homeInfoObj.tenantId) || ''
        }
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
        const res = await ladderErrorApi.deleteItem(id)
        if(res.code==0) {
          ElMessage.success("操作成功！");
          getTableData()
        }
      }
    }

    const toParmas = () => {
      let params = {...formRecord.formData}
      const obj = tenantList.value.filter(i=> 
        i.id ==formRecord.formData.tenantId)[0]
        
      params.tenantName = obj.name
      
      if(params.usedRatio && params.usedRatio.length>0) {
        params.usedRatio = 'E'
        params.errValueRatio = '1.00'
      } else {
        params.usedRatio = 'N'
        params.errValueRatio = ''
      }
      // console.log(params)
      return params

    }

    const onSubmit = async() => {
      const result = await formRecord.formRef.submitForm()
      if(!result) return 
      const params = toParmas()
      let res = null
      if(formRecord.formType == 'edit') {
        res = await ladderErrorApi.editItem(params)
      } else {
        res = await ladderErrorApi.addItem(params)
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
      tenantList,
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