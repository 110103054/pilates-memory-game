export interface Movement {
  id: number;
  image: string;
  name: string;
}

export interface BaseOption {
  isSelected?: boolean;
  isCorrect?: boolean;
}

export interface TextOption extends BaseOption {
  type: 'text';
  text: string;
}

export interface ImageOption extends BaseOption {
  type: 'image';
  image: string;
}

export type GameOption = TextOption | ImageOption;

export interface GameState {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  timeLeft: number;
  isGameOver: boolean;
  currentMovement: Movement;
  options: GameOption[];
  gameMode: 'name-to-image' | 'image-to-name';
  questionOrder: Movement[];
}

export interface LeaderboardEntry {
  score: number;
  time: number;
  date: string;
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
} 