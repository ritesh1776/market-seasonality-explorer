// Helper function to calculate RSI (14-period)
export const calculateRSI = (data) => {
  if (!data || data.length < 15) return null;
  let gains = 0;
  let losses = 0;
  // Calculate initial average gains and losses
  for (let i = 1; i < 15; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return (100 - 100 / (1 + rs)).toFixed(2);
};

// Helper function to calculate Simple Moving Average
export const calculateSMA = (data, period) => {
  if (!data || data.length < period) return null;
  const sum = data.slice(0, period).reduce((acc, val) => acc + val.close, 0);
  return (sum / period).toLocaleString(undefined, { maximumFractionDigits: 2 });
};
