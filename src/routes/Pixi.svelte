<script lang="ts">
  import {
    Graphics,
    Text,
    Sprite,
    createAsset
  } from 'pixi-svelte';
  import * as game from './lib/gameLogic';
  import { rows, columns, mineCount, cellSize } from './lib/gameConstant';
  import { writable } from 'svelte/store';
  import bombImage from './img/bomb.png';
  import flagImage from '$lib/images/flag.png';
  import PixiApp from './PixiApp.svelte'
  
  // Initialize board state
  const boardColors = writable(Array(rows).fill(Array(columns).fill(0x808080)));
  const boardStore = writable(game.initialize(rows, columns, mineCount));
 
  // Define game mode ('reveal' or 'flag')
  let mode = 'reveal';
  //
  let isGameOver = false;
  
  // Subscribe to the board store and check for win condition
  boardStore.subscribe((board) => {
    if (game.checkWin(board, rows, columns)) {
      alert('You Win!');
    }
  });

  function handleRectangleClick(x:any, y:any, event:any) {
	if (isGameOver) return;
    boardStore.update((board) => {
      const newBoard = board.map(row => [...row]);
      const cell = newBoard[y][x];

      if (mode === 'flag') {
        cell.status = cell.status === 'closed' ? 'flagged' : 'closed';
      } else if (mode === 'reveal' && cell.status === 'closed') {
        game.revealCell(newBoard, x, y,handleGameOver);
      }
      return newBoard;
    });
  }

  function restartGame() {
  boardStore.set(game.initialize(rows, columns, mineCount));
  boardColors.set(Array(rows).fill(Array(columns).fill(0x808080)));
  isGameOver = false;
}
  function handleGameOver(value:any) {
    isGameOver = value;
  }
  // Toggle game mode between 'reveal' and 'flag'
  function toggleMode() {
    mode = mode === 'reveal' ? 'flag' : 'reveal';
  }

//   function revealCell(board: any, x: any, y: any) {
//   // Check if coordinates are within the board boundaries
//   if (x < 0 || x >= columns || y < 0 || y >= rows) return;
  
//   let cell = board[y][x];

//   // Return if the cell is already open or flagged
//   if (cell.status !== 'closed') return;

//   // Open the cell
//   cell.status = 'open';

//   // Handle the case when a mine is clicked
//   if (cell.hasMine) {
//     alert('Game Over!');
//     isGameOver = true;
//     // Reveal all mines
//     board.forEach((row, rowIndex) => {
//       row.forEach((cell, colIndex) => {
//         if (cell.hasMine) {
//           cell.status = 'open';
//         }
//       });
//     });
//     return;
//   }
//   // Recursively open adjacent cells if the current cell has no adjacent mines
//   if (game.getAdjacentMines(board, x, y, rows, columns) === 0) {
//     for (let dx = -1; dx <= 1; dx++) {
//       for (let dy = -1; dy <= 1; dy++) {
//         if (dx === 0 && dy === 0) continue;
//         revealCell(board, x + dx, y + dy);
//       }
//     }
//   }
// }

</script>

<PixiApp assets={{ bomb: createAsset({ img: bombImage }), flag: createAsset({ img: flagImage }) }}>
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
</PixiApp>

<div class="game-intro">
	<p>Welcome to the Minesweeper Game!</p>
	<p>Click on a cell to reveal it, or toggle the mode to mark suspected mines.</p>
  </div>
  
  <button class="my-button toggle" on:click={toggleMode}>Toggle Mode</button>
  <button class="my-button restart" on:click={restartGame}>Restart Game</button>
  <p class="my-text">Current Mode: {mode}</p>
<style>
	.my-button, .my-text, .game-intro {
	  position: fixed;
	  left: 50%;
	  transform: translateX(-50%);
	  z-index: 10;
	  text-align: center;
	}
  
	.my-button {
	  background-color: #007bff;
	  color: white;
	  border: none;
	  border-radius: 5px;
	  padding: 10px 20px;
	  cursor: pointer;
	  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	  margin-bottom: 10px; 
	  transition: background-color 0.3s;
	}
  
	.my-button:hover {
	  background-color: #0056b3;
	}
  
	.toggle {
	  bottom: 140px; 
	}
  
	.restart {
	  bottom: 100px; 
	}
  
	.my-text {
	  bottom: 60px; 
	  color: #333;
	  font-size: 16px;
	}
  
	.game-intro {
	  bottom: 180px; 
	  color: #333;
	  font-size: 16px;
	  max-width: 300px; 
	  padding: 0 10px; 
	}
  </style>
  