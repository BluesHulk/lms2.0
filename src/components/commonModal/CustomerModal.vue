<template>
  <el-input
    v-model="inputShow"
    clearable
    :size="size"
    :placeholder="placeholder"
    :disabled="disabled"
    @click="onShow"
    @clear="onClear"
  >
    <template #suffix>
      <i class="iconfont icon-sousuo"></i>
    </template>
  </el-input>

  <teleport to="body">
    <el-dialog
      v-model="visible"
      :title="modalTitle"
      width="750px"
      custom-class="customer-dialog"
    >
      <div class="customer-content">
        <div class="content-left">
          <div class="search">
            <el-input
              v-model="model.nameOrCode"
              placeholder="搜索客户名称/客户编码"
              :size="size"
              @input="onKeywordChange"
            >
              <template #prefix>
                <i class="iconfont icon-sousuo"></i>
              </template>
            </el-input>
          </div>

          <div class="header">
            <div class="subTitle">{{ subTitle }}</div>
            <div>
              <el-select
                v-model="model.type"
                :size="size"
                :disabled="lockType"
                style="width: 100px"
                @change="onTypeChange"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
          <div class="list" id="customer-list" ref="scrollRef">
            <template v-for="item in list" :key="item.id">
              <div
                :class="`list-item ${
                  item.id == selectedItem.id && 'item-active'
                }`"
                @click="handleItem(item)"
              >
                <div class="name">{{ item.name }}</div>
                <div class="tags">
                  <el-tag type="info" size="small" class="tag">{{
                    typeMap.get(item.type)
                  }}</el-tag>
                </div>
              </div>
            </template>
            <div class="footer-text" v-if="dataLoading">加载中...</div>
            <div
              class="footer-text"
              v-if="!dataLoading && model.current == data.pages"
            >
              暂无更多数据
            </div>
          </div>
        </div>
        <div class="content-right">
          <div class="title">客户基本信息</div>
          <div class="basic-info">
            <div
              v-for="(item, index) in basicInfo"
              class="info-item"
              :key="index"
            >
              <div class="label">
                {{ item.label }}
              </div>
              <div class="value">
                {{ item.value }}
              </div>
            </div>
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
import {
  watch,
  ref,
  reactive,
  toRefs,
  onMounted,
  onUnmounted,
} from "vue";
import commonApi from "@/request/services/common";
export default {
  props: {
    customerId: {
      type: String || Number,
    },
    size: {
      type: String,
      default: "normal",
    },
    modalTitle: {
      type: String,
      default: "选择客户",
    },
    lockType: {
      type: String || Number,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    isRequired: {
      type: Boolean,
    },
    params: {
      type: Object,
      default: () => ({
        auditStatus: 1,
      })
    }
  },
  setup(props, { emit }) {
    const inputShow = ref("");
    const scrollRef = ref(null);

    const defaultRecord = reactive({
      visible: false,
      model: {
        type: "",
        nameOrCode: "",
        current: 1,
        size: 10,
      },
      data: {},
      list: [],
      basicInfo: [],
      active: null,
      selectedItem: {},
      dataLoading: false,
    });
    const typeOptions = [
      { label: "全部", value: "" },
      { label: "客户", value: 1 },
      { label: "供应商", value: 2 },
      { label: "承运商", value: 3 },
    ];
    const typeMap = new Map([
      [1, "客户"],
      [2, "供应商"],
      [3, "承运商"],
    ]);
    const basicInfoItem = [
      { label: "客户名称", prop: "name" },
      { label: "客户编号", prop: "code" },
      { label: "客户简称", prop: "shortName" },
      { label: "客户分类", prop: "customerCategoryName" },
      { label: "联系地址", prop: "address" },
      { label: "联系人", prop: "contact" },
      { label: "联系电话", prop: "phone" },
    ];

    const formatterData = (data = {}) => {
      let arr = basicInfoItem.map((item) => {
        const { label, prop, span = 8, formatter } = item;
        let obj = { label, span };
        if (formatter) {
          obj.value = formatter(data);
        } else {
          obj.value = data[prop];
        }
        return obj;
      });
      return arr;
    };

    const onShow = (e) => {
      e.target.blur();
      defaultRecord.visible = true;
    };

    const onClear = () => {
      inputShow.value = "";
      defaultRecord.model.nameOrCode = "";
      defaultRecord.model.type = "";
      defaultRecord.selectedItem = {};
      emit("selectedCustomer", defaultRecord.selectedItem);
    };

    const getCustomerList = () => {
      defaultRecord.dataLoading = true;
      let params = {
        ...props.params,
        ...defaultRecord.model,
      };
      commonApi.getCustomerPage(params).then((res) => {
        if (res && res.code == 0) {
          defaultRecord.list = defaultRecord.list.concat(res.data.records);
          defaultRecord.data = res.data;
        }
        defaultRecord.dataLoading = false;
      });
    };

    onMounted(() => {
      if (props.customerId) {
        initData(props.customerId);
      } else {
        inputShow.value = "";
      }
    });

    const handleItem = (item) => {
      defaultRecord.selectedItem = item;
      defaultRecord.basicInfo = formatterData(item);
    };

    const onClose = () => {
      defaultRecord.visible = false;
    };

    const onSubmit = () => {
      inputShow.value = defaultRecord.selectedItem.name;
      emit("selectedCustomer", defaultRecord.selectedItem);

      if (props.isRequired && !defaultRecord.selectedItem.id) {
        return;
      }
      onClose();
    };

    const initData = async (id) => {
      const res = await commonApi.getCustomerdetail({ id });
      inputShow.value = res.data.name;
      // defaultRecord.selectedItem = res.data;
      // defaultRecord.basicInfo = formatterData(res.data);
    };

    let timer = null;
    const onKeywordChange = () => {
      timer && clearTimeout(timer);

      timer = setTimeout(() => {
        defaultRecord.list = [];
        defaultRecord.data = {};
        defaultRecord.model.current = 1;
        getCustomerList();
      }, 800)
    }

    const onTypeChange = () => {
      defaultRecord.list = [];
      defaultRecord.data = {};
      defaultRecord.model.current = 1;
      getCustomerList();
    }

    watch(
      () => props.customerId,
      async (val, oldVal) => {
        if (val == oldVal) return;
        if (val) {
          initData(val);
        } else {
          inputShow.value = "";
        }
      }
    );
    watch(
      () => [defaultRecord.visible],
      (val) => {
        defaultRecord.model.current = 1;
        defaultRecord.selectedItem = {};
        defaultRecord.list = [];
        if (val) {
          if (props.lockType) {
            defaultRecord.model.type = props.lockType;
          }
          getCustomerList();
        } else {
          defaultRecord.model.nameOrCode = "";
          defaultRecord.model.type = "";
        }
      }
    );

    watch(
      () => [defaultRecord.visible, defaultRecord.list],
      ([visible, list]) => {
        if (visible && list.length) {
          if (scrollRef.value) {
            scrollRef.value.addEventListener("scroll", customerListScroll, true);
          }
        }
      }
    );

    const customerListScroll = () => {
      const dom = document.getElementById("customer-list");

      const clientHeight = dom.clientHeight;
      const scrollTop = dom.scrollTop;
      const scrollHeight = dom.scrollHeight;
      
      if (clientHeight + scrollTop === scrollHeight) {
        console.log("竖向滚动条已经滚动到底部");
        if (defaultRecord.model.current < defaultRecord.data.pages) {
          defaultRecord.model.current += defaultRecord.model.current;
          getCustomerList();
        }
      }
    };

    onUnmounted(() => {
      scrollRef.value &&
        scrollRef.value
          .getElementById("customer-list")
          .removeEventListener("scroll", customerListScroll);
    });

    return {
      scrollRef,
      ...toRefs(defaultRecord),
      typeOptions,
      typeMap,
      basicInfoItem,
      inputShow,
      onShow,
      onClose,
      onSubmit,
      handleItem,
      onClear,
      onKeywordChange,
      onTypeChange,
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
    width: 350px;
    padding-right: 24px;
    box-sizing: border-box;
    border-right: 1px solid #eeeeee;
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
  .content-right {
    width: 350px;
    padding-left: 24px;
    box-sizing: border-box;
    .title {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .basic-info {
      .info-item {
        height: 32px;
        line-height: 32px;
        display: flex;
        .label {
          width: 80px;
          color: #909399;
        }
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

    .footer-text {
      padding: 8px 0 5px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  }
}
</style>

