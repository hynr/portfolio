'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Phone, MapPin, Github, Linkedin, GamepadIcon, RotateCcw, Trophy, Zap, Target, RefreshCw } from 'lucide-react'

// Contact info (kept simple)
const contactInfo = [
  { icon: Mail, value: 'huzaifa478@gmail.com', href: 'mailto:huzaifa478@gmail.com' },
  { icon: Phone, value: '443-883-5520', href: 'tel:443-883-5520' },
  { icon: Github, value: 'github.com/hynr', href: 'https://github.com/hynr' },
  { icon: Linkedin, value: 'linkedin.com/in/huzaifa-naroo', href: 'https://linkedin.com/in/huzaifa-naroo' }
]

// Game 1: Click Speed Test
const ClickSpeedGame = () => {
  const [clicks, setClicks] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const startGame = () => {
    setClicks(0)
    setTimeLeft(10)
    setGameActive(true)
  }

  useEffect(() => {
    if (timeLeft > 0 && gameActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false)
      if (clicks > highScore) setHighScore(clicks)
    }
  }, [timeLeft, gameActive, clicks, highScore])

  return (
    <div className="personal-card p-6 rounded-2xl">
      <div className="text-center">
        <Zap className="mx-auto mb-3 text-coral-400" size={32} />
        <h3 className="text-lg font-semibold text-cream-200 mb-2">Speed Clicker</h3>
        
        {!gameActive && timeLeft === 0 && clicks === 0 ? (
          <div>
            <p className="text-sage-300 text-sm mb-4">How fast can you click in 10 seconds?</p>
            {highScore > 0 && <p className="text-cream-400 text-sm mb-4">Best: {highScore} clicks</p>}
            <button
              onClick={startGame}
              className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors"
            >
              Start!
            </button>
          </div>
        ) : gameActive ? (
          <div>
            <div className="text-3xl font-bold text-coral-400 mb-2">{clicks}</div>
            <div className="text-sage-300 text-sm mb-4">Time: {timeLeft}s</div>
            <button
              onClick={() => setClicks(clicks + 1)}
              className="w-full py-4 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-lg font-bold text-lg hover:from-coral-600 hover:to-coral-700 transition-all transform active:scale-95"
            >
              CLICK!
            </button>
          </div>
        ) : (
          <div>
            <Trophy className="mx-auto mb-2 text-cream-400" size={24} />
            <div className="text-2xl font-bold text-cream-200 mb-2">{clicks} clicks!</div>
            <div className="text-sage-300 text-sm mb-4">
              {clicks > highScore ? 'New record! 🎉' : `Best: ${highScore}`}
            </div>
            <button
              onClick={startGame}
              className="px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Game 2: Tic Tac Toe
const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [winner, setWinner] = useState<string | null>(null)

  const checkWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ]
    
    for (let line of lines) {
      const [a, b, c] = line
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const handleClick = (index: number) => {
    if (board[index] || winner) return
    
    const newBoard = board.slice()
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setIsXNext(!isXNext)
    setWinner(checkWinner(newBoard))
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
    setWinner(null)
  }

  return (
    <div className="personal-card p-6 rounded-2xl">
      <div className="text-center">
        <Target className="mx-auto mb-3 text-sage-400" size={32} />
        <h3 className="text-lg font-semibold text-cream-200 mb-4">Tic Tac Toe</h3>
        
        {winner ? (
          <div className="mb-4">
            <div className="text-xl font-bold text-cream-200 mb-2">
              {winner === 'X' ? '🎉 You won!' : '🤖 Computer wins!'}
            </div>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-sage-500 hover:bg-sage-600 text-white rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="mb-4 text-sage-300 text-sm">
            {isXNext ? "Your turn (X)" : "Computer's turn (O)"}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className="w-16 h-16 bg-forest-700 hover:bg-forest-600 border border-sage-600 rounded-lg text-2xl font-bold text-cream-200 transition-colors"
              disabled={cell || winner}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Game 3: Frogger
const FroggerGame = () => {
  const [frogPosition, setFrogPosition] = useState({ x: 7, y: 9 })
  const [cars, setCars] = useState([
    { x: 0, y: 7, speed: 1 },
    { x: 5, y: 6, speed: -1 },
    { x: 2, y: 5, speed: 1 },
    { x: 8, y: 4, speed: -1 }
  ])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const resetGame = () => {
    setFrogPosition({ x: 7, y: 9 })
    setCars([
      { x: 0, y: 7, speed: 1 },
      { x: 5, y: 6, speed: -1 },
      { x: 2, y: 5, speed: 1 },
      { x: 8, y: 4, speed: -1 }
    ])
    setGameOver(false)
    setWon(false)
    setGameStarted(true)
  }

  useEffect(() => {
    if (!gameStarted || gameOver || won) return

    const interval = setInterval(() => {
      setCars(prevCars => 
        prevCars.map(car => ({
          ...car,
          x: car.speed > 0 
            ? (car.x + 1) % 15 
            : car.x === 0 ? 14 : car.x - 1
        }))
      )
    }, 300)

    return () => clearInterval(interval)
  }, [gameStarted, gameOver, won])

  useEffect(() => {
    const collision = cars.some(car => 
      car.x === frogPosition.x && car.y === frogPosition.y
    )
    if (collision) setGameOver(true)
    if (frogPosition.y === 0) setWon(true)
  }, [frogPosition, cars])

  useEffect(() => {
    if (!gameStarted) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || won) return
      
      setFrogPosition(prev => {
        switch(e.key) {
          case 'ArrowUp':
            return { ...prev, y: Math.max(0, prev.y - 1) }
          case 'ArrowDown':
            return { ...prev, y: Math.min(9, prev.y + 1) }
          case 'ArrowLeft':
            return { ...prev, x: Math.max(0, prev.x - 1) }
          case 'ArrowRight':
            return { ...prev, x: Math.min(14, prev.x + 1) }
          default:
            return prev
        }
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted, gameOver, won])

  const renderGrid = () => {
    const grid = []
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 15; x++) {
        const isFrog = frogPosition.x === x && frogPosition.y === y
        const car = cars.find(c => c.x === x && c.y === y)
        const isRoad = y >= 4 && y <= 7
        
        grid.push(
          <div
            key={`${x}-${y}`}
            className={`w-4 h-4 border border-sage-600 ${
              y === 0 ? 'bg-neon-500' : 
              isRoad ? 'bg-gray-700' : 
              'bg-green-600'
            }`}
          >
            {isFrog ? '🐸' : car ? '🚗' : ''}
          </div>
        )
      }
    }
    return grid
  }

  return (
    <div className="personal-card p-6 rounded-2xl">
      <div className="text-center">
        <Target className="mx-auto mb-3 text-neon-400" size={32} />
        <h3 className="text-lg font-semibold text-cream-200 mb-2">Frogger</h3>
        
        {!gameStarted ? (
          <div>
            <p className="text-sage-300 text-sm mb-4">Get the frog to safety! Use arrow keys.</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-neon-500 hover:bg-neon-600 text-white rounded-lg transition-colors"
            >
              Start Game
            </button>
          </div>
        ) : gameOver ? (
          <div>
            <div className="text-xl font-bold text-red-400 mb-2">💥 Game Over!</div>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-neon-500 hover:bg-neon-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : won ? (
          <div>
            <div className="text-xl font-bold text-neon-400 mb-2">🎉 You made it!</div>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-neon-500 hover:bg-neon-600 text-white rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div>
            <div className="text-sage-300 text-xs mb-2">Arrow keys to move</div>
            <div className="grid grid-cols-15 gap-0 max-w-xs mx-auto border border-sage-600">
              {renderGrid()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Game 4: Memory Match
const MemoryGame = () => {
  const emojis = ['🚀', '💻', '☕', '🎮', '🔥', '⚡', '🌟', '🎯']
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }))
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameStarted(true)
  }

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped
      if (cards[first].emoji === cards[second].emoji) {
        setMatched(prev => [...prev, first, second])
      }
      const timer = setTimeout(() => setFlipped([]), 1000)
      return () => clearTimeout(timer)
    }
  }, [flipped, cards])

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return
    
    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)
    
    if (newFlipped.length === 1) {
      setMoves(moves + 1)
    }
  }

  const isGameWon = matched.length === cards.length

  return (
    <div className="personal-card p-6 rounded-2xl">
      <div className="text-center">
        <RefreshCw className="mx-auto mb-3 text-cream-400" size={32} />
        <h3 className="text-lg font-semibold text-cream-200 mb-2">Memory Match</h3>
        
        {!gameStarted ? (
          <div>
            <p className="text-sage-300 text-sm mb-4">Match all the pairs!</p>
            <button
              onClick={initializeGame}
              className="px-4 py-2 bg-cream-600 hover:bg-cream-700 text-white rounded-lg transition-colors"
            >
              Start Game
            </button>
          </div>
        ) : isGameWon ? (
          <div>
            <div className="text-xl font-bold text-cream-200 mb-2">🎉 You did it!</div>
            <div className="text-sage-300 text-sm mb-4">Completed in {moves} moves</div>
            <button
              onClick={initializeGame}
              className="px-4 py-2 bg-cream-600 hover:bg-cream-700 text-white rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div>
            <div className="text-sage-300 text-sm mb-4">Moves: {moves}</div>
            <div className="grid grid-cols-4 gap-2 max-w-64 mx-auto">
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className="w-12 h-12 bg-forest-700 hover:bg-forest-600 border border-sage-600 rounded-lg text-lg transition-colors flex items-center justify-center"
                >
                  {flipped.includes(index) || matched.includes(index) ? card.emoji : '?'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const GamesSection = () => {
  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-forest-800 via-sage-900 to-forest-900 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Let&apos;s Connect & Play!</span>
          </h2>
          <p className="text-xl text-sage-300 max-w-3xl mx-auto mb-8">
            Want to chat about code? Awesome! But first... wanna play some games? 🎮
          </p>
        </motion.div>

        {/* Contact Info - Simple */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex flex-wrap justify-center gap-6 personal-card rounded-2xl px-8 py-6">
            {contactInfo.map((item, index) => (
              <motion.a
                key={index}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2 text-sage-300 hover:text-coral-400 transition-colors"
              >
                <item.icon size={16} />
                <span className="text-sm">{item.value}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <ClickSpeedGame />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <TicTacToe />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <FroggerGame />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <MemoryGame />
          </motion.div>
        </div>

        {/* Personal note */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="personal-card rounded-2xl px-8 py-6 max-w-2xl mx-auto">
            <p className="text-sage-300 leading-relaxed">
              Hope you had some fun! 😄 These little games remind me why I love programming - 
              there&apos;s something magical about bringing ideas to life with code. 
              Feel free to reach out if you want to chat about projects, opportunities, or just geek out about tech!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default GamesSection