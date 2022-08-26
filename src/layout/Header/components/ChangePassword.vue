<template>
  <el-dialog
    v-model="isShow"
    width="732px"
    title="修改密码"
    custom-class="reset-passwor-dialog"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="handleClose"
  >
    <div class="check-main">
      <el-steps :active="setupActive" align-center>
        <el-step title="手机号验证"></el-step>
        <el-step title="输入新密码"></el-step>
      </el-steps>
      <div class="retrievePass-main" v-if="setupActive == 1">
        <div class="retrievePass-main-title">手机号验证</div>
        <el-form
          ref="retrieveRef"
          :model="retrieveForm"
          :rules="retrieveRules"
          label-position="top"
        >
          <el-form-item prop="iphone" label="手机">
            <el-input
              placeholder="请输入手机号"
              v-model="retrieveForm.iphone"
            >
              <template #prepend>+86</template>
            </el-input>
          </el-form-item>
          <el-form-item label="验证码">
            <div class="codebox">
              <el-input
                v-model="retrieveForm.code"
                placeholder="请输入4位验证码"
              ></el-input>
              <el-button
                type="primary"
                @click="onCodeVerify"
                :disabled="codeGet || !retrieveForm.iphone"
                >{{ yzm }}</el-button
              >
            </div>
          </el-form-item>
        </el-form>
        <button class="btn" @click="retrievePassword">下一步</button>
      </div>
      <!--重置密码  -->
      <div class="reset-main" v-if="setupActive == 2">
        <p class="reset-title">请重设置密码</p>
        <p class="reset-smtitle">最少8位，不能全字母或数字</p>
        <el-form
          ref="resetpassRef"
          :model="resetpassForm"
          :rules="resetpassRules"
        >
          <el-form-item prop="newpassword">
            <el-input
              placeholder="请输入新密码"
              :type="showNewPassword ? 'text' : 'password'"
              class="password"
              v-model="resetpassForm.newpassword"
            >
              <template #suffix>
                <i @click="changeShowPassword('showNewPassword')" :class="`iconfont ${showNewPassword ? 'icon-keshi' : 'icon-bukeshi'}`"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="againpassword">
            <el-input
              placeholder="请再次输入密码"
              :type="showAffirmPassword ? 'text' : 'password'"
              class="password"
              v-model="resetpassForm.againpassword"
            >
              <template #suffix>
                <i @click="changeShowPassword('showAffirmPassword')" :class="`iconfont ${showAffirmPassword ? 'icon-keshi' : 'icon-bukeshi'}`"></i>
              </template>
            </el-input>
          </el-form-item>
        </el-form>
        <button class="btn" @click="submitNewPassword">提交</button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { reactive, ref, toRefs } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import user from "@/request/services/user";

