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
import ListSelect from "@/components/ListSelect.vue";
import commonApi from "@/request/services/common";
import { reactive, toRefs, watch } from "vue";
export default {
  components: {
    ListSelect,
  },
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
    }
  },
  setup(props, { emit }) {
    const typeOptions = [
      { label: "全部", value: "" },
      { label: "客商", value: 1 },
      { label: "供应商", value: 2 },
      { label: "承运商", value: 3 },
    ];

    const defaultRecord = reactive({
      type: props.type,
      treeData: [],
    })
    const getCustomerList = () => {
      let params = {};
      if (defaultRecord.type) {
        params.type = defaultRecord.type;
      }
      commonApi.getCustomerList(params).then(res => {
        if(res && res.code == 0) {
          res.data.map(item => {
            item.label = item.name;
          })
          defaultRecord.treeData = res.data;
        }
      })
    };
    getCustomerList();

    const formRecord = reactive({
      formData: {},
    });

    const onSelectedChange = (val) => {
      const ids = [], names = [];
      val.map(item => {
        ids.push(item.id);
        names.push(item.name);
      })
      formRecord.formData.ids = ids;
      formRecord.formData.names = names;

      emit("getSelected", val);
    };
    
    watch(
      () => [props.data, defaultRecord.treeData],
      ([val, treeData]) => {
        formRecord.formData.ids = val;
        if (val.length && treeData.length) {
          const names = [];
          treeData.map(item => {
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
      typeOptions,
      ...toRefs(defaultRecord),
      ...toRefs(formRecord),
      onSelectedChange,
    };
  },
};
</script>