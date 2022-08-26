<template>
  <el-input v-model="inputShow" @click="onShow" :size="size" readonly>
    <template #suffix>
      <i class="iconfont icon-a-16search"></i>
    </template>
  </el-input>

  <teleport to="body">
      <el-dialog
      v-model="visible"
      title="选择价目表"
      width="550px"
      custom-class="customer-dialog"
    >
      <div class="customer-content">
        <div class="content-left">
          <div class="header">
            <slot name="header"></slot>
          </div>
          <div class="search">
            <el-input v-model="model.nameOrCode" placeholder="搜索名称" :size="size">
              <template #prefix>
                <i class="iconfont icon-a-16search"></i>
              </template>
            </el-input>
          </div>

          <div class="list">
            <template v-for="item in list" :key="item.id">
              <div
                :class="`list-item ${
                  item.id == selectedItem.id && 'item-active'
                }`"
                @click="handleItem(item)"
              >
                <div class="name">{{ item.priceListName }}</div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onClose" size="small">取消</el-button>
          <el-button type="primary" size="small" @click="onSubmit"
            >确定选择</el-button
          >
        </span>
      </template>
    </el-dialog>
  </teleport>
</template>

<script>
import {
  watch,
  ref,
  reactive,
  toRefs,
  onMounted,
} from "vue";
import commonApi from "@/request/services/common";
import { priceSettingApi } from "@/request/services/priceManagement";

export default {
  props: {
    customerId: {
      type: String || Number,
    },
    tenantId: {
      type: String || Number,
    },
    priceListId: {
      type: String || Number,
    },
    size: {
      type: String,
      default: "normal",
    },
  },
  setup(props, { emit }) {
    const inputShow = ref("");

    const defaultRecord = reactive({
      visible: false,
      model: {
        type: "",
        nameOrCode: "",
      },
      list: [],
      active: null,
      selectedItem: {},
      // inputShow: ''
    });
 

    const onShow = () => {
      defaultRecord.visible = true;
    };

    const getCustomerList = async () => {
      let params = {
        current:1,
        size:9999,
      };
      if (props.customerId) {
        params.customerId = props.customerId;
      }
      if (defaultRecord.model.nameOrCode) {
        params.priceListName = defaultRecord.model.nameOrCode;
      }
      if (props.tenantId) {
        params.tenantId = props.tenantId;
      }
      const res = await priceSettingApi.getTableData(params);
      defaultRecord.list = res.data.records;
    };

    onMounted(() => {
      if (props.priceListId) {
        initData(props.priceListId);
      } else {
        inputShow.value = "";
      }
    });

    const handleItem = (item) => {
      defaultRecord.selectedItem = item;
    };

    const onClose = () => {
      defaultRecord.visible = false;
    };

    const onSubmit = () => {
      inputShow.value = defaultRecord.selectedItem.priceListName;
      emit("selectedCustomer", defaultRecord.selectedItem);
      onClose();
    };

    const initData = async (id) => {
      const res = await priceSettingApi.getTableData({ current:1,
        size:9999, });
      const { data = [] } = res;
      const selectItem=data.records.find(item=>item.id==id)
      inputShow.value =selectItem .priceListName;
      defaultRecord.selectedItem = selectItem;
    };

    watch(
      () => defaultRecord.model.type,
      () => {
        getCustomerList();
      }
    );
    watch(
      () => defaultRecord.model.nameOrCode,
      () => {
        getCustomerList();
      }
    );

    watch(
      () => props.priceListId,
      async (val, oldVal) => {
        if (val == oldVal) return;
        if (val) {
          initData(val);
        } else {
          inputShow.value = "";
        }
        // initData(val)
      }
    );
    watch(
      () => defaultRecord.visible,
      (val) => {
        if (val) {
          getCustomerList();
        } else {
          defaultRecord.model.nameOrCode = "";
          defaultRecord.model.type = "";
          defaultRecord.selectedItem = {};
        }
      }
    );

    return {
      ...toRefs(defaultRecord),
      onShow,
      onClose,
      onSubmit,
      handleItem,
      inputShow,
    };
  },
};
</script>
<style lang="scss" scoped>
.customer-content {
  padding: 0 24px;
  display: flex;
  height: 300px;
  .content-left {
    width: 500px;
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
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      .subTitle {
        color: #909399;
      }
    }
    .list {
      height: 200px;
      overflow-y: auto;
      .list-item {
        height: 32px;
        display: flex;
        justify-content: space-between;
        line-height: 32px;
        cursor: pointer;
        .name {
        }
        .tag {
          margin-right: 8px;
        }
      }
      .list-item:hover {
        background: #ecf5ff;
      }
      .item-active {
        background: #ecf5ff;
      }
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

    .header {
      .el-select {
        .el-input--suffix {
          .el-input__validateIcon {
            display: none;
          }
        }
      }
    }
  }
}
</style>

