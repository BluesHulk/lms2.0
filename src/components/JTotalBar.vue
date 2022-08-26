<template>

  <div class="totalBar">
    <div
      v-for="item in list" 
      class="totalBar-item">
      <span v-if="item.prefix">{{item.prefix}}</span>
      <span class="totalBar-item-data">{{item.value}}</span>
      <span v-if="item.suffix">{{item.suffix}}</span>
    </div>
  </div>
</template>

<script>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';

export default {
  props: {
    totalItems: {
      type: Array,
      default: () => [],
    },
    totalData: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit }) {

    const list = ref([])
    const formatterData = (data={}) => {
      let arr = props.totalItems.map(item => {
        const { prefix,suffix, prop, formatter} = item 
        let obj = {prefix,suffix}
        if(formatter) {
          obj.value = formatter(data)
        } else {
          obj.value = data[prop] 
        }
        return obj
      })
      return arr
    }

    onMounted(() => {
      list.value = formatterData(props.totalData)
    })

    watch(() => props.totalData,(value)=>{
      list.value = formatterData(value)
      // console.log(list)
    })
  
    return {
      list,
    }

  }
}
</script>

<style lang="scss" scoped>
  .totalBar {
    display: flex;
    .totalBar-item {
      font-size: 16px;
      font-weight: 400;
      color: #5A78A0;
      line-height: 22px;
      margin-right: 24px;
      .totalBar-item-data {
        font-size: 28px;
        font-weight: bold;
        color: #3C82FE;
        line-height: 34px;
      }
    }
  }
</style>
