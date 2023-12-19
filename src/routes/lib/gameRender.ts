import * as PIXI from 'pixi.js'

export class GameRender {
  private app: PIXI.Application
  private cellSize: number

  constructor(app: PIXI.Application, cellSize: number) {
    this.app = app
    this.cellSize = cellSize
  }

  createImageForCell(x: number, y: number, image: string) {
    const texture = PIXI.Texture.from(image)
    const sprite = PIXI.Sprite.from(texture)
    sprite.x = x * this.cellSize
    sprite.y = y * this.cellSize
    sprite.width = this.cellSize
    sprite.height = this.cellSize
    this.app.stage.addChild(sprite)
  }

  createTextForCell(x: number, y: number, adjacentMines: number) {
    const textStyle = new PIXI.TextStyle({
      fill: 0x000000,
      fontSize: this.cellSize / 2,
      align: 'center',
    })
    const text = new PIXI.Text(adjacentMines.toString(), textStyle)
    text.x = x * this.cellSize + this.cellSize / 2
    text.y = y * this.cellSize + this.cellSize / 2
    text.anchor.set(0.5)
    this.app.stage.addChild(text)
  }
}
