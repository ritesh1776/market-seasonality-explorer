# Market Seasonality Explorer

This is a React application for visualizing historical volatility, liquidity, and performance data for financial instruments on an interactive calendar dashboard.

## Features

- **Interactive Calendar:** A monthly calendar view showing daily performance, volatility, and volume.
- **Multi-Layer Visualization:**
  - Volatility Heatmap (Green/Yellow/Red).
  - Performance Indicators (Up/Down Arrows).
  - Liquidity Indicators (Volume Bars).
- **Detailed Analysis Panels:**
  - **Today's Market:** A live-updating panel showing 24-hour stats, technical indicators (RSI, SMA), and an interactive intraday chart.
  - **Click-to-View:** Click any historical day on the calendar to see its detailed intraday chart and metrics.
- **Time-Based Analysis:**
  - Perform weekly, monthly, and yearly analysis via a dedicated control panel.
  - Each analysis opens a detailed modal with a zoomable chart and aggregated summary stats.
- **Custom Date Range Analysis:** Use a date picker to analyze any historical period.
- **Interactive Charts:** All charts include a "Zoom & Pan" brush for detailed inspection.
- **Theming:** Switch between Default (Light) and Dark color themes.
- **Responsive Design:** The layout adapts for usability on tablet and mobile devices.

## Tech Stack & Libraries

- **Framework:** React (with Vite)
- **UI Components:** Material-UI (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`)
- **Charting:** Recharts
- **Data Fetching:** Axios
- **Date Manipulation:** date-fns

## Assumptions Made

- **Data Source:** All financial data is sourced from the public, free-to-use Binance API endpoints.
- **Instrument:** The application is hardcoded to analyze the `BTC/USDT` pair for demonstration purposes.
- **Live Data:** The "live" data in the "Today's Market" panel is simulated by polling the API every 15 seconds.
- **Volatility:** Volatility is calculated as a simple daily price range `(High - Low) / Open` for the calendar heatmap.
- **Data Granularity:** The yearly/monthly charts use daily data, while weekly/daily charts use hourly/15-minute data where appropriate to provide detailed views.

## Running the Project Locally

## Running the Project Locally

### Prerequisites

- Node.js (v18 or later)
- npm

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ritesh1776/market-seasonality-explorer
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd market-seasonality-explorer
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to `http://localhost:5173` (or the address shown in your terminal).
