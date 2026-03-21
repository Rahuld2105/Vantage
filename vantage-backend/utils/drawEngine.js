export const generateRandomDraw = () => {
  const numbers = new Set();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
};

export const generateAlgorithmicDraw = (allScores) => {
  const frequency = {};
  
  allScores.forEach(score => {
    frequency[score] = (frequency[score] || 0) + 1;
  });

  const entries = Object.entries(frequency)
    .map(([num, count]) => ({ num: parseInt(num), count }))
    .filter(({ num }) => num >= 1 && num <= 45);

  const mostFrequent = [...entries]
    .sort((a, b) => b.count - a.count || a.num - b.num)
    .map(({ num }) => num);

  const leastFrequent = [...entries]
    .sort((a, b) => a.count - b.count || a.num - b.num)
    .map(({ num }) => num);

  const picked = new Set();
  let highIndex = 0;
  let lowIndex = 0;

  while (picked.size < 5 && (highIndex < mostFrequent.length || lowIndex < leastFrequent.length)) {
    if (highIndex < mostFrequent.length) {
      picked.add(mostFrequent[highIndex]);
      highIndex += 1;
    }
    if (picked.size >= 5) break;
    if (lowIndex < leastFrequent.length) {
      picked.add(leastFrequent[lowIndex]);
      lowIndex += 1;
    }
  }
  
  while (picked.size < 5) {
    const random = Math.floor(Math.random() * 45) + 1;
    picked.add(random);
  }
  
  return Array.from(picked).sort((a, b) => a - b);
};

export const countMatches = (userScores, drawNumbers) => {
  const drawSet = new Set(drawNumbers);
  const matches = userScores.filter(score => drawSet.has(score));
  return matches.length;
};

export const getTier = (matchCount) => {
  if (matchCount === 5) return '5-match';
  if (matchCount === 4) return '4-match';
  if (matchCount === 3) return '3-match';
  return null;
};
