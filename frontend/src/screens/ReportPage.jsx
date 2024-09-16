import React, { useState, useMemo } from "react";
import {
  useGetSalesByDateRangeQuery,
  useGetPurchasesByDateRangeQuery,
} from "../slices/summaryApiSlice";
import { Form } from "react-bootstrap";
import { saveAs } from "file-saver"; // To trigger file download

const ReportPage = () => {
  const [startDate, setStartDate] = useState(""); // Start date filter
  const [endDate, setEndDate] = useState(""); // End date filter

  // Fetch sales data (Credit)
  const { data: sales } = useGetSalesByDateRangeQuery({ startDate, endDate });
  // Fetch product data (Debit)
  const { data: purchases } = useGetPurchasesByDateRangeQuery({
    startDate,
    endDate,
  });

  // Calculate total Debit (Purchases)
  const totalDebit = useMemo(() => {
    return (
      purchases?.reduce(
        (total, product) => total + product.buyingPrice * product.quantity,
        0
      ) || 0
    );
  }, [purchases]);

  // Calculate total Credit (Sales)
  const totalCredit = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.sellingPrice * sale.quantitySold,
        0
      ) || 0
    );
  }, [sales]);

  // Compute balance: Credit - Debit
  const balance = useMemo(
    () => totalDebit - totalCredit,
    [totalDebit, totalCredit]
  );

  // Combine sales and purchases data for the table
  const reportData = useMemo(() => {
    const reportRows = [];

    // Add purchases (Debit)
    purchases?.forEach((product) => {
      reportRows.push({
        date: new Date(product.date).toLocaleDateString(),
        productName: product.name,
        debit: product.buyingPrice * product.quantity,
        credit: null, // No credit for purchases
      });
    });

    // Add sales (Credit)
    sales?.forEach((sale) => {
      reportRows.push({
        date: new Date(sale.saleDate).toLocaleDateString(),
        productName: sale.product.name,
        debit: null, // No debit for sales
        credit: sale.sellingPrice * sale.quantitySold,
      });
    });

    return reportRows;
  }, [purchases, sales]);

  // Convert report data to CSV format
  const convertReportToCSV = () => {
    const csvRows = [
      ["Date", "Product Name", "Debit (ETB)", "Credit (ETB)"], // CSV headers
      ...reportData.map((row) => [
        row.date,
        row.productName,
        row.debit !== null ? row.debit : "", // Only show debit if not null
        row.credit !== null ? row.credit : "", // Only show credit if not null
      ]),
      ["", "Balance", balance, ""], // Balance row in CSV
    ];

    return csvRows.map((row) => row.join(",")).join("\n"); // Combine into CSV format
  };

  // Trigger download of CSV report
  const handleDownload = () => {
    const csvData = convertReportToCSV();
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "report.csv");
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Report Page</h1>

      {/* Date Filters */}
      <div className="d-flex justify-content-center mb-4">
        <Form>
          <Form.Group className="me-2">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
        </Form>
      </div>

      {/* Report Summary */}
      <div className="card text-center mb-4">
        <div className="card-body">
          <h5 className="card-title">Report Summary</h5>
          <p className="card-text">
            Total Debit: <strong>{totalDebit} ETB</strong> <br />
            Total Credit: <strong>{totalCredit} ETB</strong> <br />
            Balance: <strong>{balance} ETB</strong>
          </p>
          <button className="btn btn-primary" onClick={handleDownload}>
            Download Report CSV
          </button>
        </div>
      </div>

      {/* Report Table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Product Name</th>
            <th scope="col">Debit (ETB)</th>
            <th scope="col">Credit (ETB)</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.productName}</td>
              <td>{row.debit !== null ? row.debit : ""}</td>
              <td>{row.credit !== null ? row.credit : ""}</td>
            </tr>
          ))}

          {/* Add balance row at the bottom */}
          <tr>
            <td></td>
            <td>
              <strong>Balance</strong>
            </td>
            <td>
              <strong>{balance} ETB</strong>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReportPage;
