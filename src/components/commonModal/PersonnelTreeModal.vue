<template>
  <MyDialog
    :visible="visible"
    :title="modalTitle"
    :width="568"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="tree-box">
      <el-input
        v-model="filterText"
        :placeholder="placeholder"
        style="margin-bottom: 15px"
      >
        <template #suffix>
          <div>
            <i class="iconfont icon-sousuo"></i>
          </div>
        </template>
      </el-input>

      <el-tree
        ref="treeRef"
        class="filter-tree"
        :data="treeData"
        show-checkbox
        node-key="id"
        default-expand-all
        :check-strictly="true"
        :props="defaultProps"
        :filter-node-method="filterNode"
        @check-change="checkChange"
      >
        <template #default="{ data }">
          <div class="tree-info">
            <div class="flex-one">
              {{ data.name || data.userName || data.categoryName }}
            </div>
            <span v-if="data.pid == 0" class="flex-inline color-cur">
              <i class="iconfont icon-zongbu"></i>
              下级
            </span>
          </div>
        </template>
      </el-tree>
    </div>
    <template v-slot:footer>
      <el-button type="primary" @click="onSubmit" :loading="loadingTree">
        确定
      </el-button>
      <el-button @click="onModalClose">关闭</el-button>
    </template>
  </MyDialog>
</template>

<script>
import { reactive, ref, toRefs, watch } from "vue";
import commonApi from "@/request/services/common";
import MyDialog from "@/components/MyDialog.vue";

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: "",
    },
    placeholder: {
      type: String,
      default: "搜索人员",
    },
  },
  components: {
    MyDialog,
  },
  setup(props, { emit }) {
    const filterText = ref();

    watch(filterText, (val) => {
      treeRecord.treeRef.filter(val);
    });
    const filterNode = (value, data) => {
      let treeData = data.name || data.categoryName || data.userName;
      if (!value) return true;
      return treeData.indexOf(value) !== -1;
    };

    const treeRecord = reactive({
      treeRef: null,
      treeData: {},
      defaultProps: {},
      checkData: {},
    });

    const getTreeData = () => {
      commonApi.getDeptUserTreeList().then((res) => {
        if (res && res.code == 0) {
          treeRecord.treeData = res.data;
          treeRecord.defaultProps.disabled = (data) => data.type == 0;
        }
      });
    };
    getTreeData();

    const checkChange = (item, node) => {
      console.log(item, node);
      if (node == true) {
        //点击未选中复选框
        treeRecord.checkData = item;
        treeRecord.treeRef.setCheckedKeys([item.id]);
      } else {
        if (treeRecord.checkData.id == item.id) {
          //点击已选中复选框，保证至少一个选中
          treeRecord.treeRef.setCheckedKeys([]);
        }
      }
    };

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        onModalClose();
      }
    };

    const onSubmit = () => {
      emit("onSelected", treeRecord.checkData);
      onModalClose();
    }

    const onModalClose = () => {
      emit("onClose");
    };

    return {
      filterText,
      ...toRefs(treeRecord),
      filterNode,
      checkChange,
      onUpdateDialogStatus,
      onSubmit,
      onModalClose
    };
  },
};
</script>

<style lang="scss" scoped>
.tree-box {
  padding: 0 24px;

  .filter-tree {
    .tree-info {
      display: flex;
      width: 100%;
      justify-content: space-between;
    }
  }
}
.filter-tree > .el-tree-node > .el-tree-node__content .el-checkbox {
  display: none;
}
</style>