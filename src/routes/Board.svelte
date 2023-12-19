<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import * as PIXI from 'pixi.js';
	import * as game from './lib/gameLogic';
	import { GameRender } from './lib/gameRender';
    import { Rectangle,Graphics } from 'pixi.js';
	import {
		rows,
		columns,
		mineCount,
		cellSize,
		cellColor,
		openCellColor,
		FLAG_IMAGE_BASE64,
		BOMB_IMAGE_BASE64
	} from './lib/gameConstant';

	let app: PIXI.Application;
	let win = false;
	let gameOver = false;
	let render: GameRender;
	let currentScore = writable(0);
	let board: Array<Array<{ hasMine: boolean; status: string }>> = []; //status: closed, open, flagged
	let boardVersion = writable(0);

	onMount(() => {
		app = new PIXI.Application({
			width: columns * cellSize,
			height: rows * cellSize,
			backgroundColor: 0xeeeeee
		});
		const canvasElement = app.view as HTMLCanvasElement;
		canvasElement.oncontextmenu = (e: MouseEvent) => e.preventDefault();
		document.getElementById('game-board')?.appendChild(canvasElement);

		game.initializeBoard(board, rows, columns, mineCount);
		render = new GameRender(app, cellSize);
		drawBoard();

		app.stage.interactive = !gameOver;
		app.stage.on('pointerdown', onCellClick);
	});

	function drawBoard() {
		const graphics = new PIXI.Graphics();
		// clear all children
		app.stage.removeChildren();

		// draw board
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < columns; x++) {
				const cell = board[y][x];
				let color; // local variable to store color
				switch (cell.status) {
					case 'closed':
						if (gameOver) {
							color = 0xff0000; // if game over, color is red
							break;
						} else {
							color = cellColor; // if cell closed, color is grey
							break;
						}
					case 'mine':
						render.createImageForCell(x, y, BOMB_IMAGE_BASE64);
						continue;
					case 'flagged':
						render.createImageForCell(x, y, FLAG_IMAGE_BASE64);
						continue;
					case 'open':
						const adjacentMines = game.getAdjacentMines(board, x, y, rows, columns);
						if (adjacentMines > 0) {
							render.createTextForCell(x, y, adjacentMines);
						}
						continue;
					default:
						color = openCellColor; //if cell open, color is light grey
						PIXI.LineStyle;
				}
				//for each cell, draw a rectangle according to the color from switch sentence
				graphics.beginFill(color);
				graphics.drawRect(x * cellSize, y * cellSize, cellSize, cellSize);
				graphics.lineStyle(1, 0x000000, 1);
				graphics.endFill();
			}
		}
		app.stage.addChild(graphics);
	}

	function onCellClick(event: any) {
        
		const isRightClick = event.data.button === 2; // right click
		const position = event.data.getLocalPosition(app.stage);
		const x = Math.floor(position.x / cellSize);
		const y = Math.floor(position.y / cellSize);
		if (x >= 0 && x < columns && y >= 0 && y < rows) {
			if (isRightClick) {
                console.log('right click');
				game.toggleFlag(board, x, y, currentScore);
			} else {
                console.log('left click');
				revealCell(x, y); // left click
			}
			$boardVersion++; // update the board
			win = game.checkWin(board, rows, columns);
		}
	}

	function revealCell(x: number, y: number) {
		// Check if the selected cell is already open; if so, return early
		if (board[y][x].status !== 'closed') {
			return;
		}
		// If the cell contains a mine, reveal all mines and end the game
		if (board[y][x].hasMine) {
			revealAllMines();
			gameOver = true;
			return;
		}
		// Set the status of the cell to open
		board[y][x].status = 'open';

		// Calculate the total number of open cells for scoring purposes
		$currentScore++; // Update the current score

		// Calculate the number of adjacent mines
		const adjacentMines = game.getAdjacentMines(board, x, y, rows, columns);

		// If there are adjacent mines, display the count; otherwise, recursively open adjacent cells
		if (adjacentMines > 0) {
			render.createTextForCell(x, y, adjacentMines); // Display mine count for this cell
		} else {
			// Open adjacent cells if they are within the board's bounds and not already open
			for (let yOffset = -1; yOffset <= 1; yOffset++) {
				for (let xOffset = -1; xOffset <= 1; xOffset++) {
					if (xOffset === 0 && yOffset === 0) continue; // Skip the current cell
					const newX = x + xOffset;
					const newY = y + yOffset;
					if (newX >= 0 && newX < columns && newY >= 0 && newY < rows) {
						revealCell(newX, newY); // Recursive call to open adjacent cell
					}
				}
			}
		}
	}

	function revealAllMines() {
		$boardVersion++;
		for (let y = 0; y < rows; y++) {
			for (let x = 0; x < columns; x++) {
				if (board[y][x].hasMine) {
					board[y][x].status = 'mine';
					render.createImageForCell(x, y, BOMB_IMAGE_BASE64);
				}
			}
		}
	}
	function restartGame() {
		gameOver = false;
		app.stage.interactive = true;
		$currentScore = 0;
		game.initializeBoard(board, rows, columns, mineCount);
		$boardVersion++;
	}

	function showPopup(popupId: string, title: string) {
		app.stage.interactive = false;
		let popup = document.getElementById(popupId);
		let restartButton = document.getElementById(`${popupId}RestartButton`);

		if (popup) {
			popup.style.display = 'flex';
			let titleElement = popup.querySelector('.popup-title');
			if (titleElement) titleElement.textContent = title;
		}

		if (restartButton) {
			restartButton.addEventListener('click', function () {
				if (popup) popup.style.display = 'none';
				restartGame();
			});
		}
	}

	$: if (gameOver) {
		showPopup('gameOverPopup', 'Game Over!');
	}

	$: if (win) {
		showPopup('winPopup', 'You Win!');
	}

	$: if ($boardVersion > 0) {
		drawBoard();
	}
</script>

<main>
	<div id="game-board" />
	<div id="bottom-bar">
		<p id="score">Score: <b>{$currentScore}</b></p>
	</div>
</main>

<div id="gameOverPopup" class="popup">
	<div class="popup-content">
		<h2 class="popup-title">Game Over</h2>
		<button id="gameOverPopupRestartButton" class="restart-button">Restart Game</button>
	</div>
</div>
<div id="winPopup" class="popup">
	<div class="popup-content">
		<h2 class="popup-title">Game Over</h2>
		<button id="winPopupRestartButton" class="restart-button">Restart Game</button>
	</div>
</div>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background: #ecf0f1;
		font-family: 'Arial', sans-serif;
	}

	#game-board {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#bottom-bar {
		width: 100%;
		padding: 10px;
		background: #34495e;
		color: white;
		text-align: center;
	}

	.popup {
		display: none;
		position: fixed;
		left: 50%;
		top: 10px;
		transform: translateX(-50%);
		width: auto;
		max-width: 300px;
		background: rgba(255, 255, 255, 0.95);
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
		z-index: 1000;
	}

	.popup-content h2 {
		font-size: 20px;
		margin: 0 0 10px;
	}
	.restart-button {
		background-color: #e74c3c;
		color: white;
		padding: 10px 20px;
		border: none;
		border-radius: 25px;
		cursor: pointer;
		font-size: 18px;
		transition: all 0.3s;
		display: inline-block;
		text-decoration: none;
	}

	.restart-button:hover {
		background-color: #c0392b;
		transform: scale(1.1);
	}
</style>
