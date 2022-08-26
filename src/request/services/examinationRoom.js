import { get, put, postJson, delJson, qs, patch } from '../http';

const examinationRoomSettingApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratorySetting/list', params);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/laboratorySetting/add', params);
  },
  onDelete(id) {
    return patch(`/tenant-lms-meter-provide/lms/meter/laboratorySetting/delete/${id}`);
  },
  getTableData1(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratorySetting/list1', params);
  },
}

const batchRecordApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratoryBatchReceiptController/listRecords', params);
  },
  getDetailTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratoryBatchReceiptController/getBatchReceiptParticulars', params);
  },
  getTotalTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratoryBatchReceiptController/getBatchReceiptStat', params);
  },
  // 导出
download(ids) {
  return postJson(`/tenant-lms-meter-provide/lms/meter/laboratoryBatchReceiptController/getBatchReceiptParticularsDownload`, ids)
},
}

const batchManagementApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratoryBatchAutoRule/list', params);
  },
  getDetail(id) {
    return get(`/tenant-lms-meter-provide/lms/meter/laboratoryBatchAutoRule/get/${id}`);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/laboratoryBatchAutoRule/add', params);
  },
  onEdit(params) {
    return put('/tenant-lms-meter-provide/lms/meter/laboratoryBatchAutoRule/edit', params);
  },
  onStatusChange(params) {
    return put(`/tenant-lms-meter-provide/lms/meter/laboratoryBatchAutoRule/editStatus?${qs(params)}`);
  },
  onDelete(id) {
    return patch(`/tenant-lms-meter-provide/lms/meter/laboratoryBatchAutoRule/delete/${id}`);
  }
}

const batchReceiptApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratoryBatchReceiptController/listRecords', params);
  },
  getTableData1(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratorySetting/list1', params);
  },
  onDelete(id) {
    return delJson(`/tenant-lms-meter-provide/lms/meter/laboratorySetting/delete?id=${id}`);
  },
}

const testRecordApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratoryRecords/list', params);
  },
  getDetail(id) {
    return get(`/tenant-lms-meter-provide/lms/meter/laboratoryRecords/get/${id}`);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/laboratoryRecords/add', params);
  },
  onEdit(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/laboratoryRecords/edit', params);
  },
  onDelete(id) {
    return delJson(`/tenant-lms-meter-provide/lms/meter/laboratoryRecords/delete/${id}`);
  },
}

const qualityInspectionApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/laboratoryQualityInsReport/list', params);
  },
  getDetail(id) {
    return get(`/tenant-lms-meter-provide/lms/meter/laboratoryQualityInsReport/get/${id}`);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/laboratoryQualityInsReport/add', params);
  },
  onEdit(params) {
    return put('/tenant-lms-meter-provide/lms/meter/laboratoryQualityInsReport/edit', params);
  },
  onDelete(id) {
    return delJson(`/tenant-lms-meter-provide/lms/meter/laboratoryQualityInsReport/delete/${id}`);
  }
}


export { examinationRoomSettingApi, batchRecordApi, batchManagementApi, batchReceiptApi, testRecordApi ,qualityInspectionApi };