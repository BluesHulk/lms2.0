<template>
  <MyDialog
    :visible="dialogVisible"
    title="分配账户权限"
    :width="750"
    @onUpdateDialogStatus="handleClose"
    :closeOnCloseModal="false"
  >
    <div class="accountAuthorityDialog-content">
      <div class="content-left">
        <el-tree 
          :data="treeData" 
          show-checkbox
          @check="check"
        />
      </div>
      <div class="content-right">
        <div class="right-title">已选（{{tags.length}}）:</div>
        <div>
          <el-tag
            v-for="item in tags"
            :key="item.id"
            class="tags-selected"
          >
            {{item.label}}
          </el-tag>

        </div>
      </div>
      
    </div>
    
    <template v-slot:footer>
      <el-button
        type="primary"
        @click="handleOk"
      >
        确定
      </el-button>
      <el-button @click="handleClose">取消</el-button>
    </template>
  </MyDialog>

</template>


<script>
import { reactive, ref, toRefs, onMounted,computed, watch } from 'vue';

import MyDialog from '@/components/MyDialog.vue';
import commonApi from '@/request/services/common';


export default {
  components: {
    MyDialog,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    } 
  },
  setup(props, { emit }) {
    const treeRecord = reactive({
      treeData: [],
      checked: [],
      tags: [],
      dialogVisible: false
    })

    const toTree = (data=[]) => {
      let tree = [] 
      function toItem(arr=[]) {
        return arr.map(item => {
          let obj = {
            label: item.name,
            id: item.id,
          }
          if(item.children && item.children.length>0) {
            obj.children = toItem(item.children)
          }
          return obj
        })
      }

      tree = toItem(data)
      // console.log(tree, "tree")
      return tree
    }

    const check = (val,all) => {
      const { checkedNodes=[] } = all
      // console.log(checkedNodes, "xx")
      treeRecord.tags = checkedNodes.filter(item => !item.children)
    }

    watch(()=>props.visible, (newVal) => {
      console.log(newVal,"nnnnn")
      treeRecord.dialogVisible = newVal
      
    });

    const handleOk = () => {
      emit("handleOk", treeRecord.tags);  
      treeRecord.dialogVisible = false   
    }
    const handleClose = () => {
      treeRecord.dialogVisible = false
      emit("handleClose", false);
    }

    onMounted(async()=>{
      const res = await commonApi.getDeptUserTreeList()
      treeRecord.treeData = toTree(res.data)
    })

    return {
      ...toRefs(treeRecord),
      check,
      handleOk,
      handleClose,
    }

  }
}
</script>

<style lang="scss" scoped>
  .accountAuthorityDialog-content {
    padding: 0 32px;
    display: flex;
    min-height: 300px;
    .content-left {
      width: 300px;
      padding-right: 24px;
      border-right: 1px solid #eee;
    }
    .content-right {
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

