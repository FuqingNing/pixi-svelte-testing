// gameLogic.ts
export function initializeBoard(
  rows: number,
  columns: number,
  mineCount: number
) {
  let board = Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ({
      mine: false,
      revealed: false,
      adjacentMines: 0,
    }))
  )

  // 随机放置雷
  let minesPlaced = 0
  while (minesPlaced < mineCount) {
    let x = Math.floor(Math.random() * columns)
    let y = Math.floor(Math.random() * rows)
    if (!board[y][x].mine) {
      board[y][x].mine = true
      minesPlaced++
    }
  }

  // 计算邻近雷数
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      if (board[y][x].mine) continue
      let adjacentMines = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          let nx = x + dx,
            ny = y + dy
          if (
            nx >= 0 &&
            nx < columns &&
            ny >= 0 &&
            ny < rows &&
            board[ny][nx].mine
          ) {
            adjacentMines++
          }
        }
      }
      board[y][x].adjacentMines = adjacentMines
    }
  }
  console.log(board)
  return board
}
export function handleClick(x: number, y: number, grid: any) {}
