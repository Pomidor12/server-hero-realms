export const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomNumbers = (min: number, max: number, total: number) => {
  const result: Set<number> = new Set();

  while (result.size < total) {
    const randomNumber = getRandomNumber(min, max);
    result.add(randomNumber);

    if (result.size >= max - min + 1) {
      return Array.from(result);
    }
  }

  return Array.from(result);
};
