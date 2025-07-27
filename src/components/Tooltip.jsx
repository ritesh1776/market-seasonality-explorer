import React from "react";
import { format } from "date-fns";

const Tooltip = ({ details }) => {
  // Don't render if there are no details
  if (!details || !details.data) return null;

  const { x, y, data } = details;
  const style = {
    position: "fixed", // Use 'fixed' to position relative to the viewport
    top: y + 15, // Offset slightly below the cursor
    left: x + 15, // Offset slightly to the right of the cursor
  };

  // Calculate volatility for display
  const volatility = (((data.high - data.low) / data.open) * 100).toFixed(2);

  return (
    <div className="tooltip-container" style={style}>
      <strong>{format(data.date, "MMM d, yyyy")}</strong>
      <div>Open: {data.open.toLocaleString()}</div>
      <div>High: {data.high.toLocaleString()}</div>
      <div>Low: {data.low.toLocaleString()}</div>
      <div>Close: {data.close.toLocaleString()}</div>
      <div>
        Volume:{" "}
        {data.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </div>
      <div>Volatility: {volatility}%</div>
    </div>
  );
};

export default Tooltip;
