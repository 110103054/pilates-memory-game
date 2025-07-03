import { Movement, GameState, TextOption, ImageOption, LeaderboardEntry } from './types';

export const initializeMovements = (movements: string[]): Movement[] => {
  // Create movements with matching image numbers in the same order
  return movements.map((name, index) => ({
    id: index + 1,
    image: process.env.PUBLIC_URL + `/pilates-images/${index + 1}.png`,
    name,
  }));
};

export const getRandomOptions = (movements: Movement[], correctAnswer: string): TextOption[] => {
  const options = movements
    .filter(m => m.name !== correctAnswer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(m => ({ type: 'text' as const, text: m.name, isCorrect: false }));

  options.push({ type: 'text' as const, text: correctAnswer, isCorrect: true });
  return options.sort(() => Math.random() - 0.5);
};

export const getRandomImageOptions = (movements: Movement[], correctImage: string): ImageOption[] => {
  const options = movements
    .filter(m => m.image !== correctImage)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(m => ({ type: 'image' as const, image: m.image, isCorrect: false }));

  options.push({ type: 'image' as const, image: correctImage, isCorrect: true });
  return options.sort(() => Math.random() - 0.5);
};

export const initializeGame = (movements: Movement[], gameMode: 'name-to-image' | 'image-to-name' = 'image-to-name', questionCount: number = 20): GameState => {
  const shuffledMovements = [...movements].sort(() => Math.random() - 0.5);
  const currentMovement = shuffledMovements[0];
  
  return {
    currentQuestion: 1,
    totalQuestions: Math.min(questionCount, movements.length),
    score: 0,
    timeLeft: 15,
    isGameOver: false,
    currentMovement,
    options: gameMode === 'image-to-name'
      ? getRandomOptions(movements, currentMovement.name)
      : getRandomImageOptions(movements, currentMovement.image),
    gameMode,
    questionOrder: shuffledMovements.slice(0, Math.min(questionCount, movements.length))
  };
};

export const handleAnswer = (
  gameState: GameState,
  selectedAnswer: string,
  movements: Movement[]
): GameState => {
  const isCorrect = gameState.gameMode === 'image-to-name'
    ? selectedAnswer === gameState.currentMovement.name
    : selectedAnswer === gameState.currentMovement.image;

  const newScore = isCorrect ? gameState.score + 1 : gameState.score;
  const nextQuestion = gameState.currentQuestion + 1;
  const isGameOver = nextQuestion > gameState.totalQuestions;

  // Update options with feedback
  const updatedOptions = gameState.options.map(option => ({
    ...option,
    isSelected: option.type === 'text'
      ? option.text === selectedAnswer
      : option.image === selectedAnswer,
    isCorrect: option.type === 'text'
      ? option.text === gameState.currentMovement.name
      : option.image === gameState.currentMovement.image
  }));

  if (isGameOver) {
    return {
      ...gameState,
      options: updatedOptions,
      score: newScore,
      isGameOver: true,
    };
  }

  const nextMovement = gameState.questionOrder[nextQuestion - 1];
  return {
    ...gameState,
    currentQuestion: nextQuestion,
    score: newScore,
    currentMovement: nextMovement,
    options: gameState.gameMode === 'image-to-name'
      ? getRandomOptions(movements, nextMovement.name)
      : getRandomImageOptions(movements, nextMovement.image),
    timeLeft: 15, // Reset timer for next question
  };
};

export const updateTimer = (state: GameState, movements: Movement[]): GameState => {
  if (state.timeLeft <= 0) {
    if (state.currentQuestion >= state.totalQuestions) {
      // Show correct answer when time's up
      const updatedOptions = state.options.map(option => ({
        ...option,
        isCorrect: option.type === 'text'
          ? option.text === state.currentMovement.name
          : option.image === state.currentMovement.image
      }));

      return {
        ...state,
        options: updatedOptions,
        isGameOver: true,
      };
    }

    const nextMovement = state.questionOrder[state.currentQuestion];
    return {
      ...state,
      currentMovement: nextMovement,
      options: state.gameMode === 'image-to-name'
        ? getRandomOptions(movements, nextMovement.name)
        : getRandomImageOptions(movements, nextMovement.image),
      currentQuestion: state.currentQuestion + 1,
      timeLeft: 15, // Reset timer for next question
    };
  }

  return {
    ...state,
    timeLeft: state.timeLeft - 1,
  };
};

// Leaderboard functions
export const saveToLeaderboard = (score: number, time: number): void => {
  const leaderboard = getLeaderboard();
  const newEntry = {
    score,
    time,
    date: new Date().toLocaleDateString(),
  };
  
  leaderboard.push(newEntry);
  leaderboard.sort((a, b) => b.score - a.score || a.time - b.time);
  localStorage.setItem('pilatesGameLeaderboard', JSON.stringify(leaderboard.slice(0, 10)));
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  const saved = localStorage.getItem('pilatesGameLeaderboard');
  return saved ? JSON.parse(saved) : [];
}; 