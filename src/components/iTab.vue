<template>
  <div class="tab">
    <div
      class="tab-item"
      v-for="(item, index) in tabList"
      :key="item.id"
      @click="tapStatus(item, index)"
      :class="{ active: index == num }"
    >
      <span class="tab-link">{{ item.name }}</span>
    </div>
  </div>
</template>

<script>
import { computed, watch } from 'vue'
export default {
  props: {
    num: [Number, String],
    tabList: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const tapStatus = (item, index) => {
      emit('tapStatus', item, index)
    }

    watch(props.num, (newVal) => {
      emit('tapStatus', newVal)
    })

    return {
      iIndex: computed(() => props.num),
      tapStatus,
    }
  },
}
</script>

<style lang="scss">
.tab {
  display: flex;
  height: 28px;
  line-height: 28px;
  font-size: 14px;
  background-color: #fff;
  position: fixed;
  top: 114px;

  width:100%;
  padding-left: 24px;
  .tab-item {
    width: 100px;
    text-align: center;
    cursor: pointer;
    .tab-link {
      color: #5A78A0;    
      display: inline-block;
      width: 100%;
    }
    &.active {
      position: relative;
      .tab-link {
        color: #3c82fe;
        
        border-bottom: 2px solid#3C82FE;
      }
    }
  }
}
</style>
