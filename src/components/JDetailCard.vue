<template>

  <div class="j-detail-card">
    <div class="j-detail-card-content">
      <div 
        v-if="title"
        class="j-detail-card-content-subtitle">
        <i :class="`iconfont ${icon}`"></i>
        <span>{{title}}</span>
      </div>
      <el-row >
        <el-col 
          v-for="(item, index) in detailList"
          :key="index"
          :span="item.span" 
        >
          <div 
            class="j-detail-card-content-label"
            :style="labelWidth?`width:${labelWidth}`:''"
          >
            {{item.label}}
          </div>
          <div class="j-detail-card-content-label">
            {{item.value}}
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router'

export default {
  props: {
    title: {
      type: String,
    },
    icon: {
      type: String,
      default: 'icon-danju'
    },
    labelWidth: {
      type: String,
      default: "124px",
    },
    detailItems: {
      type: Array,
      default: () => [],
    },
    detailData: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit }) {
    const router = useRouter();
    const handleBtn = () => {
      router.back()
    }


    const detailList = ref([])

    const formatterData = (data={}) => {
      let arr = props.detailItems.map(item => {
        const { label, prop, span=8, formatter} = item 
        let obj = {label, span}
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
      detailList.value = formatterData(props.detailData)
    })

    watch(() => props.detailData,(value)=>{
      detailList.value = formatterData(value)
    })
  
    return {
      detailList,
    }

  }
}
</script>


<style lang="scss" scoped>
  .j-detail-card {
    .j-detail-card-content {
      .j-detail-card-content-subtitle {
        font-size: 16px;
        font-weight: 600;
        color: #092D5C;
        line-height: 22px;
        margin-bottom: 24px;
        i {
          margin-right: 6px;
          color: #3c82fe;
        }
      }
      .el-col {
        display: flex;
        align-items: flex-start;
      }
      .j-detail-card-content-label {
        display: inline-block;
        min-width: 120px;
        margin-bottom: 16px;
        font-size: 14px;
        font-weight: 400;
        color: #5A78A0;
        line-height: 20px;
      }
      .j-detail-card-content-value {
        display: inline-block;
        font-size: 14px;
        font-weight: 400;
        color: #092D5C;
        line-height: 20px;
      }
    }
    .j-detail-container-content-custom {
      padding-top: 24px;
    }

  }


</style>