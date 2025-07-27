import React from "react";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Legend = () => {
  return (
    <div className="legend-container">
      <div className="legend-item">
        <div className="legend-swatch volatility-low"></div>
        <span>Low Volatility</span>
      </div>
      <div className="legend-item">
        <div className="legend-swatch volatility-medium"></div>
        <span>Medium Volatility</span>
      </div>
      <div className="legend-item">
        <div className="legend-swatch volatility-high"></div>
        <span>High Volatility</span>
      </div>
      <div className="legend-item">
        <ArrowDropUpIcon className="performance-icon up" />
        <span>Price Up</span>
      </div>
      <div className="legend-item">
        <ArrowDropDownIcon className="performance-icon down" />
        <span>Price Down</span>
      </div>
    </div>
  );
};

export default Legend;
