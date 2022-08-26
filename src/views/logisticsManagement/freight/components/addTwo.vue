<template>
  <MyDialog
    :visible="visiable"
    :title="update == 'add' ? '新增运价':'编辑运单'"
    :width="1080"
    @onUpdateDialogStatus="onClose"
  >
    <div class="type-steps" v-if="update == 'add'">
      <el-steps :active="2" align-center space="320px" class="type-step">
        <el-step title="托运类型" />
        <el-step title="运价信息" />
      </el-steps>
    </div>
    <div class="freight-table">
      <el-form label-width="auto" label-position="left" >
        <el-row :gutter="20" v-if="update == 'edit'">
          <el-col :span="12">
            <el-form-item label="托运类型：">
              销售运输
            </el-form-item>
          </el-col>
          </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="发货方：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发货地址：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收货方：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="收货地址：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="承运商：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运价类型：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料分类：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计价单位：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="货主运价：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="扣损免赔方案：">
              <el-row :gutter="10" style="width: 100%;">
                <el-col :span="20">
                  <el-input placeholder="发货方：" v-model="form.a" />
                </el-col>
                <el-col :span="4">
                  <el-popover
                    v-model:visible="popVisible"
                    placement="top"
                    :width="203"
                  >
                    <p>
                      签收量低于发货量
                      <el-input
                        v-model="form.b"
                        size="small"
                        style="width: 54px"
                      >
                        <template #append>吨</template>
                      </el-input>
                      免赔
                    </p>
                    <div style="text-align: right; margin-top: 13px">
                      <el-button
                        size="small"
                        type="primary"
                        @click="popVisible = false"
                      >
                        确定
                      </el-button>
                      <el-button
                        size="small"
                        @click="popVisible = false"
                      >
                        取消
                      </el-button>
                    </div>
                    <template #reference>
                      <img :src="getAssetsImg('/logo.png')" v-popover="popoverRef"  @click="popVisible = true"/>
                    </template>
                  </el-popover>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运费抹零方案：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="运量取值方式：">
              <el-input placeholder="发货方：" v-model="form.a" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="备注：">
              <el-input placeholder="发货方："
                v-model="form.a"
                :autosize="{ minRows: 2 }"
                type="textarea"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <template v-slot:footer>
      <el-button v-if="update == 'add'" type="primary" size="small" @click="onLast" :loading="subLoading">
        上一步
      </el-button>
      <el-button type="primary" size="small" @click="onSubmit" :loading="subLoading">
        {{ update == 'add' ? '完成并提交' : '保存' }}
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
    update: {
      type: String,
      default: 'add',
    }
  },
  setup(props, { emit }) {
    const sale = ref(true)
    const popVisible = ref(false)
    const form = ref({
      a: '',
      b: '',
    })
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
    const onLast = () => {
      emit('last')
    }
    const onSubmit = () => {
      onClose()
    }
    return {
      sale,
      salesimg,
      salesactiveimg,
      purchaseimg,
      purchaseactiveimg,
      form,
      getAssetsImg,
      popVisible,
      changeType,
      onLast,
      onSubmit,
      onClose,
    }
  }
}

</script>
<style lang="scss" scoped>
.type-steps {
  margin-top: 40px;
  margin-bottom: 48px;

  .type-step {
    margin: 0 220px;
  }

}

:deep(.el-steps) {
  .el-step__title.is-process {
    color: #092D5C;
    font-weight: 600;
  }

  .el-step__title.is-finish {
    color: #3C82FE;
    font-weight: 600;
  }

  .is-finish {
    .el-step__icon {
      background-color: #3C82FE;
      border-color: #3C82FE;

      .el-step__icon-inner {
        color: #fff;
        font-weight: bold;
      }
    }

    .el-step__line {
      background-color: #3C82FE;
    }
  }

  .is-process {
    .el-step__icon {
      background-color: #DCE5ED;
      border-color: #DCE5ED;

      .el-step__icon-inner {
        color: #fff;
        font-weight: bold;
      }
    }
  }
}
:deep(.el-input){
  .el-input-group__append{
    padding: 0 5px;
  }
}

.freight-table {
  padding: 0 24px;
}

.type-list {
  margin-bottom: 24px;

  .type-title {
    width: 100%;
    text-align: center;
    margin-top: 39px;
    margin-bottom: 61px;
    font-weight: 600;
    color: #092D5C;
    line-height: 20px;
  }

  .type-imgs {
    text-align: center;

    .type-img {
      width: 230px;
      cursor: pointer;
    }

    .type-img:last-child {
      margin-left: 56px;
    }
  }
}
</style>