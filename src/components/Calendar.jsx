import React, { useState, useEffect, useCallback } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { fetchMonthlyKlines } from "../api";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Tooltip from "./Tooltip";
import DashboardPanel from "./DashboardPanel"; // 1. Import DashboardPanel

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [marketData, setMarketData] = useState({});
  const [tooltipData, setTooltipData] = useState(null);
  const [maxVolume, setMaxVolume] = useState(0);

  // --- 2. ADD STATE FOR THE DASHBOARD ---
  const [selectedDayData, setSelectedDayData] = useState(null);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  useEffect(() => {
    const getDataForMonth = async () => {
      const data = await fetchMonthlyKlines("BTCUSDT", currentMonth);
      if (data.length > 0) {
        const maxVol = Math.max(...data.map((d) => d.volume));
        setMaxVolume(maxVol);
      } else {
        setMaxVolume(0);
      }
      const dataMap = data.reduce((acc, dayData) => {
        const dateKey = format(dayData.date, "yyyy-MM-dd");
        acc[dateKey] = dayData;
        return acc;
      }, {});
      setMarketData(dataMap);
    };
    getDataForMonth();
  }, [currentMonth]);

  const handleMouseEnter = (e, dayData) => {
    if (!dayData) return;
    setTooltipData({ x: e.clientX, y: e.clientY, data: dayData });
  };
  const handleMouseLeave = () => setTooltipData(null);

  // --- 3. ADD HANDLERS FOR DASHBOARD ---
  const handleDayClick = (dayData) => {
    if (!dayData) return; // Don't open if there's no data
    setSelectedDayData(dayData);
    setIsDashboardOpen(true);
  };

  const handleDashboardClose = () => {
    setIsDashboardOpen(false);
    setSelectedDayData(null);
  };

  const nextMonth = useCallback(
    () => setCurrentMonth(addMonths(currentMonth, 1)),
    [currentMonth]
  );
  const prevMonth = useCallback(
    () => setCurrentMonth(subMonths(currentMonth, 1)),
    [currentMonth]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") nextMonth();
      else if (e.key === "ArrowLeft") prevMonth();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextMonth, prevMonth]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dateFormat = "d";
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={prevMonth}>&lt;</button>
          <h2>{format(currentMonth, "MMMM yyyy")}</h2>
          <button onClick={nextMonth}>&gt;</button>
        </div>
        <div className="days-of-week">
          {weekDays.map((day) => (
            <div key={day} className="day-of-week-cell">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map((day, i) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayData = marketData[dateKey];
            let volatilityClass = "";
            const placeholder = <div className="icon-placeholder" />;
            let performanceIndicator = isSameMonth(day, monthStart)
              ? placeholder
              : null;

            if (dayData) {
              const dailyRange = dayData.high - dayData.low;
              const volatility = (dailyRange / dayData.open) * 100;
              if (volatility > 5) volatilityClass = "volatility-high";
              else if (volatility > 2.5) volatilityClass = "volatility-medium";
              else volatilityClass = "volatility-low";

              if (dayData.close > dayData.open) {
                performanceIndicator = (
                  <ArrowDropUpIcon className="performance-icon up" />
                );
              } else if (dayData.close < dayData.open) {
                performanceIndicator = (
                  <ArrowDropDownIcon className="performance-icon down" />
                );
              }
            }

            let volumeBar = null;
            if (dayData && maxVolume > 0) {
              const heightPercent = (dayData.volume / maxVolume) * 100;
              volumeBar = (
                <div className="volume-bar-container">
                  <div
                    className="volume-bar"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
              );
            }

            return (
              <div
                key={i}
                className={`calendar-cell ${
                  !isSameMonth(day, monthStart) ? "disabled-day" : ""
                } ${isToday(day) ? "today" : ""} ${volatilityClass}`}
                onMouseEnter={(e) => handleMouseEnter(e, dayData)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleDayClick(dayData)} // 4. ADD onClick HANDLER
              >
                <div className="cell-header">
                  {performanceIndicator}
                  <span>{format(day, dateFormat)}</span>
                </div>
                {volumeBar}
              </div>
            );
          })}
        </div>
      </div>
      {tooltipData && <Tooltip details={tooltipData} />}
      {/* --- 5. RENDER THE DASHBOARD --- */}
      <DashboardPanel
        open={isDashboardOpen}
        handleClose={handleDashboardClose}
        dayData={selectedDayData}
      />
    </>
  );
};

export default Calendar;
