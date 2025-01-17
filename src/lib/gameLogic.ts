import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'

import * as PIXI from 'pixi.js'

export const isGameWon = writable(false)

export function initializeBoard(
  board: Array<Array<{ hasMine: boolean; status: string }>>,
  rows: number,
  columns: number,
  mineCount: number
) {
  for (let y = 0; y < rows; y++) {
    board[y] = []
    for (let x = 0; x < columns; x++) {
      board[y][x] = {
        hasMine: false,
        status: 'closed',
      }
    }
  }
  // random bombs placed
  let minesPlaced = 0
  while (minesPlaced < mineCount) {
    const x = Math.floor(Math.random() * columns)
    const y = Math.floor(Math.random() * rows)
    if (!board[y][x].hasMine) {
      board[y][x].hasMine = true
      minesPlaced++
    }
  }
}
export function checkWin(
  board: Array<Array<{ hasMine: boolean; status: string }>>,
  rows: number,
  columns: number
): boolean {
  let allNonMinesRevealed = true
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      if (board[y][x].status === 'closed' && !board[y][x].hasMine) {
        allNonMinesRevealed = false
        break
      }
    }
    if (!allNonMinesRevealed) {
      break
    }
  }
  return allNonMinesRevealed
}
export function getAdjacentMines(
  board: Array<Array<{ hasMine: boolean; status: string }>>,
  x: number,
  y: number,
  rows: number,
  columns: number
) {
  let count = 0
  for (let yOffset = -1; yOffset <= 1; yOffset++) {
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      if (xOffset === 0 && yOffset === 0) continue
      const newX = x + xOffset
      const newY = y + yOffset
      if (newX >= 0 && newX < columns && newY >= 0 && newY < rows) {
        if (board[newY][newX].hasMine) {
          count++
        }
      }
    }
  }
  return count
}
export function toggleFlag(
  board: Array<Array<{ hasMine: boolean; status: string }>>,
  x: number,
  y: number,
  currentScore: Writable<number>
) {
  if (board[y][x].status === 'closed') {
    board[y][x].status = 'flagged' // if cell closed ,flag it
    currentScore.update((n) => n - 5)
  } else if (board[y][x].status === 'flagged') {
    board[y][x].status = 'closed' // unflag
    currentScore.update((n) => n + 1) // update score
  }
}
