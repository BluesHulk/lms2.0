<template>
  <el-dialog
    v-model="visible"
    title="专管业务员"
    width="600px"
    custom-class="customer-dialog"
    @close="onClose"
    :close-on-click-modal="false"
  >
    <div class="modal-content">
      <div class="search">
        <el-input
          v-model="filterText"
          placeholder="搜索人员"
          :size="size"
        >
          <template #prefix>
            <i class="iconfont icon-sousuo"></i>
          </template>
        </el-input>
      </div>

      <div class="tree-content">
        <el-radio-group v-model="selected">
          <el-radio 
            v-for="item in showList"
            :label="item.id"
          >{{item.userName}}</el-radio>
        </el-radio-group>
      </div>   
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script>
import {
  computed,
  watch,
  watchEffect,
  ref,
  reactive,
  toRefs,
  onMounted,
} from "vue";
import commonApi from "@/request/services/common";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {

    const filterText = ref('')

    const defaultRecord = reactive({
      searchModel: {
        licensePlate: '',
      },
      list: [],
      showList: [],
      selected:'',  
    });

    const getList = async() => {
      const res = await commonApi.getSalesmanList()
      defaultRecord.list = res.data
      defaultRecord.showList = res.data
    }

    onMounted(async() => {
      getList()
    });


    const onClose = () => {
      emit('onClose',false)
    };

    const onSubmit = () => {
      const obj = defaultRecord.list.find(item => 
        item.id == defaultRecord.selected)
      emit("onSelected", obj);
      onClose();
    };

    watch(filterText, (value) => {
      defaultRecord.showList = defaultRecord.list.filter(item => 
        item.userName.toLowerCase().includes(value.toLowerCase())
      )
    })


    return {
      ...toRefs(defaultRecord),
      onClose,
      onSubmit,
      filterText,
    };
  },
};
</script>
<style lang="scss" scoped>
.modal-content {
  padding: 0 24px;
  .search {
    margin-bottom: 24px;
  }
  .crumbs {
    margin-bottom: 24px;
    font-size: 16px;
    line-height: 22px;
  }
  .tree-content {
    min-height: 200px;
    ::v-deep {
      .el-tree-node__expand-icon {
        position: absolute;
        right: 0;
      }
      // .el-tree-node__expand-icon::after {
      //   content: 'icon-jxiaji';
      // }
    }
  }
  
}
</style>