import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  AlertColor,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { GameState, GameOption } from '../types';
import { initializeGame, handleAnswer, saveToLeaderboard, getLeaderboard } from '../utils';
import Leaderboard from './Leaderboard';

interface MemoryGameProps {
  movements: string[];
}

const MemoryGame: React.FC<MemoryGameProps> = ({ movements }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [alert] = useState<{ show: boolean; message: string; severity: AlertColor }>({
    show: false,
    message: '',
    severity: 'info',
  });
  const [leaderboard, setLeaderboard] = useState(getLeaderboard());
  const [gameMode, setGameMode] = useState<'name-to-image' | 'image-to-name'>('image-to-name');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  useEffect(() => {
    if (gameStarted) {
      const movementList = movements.map((name, index) => ({
        id: index + 1,
        image: `${process.env.PUBLIC_URL}/pilates-images/${index + 1}.png`,
        name,
      }));
      setGameState(initializeGame(movementList, gameMode, questionCount));
    }
  }, [movements, gameMode, questionCount, gameStarted]);

  useEffect(() => {
    if (!gameState) return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (!prev || prev.isGameOver) {
          clearInterval(timer);
          return prev;
        }

        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          saveToLeaderboard(prev.score, 30 * prev.totalQuestions - prev.timeLeft);
          setLeaderboard(getLeaderboard());
          return { ...prev, isGameOver: true };
        }

        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const handleOptionClick = (selectedAnswer: string) => {
    if (!gameState) return;
    
    // Show answer feedback first
    // const isCorrect = gameMode === 'image-to-name'
    //   ? selectedAnswer === gameState.currentMovement.name
    //   : selectedAnswer === gameState.currentMovement.image;

    // Update options with feedback
    const updatedOptions = gameState.options.map(option => ({
      ...option,
      isSelected: option.type === 'text'
        ? option.text === selectedAnswer
        : option.image === selectedAnswer,
      isCorrect: option.type === 'text'
        ? option.text === gameState.currentMovement.name
        : option.image === gameState.currentMovement.image,
    }));

    setGameState(prev => ({
      ...prev!,
      options: updatedOptions
    }));

    // Wait 0.5 seconds before moving to next question
    setTimeout(() => {
      setGameState(prev => {
        if (!prev) return null;
        const newState = handleAnswer(prev, selectedAnswer, movements.map((name, index) => ({
          id: index + 1,
          image: `${process.env.PUBLIC_URL}/pilates-images/${index + 1}.png`,
          name,
        })));
        if (newState.isGameOver) {
          saveToLeaderboard(newState.score, 15 * newState.totalQuestions - newState.timeLeft);
          setLeaderboard(getLeaderboard());
        }
        return newState;
      });
    }, 500);
  };

  const handleRestart = () => {
    const movementList = movements.map((name, index) => ({
      id: index + 1,
      image: `${process.env.PUBLIC_URL}/pilates-images/${index + 1}.png`,
      name,
    }));
    setGameState(initializeGame(movementList, gameMode, questionCount));
  };

  const handleModeChange = (mode: 'name-to-image' | 'image-to-name') => {
    setGameMode(mode);
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleBackToMenu = () => {
    setGameStarted(false);
    setGameState(null);
  };

  if (!gameStarted) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" align="center" sx={{ mb: 4 }}>
          Pilates Memory Game
        </Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              遊戲設定
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                遊戲模式
              </Typography>
              <ButtonGroup variant="contained" aria-label="game mode selection" fullWidth>
                <Button
                  onClick={() => handleModeChange('image-to-name')}
                  color={gameMode === 'image-to-name' ? 'primary' : 'inherit'}
                  sx={{ flex: 1, py: 2 }}
                >
                  圖片選擇名稱
                </Button>
                <Button
                  onClick={() => handleModeChange('name-to-image')}
                  color={gameMode === 'name-to-image' ? 'primary' : 'inherit'}
                  sx={{ flex: 1, py: 2 }}
                >
                  名稱選擇圖片
                </Button>
              </ButtonGroup>
            </Box>

            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>題目數量</InputLabel>
                <Select
                  value={questionCount}
                  label="題目數量"
                  onChange={(e) => setQuestionCount(e.target.value as number)}
                >
                  <MenuItem value={10}>10 題</MenuItem>
                  <MenuItem value={15}>15 題</MenuItem>
                  <MenuItem value={20}>20 題</MenuItem>
                  <MenuItem value={25}>25 題</MenuItem>
                  <MenuItem value={30}>30 題</MenuItem>
                  <MenuItem value={50}>50 題</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button 
              variant="contained" 
              size="large" 
              fullWidth 
              onClick={handleStartGame}
              sx={{ py: 2 }}
            >
              開始遊戲
            </Button>
          </CardContent>
        </Card>

        <Leaderboard entries={leaderboard} />
      </Box>
    );
  }

  if (!gameState) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Question {gameState.currentQuestion} of {gameState.totalQuestions}
        </Typography>
        <Typography variant="h5">
          Time: {gameState.timeLeft}s
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <ButtonGroup variant="contained" aria-label="game mode selection" fullWidth>
          <Button
            onClick={() => handleModeChange('image-to-name')}
            color={gameMode === 'image-to-name' ? 'primary' : 'inherit'}
            sx={{ flex: 1, py: 2 }}
          >
            圖片選擇名稱
          </Button>
          <Button
            onClick={() => handleModeChange('name-to-image')}
            color={gameMode === 'name-to-image' ? 'primary' : 'inherit'}
            sx={{ flex: 1, py: 2 }}
          >
            名稱選擇圖片
          </Button>
        </ButtonGroup>
      </Box>

      {alert.show && (
        <Alert severity={alert.severity} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {gameState.isGameOver ? (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            Game Over!
          </Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Final Score: {gameState.score} / {gameState.totalQuestions}
          </Typography>
          <Button variant="contained" onClick={handleBackToMenu} sx={{ mr: 2 }}>
            回到選單
          </Button>
          <Button variant="outlined" onClick={handleRestart} sx={{ mr: 2 }}>
            再玩一次
          </Button>
          <Button variant="outlined" onClick={() => {
            setGameStarted(false);
            setGameState(null);
          }}>
            重新設定
          </Button>
          <Leaderboard entries={leaderboard} />
        </Box>
      ) : (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              {gameMode === 'image-to-name' ? (
                <img
                  src={gameState.currentMovement.image}
                  alt={`Movement ${gameState.currentQuestion}`}
                  style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="h4" align="center">
                  {gameState.currentMovement.name}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            {(gameState.options as GameOption[]).map((option, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleOptionClick(
                    option.type === 'text' ? option.text : option.image
                  )}
                  disabled={option.isSelected}
                  sx={{
                    height: '100%',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'inherit',
                    border: (gameState.options.some(opt => opt.isSelected))
                      ? (option.isCorrect
                        ? '5px solid #4caf50'
                        : '1px solid rgba(0, 0, 0, 0.12)')
                      : '1px solid rgba(0, 0, 0, 0.12)',
                  }}
                >
                  {option.type === 'text' ? (
                    <Typography>{option.text}</Typography>
                  ) : (
                    <img
                      src={option.image}
                      alt={`Option ${index + 1}`}
                      style={{ width: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }}
                    />
                  )}
                </Button>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default MemoryGame; 