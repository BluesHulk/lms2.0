import { get, getFile, postFile, postJson } from '../http'

export default {
	// 下载模板
	downloadTemplate(url, method, params) {
		if (method == 'post') {
			return postFile(url, params, { responseType: 'blob' });
		} else if (method == 'get') {
			return getFile(url, params, { responseType: 'blob' });
		}
	},
	//查询状态数据字典
	getDictionaryList(params) {
		return get(`/upms-management-provider/dictionary/data/list/${params}`)
	},
	// 查询租户端数据字典
	getTenantDictionaryList(params) {
		return get(`/upms-provider/tenant/dictionary/data/list/${params}`)
	},
	//获取省市区域树
	getRegionTree() {
		return get(`/upms-management-provider/sys/region/find/region/tree`)
	},
	// 文件上传
	fileUpload(obj) {
		return postFile('/upms-management-provider/file/upload/fileName', obj)
	},
	// 文件上传(限格式)
	fileUploadFormatLimit(obj) {
		return postFile('/upms-management-provider/file/uploadOnFormatLimit', obj)
	},
	// 获取用户菜单权限
	getMenuByUser(params) {
		return get('/upms-provider/tenant/user/auth', params);
	},
	// 获取企业列表
	getTenantList(params) {
		return get('/upms-management-provider/sys/tenant/list', params);
	},
	// 获取企业列表
	getbusinessList() {
		return get(`/upms-management-provider/sys/user/tenants`)
	},
	// 获取企业信息
	getTenantInfo(obj) {
		const params = obj ? getParams(obj) : ''
		return get(`/upms-provider/tenant/detail?${params}`)
	},
	// 获取当前租户子公司列表
	getSubsidiaryList() {
		return get('/upms-provider/tenant/relation/subsidiary-list');
	},
	// 获取客户列表
	getCustomer(params) {
		return get('/tenant-lms-basic-provide/lms/basic/customer/list', params);
	},
	// 获取公司列表
	getCompany(params) {
		return get('/upms-management-provider/sys/user/tenants', params);
	},
	// 获取企业组织人员树
	getDeptUserTreeList(params) {
		return get('/upms-provider/tenant/dept/getDeptUserTreeList', params);
	},
	// 获取客商列表
	getCustomerList(params) {
		return get('/tenant-lms-basic-provide/lms/basic/customer/listByCondition', params);
	},
	// 获取客商分页列表
	getCustomerPage(params) {
		return get('/tenant-lms-basic-provide/lms/basic/customer/page', params);
	},
	getCustomerdetail(params) {
    return get(`/tenant-lms-basic-provide/lms/basic/customer/detail/${params.id}`)
  },
	// 获取物料分类树
	getMaterialTree(params) {
		return get('/tenant-lms-basic-provide/lms/basic/productCategory/getTree', params)
	},
	getMaterialTableData(params) {
		return get('/tenant-lms-basic-provide/lms/basic/product/list', params);
	},
	//获取物料批次
	getBatchTableData(params) {
		return get('/tenant-lms-meter-provide/lms/meter/laboratoryBatchInfo/list', params);
	},
	// 获取车辆列表
	getCarList(params) {
		return get('/tenant-lms-basic-provide/lms/basic/car/getCar', params);
	},
	addCar(params) {
		return postJson('/tenant-lms-basic-provide/lms/basic/car/save', params);
	},
	// 获取司机列表
	getDriverList(params) {
		return get('/tenant-lms-basic-provide/lms/basic/driver/getDriver', params);
	},
	//添加司机
	addDriver(params) {
		return postJson('/tenant-lms-basic-provide/lms/basic/driver/save', params);
	},
	// 获取企业组织树
	getDeptTree(params) {
		return get('/upms-provider/tenant/dept/tree', params);
	},
	// 获取业务员
	getSalesmanList(params) {
		return get(`/tenant-lms-basic-provide/lms/basic/customer/salesman/list`, params)
	},
	// 获取客户价格单
	getCustomerPrice(params) {
		return get(`/tenant-lms-price-provide/priceListCustomerGoods/customerGoodsList`, params)
	}
}