import React from 'react'
import Game from './components/game'
import './App.css'

const Header = () => (
  <header className='header'>Conway's Game of Life</header>
)

const App = () => (
  <div className="App">
    <Header/>
    <Game/>
  </div>
)

export default App
