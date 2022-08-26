<template>
  <!-- <div class="j-scroll-container"
    @scroll="scrollEvent"
    :style="`height:${height}px`"
    ref="scrollRef"
  >
    <slot></slot>
  </div> -->
  <div class="j-elevator">
    <div 
      v-for="item in items"
      :class="`j-elevator-item ${currNodeId==item.nodeId? 'item-active':''}`"
      @click="scrollTo(item.nodeId)"
    >
      {{item.name}}
    </div>

  </div>
</template>

<script>
import { reactive, ref, toRefs, watch, onMounted,onBeforeUnmount } from 'vue';

export default {
  props: {
    height: { 
      type: Number,
      default: 600
    },
    listenRef: {
      type: Object
    },
    items: {
      type: Array,
      default: [
        { name: '销售公司', nodeId: 'saleId'},
        { name: '客户信息', nodeId: 'customerId'},
        { name: '订单信息', nodeId: 'orderId'},
        { name: '销售物料', nodeId: 'productId'},
      ],
    }
  },
  setup(props, { emit }) {

    const scrollRef = ref(null)
    const sites = ref([])
    const elevatorRecord = reactive({
      currNodeId: 'saleId'
    })



    const scrollTo = (nodeId) => {
      document.getElementById(nodeId).scrollIntoView({behavior:'smooth'});
      elevatorRecord.currNodeId = nodeId
      // console.log(props.listenRef,"props")
    }

    const scrollEvent =(event) => {
      console.log(props.items)
      console.log(event.target.scrollTop, "xx")
      // console.log(event.target.children[1].offsetTop, "xx")
    }

    onMounted(()=> {
      // console.log(scrollRef.value.children)
      initSite()
    })

    const initSite = () => {
      const arr = props.items.forEach(item => {
        const offsetTop = document.getElementById(item.nodeId).offsetTop
        return offsetTop
      })
      sites.value = arr
    }
    
    return {
      ...toRefs(elevatorRecord),
      scrollRef,
      scrollTo,
      scrollEvent,
    }

  }
}
</script>


<style lang="scss" scoped>
  .j-scroll-container {
    overflow-y: scroll;
    position: relative;
  }
  .j-elevator {
    width: 124px;
    height: auto;
    padding: 4px 0;
    background: #FFFFFF;
    box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.0400), 0px 2px 4px 0px rgba(0,0,0,0.1200);
    border-radius: 2px;
    border: 1px solid #D3DCE6;
    position: fixed;
    right: 0;
    bottom: 300px;
    z-index: 999;
    .j-elevator-item {
      height: 36px;
      line-height: 36px;
      color: #092D5C;
      padding: 0 6px;
      cursor: pointer;
    }
    .item-active {
      background-color: #3C82FE;
      color: #fff;
    }
  }

</style>