export const getRandomNumber = (min: number, max: number) => {
  const ceiledMin = Math.ceil(min);
  const flooredMax = Math.floor(max);
  return Math.floor(Math.random() * (flooredMax - ceiledMin + 1)) + ceiledMin;
};

export const getRandomNumbers = (min: number, max: number, total: number) => {
  const result: Set<number> = new Set();

  while (result.size < total) {
    const randomNumber = getRandomNumber(min, max);
    result.add(randomNumber);
  }

  return Array.from(result);
};
