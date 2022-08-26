<template>
  <div class="j-detail-container">
    <div class="j-detail-container-header">
      <el-button @click="handleBtn">返回</el-button>
    </div>
    <div :class="`j-detail-container-content 
      ${$slots.footer && 'j-detail-container-content-bottom'}
      ${autoHeight && 'j-detail-container-content-autoheight'}
    `">  
      <slot></slot>
    </div>
  </div>
  
  <div v-if="$slots.footer" class="j-detail-container-footer">
    <slot name="footer"></slot>
  </div>
  
</template>

<script>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router'


export default {

  props: {
    autoHeight: {
      type: Boolean,
      default: false
    },
    goBack: {
      type: Function,
    }
  },
  setup(props, { emit }) {
    const router = useRouter();
    const handleBtn = () => {
      if(props.goBack) {
        props.goBack();
        return;
      }
      router.back()
    }
  
    return {
      handleBtn,
    }
  }
}
</script>


<style lang="scss">
  .j-detail-container {
    height: 100%;
    // overflow-y: auto;
    box-sizing: border-box;
    position: relative;
    padding: 24px;
    .j-detail-container-header {
      margin-bottom: 24px;
    }
    .j-detail-container-content {
      height: calc(100vh - 220px);
      max-height: calc(100vh - 220px);
      overflow-y: auto;
      width: 100%;
      background: #fff;
      box-sizing: border-box;
      position: relative;
      padding: 24px;
      .line {
        height: 1px;
        background-color: #f6f7f9;
        margin-bottom: 24px;
      }
      .through-line {
        height: 1px;
        background-color: #f6f7f9;
        margin-bottom: 18px;
        margin-left: -24px;
        margin-right: -24px;
      }
      .content-item {
        margin-bottom: 24px;
      }
    }
    .j-detail-container-content-bottom {
      height: calc(100vh - 280px);
      max-height: calc(100vh - 280px);
    }
    .j-detail-container-content-autoheight {
      height: auto;
    }
  }
  .j-detail-container-footer {
    position: absolute;
    height: 60px;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 14px 24px;
    border-top: 1px solid $color-border;
    box-sizing: border-box;
    background-color: #fff;
    z-index: 99;
  }


</style>