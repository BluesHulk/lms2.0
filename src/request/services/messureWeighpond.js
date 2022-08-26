import { get, put, patch, postJson, delJson, post, qs,postFile } from '../http';

const mockTableData = {
	"code": 0,
	"data": {
		"countId": "",
		"current": 0,
		"maxLimit": 0,
		"optimizeCountSql": true,
		"orders": [
			{
				"asc": true,
				"column": ""
			}
		],
		"pages": 0,
		"records": [
			{
				"accountFlag": "1",
				"batchNum": "",
				"batchType": "",
				"billCustomer": "",
				"billFactoryName": "",
				"businessType": "1",
				"cardIdNo": "",
				"cardNo": "003733871185",
				"countryStandard": "",
				"createTime": "",
				"createUser": 0,
				"createUserName": "",
				"dpOrderNum": "",
				"driverId": 0,
				"driverIdCard": "",
				"driverName": "",
				"driverPhone": "",
				"fromAreaCode": "",
				"fromAreaName": "",
				"grantCardTime": "",
				"id": 1,
				"inTime": 1658111083000,
				"isDelete": true,
				"licensePlate": "浙A11111",
				"lmsType": "",
				"logisticsNum": "",
				"modelMaterial": "",
				"needBatch": "",
				"needPda": "",
				"nodeNow": "120",
				"orderNum": "",
				"orderSourse": "",
				"outTime": 1658111083000,
				"packType": "D",
				"predictWeigh": 0,
				"pringCount": 0,
				"productCode": "",
				"productGroupType": "",
				"productName": "水泥",
				"pushG7": "",
				"recycleCardTime": "",
				"remark": "",
				"replenishOrderFlag": "",
				"sampleOrder": "",
				"status": "1",
				"strength": "",
				"tenantAddressBusiness": "",
				"tenantId": 0,
				"tenantIdBusiness": "",
				"tenantIdTransport": "",
				"tenantName": "英雄联盟",
				"tenantNameBusiness": "",
				"tenantNameTransport": "",
				"toAreaCode": "",
				"toAreaName": "",
				"unloadMethod": "",
				"updateTime": "",
				"updateUser": 0,
				"updateUserName": "",
				"variety": "",
				"waybillNum": "",
				"weighOrderUrl": "",
				"weighType": "",
				"whCode": "",
				"whName": ""
			},
      {
				"accountFlag": "0",
				"batchNum": "",
				"batchType": "",
				"billCustomer": "",
				"billFactoryName": "",
				"businessType": "2",
				"cardIdNo": "",
				"cardNo": "003733876666",
				"countryStandard": "",
				"createTime": "",
				"createUser": 0,
				"createUserName": "",
				"dpOrderNum": "",
				"driverId": 0,
				"driverIdCard": "330323198008132278",
				"driverName": "张三",
				"driverPhone": "",
				"fromAreaCode": "",
				"fromAreaName": "",
				"grantCardTime": "",
				"id": 2,
				"inTime": "",
				"isDelete": true,
				"licensePlate": "浙A22222",
				"lmsType": "",
				"logisticsNum": "",
				"modelMaterial": "",
				"needBatch": "",
				"needPda": "",
				"nodeNow": "888",
				"orderNum": "",
				"orderSourse": "",
				"outTime": "",
				"packType": "S",
				"predictWeigh": 0,
				"pringCount": 0,
				"productCode": "",
				"productGroupType": "",
				"productName": "",
				"pushG7": "",
				"recycleCardTime": "",
				"remark": "",
				"replenishOrderFlag": "",
				"sampleOrder": "",
				"status": "2",
				"strength": "",
				"tenantAddressBusiness": "",
				"tenantId": 4,
				"tenantIdBusiness": "",
				"tenantIdTransport": "",
				"tenantName": "英雄联盟",
				"tenantNameBusiness": "",
				"tenantNameTransport": "",
				"toAreaCode": "",
				"toAreaName": "",
				"unloadMethod": "",
				"updateTime": "",
				"updateUser": 0,
				"updateUserName": "",
				"variety": "",
				"waybillNum": "",
				"weighOrderUrl": "",
				"weighType": "",
				"whCode": "",
				"whName": ""
			}
		],
		"searchCount": true,
		"size": 0,
		"total": 0
	},
	"ext": {},
	"message": "",
	"success": true
}


const weighpondApi = {
  getTableData(params) {
    // return get(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/page`, params );
    return mockTableData
  },
  addItem(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics`, params)
  },
  updateItem(params) {
    return patch(`/tenant-lms-meter-provide/lms/meter/calculate/logistics`, params)
  },
  deleteItem(params) {
    return delJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/${params}`)
  },


	//业务流程
	getBusinessProcess(params) {
		return get(`/tenant-lms-meter-provide/lms/meter/calculate/businessType/detail`, params)
	},

  /*操作相关*/

  //补单
    //todo

  //核算
  toAdjust(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/adjustAccounts`, params)
  },
  //核算驳回
    //todo

  //回退
  toBack(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/backNode`, params)
  },
  
  //厂内物流 退货&空车出厂
  toNotMaterial(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/notMaterial`, params)
  },
  //作废
  toCancel(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/cancellationWeigh`, params)
  },
  //过磅
  toWeighting(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logisticsWeighing/weighting`, params)
  },
  //验收
  toCheck(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logisticsWeighing/check`, params)
  },
  //开始装货&结束装货 loadFlag装卸标识 load==开始装卸，unload=结束装卸
  toLoad(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/load`, params)
  },
  //进厂 & 出厂
  toPassDoor(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/door/passDoor`, params)
  },
  //发卡
  toGrantCard(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/grantCard`, params)
  },
  //收卡
  toRecycleCard(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/recycleCard`, params)
  },
  //换卡
  toChangeCard(params) {
    return postJson(`/tenant-lms-meter-provide/lms/meter/calculate/logistics/changeCard`, params)
  },
  //空车出厂完结
  //手工开闸
  //手工关闸
}





export { weighpondApi  };
