<template>
  <div class="container">
    <i-tab :tabList="tabList" :num="actived" @tapStatus="tapStatus" />
    <listed-price v-if="actived==0" />
    <deal-price v-if="actived==1" />
    
  </div>
</template>

<script>
import { reactive, ref, toRefs } from 'vue';
import iTab from '@/components/iTab.vue'
import listedPrice from './listPrice/index.vue'
import dealPrice from './dealPrice/index.vue'
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from 'element-plus';
import config from '@/utils/config';

export default {
  components: {
    iTab,
    listedPrice,
    dealPrice
  },
  setup() {
    const actived = ref(sessionStorage.getItem("priceKey") ||0) //当前为挂牌还是协议
    const state = reactive({
       tabList: [
        {
          name: '挂牌价格',
          id: 'listedPrice',
        },
        {
          name: '协议价格',
          id: 'dealPrice',
        },
      ],
    })

     //切换挂牌或者协议
    const tapStatus = (item, index) => {
        sessionStorage.setItem("priceKey", index);

      actived.value = index
    }

    return {
      actived,
      tapStatus,
      ...toRefs(state)
    }
  }
}
</script>

<style lang="scss" scoped>
.container{
  color: $color-text;
}

</style>