import React, { useState, useMemo, useEffect } from "react";
import { Form, Button, Card, Row, Col, Table, Alert } from "react-bootstrap";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { FaDownload } from "react-icons/fa"; // Download icon for better UI
import { saveAs } from "file-saver"; // To trigger file download
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";

const ReportPage = () => {
  const [startDate, setStartDate] = useState(""); // Start date filter
  const [endDate, setEndDate] = useState(""); // End date filter
  const [applyFilters, setApplyFilters] = useState(false); // To track when to apply filters
  const [errorMessage, setErrorMessage] = useState(""); // Validation error message

  // Fetch sales data (Credit) only after filters are applied
  const { data: sales, refetch: refetchSales } = useGetSalesByDateRangeQuery(
    { startDate, endDate },
    { skip: !applyFilters } // Skip query until filters are applied
  );

  // Fetch purchases data (Debit) only after filters are applied
  const { data: purchases, refetch: refetchPurchases } =
    useGetPurchasesByDateRangeQuery(
      { startDate, endDate },
      { skip: !applyFilters } // Skip query until filters are applied
    );

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
    () => totalCredit - totalDebit,
    [totalCredit, totalDebit]
  );

  // Combine sales and purchases data for the table and sort by date (recent at bottom)
  const reportData = useMemo(() => {
    const reportRows = [];

    purchases?.forEach((purchase) => {
      reportRows.push({
        date: new Date(purchase.purchaseDate).toISOString().split("T")[0],
        productName: purchase?.productName || "Unknown Product",
        debit: purchase.buyingPrice * purchase.quantity,
        credit: null,
      });
    });

    sales?.forEach((sale) => {
      reportRows.push({
        date: new Date(sale.saleDate).toISOString().split("T")[0],
        productName: sale?.productName || "Unknown Product",
        debit: null,
        credit: sale.sellingPrice * sale.quantitySold,
      });
    });

    // Sort rows by date (most recent at the bottom)
    return reportRows.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [purchases, sales]);

  // Convert report data to CSV format
  const convertReportToCSV = () => {
    const header = `"የአየር ጤና አንቀጸ ብርሃን ቅድስት ኪዳነምሕረት ቤተክርስቲያን የፍኖተ ጽድቅ ሰንበት ትምህርት ቤት ንዋየ ቅድሳት መሸጫ ሱቅ"\n"GL report"\n"Period: ${startDate} to ${endDate}"\n\nDate,Product Name,Debit (ETB),Credit (ETB)\n`;

    const rows = reportData
      .map((row) => [
        row.date,
        row.productName,
        row.debit !== null ? row.debit : "",
        row.credit !== null ? row.credit : "",
      ])
      .join("\n");

    const balanceRow = `\n,Balance,${balance} ETB,\n`;
    return header + rows + balanceRow;
  };

  const handleDownload = () => {
    const csvContent = convertReportToCSV();

    // Add BOM (Byte Order Mark) for UTF-8 encoding to support Amharic characters
    const utf8BOM = "\uFEFF";

    // Create a Blob object with the CSV content and the BOM
    const blob = new Blob([utf8BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // Trigger the download using file-saver
    saveAs(blob, "የፍኖተ_ጽድቅ_ሱቅ_ሪፖርት.csv");
  };
  // Handle filter application
  const handleApplyFilters = () => {
    if (!startDate || !endDate) {
      setErrorMessage("Both start and end dates are required.");
    } else if (new Date(startDate) > new Date(endDate)) {
      setErrorMessage("Start date cannot be later than end date.");
    } else {
      setErrorMessage("");
      setApplyFilters(true);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4 fw-bold">Financial Report</h1>

      {/* Date Filters */}
      <Card className="p-4 mb-4 shadow-sm">
        <Form>
          <Row className="align-items-center">
            <Col md={4}>
              <Form.Group controlId="startDate">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="endDate">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="text-end">
              <Button
                variant="primary"
                className="mt-3"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Display Error Message */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {/* Report Summary */}
      <Card className="text-center mb-4 shadow">
        <Card.Body>
          <Card.Title>Report Summary</Card.Title>
          <Card.Text>
            <strong>Total Debit:</strong> {totalDebit} ETB <br />
            <strong>Total Credit:</strong> {totalCredit} ETB <br />
            <strong>Balance:</strong> {balance} ETB
          </Card.Text>
        </Card.Body>
      </Card>

      {/* Download Button */}
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleDownload}>
          <FaDownload /> Download Report
        </Button>
      </div>

      {/* Report Table */}
      <Table striped bordered hover className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Product Name</th>
            <th>Debit (ETB)</th>
            <th>Credit (ETB)</th>
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
      </Table>
    </div>
  );
};

export default ReportPage;
