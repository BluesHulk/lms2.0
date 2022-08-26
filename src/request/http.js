import axios from 'axios'
import { ElMessage } from "element-plus";
import router from '../router'

const instance = axios.create({
	headers: {
		'Content-Type': 'application/json;charset=utf-8'
	}, // 设置传输内容的类型和编码
	withCredentials: false, // 指定某个请求应该发送凭据。允许客户端携带跨域cookie，也需要此配置
	timeout: 60000, // 请求超时时间
});

/**
 * 配置请求地址
 */
// instance.defaults.baseURL = process.env.VITE_APP_BASE_API
instance.defaults.baseURL = import.meta.env.VITE_APP_BASE_API;

/*
 * 参数序列化
 * @param data 参数列表
 * @return
 */
export function qs(data) {
	if (data) {
		let datas = [];
		Object.keys(data).forEach(function (key) {
			datas.push(key + "=" + data[key]);
		});
		return datas.join("&");
	} else {
		return null
	}
}
/**
 * 请求拦截器
 */
instance.interceptors.request.use(
	config => {
		var token = sessionStorage.getItem('token')
		var refresh_token = sessionStorage.getItem('refresh_token')
		var tenantId = sessionStorage.getItem('tenantId')
		// token拼接Bearer空格请求接口权限
		if (token) {
			let newToken = token
			config.headers.access_token = newToken
			config.headers.refresh_token = refresh_token
			config.headers.tenant_id = tenantId
		}
		// if (config.url == "/login/check") {
		// 	config.headers.captcha = config.data.captcha;
		// 	config.headers.captchaCode = config.data.captchaCode;
		// }
		return config
	},
	err => {
		return Promise.reject(err)
		ElMessage({
			type: "error",
			message: "请求超时",
		});
	}
)

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
	// 请求成功
	res => {
		// token失效时，返回登录页，清除token和username
		// if (res.data.code == 4003) {
		// 	router.push("/login");
		// 	window.sessionStorage.removeItem("token");
		// 	window.sessionStorage.removeItem("'refresh_token");
		// }
		return res;
	},
	// 请求失败
	error => {
		return Promise.reject(error);
	});
/** 
 * get方法，对应get请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function get(url, params) {
	return new Promise((resolve, reject) => {
		instance({
			method: 'get',
			url: url,
			params: params,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
			},
			timeout: 60000,
		}).then(res => {
			checkStatus(res.data)
			resolve(res.data);
		}).catch(err => {
			reject(err)
		})
	});
}
export function getFile(url, params) {
	return new Promise((resolve, reject) => {
		instance({
			method: 'get',
			url: url,
			params: params,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
			},
			timeout: 60000,
			responseType: 'blob'
		}).then(res => {
			checkStatus(res.data)
			resolve({
				data: res.data,
				headers: res.headers
			});
		}).catch(err => {
			reject(err)
		})
	});
}
/** 
 * post方法，对应post请求 请求头为 application/json
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function post(url, params) {
	return new Promise((resolve, reject) => {
		instance({
			method: 'post',
			url: url,
			params: qs(params),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
			},
			timeout: 60000,
		}).then(res => {
			checkStatus(res.data)
			resolve(res.data);
		}).catch(err => {
			reject(err)
		})
	});
}
/** 
 * post方法，对应post请求 请求头为 application/json
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function postJson(url, data, token, params) {
	return new Promise((resolve, reject) => {
		instance({
			method: 'post',
			url: url,
			data: data,
			//params:params,
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: 60000 * 5,
			cancelToken: token
		}).then(res => {
			checkStatus(res.code || res.data.code)
			resolve(res.data);
		}).catch(err => {
			// ElMessage.error(err.response.data.message);
			reject(err)
		})
	});
}
/** 
 * post方法，对应post请求 请求头为 application/x-www-form-urlencoded
 * @param {String} url [请求的url地址] 上传文件
 * @param {Object} params [请求时携带的参数] 
 */
export function postFile(url, params, responseParams = {}) {
	return new Promise((resolve, reject) => {
		instance({
			method: 'post',
			url: url,
			data: params,
			headers: {
				'accept': 'application/json;',
			},
			timeout: 600000,
			...responseParams
		}).then(res => {
			checkStatus(res.data)
			resolve(res.data);
		})
			.catch(err => {
				reject(err)
			})
	});
}

/** 
 * put方法，对应put请求 请求头为 application/json
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function put(url, params) {
	return new Promise((resolve, reject) => {
		instance({
			method: 'put',
			url: url,
			data: params,
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: 60000,
		}).then(res => {
			checkStatus(res.data)
			resolve(res.data);
		}).catch(err => {
			reject(err)
		})
	});
}
/** 
 * del方法，对应delete请求  请求头为 application/x-www-form-urlencoded
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 */
export function del(url, params) {
	return new Promise((resolve, reject) => {
		instance({
			method: 'delete',
			url: url,
			params: params,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			timeout: 60000,
		}).then(res => {
			checkStatus(res.data)
			resolve(res.data);
		}).catch(err => {
			reject(err)
		})
	});
}
/** 
 * delJson方法，对应delete请求  请求头为 application/json
 * @param {String} url [请求的url地址] data:JSON.stringify(params){headers: {'Content-Type': 'application/json;charset=UTF-8'}}
 * @param {Object} params [请求时携带的参数] 
 */
export function delJson(url, params) {
	return new Promise((resolve, reject) => {
		instance({
			method: 'delete',
			url: url,
			data: params,
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: 60000,
		}).then(res => {
			checkStatus(res.data)
			resolve(res.data);
		}).catch(err => {
			reject(err)
		})
	});
}
// patch请求
export function patch(url, params) {
	return new Promise((resolve, reject) => {
		instance({
			method: 'patch',
			url: url,
			data: params,
			headers: {
				'Content-Type': 'application/json',
			},
			timeout: 60000,
		}).then(res => {
			checkStatus(res.data)
			resolve(res.data);
		}).catch(err => {
			reject(err)
		})
	});
}
// 令牌失效退出
function checkStatus(val) {
	if (val?.code == '100018') {
		// router.push({ path: '/login' })
		location.href = `${location.protocol}//${location.host}/middleground-web/#/login`;
	}
}
