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
  Label,
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

const CustomSummaryModal = ({ open, handleClose, customData, isLoading }) => {
  if (!open) return null;
  const isPositive = customData ? customData.performance >= 0 : false;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        {isLoading || !customData ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Analyzing custom range...</Typography>
          </Box>
        ) : (
          <>
            <Box>
              <Typography variant="h6" component="h2">
                Custom Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(customData.startDate, "MMM d, yyyy")} -{" "}
                {format(customData.endDate, "MMM d, yyyy")}
              </Typography>
            </Box>

            <Box sx={{ height: 250, my: 3, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={customData.chartData}
                  margin={{ top: 10, right: 30, left: 40, bottom: 20 }}
                >
                  <XAxis
                    dataKey="date"
                    tickFormatter={(timeStr) =>
                      format(new Date(timeStr), "d MMM yyyy")
                    }
                    tick={{ fontSize: 12 }}
                  >
                    <Label
                      value="Date"
                      position="bottom"
                      offset={0}
                      style={{ fontSize: "0.8rem", color: "#666" }}
                    />
                  </XAxis>
                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(val) => `$${val.toLocaleString()}`}
                    tick={{ fontSize: 12 }}
                    width={80}
                  >
                    <Label
                      value="Price (USD)"
                      angle={-90}
                      position="left"
                      offset={-20}
                      style={{
                        textAnchor: "middle",
                        fontSize: "0.8rem",
                        color: "#666",
                      }}
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
                    stroke={isPositive ? "#2e7d32" : "#d32f2f"}
                    fill={isPositive ? "#2e7d32" : "#d32f2f"}
                    fillOpacity={0.3}
                  />
                  <Brush
                    dataKey="date"
                    tickFormatter={(timeStr) =>
                      format(new Date(timeStr), "d MMM yyyy")
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
                  bottom: 25,
                  left: "55%",
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

            <Divider sx={{ mb: 2 }} />

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
                  {customData.performance.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Avg. Daily Volatility
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  {customData.avgVolatility.toFixed(2)}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Volume
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "600" }}>
                  $
                  {customData.totalVolume.toLocaleString(undefined, {
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

export default CustomSummaryModal;
