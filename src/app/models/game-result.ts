export type GameResult = {
  winner: 'one' | 'two' | 'draw';
  scores: [number, number];
};
