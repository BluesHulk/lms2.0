<template>
  <el-tabs
    v-model="activeName"
    class="base-tabs"
    @tab-click="handleClick"
  >
    <el-tab-pane v-for="item in data" :key="item.value" :label="item.label" :name="item.value">
      <template #label>
        <span>{{ item.label }}</span>
      </template>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    data: {
      type: Array
    },
    tabKey: {
      type: [Number, String],
    }
  },
  setup(props, { emit }) {
    const activeName = ref(props.tabKey || props.data[0].value);

    const handleClick = (val) => {
      activeName.value = val.props.name;
      emit('onTabsClick', val.props.name);
    }
    
    return {
      activeName,
      handleClick,
    }
  }
};
</script>

<style lang="scss" scoped>
.base-tabs {
  
  ::v-deep {
    .el-tabs__header {
      margin: 0;
      border-top: 1px solid $color-border;
      border-bottom: 1px solid $color-border;

      .el-tabs__nav-wrap {
        &::after {
          display: none;
        }
      }

      .el-tabs__item {
        position: relative;
        min-width: 100px;
        border: none;
        text-align: center;
      }
      .is-active {
        span {
          position: relative;
          &::before {
            content: '';
            position: absolute;
            top: -4px;
            right: -4px;
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #FF3B30;
            border: 1px solid #FFFFFF;
            border-radius: 50%;
          }
        }
      }
    }
  }
}
</style>