<template>
  <div class="filter-container">
    <div class="header">
      <span>高级搜索</span>
      <el-input
        v-model="filterText"
        class="filter-header-input"
        placeholder="搜索筛选项"
      >
        <template #suffix>
          <i class="iconfont icon-sousuo"></i>
        </template>
      </el-input>
    </div>
    <div class="content">
      <MyForm
        ref="formRef"
        :labelSuffix="'：'"
        :labelPosition="'top'"
        :formItems="filterItems"
        :formData="formData"
        :gutter="18"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitForm"
      >
      </MyForm>
    </div>
    <div class="btns">
      <el-button type="primary" @click="onSearch">搜索</el-button>
      <el-button @click="onEmpty">清空</el-button>
      <el-button @click="onClose">收起<span class="icon-box"></span></el-button>
    </div>
  </div>

</template>

<script>
import { ref, reactive, toRefs, onUnmounted, watch, computed } from "vue";
import { useStore } from "vuex";
import MyForm from "@/components/MyForm.vue";
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import PersonnelModal from "@/components/commonModal/Multiple/PersonnelModal.vue";
import MaterialTreeModal from "@/components/commonModal/Multiple/MaterialTreeModal.vue";
import DepartmentTreeModal from "@/components/commonModal/Multiple/DepartmentTreeModal.vue";
import PersonnelTreeModal from "@/components/commonModal/Multiple/PersonnelTreeModal.vue";
import { purchaseOrderApi } from "@/request/services/purchasingManagement";
import commonApi from "@/request/services/common";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  components: {
    MyForm,
    MaterialModal,
    PersonnelModal,
    MaterialTreeModal,
    DepartmentTreeModal,
    PersonnelTreeModal,
  },
  setup(props, { emit }) {
    const store = useStore();

    const tenantList = ref(computed(() => {
      if(store.state.common.tenantList.length) {
        return store.state.common.tenantList;
      } else {
        store.dispatch('common/getTenantList');
      }
    }));

    const formRecord = reactive({
      filterText: "",
      formRef: null,
      formData: props.data,
    });

    watch(
      () => formRecord.filterText,
      (val) => {
        const elements = formRecord.formRef.$el
          .querySelector(".el-form")
          .getElementsByClassName("el-col");
        if (val) {
          for (let i = 0; i < elements.length; i++) {
            if (
              elements[i]
                .querySelector(".el-form-item__label")
                .innerText.indexOf(val) > -1
            ) {
              elements[i].querySelector(".el-form-item__label").style.display =
                "inline-block";
              elements[i].querySelector(
                ".el-form-item__label"
              ).style.background = "#E3AB29";
            } else {
              elements[i].querySelector(
                ".el-form-item__label"
              ).style.background = "none";
            }
          }
        } else {
          for (let i = 0; i < elements.length; i++) {
            elements[i].querySelector(".el-form-item__label").style.background =
              "none";
          }
        }
      }
    );

    const onSearch = () => {
      const data = { ...formRecord.formData };


      // 多选框清空后为空数组，会被计算在筛选数里显示不准确，需要删除
      for (let key in data) {
        if (Array.isArray(data[key]) && data[key].length == 0) {
          delete data[key];
        }
        if (!data[key]) {
          delete data[key];
        }
      }

      // delete data.productNameList;
      // delete data.customerIds;
      // delete data.salesmanIds;
      emit("onSearch", data);
    };

    const onEmpty = () => {
      formRecord.formData = {};
      emit("onSearch", {});
    };

    const onClose = () => {
      emit("onClose");
    };

    const modalRecord = reactive({
      materialModalShow: false,
    });

    const onModalShow = (type) => {
      if (type == "material") {
        modalRecord.materialModalShow = true;
      }
    };

    const onModalClose = (type) => {
      if (type == "material") {
        modalRecord.materialModalShow = false;
      }
    };

    const getSelected = (val) => {
      const ids = [],
        names = [];
      val.map((item) => {
        ids.push(item.id);
        names.push(item.productName);
      });
      formRecord.formData.productIdList = ids.join(",");
      formRecord.formData.productNameList = names;
    };

    const onClear = (type) => {
      if (type == "material") {
        formRecord.formData.productIdList = undefined;
        formRecord.formData.productNameList = undefined;
      }
    };

    const onSearchParamsChange = (type, val) => {
      const ids = [];
      val.map((item) => {
        ids.push(item.id);
      });
      formRecord.formData[type] = ids.join(",");
    };

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 24,
      },
      {
        type: "input",
        label: "磅单编号",
        paramName: "xx",
        span: 24,
      },
      {
        type: "input",
        label: "运单号",
        paramName: "waybillNum",
        span: 24,
      },
      {
        type: "input",
        label: "订单号",
        paramName: "orderNum",
        span: 24,
      },
      {
        type: "input",
        label: "发货单号",
        paramName: "xxx",
        span: 24,
      },
      {
        type: "input",
        label: "到货单号",
        paramName: "xxxxx",
        span: 24,
      },
      {
        type: "input",
        label: "车牌号",
        paramName: "licensePlate",
        span: 24,
      },
      {
        type: "input",
        label: "客户名称",
        paramName: "customerName",
        span: 24,
      },
      {
        type: "input",
        label: "承运单位",
        paramName: "tenantNameTransport",
        span: 24,
      }, 
      {
        type: "select",
        label: "车辆状态",
        paramName: "cartStatus",
        options: [],
        span: 24,
      },
      {
        type: "select",
        label: "包装类型",
        paramName: "packType",
        options: [
          { label: '袋装', value: 'D'},
          { label: '散装', value: 'S'},
        ],
        span: 24,
      },
      {
        type: "input",
        label: "物料名称",
        paramName: "productName",
        span: 24,
      }, 
      {
        type: "datetimePicker2",
        label: "进厂时间",
        paramName: "inTime",
        span: 24,
      },
      {
        type: "datetimePicker2",
        label: "出厂时间",
        paramName: "outTime",
        span: 24,
      },
      {
        type: "select",
        label: "业务类型",
        paramName: "businessType",
        options: [
          { label: '采购', value: '1'},
          { label: '销售', value: '2'},
          { label: '短倒', value: '3'},
          { label: '厂外短倒', value: '4'},
          { label: '调拨', value: '5'},
        ],
        span: 24,
      },
      {
        type: "select",
        label: "核算状态",
        paramName: "accountFlag",
        options: [
          { label: '未核算', value: '1'},
          { label: '已核算', value: '2'},
        ],
        span: 24,
      },
      {
        type: "select",
        label: "单据状态",
        paramName: "status",
        options: [
          { label: '未开始', value: '0'},
          { label: '进行中', value: '1'},
          { label: '已完成', value: '2'},
          { label: '已作废', value: '3'},
        ],
        span: 24,
      }, 
      {
        type: "input",
        label: "创建人",
        paramName: "createUserName",
        span: 24,
      },
      {
        type: "rangePicker",
        label: "创建日期",
        paramName: "time1",
        span: 24,
      },
      {
        type: "input",
        label: "修订人",
        paramName: "updateUserName",
        span: 24,
      },
      {
        type: "rangePicker",
        label: "修订日期",
        paramName: "time2",
        span: 24,
      },
    ]);

    onUnmounted(() => {
      store.commit("common/setAsideFilterShow", false);
    });
    return {
      filterItems,
      ...toRefs(formRecord),
      ...toRefs(modalRecord),
      getSelected,
      onSearch,
      onEmpty,
      onClose,
      onModalShow,
      onModalClose,
      onClear,
      onSearchParamsChange,
    };
  },
};
</script>

<style lang="scss" scoped>
.filter-container {
  width: 100%;
  height: 100%;
  box-shadow: -4px 0px 16px 0px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}
.header {
  display: flex;
  padding: 0 24px;
  width: 100%;
  height: 60px;
  font-size: 16px;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: 600;
  color: $color-text;
  background: #fff;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;

  .filter-header-input {
    width: 150px;
  }
}

.content {
  padding: 24px;
  height: calc(100vh - 60px - 68px - 54px);
  border-top: 1px solid $color-border;
  border-bottom: 1px solid $color-border;
  box-sizing: border-box;
  overflow: auto;
}
.btns {
  display: flex;
  width: 100%;
  height: 68px;
  justify-content: center;
  align-items: center;

  .icon-box {
    display: inline-block;
    width: 16px;
    height: 16px;
    background: url("@/assets/imgs/icon-packup.png") no-repeat;
    background-size: 100% 100%;
  }
}
</style>

<style lang="scss">
.el-select__popper.select-poper-hidden {
  display: none;
}
</style>