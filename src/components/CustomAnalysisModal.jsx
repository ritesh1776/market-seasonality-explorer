import React from "react";
import { Modal, Box, Typography, Button, Divider } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "1px solid #ddd",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
};

const CustomAnalysisModal = ({
  open,
  handleClose,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  handleAnalyze,
}) => {
  const handleAnalyzeClick = () => {
    if (fromDate && toDate) {
      // This will be connected to the data fetching logic in the next step
      handleAnalyze(fromDate, toDate);
    } else {
      alert("Please select both a 'From' and 'To' date.");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Select Custom Date Range
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <DatePicker
            label="From Date"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
            maxDate={new Date()}
          />
          <DatePicker
            label="To Date"
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
            minDate={fromDate}
            maxDate={new Date()}
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" onClick={handleAnalyzeClick}>
            Analyze
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomAnalysisModal;
