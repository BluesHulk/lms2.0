import { ElMessage } from "element-plus";

/** 
 * get方法，对应get请求 拼接请求参数
 * @param {Object} obj [请求时携带的参数] 
 */
export function getParams(obj) {
  let params = ''
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== '' && obj[k] !== null) {
      params += params ? `&${k}=${obj[k]}` : `${k}=${obj[k]}`
    }
  })
  return params
}

/**
 * @param data 需要转换结构的源数据
 * @param needColNum 需要增加table序号列数据
 * @param needKey 需要增加唯一标识key
 * @param currentPage 当前页
 * @param pageSize 每页数据数目
 * @returns {*} 转换后的数据
 */
export function transformArrayData(data, needColNum, needKey, currentPage, pageSize) {
  // 需要添加table序号
  if (needColNum) {
    for (let i = 0; i < data.length; i++) {
      // 有分页
      if (currentPage && pageSize) {
        data[i]['num'] = pageSize * (currentPage - 1) + i + 1;
        // 无分页
      } else {
        data[i]['num'] = i + 1;
      }
    }
    // 需要添加唯一标识key
  }
  // 添加Key
  if (needKey) {
    for (let i = 0; i < data.length; i++) {
      // 若数据不存在key字段,则增加唯一标识key
      if (!data[i]['key']) data[i]['key'] = i;
    }
  }
  if (!needColNum && !needColNum) {
    console.info('检查transformArrayData方法参数(needColNum,needKey),返回数据结构未改变');
  }
  return data;
}

/** 
 * 上传图片，校验大小和图片格式
 * @param {Object} file [请求时携带的图片] 
 */
export function beforeAvatarUpload(size, file) {
  const isJPG = 'image/jpeg,image/png'.includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < size
  if (!isJPG) {
    ElMessage({
      type: 'error',
      message: '上传头像图片只能是 JPG 格式!',
    });
  }
  if (!isLt2M) {
    ElMessage({
      type: 'error',
      message: `上传头像图片大小不能超过 ${size}MB!`,
    });
  }
  return isJPG && isLt2M
}

/**
 * 获取assets静态图片资源
 * @param url 图片路径
 */
export const getAssetsImg = (url) => {
  return new URL(`../assets/imgs/${url}`, import.meta.url).href;
}
// 小数点前13位，小数点后2位
export function isNum(value) {
  const reg =  /^[\+\-]?(0|[1-9]\d{0,12}|0\.\d{2}|[1-9]\d{0,12}\.\d{2})$/;
  return reg.test(value)
}