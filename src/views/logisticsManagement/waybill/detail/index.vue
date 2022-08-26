<template>
  <JDetailContainer>
    <div class="btns">
      <el-button>新增子账户</el-button>
      <el-button>信用借款</el-button>
    </div>
    <div>
      
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

  </JDetailContainer>

</template>

<script>
import { reactive, ref, toRefs } from 'vue';
import { useRouter } from 'vue-router'
import MyContainer from '@/components/MyContainer.vue';
import MyTable from '@/components/MyTable.vue';
import MyPagination from '@/components/MyPagination.vue';
import MyDrawer from '@/components/MyDrawer.vue';
import MyForm from '@/components/MyForm.vue';
import JDetailContainer from '@/components/JDetailContainer.vue';

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyDrawer,
    MyForm,
    JDetailContainer,
  },
  setup() {

    const tableRecord = reactive({
      tableRef: null,
      tableData: [{}, {}],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      selectedRows: [],
    })
    const tableColumns = [
      { label: '序号', prop: 'num', width: 60 },
      {
        label: '银行账号',
        prop: 'account',
        formatter: (row) => {
          return `<div class="table-column-content"><span class="account-box">${row.account}</span>${row.isDefault && '<span class="default-box">默认</span>' || ''}</div>`
        }
      },
      { label: '账户名', prop: 'accountName' },
      { label: '大行', prop: 'accountBank' },
      { label: '开户支行', prop: 'accountBranch' },
      {
        label: '状态',
        prop: 'accountStatus',
        width: 80,
        formatter: (row) => (
          `<span class="status-label" style="background: ${row.accountStatus == 1 ? '#32D231' : '#FF3B30'};"></span>${{ 1: '启用', 2: '停用' }[row.accountStatus]}`
        )
      },
      { label: '备注', prop: 'description', width: 150 },
      {
        label: '操作',
        width: 120,
        operatetion: (row) => {
          return [
            { 
              name: '详情', 
              style: {color: '#239cff'}, 
              onClick: onDetail.bind(this, '编辑') 
            },
          ]
        }
      },
    ];

    const onDetail = () => {
      router.push({
        name: 'purchaseDetail'
      })
    }
  
    return {
       ...toRefs(tableRecord),
      tableColumns,
      
    }

  }
}
</script>