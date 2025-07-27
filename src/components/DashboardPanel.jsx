import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Typography,
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
  Brush,
  Label, // 1. Import the Label component
} from "recharts";
import { format, startOfDay, endOfDay, subDays } from "date-fns";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "900px",
  bgcolor: "background.paper",
  border: "1px solid #ddd",
  borderRadius: "12px",
  boxShadow: 24,
  p: "24px 32px",
};

// Helper function to calculate RSI
const calculateRSI = (data) => {
  if (!data || data.length < 15) return null;
  let gains = 0;
  let losses = 0;
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
const calculateSMA = (data, period) => {
  if (!data || data.length < period) return null;
  const sum = data.slice(0, period).reduce((acc, val) => acc + val.close, 0);
  return (sum / period).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const DashboardPanel = ({ open, handleClose, dayData }) => {
  const [chartData, setChartData] = useState([]);
  const [indicators, setIndicators] = useState({ rsi: null, sma20: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && dayData) {
      const fetchAllData = async () => {
        setLoading(true);
        try {
          const intradayPromise = axios.get(
            "https://api.binance.com/api/v3/klines",
            {
              params: {
                symbol: "BTCUSDT",
                interval: "15m",
                startTime: startOfDay(dayData.date).getTime(),
                endTime: endOfDay(dayData.date).getTime(),
              },
            }
          );
          const historicalPromise = axios.get(
            "https://api.binance.com/api/v3/klines",
            {
              params: {
                symbol: "BTCUSDT",
                interval: "1d",
                endTime: endOfDay(dayData.date).getTime(),
                limit: 30,
              },
            }
          );
          const [intradayResponse, historicalResponse] = await Promise.all([
            intradayPromise,
            historicalPromise,
          ]);
          const formattedChartData = intradayResponse.data.map((d) => ({
            time: format(new Date(d[0]), "HH:mm"),
            price: parseFloat(d[4]),
          }));
          setChartData(formattedChartData);
          const historicalData = historicalResponse.data
            .map((d) => ({ close: parseFloat(d[4]) }))
            .reverse();
          const rsi = calculateRSI(historicalData);
          const sma20 = calculateSMA(historicalData, 20);
          setIndicators({ rsi, sma20 });
        } catch (error) {
          console.error("Error fetching detailed data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAllData();
    }
  }, [open, dayData]);

  if (!dayData) return null;

  const performance = dayData.close - dayData.open;
  const performancePercent = ((performance / dayData.open) * 100).toFixed(2);
  const isPositive = performance >= 0;
  const volatilityPercent = (
    ((dayData.high - dayData.low) / dayData.open) *
    100
  ).toFixed(2);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography id="modal-title" variant="h6" component="h2">
              Metrics for {format(dayData.date, "MMMM d, yyyy")}
            </Typography>

            <Box sx={{ height: 200, my: 2, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                {/* --- 2. ADJUSTED MARGINS --- */}
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="historicalPriceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
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
                  {/* --- 3. ADDED LABEL TO Y-AXIS --- */}
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                    width={80}
                  >
                    <Label
                      value="Price (USD)"
                      angle={-90}
                      position="insideLeft"
                      style={{ textAnchor: "middle" }}
                    />
                  </YAxis>
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? "#2e7d32" : "#d32f2f"}
                    fill="url(#historicalPriceGradient)"
                    strokeWidth={2}
                  />
                  <Brush
                    dataKey="time"
                    height={25}
                    stroke="#6c63ff"
                    fill="#f4f4f4"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <Typography
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "0.7rem",
                  color: "#2a1592ff",
                  fontWeight: "bold",
                  pointerEvents: "none",
                }}
              >
                Zoom & Pan
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              <Typography>
                <strong>Open:</strong> {dayData.open.toLocaleString()}
              </Typography>
              <Typography>
                <strong>High:</strong> {dayData.high.toLocaleString()}
              </Typography>
              <Typography>
                <strong>Low:</strong> {dayData.low.toLocaleString()}
              </Typography>
              <Typography>
                <strong>Close:</strong> {dayData.close.toLocaleString()}
              </Typography>
              <Typography>
                <strong>Volume:</strong>{" "}
                {dayData.volume.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </Typography>
              <Typography
                sx={{ color: isPositive ? "success.main" : "error.main" }}
              >
                <strong>Change:</strong> {performance.toFixed(2)} (
                {performancePercent}%)
              </Typography>
              <Typography>
                <strong>Volatility (Range):</strong> {volatilityPercent}%
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Technical Analysis
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              <Typography>
                <strong>RSI (14 Day):</strong> {indicators.rsi || "N/A"}
              </Typography>
              <Typography>
                <strong>SMA (20 Day):</strong>{" "}
                {indicators.sma20 ? `$${indicators.sma20}` : "N/A"}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default DashboardPanel;
