<template>
  <div class="tetris">
    <div>점수 : {{score}}</div>
    <div class="tetris-stage">
      <board :blocks="bgBlockString" />
      <my-block :blocks="myBlockString" :x="curBlockX" :y="curBlockY" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import Board from '@/components/Board.vue';
import MyBlock from '@/components/MyBlock.vue';

const maxBgY = 16;
const maxBgX = 10;
// color는 0은 투명, 1~7까지 블록색상, 6은 bg색상
const bgColor = 8;

const maxMyY = 4;
const maxMyX = 4;

interface Timer {
  clear?: () => void;
}

function delay(ms: number, timer?: Timer) {
  return new Promise((resolve) => {
    const id = setTimeout(() => {
      resolve('timeout');
    }, ms);
    if (timer) {
      timer.clear = () => {
        clearTimeout(id);
        resolve('stop');
      }
    }
  });
}

const myblocks = [
  [ // type
    [ // direction
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  [
    [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
  ],
  [
    [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
  ],
  [
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [1, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
  ],
  [
    [
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ]
  ],
  [
    [
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [1, 0, 0, 0],
      [0, 0, 0, 0],
    ]
  ],
  [
    [
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [1, 0, 0, 0],
      [1, 1, 1, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
  ]
];

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함
}

@Component({
  name: 'tetris',
  components: {
    Board,
    MyBlock,
  }
})
export default class Tetris extends Vue {
  private bgBlock = new Array<Array<number>>();
  private bgBlockString = '[]';
  private myBlockString = '[]';
  private timer: Timer = {};
  private score = 0;

  private curBlockDirection!: number;
  private curBlockType!: number;
  private curBlockX = 0;
  private curBlockY = -maxMyY;
  private curSpeed = 500;

  private startGame() {
    this.clearBg();
    this.score = 0;

    (async() => {
      let running = true;
      while (running) {
        this.curSpeed = 1000;
        this.newMyBlock();
        let autoDown = true;
        while (autoDown) {
          await delay(this.curSpeed, this.timer);
          if (this.checkCollision(this.curBlockX, this.curBlockY + 1, this.curBlockDirection)) {
            this.curSpeed = 1000;
            autoDown = false;
          } else {
            this.curBlockY++;
          }
        }

        // 현재 블럭을 bg에 저장
        if (this.setMyBlockInBgAndCheckGameOver()) {
          running = false;
        } else {
          const newBgBlock = [];
          this.bgBlock.forEach((row) => {
            if (row.some((data) => (data === bgColor))) {
              newBgBlock.push(row);
            }
          });

          // 행이 채워진게 있음
          if (newBgBlock.length !== maxBgY) {
            for (let i = newBgBlock.length; i < maxBgY; i++) {
              const row = new Array(maxBgX);
              row.fill(bgColor, 0, maxBgX)
              newBgBlock.unshift(row);
              this.score++;
            }
            this.bgBlock = newBgBlock;
            await delay(300);
            this.bgBlockString = JSON.stringify(this.bgBlock);
          }
        }
      }

      alert('gameover');
      this.startGame();
    })();
  }

  private newMyBlock() {
    this.curBlockX = Math.floor((maxBgX - maxMyX) / 2);
    this.curBlockY = -Math.floor(maxMyY / 2);
    this.curBlockType = getRandomInt(0, myblocks.length - 1);
    this.curBlockDirection = 0;
    this.drawMyBlock(this.curBlockType, this.curBlockDirection);
  }

  private getNextDirection(direction: number) {
    if (direction < myblocks[this.curBlockType].length - 1) {
      direction++;
    } else {
      direction = 0;
    }
    return direction;
  }

  private nextDirection() {
    this.curBlockDirection = this.getNextDirection(this.curBlockDirection);
    this.drawMyBlock(this.curBlockType, this.curBlockDirection);
  }

  private clearBg() {
    for (let y = 0; y < maxBgY; y++) {
      this.bgBlock[y] = new Array(maxBgX);
      this.bgBlock[y].fill(bgColor, 0, maxBgX);
      // for (let x = 0; x < maxBgX; x++) {
      //   this.bgBlock[y][x] = bgColor;
      // }
    }

    this.bgBlockString = JSON.stringify(this.bgBlock);
  }

  private drawMyBlock(type: number, direction: number) {
    const color = type + 1;
    
    // type
    const myBlock = new Array(maxMyY);
    for (let y = 0; y < maxMyY; y++) {
      myBlock[y] = new Array(maxMyX);
      for (let x = 0; x < maxMyX; x++) {
        if (myblocks[type][direction][y][x] === 1) {
          myBlock[y][x] = color;
        } else {
          myBlock[y][x] = 0;
        }
      }
    }

    this.myBlockString = JSON.stringify(myBlock);
  }

  protected mounted() {
    this.startGame();
    document.addEventListener('keydown', this.handleKeyPress, false);
  }

  protected checkCollision(x: number, y: number, direction: number): boolean {
    const type = this.curBlockType;
    const myBlock = new Array(maxMyY);
    for (let cy = 0; cy < maxMyY; cy++) {
      myBlock[cy] = new Array(maxMyX);
      for (let cx = 0; cx < maxMyX; cx++) {
        if (myblocks[type][direction][cy][cx] === 1) {
          if (y + cy >= maxBgY) {
            return true;
          }
          if (x + cx < 0 || x + cx >= maxBgX) {
            return true;
          }
          if (y + cy < 0) {
            continue;
          }
          // 이미 블럭이 쌓여 있음
          if (this.bgBlock[y + cy][x + cx] !== bgColor) {
            return true;
          }
        }
      }
    }

    return false;
  }

  protected handleKeyPress(e: KeyboardEvent) {
    console.log(e.keyCode);
    switch (e.keyCode) {
      case 40: /* bottom */
      case 32: /* space */
        // 아래로 빠르게 떨어뜨림
        this.curSpeed = 10;
        this.timer.clear && this.timer.clear();
        break;
      case 37: /* left */
        if (!this.checkCollision(this.curBlockX - 1, this.curBlockY, this.curBlockDirection)) {
          this.curBlockX--;
        }
        break;
      case 38: /* top */
        // 방향전환
        if (!this.checkCollision(this.curBlockX, this.curBlockY, this.getNextDirection(this.curBlockDirection))) {
          this.nextDirection();
        }
        break;
      case 39: /* right */
        if (!this.checkCollision(this.curBlockX + 1, this.curBlockY, this.curBlockDirection)) {
          this.curBlockX++;
        }
        break;
    }
    console.log('move: ', this.curBlockX, this.curBlockY);
  }

  protected setMyBlockInBgAndCheckGameOver() {
    const x = this.curBlockX;
    const y = this.curBlockY;
    const type = this.curBlockType;
    const color = type + 1;
    const direction = this.curBlockDirection;
    for (let cy = 0; cy < maxMyY; cy++) {
      for (let cx = 0; cx < maxMyX; cx++) {
        if (myblocks[type][direction][cy][cx] === 1) {
          if (y + cy < 0) {
            // game over
            return true;
          }
          this.bgBlock[y + cy][x + cx] = color;
        }
      }
    }
    this.bgBlockString = JSON.stringify(this.bgBlock);
  }

  protected beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeyPress, false);
  }
}
</script>

<style lang="scss" scoped>
.tetris-stage {
  position: relative;
  box-sizing: border-box;
  width: calc(32px * 10);
  height: calc(32px * 16);
  background-color: #fff;
  overflow: hidden;

  &::v-deep {
    .horz {
      display: flex;
    }
    .color-1 {
      background-color: red;
    }
    .color-2 {
      background-color: orange;
    }
    .color-3 {
      background-color: yellow;
    }
    .color-4 {
      background-color: green;
    }
    .color-5 {
      background-color: blue;
    }
    .color-6 {
      background-color: purple;
    }
    .color-7 {
      background-color: deeppink;
    }
    .color-8 {
      background-color: #ccc;
    }
    .block {
      margin: 1px;
      border-radius: 5px;
      height: 28px;
      width: 28px;
      border: 1px solid #444;
    }
  }
}

</style>