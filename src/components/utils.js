// Define the calculateRollingAverage function
export function calculateRollingAverage(data, windowSize) {
    const rollingAverage = [];
  
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        rollingAverage.push(null);
      } else {
        const window = data.slice(i - windowSize + 1, i + 1);
        const average = window.reduce((acc, val) => acc + val, 0) / windowSize;
        rollingAverage.push(average);
      }
    }
  
    return rollingAverage;
  }
  