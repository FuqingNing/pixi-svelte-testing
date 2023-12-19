<script lang="ts">
  import {
    createApp,
    setAppContext,
    Graphics,
    Text,
    Sprite,
    createAsset,
    type Assets
  } from 'pixi-svelte';
  import * as game from './lib/gameLogic';
  import { rows, columns, mineCount, cellSize } from './lib/gameConstant';
  import { writable } from 'svelte/store';
  import bombImage from './img/bomb.png';
  import flagImage from '$lib/images/flag.png';
  import StoryPixi from './StoryPixi.svelte';

  // Initialize board state
  const boardColors = writable(Array(rows).fill(Array(columns).fill(0x808080)));
  const boardStore = writable(game.initialize(rows, columns, mineCount));
 
  const context = createApp();
  let assets: Assets = undefined;
  const { loaded } = context;
setAppContext({ ...context, assets });

  // Define game mode ('reveal' or 'flag')
  let mode = 'reveal';

  // Subscribe to the board store and check for win condition
  boardStore.subscribe((board) => {
    if (game.checkWin(board, rows, columns)) {
      alert('You Win!');
    }
  });

  function handleRectangleClick(x:any, y:any, event:any) {
    boardStore.update((board) => {
      const newBoard = board.map(row => [...row]);
      const cell = newBoard[y][x];

      if (mode === 'flag') {
        cell.status = cell.status === 'closed' ? 'flagged' : 'closed';
      } else if (mode === 'reveal' && cell.status === 'closed') {
        revealCell(newBoard, x, y);
      }

      return newBoard;
    });
  }


  // Toggle game mode between 'reveal' and 'flag'
  function toggleMode() {
    mode = mode === 'reveal' ? 'flag' : 'reveal';
  }

	function revealCell(board: any, x: any, y: any) {
		// 确保坐标在边界内
		if (x < 0 || x >= columns || y < 0 || y >= rows) return;
		let cell = board[y][x];
		// 如果格子已经打开或标记了雷，不再处理
		if (cell.status !== 'closed') return;
		cell.status = 'open';
		// 如果点击了雷
		if (cell.hasMine) {
			alert('Game Over!');
			// 揭示所有雷
			board.forEach((row, rowIndex) => {
				row.forEach((cell, colIndex) => {
					if (cell.hasMine) {
						cell.status = 'open'; // 更新状态为 'open'
					}
				});
			});
			boardColors.update((colors) => {
				let newColors = colors.map((row) => [...row]);
				board.forEach((row, rowIndex) => {
					row.forEach((cell, colIndex) => {
						if (cell.hasMine) {
							// 将带有雷的格子的颜色设置为红色
							newColors[rowIndex][colIndex] = 0xff0000;
						}
					});
				});
				return newColors;
			});
			return;
		}
		// 如果当前格子没有相邻雷，则递归打开相邻格子
		if (game.getAdjacentMines(board, x, y, rows, columns) === 0) {
			// 遍历所有相邻的格子
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					if (dx === 0 && dy === 0) continue;
					revealCell(board, x + dx, y + dy);
				}
			}
		}
	}
</script>

<StoryPixi assets={{ bomb: createAsset({ img: bombImage }), flag: createAsset({ img: flagImage }) }}>
	{#each $boardStore as row, y}
    {#each row as cell, x}
      {#if cell.status === 'closed'}
        <Graphics
          x={x * cellSize}
          y={y * cellSize}
          draw={(graphics) => {
            graphics.lineStyle(1, 0x000000, 1);
            graphics.beginFill($boardColors[y][x]);
            graphics.drawRect(0, 0, cellSize, cellSize);
            graphics.endFill();
          }}
          eventMode="dynamic"
          on:click={(event) => handleRectangleClick(x, y, event)}
        />
      {:else if cell.status === 'open' && !cell.hasMine}
        <Text
          x={x * cellSize + cellSize / 2}
          y={y * cellSize + cellSize / 2}
          style={{
            fill: 0x000000,
            fontSize: cellSize / 2,
            align: 'center'
          }}
          value={game.getAdjacentMines($boardStore, x, y, rows, columns).toString()}
        />
      {:else if cell.status === 'flagged'}
        <Graphics
          x={x * cellSize}
          y={y * cellSize}
          draw={(graphics) => {
            graphics.lineStyle(1, 0x000000, 1);
            graphics.beginFill(0xFFFFFF, 1); // Transparent fill
            graphics.drawRect(0, 0, cellSize, cellSize);
            graphics.endFill();
          }}
          eventMode="dynamic"
          on:click={(event) => handleRectangleClick(x, y, event)}
        />
        <Sprite x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} key="flag" />
      {:else if cell.status === 'open' && cell.hasMine}
        <Sprite x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} key="bomb" />
      {/if}
    {/each}
  {/each}
</StoryPixi>
<button class="my-button" on:click={toggleMode}>切换模式</button>
<p class="my-text">当前模式: {mode}</p>
<style>
	.my-button, .my-text {
	  position: fixed; /* 固定定位，相对于视口 */
	  left: 50%; /* 水平居中 */
	  transform: translateX(-50%); /* 水平居中的偏移量 */
	  z-index: 10; /* 层级 */
	}
  
	.my-button {
	  bottom: 20px; /* 距离底部 20px */
	  /* 其他按钮样式... */
	}
  
	.my-text {
	  bottom: 60px; /* 距离底部 60px，保持在按钮上方 */
	  color: #333; /* 文字颜色 */
	  /* 可以添加更多样式，如字体大小、对齐等 */
	}
  </style>