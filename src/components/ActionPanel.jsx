import React, { useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Legend from "./Legend";
import WeeklySummaryModal from "./WeeklySummaryModal";
import MonthlySummaryModal from "./MonthlySummaryModal";
import YearlySummaryModal from "./YearlySummaryModal";
import CustomAnalysisModal from "./CustomAnalysisModal";
import CustomSummaryModal from "./CustomSummaryModal";
import {
  getWeek,
  getMonth,
  getYear,
  startOfYear,
  endOfYear,
  addWeeks,
  startOfWeek,
  endOfWeek,
  format,
  startOfMonth,
  endOfMonth,
  setMonth,
} from "date-fns";
import {
  getWeeksForCurrentYear,
  getMonthsForCurrentYear,
  getYearsRange,
} from "../utils/dateHelpers";
const buttonStyles = {
  justifyContent: "flex-start",
  textTransform: "none",
  fontWeight: "600",
  color: "#495057",
  border: "1px solid #dee2e6",
  padding: "8px 16px",
  backgroundColor: "transparent",
  width: "100%",
  "&:hover": {
    backgroundColor: "#f8f9fa",
    borderColor: "#adb5bd",
  },
};

const ActionPanel = () => {
  const [activeMenu, setActiveMenu] = useState("main");
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [selectedWeekData, setSelectedWeekData] = useState(null);
  const [isLoadingWeek, setIsLoadingWeek] = useState(false);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const [isYearlyModalOpen, setIsYearlyModalOpen] = useState(false);
  const [selectedYearData, setSelectedYearData] = useState(null);
  const [isLoadingYear, setIsLoadingYear] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [isCustomSummaryOpen, setIsCustomSummaryOpen] = useState(false);
  const [customSummaryData, setCustomSummaryData] = useState(null);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);

  const weeks = getWeeksForCurrentYear();
  const months = getMonthsForCurrentYear();
  const years = getYearsRange();

  const handleWeekClick = async (weekNumber) => {
    setIsWeeklyModalOpen(true);
    setIsLoadingWeek(true);
    const yearStart = startOfYear(new Date());
    const dateInWeek = addWeeks(yearStart, weekNumber - 1);
    const startDate = startOfWeek(dateInWeek);
    const endDate = endOfWeek(dateInWeek);
    try {
      const dailyPromise = axios.get("https://api.binance.com/api/v3/klines", {
        params: {
          symbol: "BTCUSDT",
          interval: "1d",
          startTime: startDate.getTime(),
          endTime: endDate.getTime(),
        },
      });
      const hourlyPromise = axios.get("https://api.binance.com/api/v3/klines", {
        params: {
          symbol: "BTCUSDT",
          interval: "1h",
          startTime: startDate.getTime(),
          endTime: endDate.getTime(),
        },
      });
      const [dailyResponse, hourlyResponse] = await Promise.all([
        dailyPromise,
        hourlyPromise,
      ]);
      const dailyKlines = dailyResponse.data;
      if (dailyKlines.length === 0) {
        setSelectedWeekData({
          weekNumber,
          startDate,
          endDate,
          performance: 0,
          avgVolatility: 0,
          totalVolume: 0,
          chartData: [],
        });
        setIsLoadingWeek(false);
        return;
      }
      const firstDayOpen = parseFloat(dailyKlines[0][1]);
      const lastDayClose = parseFloat(dailyKlines[dailyKlines.length - 1][4]);
      const performance = ((lastDayClose - firstDayOpen) / firstDayOpen) * 100;
      let totalVolume = 0;
      let totalVolatility = 0;
      dailyKlines.forEach((d) => {
        const open = parseFloat(d[1]);
        const high = parseFloat(d[2]);
        const low = parseFloat(d[3]);
        const volume = parseFloat(d[7]);
        totalVolume += volume;
        totalVolatility += ((high - low) / open) * 100;
      });
      const avgVolatility = totalVolatility / dailyKlines.length;
      const chartData = hourlyResponse.data.map((d) => ({
        time: new Date(d[0]).getTime(),
        label: format(new Date(d[0]), "d MMM HH:mm"),
        close: parseFloat(d[4]),
      }));
      setSelectedWeekData({
        weekNumber,
        startDate,
        endDate,
        performance,
        avgVolatility,
        totalVolume,
        chartData,
      });
    } catch (error) {
      console.error("Error fetching weekly data:", error);
    } finally {
      setIsLoadingWeek(false);
    }
  };
  const handleWeeklyModalClose = () => {
    setIsWeeklyModalOpen(false);
    setSelectedWeekData(null);
  };

  const handleMonthClick = async (monthIndex) => {
    setIsMonthlyModalOpen(true);
    setIsLoadingMonth(true);
    const year = getYear(new Date());
    const dateInMonth = setMonth(new Date(year, 0, 1), monthIndex);
    const startDate = startOfMonth(dateInMonth);
    const endDate = endOfMonth(dateInMonth);
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params: {
            symbol: "BTCUSDT",
            interval: "1d",
            startTime: startDate.getTime(),
            endTime: endDate.getTime(),
          },
        }
      );
      setSelectedMonthData({
        monthName: format(startDate, "MMMM"),
        year,
        klines: response.data,
      });
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    } finally {
      setIsLoadingMonth(false);
    }
  };
  const handleMonthlyModalClose = () => {
    setIsMonthlyModalOpen(false);
    setSelectedMonthData(null);
  };

  const handleYearClick = async (year) => {
    setIsYearlyModalOpen(true);
    setIsLoadingYear(true);
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));

    try {
      // Fetch year data in two halves
      const firstHalfPromise = axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params: {
            symbol: "BTCUSDT",
            interval: "1d",
            startTime: startDate.getTime(),
            limit: 500,
          },
        }
      );
      const secondHalfPromise = axios.get(
        "https://api.binance.com/api/v3/klines",
        {
          params: {
            symbol: "BTCUSDT",
            interval: "1d",
            startTime: addWeeks(startDate, 26).getTime(),
            endTime: endDate.getTime(),
            limit: 500,
          },
        }
      );
      const [firstHalf, secondHalf] = await Promise.all([
        firstHalfPromise,
        secondHalfPromise,
      ]);
      const yearlyKlines = [...firstHalf.data, ...secondHalf.data].filter(
        (item, index, self) => index === self.findIndex((t) => t[0] === item[0])
      );

      if (yearlyKlines.length === 0) {
        /* ... handle no data ... */ return;
      }

      // Calculate overall yearly stats (this part is the same)
      const firstDayOpen = parseFloat(yearlyKlines[0][1]);
      const lastDayClose = parseFloat(yearlyKlines[yearlyKlines.length - 1][4]);
      const performance = ((lastDayClose - firstDayOpen) / firstDayOpen) * 100;
      let totalVolume = 0;
      let totalVolatility = 0;
      yearlyKlines.forEach((d) => {
        const open = parseFloat(d[1]);
        const high = parseFloat(d[2]);
        const low = parseFloat(d[3]);
        totalVolume += parseFloat(d[7]);
        totalVolatility += ((high - low) / open) * 100;
      });
      const avgVolatility = totalVolatility / yearlyKlines.length;

      // --- THIS IS THE CHANGE ---
      // Format the daily data directly for the chart, just like the weekly modal
      const chartData = yearlyKlines.map((d) => ({
        time: new Date(d[0]).getTime(),
        close: parseFloat(d[4]),
      }));

      setSelectedYearData({
        year,
        performance,
        avgVolatility,
        totalVolume,
        chartData,
      });
    } catch (error) {
      console.error("Error fetching yearly data:", error);
    } finally {
      setIsLoadingYear(false);
    }
  };
  const handleYearlyModalClose = () => {
    setIsYearlyModalOpen(false);
    setSelectedYearData(null);
  };

  const handleAnalyze = async (start, end) => {
    handleCustomModalClose(); // Close the date picker
    setIsCustomSummaryOpen(true); // Open the results modal
    setIsLoadingCustom(true);

    try {
      // Logic to fetch data in chunks if the date range is large
      let allKlines = [];
      let currentStart = start.getTime();
      const endMillis = end.getTime();

      while (currentStart <= endMillis) {
        const response = await axios.get(
          "https://api.binance.com/api/v3/klines",
          {
            params: {
              symbol: "BTCUSDT",
              interval: "1d",
              startTime: currentStart,
              limit: 1000,
            },
          }
        );
        const batch = response.data.filter((d) => d[0] <= endMillis);
        allKlines.push(...batch);
        if (batch.length < 1000) break; // Exit loop if we got all remaining data
        currentStart = batch[batch.length - 1][0] + 1; // Set start for next batch
      }

      if (allKlines.length === 0) {
        throw new Error("No data found for this range.");
      }

      // Calculate stats for the custom range
      const firstDayOpen = parseFloat(allKlines[0][1]);
      const lastDayClose = parseFloat(allKlines[allKlines.length - 1][4]);
      const performance = ((lastDayClose - firstDayOpen) / firstDayOpen) * 100;
      let totalVolume = 0;
      let totalVolatility = 0;
      allKlines.forEach((d) => {
        const open = parseFloat(d[1]);
        const high = parseFloat(d[2]);
        const low = parseFloat(d[3]);
        totalVolume += parseFloat(d[7]);
        totalVolatility += ((high - low) / open) * 100;
      });
      const avgVolatility = totalVolatility / allKlines.length;
      const chartData = allKlines.map((d) => ({
        date: d[0],
        close: parseFloat(d[4]),
      }));

      setCustomSummaryData({
        startDate: start,
        endDate: end,
        performance,
        avgVolatility,
        totalVolume,
        chartData,
      });
    } catch (error) {
      console.error("Error fetching custom range data:", error);
      alert("Could not fetch data for the selected range. Please try again.");
      setIsCustomSummaryOpen(false); // Close summary modal on error
    } finally {
      setIsLoadingCustom(false);
    }
  };

  const handleCustomModalOpen = () => setIsCustomModalOpen(true);
  const handleCustomModalClose = () => setIsCustomModalOpen(false);
  const handleCustomSummaryClose = () => setIsCustomSummaryOpen(false);
  const renderMainMenu = () => (
    <>
      <div className="action-panel-legend-wrapper">
        <Button sx={buttonStyles}>More Info</Button>
        <div className="action-panel-legend-popover">
          <Legend />
        </div>
      </div>
      <Button sx={buttonStyles} onClick={() => setActiveMenu("weekly")}>
        Weekly Analysis
      </Button>
      <Button sx={buttonStyles} onClick={() => setActiveMenu("monthly")}>
        Monthly Analysis
      </Button>
      <Button sx={buttonStyles} onClick={() => setActiveMenu("yearly")}>
        Yearly Analysis
      </Button>
      <Button sx={buttonStyles} onClick={handleCustomModalOpen}>
        Custom Analysis
      </Button>
    </>
  );

  const renderWeeklyMenu = () => (
    <div className="submenu-container">
      <Button
        sx={buttonStyles}
        startIcon={<ArrowBackIcon />}
        onClick={() => setActiveMenu("main")}
      >
        Back
      </Button>
      <div className="submenu-list">
        {weeks.map((weekNum) => (
          <Button
            key={weekNum}
            sx={buttonStyles}
            onClick={() => handleWeekClick(weekNum)}
          >
            Week {weekNum}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderMonthlyMenu = () => (
    <div className="submenu-container">
      <Button
        sx={buttonStyles}
        startIcon={<ArrowBackIcon />}
        onClick={() => setActiveMenu("main")}
      >
        Back
      </Button>
      <div className="submenu-list">
        {months.map((month, index) => (
          <Button
            key={month}
            sx={buttonStyles}
            onClick={() => handleMonthClick(index)}
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderYearlyMenu = () => (
    <div className="submenu-container">
      <Button
        sx={buttonStyles}
        startIcon={<ArrowBackIcon />}
        onClick={() => setActiveMenu("main")}
      >
        Back
      </Button>
      <div className="submenu-list">
        {years.map((year) => (
          <Button
            key={year}
            sx={buttonStyles}
            onClick={() => handleYearClick(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="action-panel-container">
      {activeMenu === "main" && renderMainMenu()}
      {activeMenu === "weekly" && renderWeeklyMenu()}
      {activeMenu === "monthly" && renderMonthlyMenu()}
      {activeMenu === "yearly" && renderYearlyMenu()}

      <WeeklySummaryModal
        open={isWeeklyModalOpen}
        handleClose={handleWeeklyModalClose}
        weekData={selectedWeekData}
        isLoading={isLoadingWeek}
      />
      <MonthlySummaryModal
        open={isMonthlyModalOpen}
        handleClose={handleMonthlyModalClose}
        monthData={selectedMonthData}
        isLoading={isLoadingMonth}
      />
      <YearlySummaryModal
        open={isYearlyModalOpen}
        handleClose={handleYearlyModalClose}
        yearData={selectedYearData}
        isLoading={isLoadingYear}
      />
      <CustomAnalysisModal
        open={isCustomModalOpen}
        handleClose={handleCustomModalClose}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        handleAnalyze={handleAnalyze}
      />
      <CustomSummaryModal
        open={isCustomSummaryOpen}
        handleClose={handleCustomSummaryClose}
        customData={customSummaryData}
        isLoading={isLoadingCustom}
      />
    </div>
  );
};

export default ActionPanel;
