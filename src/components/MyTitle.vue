<template>
  <div class="title">
    <i :class="`iconfont ${icon}`" v-if="icon"></i>
    <img :src="getAssetsImg(imgUrl)" v-if="imgUrl" />
    <span>{{ title }}</span>
  </div>
</template>

<script>
import { getAssetsImg } from "@/utils/index";
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    imgUrl: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    return {
      getAssetsImg,
    };
  },
};
</script>

<style lang="scss">
.title {
  display: flex;
  align-items: center;
  // height: 30px;
  .iconfont {
    font-size: 20px;
    color: $color-blue;
  }
  img {
    width: 20px;
  }
  span {
    padding-left: 8px;
    font-size: 16px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #092d5c;
  }
}
</style>