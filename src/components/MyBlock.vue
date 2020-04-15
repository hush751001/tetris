<template>
  <div class="my-block" :style="getStyle">
    <div v-for="(row, indexY) in getBlocks" :key="indexY" class="horz">
      <div v-for="(block, indexX) in row" :key="indexX" class="block" :class="`color-`+block"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class MyBlock extends Vue {
  @Prop({type: String}) private blocks!: string;
  @Prop({type: Number}) private x!: number;
  @Prop({type: Number}) private y!: number;
  private style = '';
  protected mounted() {
    console.log(this.blocks);
  }

  private get getStyle() {
    const x = this.x * 32;
    const y = this.y * 32;

    return `transform: translate(${x}px, ${y}px);`;
  }

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
.my-block {
  background-color: transparent;
  position: absolute;
}
</style>
