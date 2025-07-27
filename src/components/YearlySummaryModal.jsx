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

const YearlySummaryModal = ({ open, handleClose, yearData, isLoading }) => {
  if (!open) return null;

  const isPositive = yearData ? yearData.performance >= 0 : false;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {isLoading || !yearData ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Fetching year data...</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" component="h2">
              Summary for {yearData.year}
            </Typography>

            <Box sx={{ height: 250, my: 3, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={yearData.chartData}
                  margin={{ top: 10, right: 30, left: 40, bottom: 5 }} // 2. Adjusted left margin
                >
                  <defs>
                    <linearGradient
                      id="yearlyPriceGradient"
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
                      format(new Date(timeStr), "MMM d")
                    }
                    tick={{ fontSize: 12 }}
                    minTickGap={30}
                  />
                  {/* --- 3. ADDED LABEL TO Y-AXIS --- */}
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
                      format(new Date(label), "d MMM yyyy")
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    name="Price"
                    stroke={isPositive ? "#2e7d32" : "#d32f2f"}
                    fill="url(#yearlyPriceGradient)"
                    strokeWidth={2}
                  />
                  <Brush
                    dataKey="time"
                    tickFormatter={(timeStr) =>
                      format(new Date(timeStr), "MMM")
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
                  color: "#110b7bff",
                  fontWeight: "bold",
                  pointerEvents: "none",
                }}
              >
                Zoom & Pan
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="h6" gutterBottom>
              Yearly Summary
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
                  {yearData.performance.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Avg. Daily Volatility
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  {yearData.avgVolatility.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Volume
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  $
                  {yearData.totalVolume.toLocaleString(undefined, {
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

export default YearlySummaryModal;
