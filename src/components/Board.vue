<template>
  <div class="board">
    <div v-for="(row, indexY) in getBlocks" :key="indexY" class="horz">
      <div v-for="(block, indexX) in row" :key="indexX" class="block" :class="`color-`+block"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class Board extends Vue {
  @Prop() private blocks!: string;

  private get getBlocks() {
    let result = [];
    try {
      result = JSON.parse(this.blocks);
    } catch (e) {
      console.log(e);
    }
    return result;
  }
}
</script>

<style scoped lang="scss">
.board {
  background-color: #eee;
  position: absolute;
}
</style>
