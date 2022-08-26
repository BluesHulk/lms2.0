import { get, put, postJson, delJson, qs } from '../http';

//价格设置
const priceSettingApi = {
    //列表查询
  getTableData(params) {
    return get('/tenant-lms-price-provide/priceList/page', params);
  },
  getPriceTableData(params) {
    return get('/tenant-lms-price-provide/priceListGoods/list', params);
  },
  //撤回
  onUndo(params) {
    return put('/tenant-lms-price-provide/priceList/withdraw', params);
  },
  //删除
  onDelete(params) {
    return delJson(`/tenant-lms-price-provide/priceList/delete`,params);
  },
  //查询详情
  getDetail(id) {
    return get('/tenant-lms-price-provide/priceList/detail', { id })
  },
  onAdd(params) {
    return postJson('/tenant-lms-price-provide/priceList/save', params);
  },
  onEdit(params) {
    return postJson('/tenant-lms-price-provide/priceList/update', params);
  },
   //修改状态
   onUnStatus(params) {
    return put(`/tenant-lms-price-provide/priceList/updateStatus?${qs(params)}`);
  },
  //获取企业列表
  getbusinessList() {
    return get(`/upms-management-provider/sys/user/tenants`)
},
// 导出
download(ids,type) {
  return postJson(`/tenant-lms-price-provide/priceList/export?priceListType=${type}`, ids)
},
getAddress(params) {
  return get('/tenant-lms-basic-provide/lms/basic/address/getAddress', params);
},
//分配客户
addCustomer(params) {
  return postJson('/tenant-lms-price-provide/priceListCustomer/save', params);
},
//获取历史价格
getHistoryPrice(params) {
  return get('/tenant-lms-price-provide/priceListAdjustGoods/page', params);
},
}
//调价单
const dadjapManagementApi = {
    //列表查询
  getTableData(params) {
    return get('/tenant-lms-price-provide/priceListAdjust/page', params);
  },
  getDetailTable(params) {
    return postJson('/tenant-lms-price-provide/priceListGoods/toAdjustList', params);
  },
  //撤回
  onUndo(params) {
    return put('/tenant-lms-price-provide/priceListAdjust/withdraw', params);
  },
  //删除
  onDelete(params) {
    return delJson(`/tenant-lms-price-provide/priceListAdjust/deleteBatch`,params);
  },
  //查询详情
  getDetail(id) {
    return get('/tenant-lms-price-provide/priceListAdjust/detail', { id })
  },
  onAdd(params) {
    return postJson('/tenant-lms-price-provide/priceListAdjust/save', params);
  },
  onEdit(params) {
    return postJson('/tenant-lms-price-provide/priceListAdjust/update', params);
  },
   //修改状态  
   onUnStatus(params) {
    return put(`/tenant-lms-price-provide/priceListAdjust/updateStatus?${qs(params)}`);
  },
  getPriceTableData(params) {
    return get('/tenant-lms-price-provide/priceListAdjustGoods/list', params);
  },
  // 导出
download(ids) {
  return postJson(`/tenant-lms-price-provide/priceListAdjust/export`, ids)
},
}
//价格设置
const customerPriceApi = {
  //列表查询
getTableData(params) {
  return get('/tenant-lms-price-provide/priceListCustomer/page', params);
},
onAdd(params) {
  return postJson('/tenant-lms-price-provide/priceListCustomer/save', params);
},
 //修改状态  
 onUnType(params) {
  return put(`/tenant-lms-price-provide/priceListCustomer/updateType?type=${params.type}`, params.ids);
},
getPriceTableData(params) {
  return get('/tenant-lms-price-provide/priceListCustomerGoods/list', params);
},
//获取历史价格
getHistoryPrice(params) {
  return get('/tenant-lms-sales-provide/lms/business/sales/dporder/historyPage', params);
},
downloadHistory(ids) {
  return postJson(`/tenant-lms-price-provide/priceListCustomer/export`, ids)
},
downloadNow(ids) {
  return postJson(`/tenant-lms-price-provide/priceListCustomer/exportHistory`, ids)
},
}
export { priceSettingApi,dadjapManagementApi,customerPriceApi };