<template>
  <ListSelect
    :modalTitle="modalTitle"
    :treeData="treeData"
    :selectIds="formData.ids"
    :defaultSelectNames="formData.names"
    @onTreeChange="onSelectedChange"
  >
    <template
      v-for="(slotName, index) in slotList"
      v-slot:[slotName]
      :key="index"
    >
      <slot :name="slotName"></slot>
    </template>
  </ListSelect>
</template>

<script>
import { reactive, toRefs, watch } from "vue";
import ListSelect from "@/components/ListSelect.vue";
import commonApi from "@/request/services/common";

export default {
  props: {
    slotList: {
      type: Array,
    },
    modalTitle: {
      type: String,
      default: "选择",
    },
    type: {
      type: [Number, String],
    },
    data: {
      type: Array,
      default: [],
    },
  },
  components: {
    ListSelect,
  },
  setup(props, { emit }) {
    const treeRecord = reactive({
      treeData: {},
      dataList: [],
    });

    const handleData = (data) => {
      data.map((item) => {
        item.label = item.name;
        item.disabled = item.type == 0;

        treeRecord.dataList.push(item);

        if (item.children) {
          handleData(item.children);
        }
      });
      return data;
    };

    const getTreeData = () => {
      commonApi.getDeptUserTreeList().then((res) => {
        if (res && res.code == 0) {
          treeRecord.treeData = handleData(res.data);
        }
      });
    };
    getTreeData();

    const formRecord = reactive({
      formData: {},
    });

    const onSelectedChange = (val) => {
      const ids = [],
        names = [];
      val.map((item) => {
        ids.push(item.id);
        names.push(item.name);
      });
      formRecord.formData.ids = ids;
      formRecord.formData.names = names;

      emit("getSelected", val);
    };

    watch(
      () => [props.data, treeRecord.dataList],
      ([val, dataList]) => {
        formRecord.formData.ids = val;
        if (val.length && dataList.length) {
          const names = [];
          dataList.map(item => {
            for(let i = 0; i < val.length; i++) {
              if(val[i] == item.id) {
                names.push(item.label);
              }
            }
          })
          formRecord.formData.names = names;
        } 
        if (!val.length) {
          formRecord.formData.names = [];
        }
      },
      {
        immediate: true,
        deep: true
      }
    );

    return {
      ...toRefs(treeRecord),
      ...toRefs(formRecord),
      onSelectedChange,
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