<template>
  <el-dialog
    v-model="visible"
    title="专管部门"
    width="600px"
    custom-class="customer-dialog"
    @close="onClose"
    :close-on-click-modal="false"
    
  >
    <div class="modal-content">
      <div class="search">
        <el-input
          v-model="filterText"
          placeholder="搜索部门"
          :size="size"
        >
          <template #prefix>
            <i class="iconfont icon-sousuo"></i>
          </template>
        </el-input>
      </div>
      <!-- <div class="crumbs">陕西声威集团</div> -->
      <div class="tree-content">

        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="id"
          :check-strictly="true"
          show-checkbox
          @check-change="handleCheckChange"
          :filter-node-method="filterNode"
          :default-expand-all="true"
        />


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

    const defaultRecord = reactive({
      searchModel: {
        licensePlate: '',
      },
      treeRef: null,
      treeData: [],
      selectedItem: {}
    });
    const filterText = ref('')

    const getTree = async () => {
      const res = await commonApi.getDeptTree()
      defaultRecord.treeData = toTree(res.data)
    }

    const toTree = (data=[]) => {
      let tree = [] 
      function toItem(arr=[]) {
        return arr.map(item => {
          let obj = {
            label: item.name,
            id: item.id,
          }
          if(item.children && item.children.length>0) {
            obj.disabled = true
            obj.children = toItem(item.children)
          }
          return obj
        })
      }

      tree = toItem(data)
      // console.log(tree, "tree")
      return tree
    }

    onMounted(async() => {
      getTree()
    });

    const handleCheckChange = (val) => {
      // if(val.disabled) return
      defaultRecord.treeRef.setCheckedKeys([]);
      defaultRecord.treeRef.setChecked(val, true)
      defaultRecord.selectedItem = val
    }

    // const filterNode = (value, data) => {
    //   if (!value) return true
    //   return data.label.includes(value)
    // }



    const onClose = () => {
      emit('onClose',false)
    };

    const onSubmit = () => {
      emit("onSelected", defaultRecord.selectedItem);
      onClose();
    };

    watch(filterText, (val) => {
      defaultRecord.treeRef.filter(val)
    })

    const filterNode = (value, data) => {
      // console.log(value, data,"xxx")
      if (!value) return true
      return data.label.includes(value)
    }



    return {
      ...toRefs(defaultRecord),
      onClose,
      onSubmit,
      handleCheckChange,
      filterText,
      filterNode,
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