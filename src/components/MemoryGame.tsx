import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, LinearProgress } from '@mui/material';
import { GameState, Movement } from '../types';
import { initializeMovements, initializeGame, handleAnswer, updateTimer } from '../utils';

interface MemoryGameProps {
  movements: string[];
}

const MemoryGame: React.FC<MemoryGameProps> = ({ movements }) => {
  const [movementsList, setMovementsList] = useState<Movement[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    const initializedMovements = initializeMovements(movements);
    setMovementsList(initializedMovements);
    setGameState(initializeGame(initializedMovements));
  }, [movements]);

  useEffect(() => {
    if (!gameState || gameState.isGameOver) return;

    const timer = setInterval(() => {
      setGameState(prev => prev ? updateTimer(prev, movementsList) : null);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, movementsList]);

  const handleOptionClick = (selectedAnswer: string) => {
    if (!gameState) return;
    setGameState(handleAnswer(gameState, selectedAnswer, movementsList));
  };

  const resetGame = () => {
    setGameState(initializeGame(movementsList));
  };

  if (!gameState || !gameState.currentMovement) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Pilates Quiz Game
        </Typography>
        <Typography variant="h6" gutterBottom>
          Score: {gameState.score} | Question: {gameState.currentQuestion}/{gameState.totalQuestions}
        </Typography>
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={(gameState.timeLeft / 30) * 100} 
            color={gameState.timeLeft <= 10 ? "error" : "primary"}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Time Left: {gameState.timeLeft} seconds
          </Typography>
        </Box>
      </Box>

      {gameState.isGameOver ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h4" gutterBottom>
            Game Over!
          </Typography>
          <Typography variant="h5" gutterBottom>
            Final Score: {gameState.score}/{gameState.totalQuestions}
          </Typography>
          <Button variant="contained" onClick={resetGame} sx={{ mt: 2 }}>
            Play Again
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <img
              src={gameState.currentMovement.image}
              alt="Pilates movement"
              style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
            />
          </Box>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2 
          }}>
            {gameState.options.map((option, index) => (
              <Button
                key={index}
                variant="outlined"
                fullWidth
                onClick={() => handleOptionClick(option)}
                sx={{
                  height: '60px',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                }}
              >
                {option}
              </Button>
            ))}
          </Box>
        </>
      )}
    </Container>
  );
};

export default MemoryGame; 