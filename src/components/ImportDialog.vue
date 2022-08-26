<template>
  <MyDialog
    :className="'import-dialog'"
    :visible="modalShow"
    :title="modalTitle"
    :width="824"
    :show-close="true"
    append-to-body
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="import-file">
      <div class="template-box">
        <div>
          <span class="circle">1</span>
          <p class="title">下载导入通用模版，填写{{ subTitle }}</p>
        </div>
        <div>
          <img src="@/assets/imgs/file-icon1.png" />
          <p class="smtitle">{{ subTitle }}模版.xls</p>
          <el-button type="primary" @click="downloadTemplate">
            下载模版
          </el-button>
        </div>
      </div>
      <div class="upload-file-import">
        <div>
          <span class="circle">2</span>
          <p class="title">上传填好的文件</p>
        </div>
        <div>
          <img src="@/assets/imgs/file-icon2.png" />
          <p class="smtitle">{{ fileName || '仅支持xls、xlsx格式' }}</p>
          <el-upload
            ref="uploadlist"
            action="#"
            accept=".xls, .xlsx, .XLS, .XLSX"
            :show-file-list="false"
            :http-request="requestUploadfile"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">导入</el-button>
          </el-upload>
        </div>
      </div>
    </div>
  </MyDialog>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import commonApi from '@/request/services/common'
import MyDialog from './MyDialog.vue'

export default {
  components: { MyDialog },
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: '导入',
    },
    subTitle: {
      type: String,
    },
    templateApi: {
      type: Object,
      default: () => ({
        url: '',
        method: 'get',
        data: [],
      }),
    },
    fileNameShow: String,
  },
  setup(props, { emit }) {
  
    const downloadTemplate = async () => {
      const { url, method, data = [] } = props.templateApi

      const res = await commonApi.downloadTemplate(url, method, data)
      let fileName = props.subTitle + '模板'
      const _res = res
      let blob = new Blob([_res], {
        type: 'application/vnd.ms-excel;charset=utf-8',
      })
      let downloadElement = document.createElement('a')
      let href = window.URL.createObjectURL(blob) //创建下载的链接
      downloadElement.href = href
      downloadElement.download = `${fileName}.xls` //下载后文件名
      document.body.appendChild(downloadElement)
      downloadElement.click() //点击下载
      document.body.removeChild(downloadElement) //下载完成移除元素
      window.URL.revokeObjectURL(href) //释放掉blob对象
    }

    const requestUploadfile = (params) => {
      emit('onImportFile', params)
    }
    const beforeUpload = (file) => {
      const fileSuffix = file.name.substring(file.name.lastIndexOf('.') + 1)
      const whiteList = ['xls', 'xlsx', 'XLS', 'XLSX']
      if (whiteList.indexOf(fileSuffix) === -1) {
        ElMessage({
          type: 'warning',
          message: '上传文件只能是 xls,xlsx格式文件',
        })
        return false
      }
    }

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit('onClose')
      }
    }

    return {
      downloadTemplate,
      requestUploadfile,
      beforeUpload,
      onUpdateDialogStatus,
    }
  },
}
</script>

<style lang="scss">
.el-overlay {
  .import-dialog {
    .import-file {
      display: flex;
      justify-content: space-around;
      text-align: center;

      .template-box,
      .upload-file-import {
        display: flex;
        width: 50%;
        height: 300px;
        flex-direction: column;
        align-items: center;
      }
      .template-box {
        border-right: 1px solid #eee;
      }

      .circle {
        width: 0.24rem;
        height: 0.24rem;
        background: #239cff;
        border-radius: 50%;
        display: inline-block;
        line-height: 0.24rem;
        color: #ffffff;
        margin-bottom: 0.4rem;
      }
      .title {
        margin-left: 4px;
        display: inline-block;
        font-size: 0.16rem;
        color: #333333;
        font-weight: 600;
      }
      .smtitle {
        margin: 8px 0 12px;
        width: 200px;
        color: #999999;
      }
    }
    .el-dialog__footer {
      display: none;
    }
  }
}
</style>
