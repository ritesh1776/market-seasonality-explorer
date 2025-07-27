import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Brush, // 1. Import the Brush component
} from "recharts";
import { format } from "date-fns";
import { calculateRSI, calculateSMA } from "../utils/indicators";

const TodaysAnalysis = () => {
  const [tickerData, setTickerData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [indicators, setIndicators] = useState({ rsi: null, sma20: null });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const tickerPromise = axios.get(
        "https://api.binance.com/api/v3/ticker/24hr",
        { params: { symbol: "BTCUSDT" } }
      );
      const klinesPromise = axios.get("https://api.binance.com/api/v3/klines", {
        params: { symbol: "BTCUSDT", interval: "15m", limit: 96 },
      });
      const historicalPromise = axios.get(
        "https://api.binance.com/api/v3/klines",
        { params: { symbol: "BTCUSDT", interval: "1d", limit: 30 } }
      );

      const [tickerResponse, klinesResponse, historicalResponse] =
        await Promise.all([tickerPromise, klinesPromise, historicalPromise]);

      setTickerData(tickerResponse.data);

      const formattedChartData = klinesResponse.data.map((d) => ({
        time: format(new Date(d[0]), "HH:mm"),
        price: parseFloat(d[4]),
      }));
      setChartData(formattedChartData);

      const historicalData = historicalResponse.data
        .map((d) => ({ close: parseFloat(d[4]) }))
        .reverse();

      setIndicators({
        rsi: calculateRSI(historicalData),
        sma20: calculateSMA(historicalData, 20),
      });
    } catch (error) {
      console.error("Error fetching comprehensive data:", error);
      setTickerData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <Card
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "350px",
        }}
      >
        <CircularProgress />
      </Card>
    );
  }
  if (!tickerData) {
    return (
      <Card>
        <CardContent>
          <Typography>Could not load market data.</Typography>
        </CardContent>
      </Card>
    );
  }

  const isPositive = parseFloat(tickerData.priceChange) >= 0;
  const volatilityPercent = (
    ((parseFloat(tickerData.highPrice) - parseFloat(tickerData.lowPrice)) /
      parseFloat(tickerData.openPrice)) *
    100
  ).toFixed(2);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: "16px !important",
        }}
      >
        <Typography variant="h6" component="div" gutterBottom>
          Today's Market (BTC/USDT)
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="h5">
            ${parseFloat(tickerData.lastPrice).toLocaleString()}
          </Typography>
          <Typography
            sx={{
              color: isPositive ? "success.main" : "error.main",
              fontWeight: "500",
              fontSize: "0.9rem",
            }}
          >
            {isPositive ? "▲" : "▼"}{" "}
            {parseFloat(tickerData.priceChange).toFixed(2)} (
            {parseFloat(tickerData.priceChangePercent).toFixed(2)}%)
            <span
              style={{
                color: "#6c757d",
                fontSize: "0.8rem",
                marginLeft: "8px",
              }}
            >
              (24h)
            </span>
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, minHeight: 120, mb: 2, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 15, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#2e7d32" : "#d32f2f"}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#2e7d32" : "#d32f2f"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis
                domain={["dataMin - 100", "dataMax + 100"]}
                tick={{ fontSize: 10 }}
              />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <RechartsTooltip />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#2e7d32" : "#d32f2f"}
                fill="url(#priceGradient)"
                strokeWidth={2}
              />
              <Brush
                dataKey="time"
                height={25}
                stroke="#6c63ff"
                fill="#f4f4f9"
              />
            </AreaChart>
          </ResponsiveContainer>
          {/* This adds the text label */}
          <Typography
            sx={{
              position: "absolute",
              bottom: 5,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "0.7rem",
              color: "#1e4692ff",
              fontWeight: "bold",
            }}
          >
            Zoom & Pan
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "600" }}>
          Detailed Stats (24h)
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            fontSize: "0.85rem",
            mb: 1,
          }}
        >
          <Typography sx={{ fontSize: "inherit" }}>
            <strong>High:</strong> $
            {parseFloat(tickerData.highPrice).toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: "inherit" }}>
            <strong>Low:</strong> $
            {parseFloat(tickerData.lowPrice).toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: "inherit" }}>
            <strong>Volatility:</strong> {volatilityPercent}%
          </Typography>
          <Typography sx={{ fontSize: "inherit" }}>
            <strong>Volume (USDT):</strong> $
            {parseFloat(tickerData.quoteVolume).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "600" }}>
          Technical Analysis
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
            fontSize: "0.85rem",
          }}
        >
          <Typography sx={{ fontSize: "inherit" }}>
            <strong>RSI (14 Day):</strong> {indicators.rsi || "N/A"}
          </Typography>
          <Typography sx={{ fontSize: "inherit" }}>
            <strong>SMA (20 Day):</strong>{" "}
            {indicators.sma20 ? `$${indicators.sma20}` : "N/A"}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TodaysAnalysis;
