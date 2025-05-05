export interface Movement {
  id: number;
  image: string;
  name: string;
}

export interface GameState {
  currentMovement: Movement | null;
  options: string[];
  score: number;
  timeLeft: number;
  isGameOver: boolean;
  totalQuestions: number;
  currentQuestion: number;
} 