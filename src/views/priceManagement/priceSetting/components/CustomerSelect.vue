<template>
    <el-dialog
      v-model="modalVisible"
      :title="modelTitle"
      :before-close="onClose"
      width="650px"
      custom-class="customer-dialog"
    >
      <div class="customer-content">
        <div class="content-left">
          <div class="header">
            <slot name="header"></slot>
          </div>
          <div class="search">
            <el-input v-model="filterText" placeholder="搜索名称" >
              <template #prefix>
                <i class="iconfont icon-sousuo"></i>
              </template>
            </el-input>
          </div>

          <div class="listtree">
            <el-tree
            v-if="modalVisible"
              ref="treeRef"
              class="filter-tree"
              :data="treeData"
              :props="defaultProps"
              default-expand-all
              :check-strictly="true"
              :filter-node-method="filterNode"
              @check-change="checkChange"
              show-checkbox
              node-key="id"
            />
          </div>
        </div>
        <div class="content-right">
        <div class="right-title">已选（{{selectNames.length}}）:</div>
        <div>
          <el-tag
            v-for="(item,index) in selectNames"
            :key="index"
            class="tags-selected"
          >
            {{item}}
          </el-tag>

        </div>
      </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onClose" size="small">取消</el-button>
          <el-button type="primary" size="small" @click="onSubmit"
            >确定分配</el-button
          >
        </span>
      </template>
    </el-dialog>
</template>

<script>
import { ref, reactive, toRefs, watch ,onMounted,computed} from "vue";

export default {
  props: {
    visible:{
      type:Boolean,
      default:false
    },
    modelTitle: {
      type: String,
      default: "选择",
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
  },
  setup(props, { emit }) {
    const treeRef = ref(null);
    const filterText = ref("");
    const defaultRecord = reactive({
      selectNames:[]
    });

    const onClose = () => {
      filterText.value=""
      defaultRecord.selectNames=[]
      emit("customerClose");

    };

    const onSubmit = () => {
      let selectTree = treeRef.value.getCheckedNodes()
      emit("onTreeChange", selectTree);
      onClose()
    };

    const checkChange = (item, node) => {
       let selectTree = treeRef.value.getCheckedNodes()
      defaultRecord.selectNames=selectTree.map(item=>{
        return item.label
      })
    };

    const filterNode = (value, data) => {
      let treeData = data.label;
      if (!value) return true;
      return treeData.indexOf(value) !== -1;
    };

    watch(filterText, (val) => {
      treeRef.value.filter(val);
    });


     

    return {
      treeRef,
      ...toRefs(defaultRecord),
      modalVisible:computed(()=>props.visible),
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
