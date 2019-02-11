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

const Cell = ({ x, y, index }) => {
  let colorIndex = 0
  let color
  
  colorIndex = parseInt(index / 10)

  while (colorIndex > 5) {
    colorIndex = parseInt(colorIndex / 2)
  }

  colorIndex = colorIndex - 1

  color = colors[colorIndex]

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

const Controls = ({
  isRunning,
  runGame,
  stopGame,
  handleRandom,
  handleClear
}) => {

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
    isRunning: false
  }

  rows = HEIGHT / CELL_SIZE
  cols = WIDTH / CELL_SIZE
  interval = 80

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

    if (
      x >= 0 &&
      x <= this.cols &&
      y >= 0 &&
      y <= this.rows
    ) {
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
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]]

    for (let i = 0; i < directions.length; i++) {
      const direction = directions[i]
      let y1 = y + direction[0]
      let x1 = x + direction[1]

      if (
        x1 >= 0 &&
        x1 < this.cols &&
        y1 >= 0 &&
        y1 < this.rows &&
        board[y1][x1]
      ) {
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
    }, this.interval)
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
      <>
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
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
            <defs>
              <filter id="goo">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
            </defs>
          </svg>
        </div>
        <Controls
          isRunning={isRunning}
          runGame={this.runGame}
          stopGame={this.stopGame}
          handleRandom={this.handleRandom}
          handleClear={this.handleClear}
        />
      </>
    )
  }
}

export default Game
