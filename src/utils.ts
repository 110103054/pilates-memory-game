import { Movement, GameState } from './types';

export const initializeMovements = (movements: string[]): Movement[] => {
  return movements.map((name, index) => ({
    id: index + 1,
    image: `/pilates-images/${index + 1}.png`,
    name,
  }));
};

export const getRandomOptions = (movements: Movement[], correctAnswer: string, count: number = 4): string[] => {
  const otherMovements = movements.filter(m => m.name !== correctAnswer);
  const shuffled = [...otherMovements].sort(() => Math.random() - 0.5);
  const options = shuffled.slice(0, count - 1).map(m => m.name);
  options.push(correctAnswer);
  return options.sort(() => Math.random() - 0.5);
};

export const initializeGame = (movements: Movement[]): GameState => {
  const shuffledMovements = [...movements].sort(() => Math.random() - 0.5);
  const currentMovement = shuffledMovements[0];
  
  return {
    currentMovement,
    options: getRandomOptions(movements, currentMovement.name),
    score: 0,
    timeLeft: 30, // 30 seconds per question
    isGameOver: false,
    totalQuestions: movements.length,
    currentQuestion: 1,
  };
};

export const handleAnswer = (state: GameState, selectedAnswer: string, movements: Movement[]): GameState => {
  const isCorrect = selectedAnswer === state.currentMovement?.name;
  const newScore = isCorrect ? state.score + 1 : state.score;
  const nextQuestionIndex = state.currentQuestion;
  
  if (nextQuestionIndex >= state.totalQuestions) {
    return {
      ...state,
      score: newScore,
      isGameOver: true,
    };
  }

  const nextMovement = movements[nextQuestionIndex];
  return {
    ...state,
    currentMovement: nextMovement,
    options: getRandomOptions(movements, nextMovement.name),
    score: newScore,
    currentQuestion: state.currentQuestion + 1,
    timeLeft: 30,
  };
};

export const updateTimer = (state: GameState, movements: Movement[]): GameState => {
  if (state.timeLeft <= 0) {
    if (state.currentQuestion >= state.totalQuestions) {
      return {
        ...state,
        isGameOver: true,
      };
    }

    const nextMovement = movements[state.currentQuestion];
    return {
      ...state,
      currentMovement: nextMovement,
      options: getRandomOptions(movements, nextMovement.name),
      currentQuestion: state.currentQuestion + 1,
      timeLeft: 30,
    };
  }

  return {
    ...state,
    timeLeft: state.timeLeft - 1,
  };
}; 