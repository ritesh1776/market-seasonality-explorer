import "./App.css";
import Calendar from "./components/Calendar";
import TodaysAnalysis from "./components/TodaysAnalysis";
import ActionPanel from "./components/ActionPanel";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="App">
        <div className="app-header">
          <h1>Market Seasonality Explorer</h1>
        </div>
        <div className="dashboard-layout">
          <div className="action-panel-wrapper">
            <ActionPanel />
          </div>
          <div className="main-content">
            <Calendar />
          </div>
          <div className="sidebar-content">
            <TodaysAnalysis />
          </div>
        </div>
      </div>
    </LocalizationProvider>
  );
}

export default App;
