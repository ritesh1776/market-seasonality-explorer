import axios from "axios";
import { startOfMonth, endOfMonth } from "date-fns";

const API_BASE_URL = "https://api.binance.com/api/v3";

export const fetchMonthlyKlines = async (symbol, date) => {
  // Binance API requires time in milliseconds (UNIX timestamp)
  const startTime = startOfMonth(date).getTime();
  const endTime = endOfMonth(date).getTime();

  try {
    const response = await axios.get(`${API_BASE_URL}/klines`, {
      params: {
        symbol: symbol.toUpperCase(),
        interval: "1d", // '1d' means one day
        startTime,
        endTime,
        limit: 31, // A safe limit for a month
      },
    });

    // The API returns an array of arrays. Let's format it into a more readable array of objects.
    const formattedData = response.data.map((d) => ({
      date: new Date(d[0]), // The start time of the day
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      volume: parseFloat(d[5]),
    }));

    return formattedData;
  } catch (error) {
    console.error("Error fetching data from Binance:", error);
    return []; // Return an empty array if there's an error
  }
};
