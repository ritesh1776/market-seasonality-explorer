import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend as RechartsLegend,
  Brush,
} from "recharts";
import { format } from "date-fns";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "800px",
  bgcolor: "background.paper",
  border: "1px solid #ddd",
  borderRadius: "12px",
  boxShadow: 24,
  p: "24px 32px",
};

const MonthlySummaryModal = ({ open, handleClose, monthData, isLoading }) => {
  if (!open) return null;

  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    if (monthData && monthData.klines) {
      setDisplayData(monthData.klines);
    }
  }, [monthData]);

  const handleBrushChange = (range) => {
    if (monthData && monthData.klines) {
      const { startIndex, endIndex } = range;
      setDisplayData(monthData.klines.slice(startIndex, endIndex + 1));
    }
  };

  const stats = useMemo(() => {
    if (!displayData || displayData.length === 0) {
      return {
        performance: 0,
        avgVolatility: 0,
        totalVolume: 0,
        monthlyHigh: 0,
        monthlyLow: 0,
      };
    }

    const firstDayOpen = parseFloat(displayData[0][1]);
    const lastDayClose = parseFloat(displayData[displayData.length - 1][4]);
    const performance = ((lastDayClose - firstDayOpen) / firstDayOpen) * 100;

    let totalVolume = 0;
    let totalVolatility = 0;
    let monthlyHigh = 0;
    let monthlyLow = Infinity;

    displayData.forEach((d) => {
      const open = parseFloat(d[1]);
      const high = parseFloat(d[2]);
      const low = parseFloat(d[3]);
      const volume = parseFloat(d[7]);

      if (high > monthlyHigh) monthlyHigh = high;
      if (low < monthlyLow) monthlyLow = low;

      totalVolume += volume;
      totalVolatility += ((high - low) / open) * 100;
    });

    const avgVolatility = totalVolatility / displayData.length;

    return { performance, avgVolatility, totalVolume, monthlyHigh, monthlyLow };
  }, [displayData]);

  const chartData = useMemo(() => {
    if (!monthData || !monthData.klines) return [];
    return monthData.klines.map((d) => ({
      day: format(new Date(d[0]), "d"),
      close: parseFloat(d[4]),
      volume: parseFloat(d[7]),
    }));
  }, [monthData]);

  const isPositive = stats.performance >= 0;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {isLoading || !monthData ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <CircularProgress />{" "}
            <Typography sx={{ ml: 2 }}>Fetching month data...</Typography>
          </Box>
        ) : (
          <>
            <Box>
              <Typography variant="h6" component="h2">
                Monthly Summary: {monthData.monthName} {monthData.year}
              </Typography>
            </Box>

            {/* --- THIS IS THE CHANGED SECTION --- */}
            <Box sx={{ height: 250, my: 3, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  onChange={handleBrushChange}
                >
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    domain={["auto", "auto"]}
                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(val) => `$${(val / 1000000).toFixed(0)}M`}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip />
                  <RechartsLegend verticalAlign="top" height={36} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="close"
                    name="Price"
                    stroke={isPositive ? "#2e7d32" : "#d32f2f"}
                    fill={isPositive ? "#2e7d32" : "#d32f2f"}
                    fillOpacity={0.2}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="volume"
                    name="Volume (USDT)"
                    barSize={20}
                    fill="#413ea0"
                    fillOpacity={0.4}
                  />
                  <Brush
                    dataKey="day"
                    height={25}
                    stroke="#6c63ff"
                    fill="#f4f4f4"
                    onChange={handleBrushChange}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              {/* Added the text label here */}
              <Typography
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "0.7rem",
                  color: "#17118dff",
                  fontWeight: "bold",
                  pointerEvents: "none",
                }}
              >
                Zoom & Pan
              </Typography>
            </Box>
            {/* --- END OF CHANGED SECTION --- */}

            <Divider sx={{ mb: 2 }} />

            <Typography variant="h6" gutterBottom>
              Summary for Selected Period
            </Typography>

            <Grid container spacing={2} sx={{ textAlign: "center" }}>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Performance
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: isPositive ? "success.main" : "error.main",
                    fontWeight: "600",
                  }}
                >
                  {stats.performance.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Avg. Daily Volatility
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  {stats.avgVolatility.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Volume
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  $
                  {stats.totalVolume.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Period High
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  ${stats.monthlyHigh.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Period Low
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  ${stats.monthlyLow.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default MonthlySummaryModal;
