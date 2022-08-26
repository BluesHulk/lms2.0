import { get, put, patch, postJson, delJson, post, qs,postFile } from '../http';
import { getParams } from '@/utils/index'
import { add } from 'lodash';
const messureApi = {
  // 磁卡列表
  calculateCardList(params) {
    return get(`/tenant-lms-meter-provide/lms/meter/calculate/card/list`, params);
  },
  // 磁卡删除 
  calculateCardDel(params) {
    return delJson(`/tenant-lms-meter-provide/lms/meter/calculate/card/delete?${qs(params)}`);
  },
  // 磁卡状态变更
  calculateEditStatus(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/card/editStatus`, params);
  },
  // 获取磁卡通用模板
  calculatedownload(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/calculate/card/download', params)
  },
  //导入磁卡Excel
  calculateimport(params) {
    return postFile('/tenant-lms-meter-provide/lms/meter/calculate/card/import', params, { responseType: 'blob' })
  },
}

//阶梯误差
const ladderErrorApi = {
  getTableData(params) {
    return get(`/tenant-lms-meter-provide/lms/meter/calculate/stairErrValue/list`, params);
  },
  addItem(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/stairErrValue/add`, params);
  },
  editItem(params) {
    return put(`/tenant-lms-meter-provide/lms/meter/calculate/stairErrValue/edit`, params);
  },
  getDetail(params) {
    return put(`/tenant-lms-meter-provide/lms/meter/calculate/stairErrValue/get/${params}`);
  },
  deleteItem(params) {
    return patch(`/tenant-lms-meter-provide/lms/meter/calculate/stairErrValue/delete/${params}`);
  }
}

//车辆皮重
const tareVehicleApi = {
  getTableData(params) {
    return get(`/tenant-lms-meter-provide/lms/meter/basic/truckTare/list`, params);
  },
  addItem(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/basic/truckTare/add`, params);
  },
  editItem(params) {
    return put(`/tenant-lms-meter-provide/lms/meter/basic/truckTare/edit`, params);
  },
  deleteItem(params) {
    return patch(`/tenant-lms-meter-provide/lms/meter/basic/truckTare/delete/${params}`);
  }
}

//参数配置
const paramConfigApi = {
  getDetail(params) {
    return get(`/tenant-lms-meter-provide/lms/meter/basic/basicSetting/list`,params);
  },
  saveFiled(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/basic/basicSetting/save`,params);
  },
  saveFiledBatch(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/basic/basicSetting/saveBatch`,params);
  }
}

//流程管理
const flowMangementApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/calculate/businessType/page', params);
  },
  getDetail(params) {
    return get(`/tenant-lms-meter-provide/lms/meter/calculate/businessType/detail`, params);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/calculate/businessType', params);
  },
  onEdit(params) {
    return patch('/tenant-lms-meter-provide/lms/meter/calculate/businessType', params);
  },
  onStatusChange(params) {
    return put(`/tenant-lms-meter-provide/lms/meter/laboratoryBatchInfo/editStatus?${qs(params)}`);
  },
  onDelete(id) {
    return delJson(`/tenant-lms-meter-provide/lms/meter/calculate/businessType/${id}`);
  },
  getPnodeEnum() {
    return get(`/tenant-lms-meter-provide/lms/meter/calculate/businessType/getPnodeEnum`);
  },
}

export { messureApi, ladderErrorApi, tareVehicleApi, paramConfigApi,flowMangementApi };
