import { get,postJson,patch,postFile} from '../http'

const user={
	// 登录
    login(obj){
		return postJson('/upms-management-provider/sys/user/login/mobile',obj)
	},
	// 获取用户权限
    getuserPower(){
		return get('/upms-provider/tenant/user/auth')
	},
	// 获取手机验证码
	getCaptcha(tel){
		return get('/upms-management-provider/sys/user/verification?phone=' + tel)
	},
	// 注册用户校验
	registerCheck(data){
		return patch(`/upms-management-provider/sys/user/verification/registered?mobile=${data.telephone}&verificationCode=${data.code}`)
	},
	// 注册用户
	registerUser(data){
		return postJson('/upms-management-provider/sys/user/registered',data)
	},
	// 找回密码校验
	RetrievePassword(data){
		return patch(`/upms-management-provider/sys/user/verification/change/password?mobile=${data.iphone}&verificationCode=${data.code}`)
	},
	// 修改密码
	checkPassword(data){
		return patch(`/upms-management-provider/sys/user/change/password?mobile=${data.mobile}&newCheckPassword=${data.newCheckPassword}&newPassword=${data.newPassword}&verificationCode=${data.verificationCode}`)
	},
	// 获取企业列表
	getbusinessList(){
		return get(`/upms-management-provider/sys/user/tenants`)
	},
	// 新增企业
	addbusiness(obj){
		return postJson('/upms-management-provider/sys/user/add/tenant',obj)
	},
	// 获取首页用户信息
	getUserInfo(){
		return get('/upms-provider/tenant/user/home-info')
	},
	// 退出
	logout(){
		return get('/login/logout')
	},
	// 头像更改上传
	imgupload(obj){
		return postFile(`/upms-management-provider/file/upload/fileName`,obj)
	},
}

export default user
