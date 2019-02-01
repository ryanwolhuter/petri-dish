import React, { Component } from 'react'

const CELL_SIZE = 15
const WIDTH = 650
const HEIGHT = 650

const colors = [
  '#B3D7D4',
  '#7BB1AD',
  '#4F918C',
  '#2C7772',
  '#064B46',
]

function random(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const Cell = props => {
  const { x, y, index } = props
  let color

  if (index < 10) color = colors[4]
  if (index > 10 && index < 20) color = colors[3]
  if (index > 20 && index < 30) color = colors[2]
  if (index > 30 && index < 40) color = colors[1]
  if (index > 40 && index < 50) color = colors[0]
  if (index > 50 && index < 60) color = colors[4]
  if (index > 60 && index < 70) color = colors[3]
  if (index > 70 && index < 80) color = colors[2]
  if (index > 80 && index < 90) color = colors[1]
  if (index > 90 && index < 100) color = colors[0]
  if (index > 100 && index < 110) color = colors[4]
  if (index > 110 && index < 120) color = colors[3]
  if (index > 120 && index < 130) color = colors[2]
  if (index > 130 && index < 140) color = colors[1]
  if (index > 140 && index < 150) color = colors[0]
  if (index > 150 && index < 160) color = colors[4]
  if (index > 160 && index < 170) color = colors[3]
  if (index > 170 && index < 180) color = colors[2]
  if (index > 180 && index < 190) color = colors[1]
  if (index > 190 && index < 200) color = colors[0]
  if (index > 200) color = colors[random(colors.length)]


  return (
    <div
      className='cell'
      style={{
        left: `${CELL_SIZE * x + 1}px`,
        top: `${CELL_SIZE * y + 1}px`,
        width: `${CELL_SIZE + random(5)}px`,
        height: `${CELL_SIZE + random(5)}px`,
        backgroundColor: color
      }}
    />
  )
}

const Controls = props => {
  const {
    isRunning,
    runGame,
    stopGame,
    handleRandom,
    handleClear
  } = props
  return (
    <div className='controls'>
      {isRunning
        ? <button className='button' onClick={stopGame}>
          Stop
        </button>
        : <button className='button' onClick={runGame}>
          Run
        </button>
      }
      <button className='button' onClick={handleRandom}>Random</button>
      <button className='button' onClick={handleClear}>Clear</button>
    </div>
  )
}

class Game extends Component {

  state = {
    cells: [],
    interval: 80,
    isRunning: false
  }

  rows = HEIGHT / CELL_SIZE
  cols = WIDTH / CELL_SIZE

  // Create an empty board.

  makeEmptyBoard = () => {
    let board = []

    for (let y = 0; y < this.rows; y++) {
      board[y] = []
      for (let x = 0; x < this.cols; x++) {
        board[y][x] = false
      }
    }

    return board
  }

  board = this.makeEmptyBoard()

  // Create cells from this.board

  makeCells = () => {
    let cells = []
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.board[y][x]) {
          cells.push({ x, y })
        }
      }
    }

    return cells
  }

  getElementOffset = () => {
    const rect = this.boardRef.getBoundingClientRect()
    const doc = document.documentElement

    return {
      x: (rect.left + window.pageXOffset) - doc.clientLeft,
      y: (rect.top + window.pageYOffset) - doc.clientTop
    }
  }

  handleClick = event => {
    const elemOffset = this.getElementOffset()
    const offsetX = event.clientX - elemOffset.x
    const offsetY = event.clientY - elemOffset.y

    const x = Math.floor(offsetX / CELL_SIZE)
    const y = Math.floor(offsetY / CELL_SIZE)

    if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
      this.board[y][x] = !this.board[y][x]
    }

    this.setState({ cells: this.makeCells() })
  }

  handleClear = () => {
    this.board = this.makeEmptyBoard()
    this.setState({ cells: this.makeCells() })
  }

  handleRandom = () => {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.board[y][x] = (Math.random() >= 0.8)
      }
    }

    this.setState({ cells: this.makeCells() })
  }

  calculateNeighbors = (board, x, y) => {
    let neighbors = 0
    const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]]
    for (let i = 0; i < dirs.length; i++) {
      const dir = dirs[i]
      let y1 = y + dir[0]
      let x1 = x + dir[1]

      if (x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
        neighbors++;
      }
    }

    return neighbors
  }

  runIteration = () => {
    let newBoard = this.makeEmptyBoard()

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let neighbors = this.calculateNeighbors(this.board, x, y)
        if (this.board[y][x]) {
          newBoard[y][x] = neighbors === 2 || neighbors === 3;
        }
        else {
          if (!this.board[y][x] && neighbors === 3) {
            newBoard[y][x] = true
          }
        }
      }
    }

    this.board = newBoard
    this.setState({ cells: this.makeCells() })

    this.timeoutHandler = setTimeout(() => {
      this.runIteration()
    }, this.state.interval)
  }

  runGame = () => {
    this.setState({ isRunning: true })
    this.runIteration()
  }

  stopGame = () => {
    this.setState({ isRunning: false })
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
    }
  }

  render () {
    const { cells, isRunning } = this.state

    return (
      <div>
        <div
          className='board'
          style={{
            width: WIDTH,
            height: HEIGHT,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }}
          onClick={this.handleClick}
          ref={n => { this.boardRef = n }}
        >
          {cells.map((cell, index) => (
            <Cell
              x={cell.x}
              y={cell.y}
              key={`${cell.x}, ${cell.y}`}
              index={index}
            />
          ))}
        </div>
        <Controls
          isRunning={isRunning}
          runGame={this.runGame}
          stopGame={this.stopGame}
          handleRandom={this.handleRandom}
          handleClear={this.handleClear}
        />
      </div>
    )
  }
}

export default Game
