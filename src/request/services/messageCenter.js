import { get, put, patch, postJson } from '../http';

const messageCenterApi = {
  //查询出分页的推送数据
  getMessagePushList(params) {
    return get('/message-center-management-provider/push-message/retrieve/page', params);
  },
  //删除推送数据
  deleteMessagePush(ids) {
    return patch(`/message-center-management-provider/push-message/${ids}`);
  },
  //查询出所有的租户
  getTenantList(params) {
    return get('/upms-management-provider/sys/tenant/list', params);
  },
  //根据ID查询推送消息
  getPushInfo(id) {
    return get(`/message-center-management-provider/push-message/retrieve/${id}`);
  },
  //新增推送消息
  addMessagePush(params) {
    return postJson('/message-center-management-provider/push-message/save', params);
  },
  //更新推送消息
  editMessagePush(params) {
    return put('/message-center-management-provider/push-message/update', params);
  },
  //根据ID查询模板数据
  getMessagePush(id) {
    return patch(`/message-center-management-provider/push-message/retrieve/${id}`);
  },
  //根据ID查询模板数据
  getMessageTemplate(id) {
    return get(`/message-center-management-provider/push-template/retrieve/${id}`);
  },
  //新增模板数据
  addMessageTemplate(params) {
    return postJson('/message-center-management-provider/push-template/save', params);
  },
  //更新模板数据
  editMessageTemplate(params) {
    return put('/message-center-management-provider/push-template/update', params);
  },
  //查询出分页的模版数据
  getMessageTemplateList(params) {
    return get('/message-center-management-provider/push-template/retrieve/page', params);
  },
  //查询所有的的模版数据
  getMessageTemplateAll(params) {
    return get('/message-center-management-provider/push-template/retrieve', params);
  },
  //查询所有的签名
  getMessageSignatureAll(params) {
    return get('/message-center-management-provider/sign/retrieve', params);
  },
  //删除推送数据
  deleteMessageTemplate(ids) {
    return patch(`/message-center-management-provider/push-template/${ids}`);
  },

  //查询出分页的签名数据
  getSignatureList(params) {
    return get('/message-center-management-provider/sign/retrieve/page', params);
  },
  //删除签名数据
  deleteSignature(ids) {
    return patch(`/message-center-management-provider/sign/${ids}`);
  },
  //根据ID查询签名数据
  getSignature(id) {
    return get(`/message-center-management-provider/sign/retrieve/${id}`);
  },
  //新增签名数据
  addSignature(params) {
    return postJson('/message-center-management-provider/sign/save', params);
  },
  //更新签名数据
  editSignature(params) {
    return put('/message-center-management-provider/sign/update', params);
  },
  // 查询出分页的推送消息数据
  getMessageInfoList(params) {
    return get('/message-center-management-provider/push-message-record/retrieve/page', params);
  },
  //删除推送记录
  deleteMessageInfo(ids) {
    return patch(`/message-center-management-provider/push-message-record/${ids}`);
  },
  //重发消息
  resendMessage(ids) {
    return patch(`/message-center-management-provider/push-message-record/resend/${ids}`);
  },

  // 查询socket推送消息数据
  getSocketMessageList(params) {
    return get('/message-center-management-provider/push-socket-message-record/retrieve', params);
  },
  // socket消息标为已读
  readMessage(id) {
    return patch(`/message-center-management-provider/push-socket-message-record/read/${id}`);
  }
}
export { messageCenterApi };