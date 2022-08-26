<template>
  <div class="input-box" @click="onShow">
    <div class="item-list" v-if="selectNames.length">
      <template v-for="(item, index) in selectNames" :key="index">
        <span class="item" v-if="index < 2">{{ item }}</span>
      </template>
      <span class="item" v-if="selectNames.length > 2">...</span>
    </div>
    <div v-else class="placeholder-box">请选择</div>
    <i class="iconfont icon-sousuo"></i>
  </div>

  <teleport to="body">
    <el-dialog
      v-model="visible"
      :title="modalTitle"
      :before-close="onClose"
      width="650px"
      custom-class="customer-dialog"
    >
      <div class="customer-content">
        <div class="content-left">
          <div class="header" v-if="$slots.header">
            <slot name="header"></slot>
          </div>
          <div class="search">
            <el-input v-model="filterText" placeholder="搜索名称" :size="size">
              <template #prefix>
                <i class="iconfont icon-sousuo"></i>
              </template>
            </el-input>
          </div>

          <div class="listtree">
            <el-tree
              v-if="visible"
              ref="treeRef"
              class="filter-tree"
              :data="treeData"
              :props="defaultProps"
              default-expand-all
              :check-strictly="true"
              :filter-node-method="filterNode"
              @check-change="checkChange"
              :default-checked-keys="selectIds"
              show-checkbox
              node-key="id"
            />
          </div>
        </div>
        <div class="content-right">
          <div class="right-title">已选（{{ selectNames.length }}）:</div>
          <div>
            <el-tag
              v-for="(item, index) in selectNames"
              :key="index"
              class="tags-selected"
            >
              {{ item }}
            </el-tag>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onClose">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定选择</el-button>
        </span>
      </template>
    </el-dialog>
  </teleport>
</template>

<script>
import { ref, reactive, toRefs, watch, onMounted } from "vue";

export default {
  props: {
    size: {
      type: String,
    },
    modalTitle: {
      type: String,
      default: "选择",
    },
    defaultSelectNames: {
      type: Array,
      default: [],
    },
    defaultProps: {
      type: Object,
      default: () => {
        return {
          children: "children",
          label: "label",
        };
      },
    },
    treeData: {
      type: Array,
      default: [],
    },
    selectIds: {
      type: Array,
      default: [],
    },
  },
  setup(props, { emit }) {
    const treeRef = ref(null);
    const filterText = ref("");
    const defaultRecord = reactive({
      visible: false,
      selectNames: [],
    });
    defaultRecord.selectNames = props.defaultSelectNames;
    const onShow = () => {
      defaultRecord.visible = true;
    };

    const onClose = () => {
      defaultRecord.visible = false;
      filterText.value = "";
      defaultRecord.selectNames = props.defaultSelectNames;
    };

    const onSubmit = () => {
      let selectTree = treeRef.value.getCheckedNodes();
      defaultRecord.selectNames = selectTree.map((item) => {
        return item.label;
      });
      console.log(defaultRecord.selectNames, "defaultRecord.selectNames");
      emit("onTreeChange", selectTree);
      defaultRecord.visible = false;
      filterText.value = "";
    };

    const checkChange = (item, node) => {
      let selectTree = treeRef.value.getCheckedNodes();
      defaultRecord.selectNames = selectTree.map((item) => {
        return item.label;
      });
    };

    const filterNode = (value, data) => {
      let treeData = data.label;
      if (!value) return true;
      return treeData.indexOf(value) !== -1;
    };

    watch(filterText, (val) => {
      treeRef.value.filter(val);
    });

    watch(
      () => props.defaultSelectNames,
      (val) => {
        defaultRecord.selectNames = val;
      }
    );

    return {
      treeRef,
      ...toRefs(defaultRecord),
      onShow,
      onClose,
      onSubmit,
      filterNode,
      filterText,
      checkChange,
    };
  },
};
</script>
<style lang="scss" scoped>
.input-box {
  display: flex;
  padding: 0 8px;
  width: 100%;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;

  .item-list {
    display: flex;
    align-items: center;
    .item {
      display: inline-block;
      padding: 0 4px;
      max-width: 100px;
      height: 22px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #239cff;
      background: #f2f9ff;
      line-height: 22px;
      border-radius: 4px;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:not(:last-child) {
        margin-right: 5px;
      }
    }
  }

  .placeholder-box {
    color: #a8abb2;
  }

  .iconfont {
    font-size: 16px;
    color: #ccc;
  }
}
.customer-content {
  padding: 0 24px;
  display: flex;
  height: 300px;

  .content-left {
    width: 60%;
    padding-right: 24px;
    box-sizing: border-box;
    .search {
      margin-bottom: 20px;
      ::deep {
        .el-form-item.is-error .el-input__inner {
          border-color: #aaa;
        }
      }
    }
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 18px;
      .subTitle {
        color: #909399;
      }
    }
    .listtree {
      height: 200px;
      overflow-y: auto;
    }
  }
  .content-right {
    width: 40%;
    padding-left: 24px;
    .right-title {
      margin-bottom: 12px;
    }
    .tags-selected {
      margin-right: 10px;
    }
  }
}
</style>
<style lang="scss" >
.el-overlay {
  .customer-dialog {
    border-radius: 4px;

    .el-dialog__header {
      padding: 15px 24px;
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #3a3a3a;
    }
    .el-dialog__body {
      padding: 24px 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
  }
}
</style>
