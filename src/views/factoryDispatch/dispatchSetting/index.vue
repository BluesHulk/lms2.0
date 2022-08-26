<template>
  <div class="tabs-box">
    <BaseTabs :data="tabList" @onTabsClick="onTabsClick" />
  </div>
  <div class="content">
    <MillManagement v-if="tabKey == 1" />
    <CustomerLaneSetting v-if="tabKey == 2" />
    <GroupMaterialSetting v-if="tabKey == 3" />
  </div>
  
</template>

<script>
import { ref } from 'vue';
import BaseTabs from "@/components/BaseTabs.vue";
import MillManagement from '@/views/factoryDispatch/millManagement/index.vue';
import CustomerLaneSetting from '@/views/factoryDispatch/customerLaneSetting/index.vue';
import GroupMaterialSetting from '@/views/factoryDispatch/groupMaterialSetting/index.vue';
export default {
  components: {
    BaseTabs,
    MillManagement,
    CustomerLaneSetting,
    GroupMaterialSetting
  },
  setup() {
    const tabKey = ref(1);
    const tabList = ref([
      { label: "磨机管理", value: 1 },
      { label: "客户车道设置", value: 2 },
      { label: "分组物料设置", value: 3 },
    ]);

    const onTabsClick = (val) => {
      tabKey.value = val;
    };
    return {
      tabKey,
      tabList,
      onTabsClick,
    }
  }
}
</script>

<style lang="scss" scoped>
.tabs-box {
  padding: 0 24px;
  background: #fff;
}
.content {
  height: calc(100% - 41px);
}
</style>