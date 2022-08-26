<template>
  <div :class="`scroll ${!barShow && 'scroll-hidden'}`" @mouseenter="enterWrap" @mouseleave="leaveWrap">
    <div class="scroll-view" ref="scrollList">
      <slot />
    </div>
    <!-- <div class="scroll-bar" ref="" v-show="barShow">
      <div ref="bar" :style="scrollStyle" @mousedown="dragScroll($event)"></div>
    </div> -->
  </div>
</template>

<script>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import store from "@/store";
export default {
  setup() {
    let barShow = ref(false),
      scrollStyle = ref(""),
      barWidthPercentage = 0, //滚动条百分比
      isDrag = false;
    const scrollList = ref(null);
    // 更新滚动条样式，是否置于最右边
    const update = (isToRight = false) => {
      if (!scrollList.value) return;
      const widthPercentage = (scrollList.value.clientWidth * 100) / scrollList.value.scrollWidth;
      barWidthPercentage = widthPercentage < 100 ? widthPercentage : 0;
      if (isToRight) {
        let width = scrollList.value.clientWidth,
          barLeft = ((100 - barWidthPercentage) * width) / 100,
          percentWidth = (barLeft * 10000) / barWidthPercentage / width;
        scrollStyle.value = `
          transform:translateX(${percentWidth.toFixed(2)}%);
          width:${barWidthPercentage}%;
        `;
        scrollList.value.scrollLeft = (barLeft / barWidthPercentage) * 100;
      } else {
        scrollStyle.value = `width:${barWidthPercentage}%;`;
        scrollList.value.scrollLeft = 0;
      }
    };
    // 监听插槽数据变化，若列表长度加长则更新数据
    let navLen = store.state.common.navList.length;
    watch(store.state.common.navList, (nV) => {
      if (nV.length > navLen) {
        nextTick(() => {
          update(true);
        });
      }
      navLen = nV.length;
    });
    // 拖动滚动条
    const dragScroll = (e) => {
      isDrag = true;
      let wrap = scrollList.value,
        box = e.target,
        width = wrap.clientWidth;
      let divx = e.clientX - box.getBoundingClientRect().left;
      document.body.onmousemove = function (e) {
        //获取移动后div的位置：鼠标位置-divx/divy
        let barLeft = e.clientX - divx - wrap.getBoundingClientRect().left,
          maxLeft = ((100 - barWidthPercentage) * width) / 100;
        barLeft = barLeft < 0 ? 0 : barLeft;
        barLeft = barLeft > maxLeft ? maxLeft : barLeft;
        let percentWidth = (barLeft * 10000) / barWidthPercentage / width;
        scrollStyle.value = `
          transform:translateX(${percentWidth.toFixed(2)}%);
          width:${barWidthPercentage}%;
        `;
        scrollList.value.scrollLeft = (barLeft / barWidthPercentage) * 100;
        e.preventDefault();
      };
      document.body.onmouseup = function () {
        barShow.value = false;
        isDrag = false;
        document.body.onmousemove = null;
        document.body.onmouseup = null;
      };
    };
    // 进入菜单时判断是否显示滚动条
    const enterWrap = () => {
        if (scrollList.value.scrollWidth > scrollList.value.clientWidth) {
          barShow.value = true;
        }
      },
      // 划出菜单时判断是否隐藏滚动条
      leaveWrap = () => {
        if (!isDrag) {
          barShow.value = false;
        }
      };
    onMounted(() => {
      nextTick(update);
      addEventListener("resize", update);
    });
    onBeforeUnmount(() => {
      removeEventListener("resize", update);
    });
    return {
      barShow,
      scrollStyle,
      scrollList,
      dragScroll,
      enterWrap,
      leaveWrap,
    };
  },
};
</script>

<style lang="scss" scoped>
.scroll {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.4rem;
  overflow: hidden;
  overflow-x: scroll;

  &::-webkit-scrollbar {
    display: none;
  }
  &:hover {
    &::-webkit-scrollbar {
      display: block;
      height: 8px;
    }
  }

  .scroll-view {
    height: 100%;
  }

  &-bar {
    position: absolute;
    cursor: pointer;
    bottom: 0;
    height: 5px;
    width: 100%;
    > div {
      height: 100%;
      background: #cccccc;
      width: 50%;
      border-radius: 5px;
    }
  }
}

.scroll-hidden {
  &::-webkit-scrollbar {
    display: none !important;
  }
}
</style>