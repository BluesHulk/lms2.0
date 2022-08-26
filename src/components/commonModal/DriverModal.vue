<template>
  <el-dialog
    v-model="visible"
    title="选择司机"
    width="750px"
    custom-class="customer-dialog"
    @close="onClose"
    :close-on-click-modal="false"
  >
    <div class="modal-content">
      <div class="content-left">
        <div class="title">当前筛选范围：<el-tag>所有司机</el-tag></div>
        <div class="search">
          <el-input
            v-model="searchModel.nameOrPhone"
            placeholder="搜索司机姓名/手机号"
            :size="size"
          >
            <template #prefix>
              <i class="iconfont icon-a-16search"></i>
            </template>
          </el-input>
        </div>

        <div class="header">
          <div class="subTitle">筛选范围下所有司机</div>
        </div>
        <div class="list">
          <template v-for="item in list" :key="item.id ">
            <div
              :class="`list-item ${
                item.id == selectedItem.id && 'item-active'
              }`"
              @click="handleItem(item)"
            >
              <div class="name">{{ item.driverName || `司机${item.phone.slice(-4)}`}}</div>
              
              <div class="infos">
                <div>
                  <i class="iconfont icon-dianhua tag tag-active"></i>       
                  {{item.phone}}
                </div>
                <i :class="`iconfont icon-shenfenzheng1 tag
                  ${item.idCardCheckStatus ==2 && 'tag-active'}`"></i>
                <i :class="`iconfont icon-jiashizheng tag 
                  ${item.driverCardCheckStatus	 ==2 && 'tag-active'}`"></i>
                <i :class="`iconfont icon-zizhi tag
                  ${item.workCardCheckStatus ==2 && 'tag-active'}`"></i>
              </div>
            </div>
          </template>
          <div v-if="list.length==0" class="no-search-data">
            暂无搜索结果～
            <div class="addText">您可以
              <span @click="formShow=true">添加司机</span>
            </div>
          </div>
        </div>
      </div>
      <div class="content-right">
        <div class="title">司机基本信息</div>
        <div class="basic-info">
          <div
            v-for="(item, index) in basicInfo"
            class="info-item"
            :key="index"
          >
            <div class="label">
              {{ item.label }}
            </div>
            <div class="value">
              {{ item.value }}
            </div>
          </div>
        </div>
        <div 
          v-if="basicInfo.length==0" 
          class="nodata-tips"
        >
          请选中司机查看
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button @click="formShow=true">添加司机</el-button>
        <el-button type="primary" @click="onSubmit">确定选择</el-button>
      </span>
    </template>
  </el-dialog>


  <!--添加-->
  <el-dialog
    v-model="formShow"
    title="快速添加司机"
    width="500px"
    custom-class="customer-dialog"
    @close="formShow=false"
    :close-on-click-modal="false"
  >
    <div class="modal-add-content">
    <MyForm
      ref="formRef"
      :formItems="formItems"
      :rules="formRules"
      :formData="formData"
      @submitForm="submitForm"
      @onFormItemChange="onFormItemChange"
    ></MyForm>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCloseForm">取消</el-button>
        <el-button @click="onSave">仅保存</el-button>
        <el-button type="primary" @click="onSave('use')">保存并使用</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import {
  computed,
  watch,
  watchEffect,
  ref,
  reactive,
  toRefs,
  onMounted,
} from "vue";
import commonApi from "@/request/services/common";
import MyForm from '@/components/MyForm.vue';
import { ElMessage, ElMessageBox } from "element-plus";
import config from "@/utils/config";
export default {
  components: {
    MyForm,
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const inputShow = ref("");

    const checkStatusMap = new Map([
      [1,"审核中"],
      [2,"审核通过"],
      [3,"审核失败"],
    ])

    const defaultRecord = reactive({
      searchModel: {
        nameOrPhone: '',
      },
      list: [],
      basicInfo: [],
      active: null,
      selectedItem: {},

    });

    const basicInfoItems = [
      { label: "司机姓名：", prop: "driverName" },
      { label: "司机电话：", prop: "phone" },
      { label: "身份证：", prop: "idCardCheckStatus",
        formatter: (row) => {
          return checkStatusMap.get(row.idCardCheckStatus)
        }
      },
      { label: "驾驶证：", prop: "driverCardCheckStatus",
        formatter: (row) => {
          return checkStatusMap.get(row.driverCardCheckStatus)
        }
      },
      { label: "从业资格证：", prop: "workCardCheckStatus",
        formatter: (row) => {
          return checkStatusMap.get(row.workCardCheckStatus)
        }
      },
    ];

    const formatterData = (data = {}) => {
      let arr = basicInfoItems.map((item) => {
        const { label, prop, span = 8, formatter } = item;
        let obj = { label, span };
        if (formatter) {
          obj.value = formatter(data);
        } else {
          obj.value = data[prop];
        }
        return obj;
      });
      return arr;
    };


    const getList = async () => {
      let params = {};
      if(defaultRecord.searchModel.nameOrPhone) {
        params.nameOrPhone = defaultRecord.searchModel.nameOrPhone
      } 
      const res = await commonApi.getDriverList(params);
      defaultRecord.list = res.data
    };

    onMounted(async() => {
      await getList()
    });

    const handleItem = (item) => {
      defaultRecord.selectedItem = item;
      defaultRecord.basicInfo = formatterData(item);
    };

    const onClose = () => {
      emit('onClose',false)
    };

    const onSubmit = () => {
      emit("onSelected", defaultRecord.selectedItem);
      onClose();
    };

    

    watch(
      () => defaultRecord.searchModel.nameOrPhone,
      () => {
        getList();
      }
    );
    

    /** 添加 **/

    const formRecord = reactive({
      formShow: false,
      formRef: null,
      formData: {},
      formItems: [
        {
          type: 'input',
          label: '手机号',
          paramName: 'phone',
        },
        {
          type: 'input',
          label: '姓名',
          paramName: 'driverName',
        },
      ],
      formRules: {
        phone: [
          config.rules({type: 'required'}),
          config.rules({type: 'phone'}),
        ],
      }
    })

    const onCloseForm = () => {
      formRecord.formShow = false
      formRecord.formData={}
    }

    const onSave = async(type) => {
      const result = await formRecord.formRef.submitForm()
      if(!result) return
      let params = {}
      const homeInfo = JSON.parse(sessionStorage.getItem('homeInfo')) || {}
      params.tenantName = homeInfo.tenantName
      params.tenantId = homeInfo.tenantId
      params.phone = formRecord.formData.phone
      params.driverName = formRecord.formData.driverName 
        || `司机${formRecord.formData.phone.slice(-4)}`

      const res = await commonApi.addDriver(params)
      if(res && res.code ==0) {
        ElMessage.success("操作成功！");
        onCloseForm()
        getList();
        if(type=="use") {
          emit("onSelected", res.data);
          onClose();
        }
      } else {
        ElMessage.error(res.message);
      }

    }

    return {
      ...toRefs(defaultRecord),
      basicInfoItems,
      onClose,
      onSubmit,
      handleItem,
      ...toRefs(formRecord),
      onSave,
      onCloseForm,
    };
  },
};
</script>
<style lang="scss" scoped>
.modal-add-content {
  padding: 0 24px;
}
.modal-content {
  padding: 0 24px;
  display: flex;
  height: 300px;

  .title {
    font-size: 16px;
    margin-bottom: 20px;
    font-weight: 600;
    color: #092D5C;
  }
  .content-left {
    width: 350px;
    padding-right: 24px;
    box-sizing: border-box;
    border-right: 1px solid #eeeeee;
    .search {
      margin-bottom: 20px;
      ::deep {
        .el-form-item.is-error .el-input__inner {
          border-color: #aaa;
        }
      }
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      .subTitle {
        color: #5A78A0;
      }
    }
    .list {
      height: 168px;
      overflow-y: auto;
      .no-search-data {
        color: #B7C4D7;
        text-align: center;
        margin-top: 50px;
        .addText {
          color: #000;
          line-height: 48px;
          span {
            color: #409eff;
            cursor: pointer;
          }
        }
      }
      .list-item {
        height: 32px;
        display: flex;
        justify-content: space-between;
        line-height: 32px;
        cursor: pointer;
        .name {
          color: #092D5C;
        }
        .infos {
          color: #5A78A0;
          display: flex;
          align-items: center;
          .tag {
            
            margin-left: 8px;
            // width: 16px;
            // height: 16px;
            // background-color: #B7C4D7;
            // color: #fff;
            // text-align: center;
            // line-height: 16px;
            // border-radius: 2px;
            color: #b7c4d7;
          }
          .tag-active {
            color: #3c82fe;
          }
        }
      }
      .list-item:hover {
        background: #ecf5ff;
      }
      .item-active {
        background: #ecf5ff;
      }
    }
  }
  .content-right {
    width: 350px;
    padding-left: 24px;
    box-sizing: border-box;
    
    .basic-info {
      .info-item {
        height: 32px;
        line-height: 32px;
        display: flex;
        color: #092D5C;
        .label {
          width: 100px;
          color: #5A78A0;
        }
      }
    }
    .nodata-tips {
      font-size: 14px;
      color: #B7C4D7;
      text-align: center;
      margin-top: 35%;
    }
  }
}
</style>


