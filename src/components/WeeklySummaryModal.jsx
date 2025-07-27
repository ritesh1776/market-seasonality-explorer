import React from "react";
import {
  Modal,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Grid,
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
import { format } from "date-fns";

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

const WeeklySummaryModal = ({ open, handleClose, weekData, isLoading }) => {
  if (!open) return null;

  const isPositive = weekData ? weekData.performance >= 0 : false;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {isLoading || !weekData ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Fetching week data...</Typography>
          </Box>
        ) : (
          <>
            <Box>
              <Typography variant="h6" component="h2">
                Summary for Week {weekData.weekNumber} (
                {format(weekData.startDate, "MMM d")} -{" "}
                {format(weekData.endDate, "MMM d, yyyy")})
              </Typography>
            </Box>

            <Box sx={{ height: 250, my: 2, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weekData.chartData}
                  margin={{ top: 10, right: 30, left: 30, bottom: 5 }} // Increased left margin for label
                >
                  <defs>
                    <linearGradient
                      id="weeklyPriceGradient"
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
                  <XAxis
                    dataKey="time"
                    tickFormatter={(timeStr) =>
                      format(new Date(timeStr), "d MMM")
                    }
                    tick={{ fontSize: 11 }}
                    interval={23}
                  />
                  {/* --- 2. ADD THE LABEL TO THE YAXIS --- */}
                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                    tick={{ fontSize: 12 }}
                    width={80}
                  >
                    <Label
                      value="Price (USD)"
                      angle={-90}
                      position="insideLeft"
                      style={{ textAnchor: "middle" }}
                    />
                  </YAxis>
                  <RechartsTooltip
                    labelFormatter={(label) =>
                      format(new Date(label), "d MMM yyyy HH:mm")
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke={isPositive ? "#2e7d32" : "#d32f2f"}
                    fill="url(#weeklyPriceGradient)"
                    strokeWidth={2}
                  />
                  <Brush
                    dataKey="time"
                    tickFormatter={(timeStr) =>
                      format(new Date(timeStr), "d MMM")
                    }
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
                  color: "#161087ff",
                  fontWeight: "bold",
                  pointerEvents: "none",
                }}
              >
                Zoom & Pan
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="h6" gutterBottom>
              Weekly Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
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
                  {weekData.performance.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Avg. Volatility
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  {weekData.avgVolatility.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Volume
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  $
                  {weekData.totalVolume.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default WeeklySummaryModal;
