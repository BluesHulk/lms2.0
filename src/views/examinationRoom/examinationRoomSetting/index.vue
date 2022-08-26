<template>
  <MyContainer>
    <template #top>
      <div class="tab-box">
        <BaseTabs :data="tabList" @onTabsClick="onTabsClick" />
      </div>
    </template>
    <template v-slot:header>
      <el-button type="primary" @click="onModalShow">新增</el-button>
    </template>
    <div class="content">
      <template v-if="tabKey == 1 || tabKey == 2 || tabKey == 3">
        <MaterialManagement ref="ref1" :tabKey="tabKey" />
      </template>
      <template v-else>
        <BatchManagement ref="ref2" :tabKey="tabKey" />
      </template>
    </div>
  </MyContainer>
</template>

<script>
import { reactive, ref, toRefs } from "vue";
import BaseTabs from "@/components/BaseTabs.vue";
import MyContainer from "@/components/MyContainer.vue";
import MaterialManagement from "./MaterialManagement.vue";
import BatchManagement from "./BatchManagement.vue";

export default {
  name: "examinationRoomSetting",
  components: {
    BaseTabs,
    MyContainer,
    MaterialManagement,
    BatchManagement,
  },
  setup() {
    const tabKey = ref(1);
    const tabList = ref([
      { label: "无需验收物料管理", value: 1 },
      { label: "无需批次物料管理", value: 2 },
      { label: "无需过磅物料管理", value: 3 },
      // { label: "批次分组管理", value: 4 },
      // { label: "客户批次设置", value: 5 },
    ]);

    const onTabsClick = (val) => {
      tabKey.value = val;
    };

    const refRecord = reactive({
      ref1: null,
      ref2: null,
    });

    const onModalShow = () => {
      if (tabKey.value == 1 || tabKey.value == 2 || tabKey.value == 3) {
        refRecord.ref1.onModalShow("add");
      }
    };

    return {
      tabKey,
      tabList,
      ...toRefs(refRecord),
      onTabsClick,
      onModalShow,
    };
  },
};
</script>

<style lang="scss" scoped>
.tab-box {
  padding: 0 24px;
  background: #fff;
}
::v-deep {
  .my-multiple-filter-container {
    display: flex;
    justify-content: space-between;
    .my-form-container {
      min-width: calc(100% / 3 * 2);

      .el-form-item {
        margin: 0;
      }
    }
    .button-box {
      min-width: 145px;
    }
  }
}
</style>