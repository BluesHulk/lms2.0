<template>
  <MyDialog
    :visible="visiable"
    :title="'新增运价'"
    :width="788"
    @onUpdateDialogStatus="onClose"
  >
    <div class="type-steps">
      <el-steps :active="1" align-center space="320px" class="type-step">
        <el-step title="托运类型" />
        <el-step title="运价信息" />
      </el-steps>
    </div>
    <div class="type-list">
      <div class="type-title">选择托运类型</div>
      <div class="type-imgs">
            <img :src="sale?salesactiveimg:salesimg" class="type-img" @click="sale = !sale" />
            <img :src="!sale?purchaseactiveimg:purchaseimg" class="type-img" @click="sale = !sale" />
      </div>
    </div>
    <template v-slot:footer>
      <el-button
        type="primary"
        size="small"
        @click="onSubmit"
        :loading="subLoading"
      >
        下一步
      </el-button>
    </template>
  </MyDialog>
</template>
<script>
import { reactive, ref, toRefs, onMounted, watch } from 'vue';
import MyDialog from '@/components/MyDialog.vue';
import { getAssetsImg } from '@/utils';

export default {
  components: {
    MyDialog,
  },
  props: {
    visiable: {
      type: Boolean,
      default: false,
    },

  },
  setup(props,{emit}) {
    const sale = ref(true)
    const salesimg = getAssetsImg('sales.png')
    const salesactiveimg = getAssetsImg('salesactive.png')
    const purchaseimg = getAssetsImg('purchase.png')
    const purchaseactiveimg = getAssetsImg('purchaseactive.png')
    const changeType = (val) => {
      console.log('qian', val)
    }
    const onClose = () => {
      emit('close')
    }
    const onSubmit = () => {
      emit('next', sale)
    }
    return {
      sale,
      salesimg,
      salesactiveimg,
      purchaseimg,
      purchaseactiveimg,
      changeType,
      onClose,
      onSubmit,
    }
  }
}

</script>
<style lang="scss" scoped>
.type-steps{
  margin-top: 40px;
  .type-step{
    margin: 0 74px;
  }
  
}
:deep(.el-steps){
  .el-step__title.is-process{
    color: #092D5C;
    font-weight: 600;
  }
  .el-step__title.is-finish{
    color: #3C82FE;
    font-weight: 600;
  }
  .is-finish{
    .el-step__icon{
      background-color: #3C82FE;
      border-color: #3C82FE;
      .el-step__icon-inner{
        color: #fff;
        font-weight: bold;
      }
    }
  }
  .is-process{
    .el-step__icon{
      background-color: #DCE5ED ;
      border-color: #DCE5ED ;
      .el-step__icon-inner{
        color: #fff;
        font-weight: bold;
      }
    }
  }
  
}
.type-list{
  margin-bottom: 24px;
   .type-title{
    width: 100%;
    text-align: center;
    margin-top: 39px;
    margin-bottom: 61px;
    font-weight: 600;
    color: #092D5C;
    line-height: 20px;
  }
  .type-imgs{
    text-align: center;
    .type-img{
      width: 230px;
      cursor: pointer;
    }
    .type-img:last-child{
      margin-left: 56px;
    }
  }
}
 
</style>