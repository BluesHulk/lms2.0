<template>
  <div class="container">
    <div class="container-top">
      <slot name="top"></slot>
    </div>
    <div class="container-main">
      <div class="container-header"  v-if="$slots.header || $slots['header-right']">
        <div class="header-left">
          <slot name="header"></slot>
        </div>
        <div class="header-right">
          <slot name="header-right"></slot>
        </div>
      </div>
      <div class="container-body">
        <slot></slot>
      </div>
      <div class="container-footer">
        <slot name="footer"></slot>
      </div>
    </div>
    
  </div>
</template>


<style>
</style>

<style lang="scss">
  .container {
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
    position: relative;

    .container-main {
      padding: 24px;
      .container-header {
        display: flex;
        margin-bottom: 24px;
        justify-content: space-between;
        .header-left {
          display: flex;
        }
        .header-right {
          display: flex;
          align-items: center;
        }
      }
    }
  }
  .custom-table {
    .table-column-content {
      display: flex;
      width: 100%;
      align-items: center;
    }
    .account-box {
      display: inline-block;
      max-width: calc(100% - 52px);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .default-box {
      display: inline-flex;
      margin-left: 8px;
      width: 44px;
      height: 22px;
      font-size: 12px;
      font-family: PingFangSC-Regular, PingFang SC;
      color: #fff;
      background: #FFA93C;
      border-radius: 4px;
      justify-content: center;
      align-items: center;
    }
    .status-label {
      display: inline-block;
      margin-right: 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }
  .el-overlay .bank-info-drawer {

    .drawer-footer {
      display: flex;
      width: 100%;
      justify-content: center;
      box-sizing: border-box;

      .el-button {
        margin: 0 12px;
        height: 36px;
      }
    }
  }

  .search-container {
    width: 100%;
    height: 180px;
    background: #FFFFFF;
    padding: 24px 4px;
    box-sizing: border-box;
    .search-container-form {
      height: 90px;
      overflow-y: scroll;
      margin-bottom: 10px;
      padding: 0 20px;
    }
    .search-container-footer {
      text-align: center;
    }
    
    ::-webkit-scrollbar{
      width:4px;
      height:16px;
      background-color:#F5F5F5;
    }
    ::-webkit-scrollbar-track{
      box-shadow:inset 0 0 6px rgba(238, 238, 238, 0.3);
      border-radius:10px;
      background-color:#fff;
    }

    ::-webkit-scrollbar-thumb{
      border-radius: 2px;
      box-shadow:inset 0 0 6px rgba(206, 213, 222, 1);
      background-color:#CED5DE;
    }
  }

  .tabs-container {
    background-color: #fff;
    padding: 0 24px;
    .custom-tabs {
      .el-tabs__header {
        margin: 0;
        border-top: 1px solid #f6f7f9;
        .el-tabs__nav-wrap::after {
          width: 0;
          height: 0;
        }
      }
      .el-tabs__content {
        display: none;
      }
    }
  }



</style>