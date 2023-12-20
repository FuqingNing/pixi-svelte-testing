import { rows, columns } from './gameConstant';

export function initialize(rows: number, columns: number, mineCount: number) {
  const board = []
  for (let y = 0; y < rows; y++) {
    const row = []
    for (let x = 0; x < columns; x++) {
      row.push({ hasMine: false, status: 'closed' })
    }
    board.push(row)
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
  return board
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
export function revealCell(
  board: any[], 
  x: number,
  y: number,
  setIsGameOver: (isGameOver: boolean) => void
) {
  if (x < 0 || x >= columns || y < 0 || y >= rows) return;
  console.log('revealCell', x, y);
  console.log('board', board);
  let cell = board[y][x];
  if (cell.status !== 'closed') return;

  cell.status = 'open';

  if (cell.hasMine) {
    alert('Game Over!');
    setIsGameOver(true);
    // Reveal all mines
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        if (board[y][x].hasMine) {
          board[y][x].status = 'open';
        }
      }
    }
    return;
  }

  if(getAdjacentMines(board, x, y, rows, columns) === 0) {
    // Reveal all adjacent cells as they don't have mines
    for (let yOffset = -1; yOffset <= 1; yOffset++) {
      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        if (xOffset === 0 && yOffset === 0) continue;
        const newX = x + xOffset;
        const newY = y + yOffset;
        if (newX >= 0 && newX < columns && newY >= 0 && newY < rows) {
          revealCell(board, newX, newY, setIsGameOver);
        }
      }
    }
  }
}