export default {
  name: "ChangePassword",
  setup() {
    const router = useRouter();

    const isShow = ref(false);
    const setupActive = ref(1);
    const codeGet = ref(false);
    const yzm = ref("发送验证码");
    const countDown = ref(60);

    const validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== formState.resetpassForm.newpassword) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };

    const formState = reactive({
      retrieveForm: {},
      resetpassForm: {},
      retrieveRules: {
        iphone: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          {
            required: true,
            pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
            message: "请输入正确格式的手机号",
            trigger: "blur",
          },
        ],
      },
      resetpassRules: {
        newpassword: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            pattern: /^(?![A-Za-z]+$)(?![0-9]+$)[A-Za-z0-9]{6,20}$/,
            message: "密码格式字母与数字组合，6-20个字符",
            trigger: "blur",
          },
        ],
        againpassword: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            pattern: /^(?![A-Za-z]+$)(?![0-9]+$)[A-Za-z0-9]{6,20}$/,
            message: "密码格式字母与数字组合，6-20个字符",
            trigger: "blur",
          },
          { validator: validatePass, trigger: "blur", required: true },
        ],
      },
      retrieveRef: ref(null),
      resetpassRef: ref(null),
    });

    const password = reactive({
      showNewPassword: false,
      showAffirmPassword: false,
    })

    const changeShowPassword = (type) => {
      password[type] = !password[type];
    }

    const onCodeVerify = () => {
      formState.retrieveRef.validate(async (valid) => {
        if (valid) {
          toCode();
        }
      });
    };

    // 发送验证码
    const toCode = () => {
      user.getCaptcha(formState.retrieveForm.iphone).then((res) => {
        if (res.code == 0) {
          let timerId = setInterval(() => {
            countDown.value--;
            yzm.value = countDown.value + "秒后重试";
            codeGet.value = true;
            if (countDown.value <= 0) {
              clearInterval(timerId);
              yzm.value = "重新发送";
              countDown.value = 60;
              codeGet.value = false;
            }
          }, 1000);
        } else {
          ElMessage({
            type: "waring",
            message: res.message,
          });
        }
      });
    };
    const retrievePassword = () => {
      formState.retrieveRef.validate(async (valid) => {
        if (valid) {
          user.RetrievePassword(formState.retrieveForm).then((res) => {
            if (res.code == 0) {
              setupActive.value = 2;
            } else {
              ElMessage({
                type: "waring",
                message: res.message,
              });
            }
          });
        }
      });
    };
    // 提交
    const submitNewPassword = () => {
      formState.resetpassRef.validate(async (valid) => {
        const data = {
          mobile: formState.retrieveForm.iphone,
          newCheckPassword: formState.resetpassForm.newpassword,
          newPassword: formState.resetpassForm.againpassword,
          verificationCode: formState.retrieveForm.code,
        };
        if (valid) {
          user.checkPassword(data).then((res) => {
            if (res.code == 0) {
              isShow.value = false;
              ElMessageBox.confirm("您已重新设置密码，请重新登录", {
                confirmButtonText: "确定",
              }).then(() => {
                router.push("/login");
              });
            }
          });
        }
      });
    };

    const modalShow = () => {
      isShow.value = true;
    };

    const handleClose = () => {
      isShow.value = false;
    };

    return {
      isShow,
      setupActive,
      yzm,
      codeGet,
      ...toRefs(formState),
      ...toRefs(password),
      modalShow,
      handleClose,
      onCodeVerify,
      retrievePassword,
      submitNewPassword,
      changeShowPassword,
    };
  },
};
</script>

<style lang="scss" scoped>
.check-main {
  width: 500px;
  overflow: hidden;
  .btn {
    width: 100%;
  }
  .retrievePass-main {
    .retrievePass-main-title {
      padding: 30px 0;
      font-size: 18px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: #333333;
      line-height: 25px;
      text-align: center;
    }
    .codebox {
      display: flex;
      .el-button {
        margin-left: 20px;
      }
    }
    .btn {
      margin-top: 20px;
    }
  }
  ::v-deep {
    .el-steps {
      position: relative;
      left: 50%;
      width: 820px;
      transform: translate(-50%);
      .el-step__line {
        height: 4px;
      }
      .el-step__icon {
        width: 30px;
        height: 30px;

        .el-step__icon-inner {
          color: #fff;
        }
      }
      .is-finish {
        .el-step__line {
          background-color: $color-blue;
        }
        .el-step__icon {
          background: $color-blue;
        }
      }
      .is-process {
        .el-step__line {
          background-color: #ccc;
        }
        .el-step__icon {
          background: #ccc;
          border: none;
        }
      }
      .el-step__title {
        padding-top: 8px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        line-height: 20px;
      }
      .el-step__title.is-finish {
        color: $color-blue;
      }
      .el-step__title.is-process {
        color: #ccc;
      }
    }

    .el-form {
      .el-form-item__label {
        margin-bottom: 8px;
        line-height: 22px;
      }
    }
  }
}

.reset-main {
  .reset-title {
    padding: 30px 0 10px;
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #333333;
    line-height: 25px;
    text-align: center;
  }
  .reset-smtitle {
    padding-bottom: 40px;
    font-size: 12px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 500;
    color: #999999;
    line-height: 17px;
    text-align: center;
  }
  .btn {
    margin-top: 20px;
  }
  .icon-keshi {
    color: $color-blue;
  }

  ::v-deep {
    .el-input--suffix {
      .el-input__suffix {
        right: 10px;
      }
    }
  }
}
</style>

<style lang="scss">
.el-overlay {
  .reset-passwor-dialog {
    .el-dialog__header {
      padding: 15px;
      text-align: center;
      border-bottom: 1px solid #eee;

      span {
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #3a3a3a;
      }
    }
    .el-dialog__body {
      display: flex;
      justify-content: center;
    }
  }
}
</style>