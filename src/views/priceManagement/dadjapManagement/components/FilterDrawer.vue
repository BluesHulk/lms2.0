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
        <template #productId>
          <el-select
            v-model="formData.productName"
            clearable
            :popper-class="'select-poper-hidden'"
            placeholder="请选择"
            style="width: 100%"
            @click="onModalShow('material')"
            @clear="onClear('material')"
          />
        </template>
         <template #customerId>
          <CustomerSelect
            :placeholder="'请选择'"
            :customerId="formData.customerId"
            @selectedCustomer="selectedCustomer"
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
    :isRequired="true"
    :modalType="'single'"
    @onClose="onModalClose('material')"
    @getSelected="getSelected"
  />
</template>

<script>
import { ref, reactive, toRefs, onUnmounted, watch } from "vue";
import { useStore } from "vuex";
import MyForm from "@/components/MyForm.vue";
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import commonApi from "@/request/services/common";
import CustomerSelect from "@/components/commonModal/CustomerModal.vue";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    MyForm,
    MaterialModal,
    CustomerSelect,
  },
  setup(props, { emit }) {
    const store = useStore();

    const tenantList = ref([]);
    const payTypeList = ref([]);
     //获取数据字典
    const getDictionaryList = (code, setData) => {
      commonApi.getDictionaryList(code).then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          setData.value = res.data;
        }
      });
    };
    getDictionaryList("LMS_PAYTYPE", payTypeList);
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

    const formRecord = reactive({
      filterText: "",
      formRef: null,
      formData: {},
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
      delete data.productName
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
      formRecord.formData.productId = val.id
      formRecord.formData.productName = val.productName
    };

    const onClear = (type) => {
      if (type == "material") {
        formRecord.formData.productId = undefined;
      formRecord.formData.productName = undefined
      }
    };

     const selectedCustomer = (val) => {
      formRecord.formData.customerId = val.id;
    };

   const filterItems = ref([
      {
        type: "select",
        label: "销售公司",
        paramName: "tenantId",
        options: tenantList,
      },
     {
        type: "labelBlank",
        label: "客户名称",
        paramName: "customerId",
        slotName: "customerId",
      },
        {
        type: "labelBlank",
        label: "物料名称",
        paramName: "productId",
        slotName: "productId",
      },
  {
        type: "select",
        label: "调价类型",
        paramName: "adjustType",
        options: [
          { value: 1, label: "整体调价" },
          { value: 2, label: "客户调价" },
        ],
      },
      {
        type: "rangePicker",
        label: "创建时间",
        paramName: "time",
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
      selectedCustomer,
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