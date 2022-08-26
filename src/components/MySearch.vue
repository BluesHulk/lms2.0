<template>
  <div class="my-search-container">
    <el-select
      class="condittion-select"
      v-if="conditionSelectShow"
      :placeholder="conditionPlaceholder"
      :style="conditionSelectSty"
      v-model="conditionValue"
      @change="onConditionSelectChange"
    >
      <el-option
        :label="item.label"
        :value="item.value"
        v-for="(item, index) in searchCondition"
        :key="index"
      ></el-option>
    </el-select>
    <el-input
      class="search-ele"
      v-if="searchEleType == 'number'"
      v-model="searchVal"
      type="number"
      placeholder="输入关键字搜索"
    >
    </el-input>
    <el-input
      class="search-ele"
      v-if="searchEleType == 'input'"
      v-model="searchVal"
      placeholder="输入关键字搜索"
    >
    </el-input>
    <el-select
      class="search-ele"
      filterable
      clearable
      v-if="searchEleType == 'select'"
      v-model="searchVal"
      placeholder="请选择"
    >
      <el-option
        v-for="item in searchOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>
    <el-button @click="onSearchClick" type="primary">
      <i class="iconfont icon-a-16search"></i>
    </el-button>
  </div>
</template>

<script>
import { ref, watch } from "vue";
export default {
  name: "MySearch",
  props: {
    conditionSelectShow: {
      type: Boolean,
      default: true,
    },
    initConditionValue: {
      type: String,
    },
    searchCondition: {
      type: Array,
      default: () => [],
    },
    conditionSelectSty: {
      type: Object,
      default: () => ({
        width: "110px",
      }),
    },
    conditionPlaceholder: {
      type: String,
      default: "请选择",
    },
    initSearchEleType: {
      type: String,
      default: "input",
    },
    searchMultOptions: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { emit }) {
    const conditionValue = ref(props.initConditionValue);
    const searchVal = ref();
    const searchEleType = ref(props.initSearchEleType);
    const searchOptions = ref(props.searchMultOptions)
    const onConditionSelectChange = (val) => {
      conditionValue.value = val;
      searchVal.value = undefined;
      props.searchCondition.map((item) => {
        if (item.value == val) {
          searchEleType.value = item.ele ? item.ele : "input";
          if(item.ele == 'select'){
            searchOptions.value = item.options || []
          }
        }
      });
    };

    const onSearchClick = () => {
      emit("onSearch", { [conditionValue.value]: searchVal.value || "" });
    };

    watch(
      () => conditionValue.value,
      (newVal) => {
        emit("onConditionChange", newVal);
      }
    );

    return {
      conditionValue,
      searchEleType,
      searchOptions,
      onConditionSelectChange,
      searchVal,
      onSearchClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.my-search-container {
  display: flex;
  align-items: center;

  .condittion-select {
    ::v-deep {
      .el-input__wrapper {
        padding: 0 11px;
        border: 1px solid $color-border;
        border-right: none;
        border-radius: 4px 0 0 4px;
        box-shadow: none;
        box-sizing: border-box;
      }
    }
  }
  .search-ele {
    width: 166px;
    ::v-deep {
      .el-input__wrapper {
        border-radius: 0;
      }
    }
  }
  .el-button {
    display: flex;
    width: 40px;
    border-radius: 0 4px 4px 0;
    justify-content: center;
    align-items: center;
    .iconfont {
      font-size: 16px;
      color: #fff;
      line-height: 0;
    }
  }
}
</style>