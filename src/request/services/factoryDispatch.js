import { get, put, postJson, delJson, qs, patch } from '../http';

const millManagementApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/mill/page', params);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/dispatch/mill/create', params);
  },
  onEdit(params) {
    return put('/tenant-lms-meter-provide/lms/meter/dispatch/mill/update', params);
  },
  onDelete(id) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/mill/delete?millId=${id}`);
  },
  getMillList(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/mill/list', params);
  }
}

const customerLaneSettingApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/customer/lane/page', params);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/dispatch/customer/lane/create', params);
  },
  onEdit(params) {
    return put('/tenant-lms-meter-provide/lms/meter/dispatch/customer/lane/update', params);
  },
  onDelete(id) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/customer/lane/delete?customerLaneId=${id}`);
  },
}

const groupMaterialSettingApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/product/group/page', params);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/dispatch/product/group/create', params);
  },
  onEdit(params) {
    return put('/tenant-lms-meter-provide/lms/meter/dispatch/product/group/update', params);
  },
  onDelete(id) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/product/group/delete?id=${id}`);
  },
}

const reinstallationRecordQueryApi = {
	getLoadingLaneList(params) {
		return get('/tenant-lms-meter-provide/lms/meter/dispatch/load/lane/list', params);
	},
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/replenish/record/page', params);
  },
  onConfirm(id) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/replenish/record/confirm?replenishRecordId=${id}`);
  },
}

const salesVehicleDispatchApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/vehicle/queue/page', params);
  },
  onLeaveTeam(id) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/vehicle/queue/leave?queueId=${id}`);
  },
  onSpecifyLane(loadLaneId, queueId) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/vehicle/queue/appoint-lane?loadLaneId=${loadLaneId}&queueId=${queueId}`);
  },
  onSetLineup(queueId, type) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/vehicle/queue/move-first-last?queueId=${queueId}&type=${type}`);
  },
  getCustomerList(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/load/lane/customer-list', params);
  },
}

const loadingStatisticsApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/load/statistics/page', params);
  },
}

const laneManagementApi = {
  getTableData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/load/lane/page', params);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/dispatch/load/lane/create', params);
  },
  onEdit(params) {
    return put('/tenant-lms-meter-provide/lms/meter/dispatch/load/lane/update', params);
  },
  onDelete(id) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/load/lane/delete?loadLaneId=${id}`);
  },
  onStatusChange(params) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/load/lane/isEnable?${qs(params)}`);
  }
}

const laneVehicleDispatchApi = {
  getLaneData(params) {
    return get('/tenant-lms-meter-provide/lms/meter/dispatch/vehicle/queue/list', params);
  },
  onAdd(params) {
    return postJson('/tenant-lms-meter-provide/lms/meter/dispatch/load/lane/create', params);
  },
  onLeave(id) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/vehicle/queue/leave?queueId=${id}`);
  },
  onMove(params) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/vehicle/queue/move?${qs(params)}`);
  },
  onUpdate(params) {
    return patch(`/tenant-lms-meter-provide/lms/meter/dispatch/load/lane/isEnable?${qs(params)}`);
  },
}

export { millManagementApi, customerLaneSettingApi, laneManagementApi, groupMaterialSettingApi, salesVehicleDispatchApi, reinstallationRecordQueryApi, loadingStatisticsApi,laneVehicleDispatchApi };
