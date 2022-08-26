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
        <template #productIdList>
          <el-select
            v-model="formData.productNameList"
            clearable
            multiple
            :popper-class="'select-poper-hidden'"
            placeholder="请选择"
            style="width: 100%"
            @click="onModalShow('material')"
            @clear="onClear('material')"
          />
        </template>
        <template #customerIdList>
          <PersonnelModal
            modalTitle="选择供应商"
            type="2"
            :data="formData.customerIdList ? formData.customerIdList.split(',') : []"
            @getSelected="onSearchParamsChange('customerIdList', $event)"
          ></PersonnelModal>
        </template>
        <template #categoryIdList>
          <MaterialTreeModal
            modalTitle="选择物料分类"
            :data="formData.categoryIdList ? formData.categoryIdList.split(',') : []"
            @getSelected="onSearchParamsChange('categoryIdList', $event)"
          />
        </template>
        <template #deptIdList>
          <DepartmentTreeModal
            modalTitle="选择部门"
            :data="formData.deptIdList ? formData.deptIdList.split(',') : []"
            @getSelected="onSearchParamsChange('deptIdList', $event)"
          />
        </template>
        <template #salesmanIdList>
          <PersonnelTreeModal
            modalTitle="选择业务员"
            :data="formData.salesmanIdList ? formData.salesmanIdList.split(',') : []"
            @getSelected="onSearchParamsChange('salesmanIdList', $event)"
          />
        </template>
      </MyForm>
    </div>
    <div class="btns">
      <el-button type="primary" @click="onSearch">搜索</el-button>
      <el-button @click="onEmpty">清空</el-button>
      <el-button @click="onClose">收起<span class="icon-box"></span></el-button>
    </div>
  </div>

  <MaterialModal
    :visible="materialModalShow"
    @onClose="onModalClose('material')"
    @getSelected="getSelected"
  />
</template>

<script>
import { ref, reactive, toRefs, onUnmounted, watch } from "vue";
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

    const tenantList = ref([]);
    const addressList = ref([]);

    const getTenantList = () => {
      commonApi.getCompany().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          tenantList.value = res.data;
        }
      });
    };
    getTenantList();

    const getAddressList = () => {
      purchaseOrderApi.getAddress().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.value = item.id;
            item.label = item.name;
          });
          addressList.value = res.data;
        }
      });
    };
    getAddressList();

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

      delete data.productNameList;
      delete data.customerIds;
      delete data.salesmanIds;
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
        label: "采购公司",
        paramName: "tenantId",
        options: tenantList,
        span: 24,
      },
      {
        type: "input",
        label: "单据号",
        paramName: "orderNum",
        span: 24,
      },
      {
        type: "rangePicker",
        label: "单据日期",
        paramName: "time",
        span: 24,
      },
      {
        type: "select",
        label: "结算方式",
        paramName: "settlementTypeList",
        options: [
          { label: "现金", value: 0 },
          { label: "银行承兑", value: 1 },
          { label: "商业承兑", value: 2 },
        ],
        multiple: true,
        span: 24,
      },
      {
        type: "labelBlank",
        label: "供应商",
        paramName: "customerIdList",
        slotName: "customerIdList",
        span: 24,
      },
      {
        type: "labelBlank",
        label: "物料名称",
        paramName: "productIdList",
        slotName: "productIdList",
        span: 24,
      },
      {
        type: "input",
        label: "物料编码",
        paramName: "productCode",
        span: 24,
      },
      {
        type: "labelBlank",
        label: "物料分类",
        paramName: "categoryIdList",
        slotName: "categoryIdList",
        span: 24,
      },
      {
        type: "labelBlank",
        label: "部门",
        paramName: "deptIdList",
        slotName: "deptIdList",
        span: 24,
      },
      {
        type: "labelBlank",
        label: "业务员",
        paramName: "salesmanIdList",
        slotName: "salesmanIdList",
        span: 24,
      },
      {
        type: "select",
        label: "收货地",
        paramName: "consignerAddressIdList",
        options: addressList,
        multiple: true,
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