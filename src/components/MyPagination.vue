<template>
  <div class="my-pagination-container" id="my-pagination-container">
    <el-pagination
      v-model:current-page="state.currentPage"
      v-model:page-size="state.pageSize"
      :page-sizes="pageSizes"
      :background="background"
      :layout="layout"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>
  </div>
</template>

<script>
import { reactive, getCurrentInstance, watch } from 'vue';

export default {
  name: "MyPagination",
  props: {
    pageSizes: {
      type: Array,
      default: () => [10, 20, 30],
    },
    background: {
      type: Boolean,
      default: true,
    },
    layout: {
      type: String,
      default: "total, sizes, prev, pager, next, jumper",
    },
    total: [Number, String],
    queryData: {
      type: Object,
      default: () => ({currentPage: 1, pageSize: 10})
    }
  },
  setup(props, { emit }) {

    const handleSizeChange = () => {
      state.currentPage = 1;
    }

    const handleCurrentChange = () => {
      
    }

    const { proxy } = getCurrentInstance()

    const state = reactive({
      currentPage: proxy.queryData.currentPage,
      pageSize: proxy.queryData.pageSize,
    })

    watch(state, newVal => {
      emit('paginationChange', newVal);
    })

    watch(
      () => props.queryData,
      (newVal) => {
        state.currentPage = newVal.currentPage;
        state.pageSize = newVal.pageSize;
      },
      {
        deep: true,
      }
    );

    return {
      handleSizeChange,
      handleCurrentChange,
      state,
    }
  },
};
</script>

<style lang="scss" scoped>
  .my-pagination-container {
    display: flex;
    justify-content: center;

    ::v-deep {
      .btn-prev, .btn-next {
        background: #fff;
        border-radius: 6px;
        border: 1px solid #C0CCDA;
      }
      .el-pager {
        .number {
          background: #fff;
          border-radius: 6px;
          border: 1px solid #C0CCDA;
        }
        .is-active {
          border: none;
        }
        .more {
          background: none;
        }
      }
    }
    
  }
</style>