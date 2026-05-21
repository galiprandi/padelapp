
// Manual test for ranking logic formula
function calculateScore(wins: number, losses: number, streaks: number[], setsWon: number[]) {
  let score = 1000;
  let currentStreak = 0;

  for (let i = 0; i < wins + losses; i++) {
    const isWinner = i < wins; // Simulating wins first then losses
    const matchSetsWon = setsWon[i];

    if (isWinner) {
      currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
      score += 15 + (currentStreak * 5) + (matchSetsWon * 2);
    } else {
      currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
      score += (matchSetsWon * 1);
    }
    console.log(`Match ${i+1}: Winner=${isWinner}, SetsWon=${matchSetsWon}, Streak=${currentStreak}, NewScore=${score}`);
  }
  return score;
}

console.log("--- Testing Player 1 (3 wins, 2 sets each, increasing streak) ---");
const p1Score = calculateScore(3, 0, [1, 2, 3], [2, 2, 2]);
console.log(`Final Score P1: ${p1Score}`);
// Expected:
// M1: 1000 + 15 + (1*5) + (2*2) = 1024
// M2: 1024 + 15 + (2*5) + (2*2) = 1053
// M3: 1053 + 15 + (3*5) + (2*2) = 1087

console.log("\n--- Testing Player 2 (1 win 2 sets, 1 loss 1 set) ---");
const p2Score = calculateScore(1, 1, [1, -1], [2, 1]);
console.log(`Final Score P2: ${p2Score}`);
// Expected:
// M1: 1000 + 15 + (1*5) + (2*2) = 1024
// M2: 1024 + (1*1) = 1025
