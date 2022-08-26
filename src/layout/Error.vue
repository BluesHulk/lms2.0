<template>
  <div class="box">
    <p>404</p>
  </div>
</template>

<script>
export default {
  name: "Error",
};
</script>

<style lang="scss" scoped>
.box {
  text-align: center;
  height: 100%;
  width: 100%;
  background: #fff;
  padding-top: 1rem;
  box-sizing: border-box;
  > p {
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 0.03rem;
    background: linear-gradient(to bottom, $color-blue, #a1c9f0, $color-blue);
    -webkit-background-clip: text;
    color: transparent;
  }
}
</style>