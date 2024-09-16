import React, { useState, useMemo, useEffect } from "react";
import { useGetAllSalesQuery } from "../slices/salesApiSlice"; // Import the getAllSales query
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice"; // Purchases slice
import { useGetProductsQuery } from "../slices/productApiSlice"; // Fetch all products at once
import { Nav, Tab, Form, Button } from "react-bootstrap";
import { saveAs } from "file-saver"; // A package to trigger file download

const SummaryPage = () => {
  const [startDate, setStartDate] = useState(""); // Start date filter
  const [endDate, setEndDate] = useState(""); // End date filter
  const [tabKey, setTabKey] = useState("sell"); // State to track active tab ("sell" or "purchase")
  const [applyFilters, setApplyFilters] = useState(false); // State to track when to apply filters

  // Fetch all products (to match product IDs with purchases)
  const { data: products, isLoading: productsLoading } = useGetProductsQuery();

  // Fetch all sales (use the new hook)
  const { data: sales, isLoading: salesLoading } = useGetAllSalesQuery();
  console.log(sales);

  // Fetch purchases based on date range
  const { data: purchases, isLoading: purchasesLoading } =
    useGetPurchasesByDateRangeQuery(
      applyFilters ? { startDate, endDate } : {} // Fetch all data if no filters applied
    );

  // Calculate total sales amount
  const totalSales = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.sellingPrice * sale.quantitySold,
        0
      ) || 0
    );
  }, [sales]);

  // Calculate total purchases amount
  const totalPurchases = useMemo(() => {
    return (
      purchases?.reduce(
        (total, product) => total + product.buyingPrice * product.quantity,
        0
      ) || 0
    );
  }, [purchases]);

  // Calculate balance (sales - purchases)
  const balance = totalSales - totalPurchases;

  // Convert sales data to CSV format
  const convertSalesToCSV = () => {
    const csvRows = [
      ["Date", "Product Name", "Selling Price", "Quantity Sold"], // CSV headers
      ...sales?.map((sale) => [
        sale.saleDate
          ? new Date(sale.saleDate).toLocaleDateString()
          : "Invalid Date",
        sale.product?.name || "Unknown Product", // Safely access product name
        sale.sellingPrice,
        sale.quantitySold,
      ]),
    ];

    return csvRows.map((row) => row.join(",")).join("\n"); // Combine into CSV format
  };

  // Convert purchases data to CSV format
  const convertPurchasesToCSV = () => {
    const csvRows = [
      ["Date", "Product Name", "Buying Price", "Quantity"], // CSV headers
      ...purchases?.map((purchase) => [
        purchase.date
          ? new Date(purchase.date).toLocaleDateString()
          : "Invalid Date",
        products?.find((product) => product._id === purchase.product)?.name ||
          "Unknown Product", // Match product ID with the product name
        purchase.buyingPrice,
        purchase.quantity,
      ]),
    ];

    return csvRows.map((row) => row.join(",")).join("\n"); // Combine into CSV format
  };

  // Trigger download of CSV file for sales or purchases
  const handleDownload = (data, filename) => {
    const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, filename);
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    setApplyFilters(true); // Set to true to apply the date range filters
  };

  // Handle resetting filters
  useEffect(() => {
    if (!startDate && !endDate) {
      setApplyFilters(false); // Reset filters when no dates are selected
    }
  }, [startDate, endDate]);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Summary Page</h1>

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
          <Button
            className="mt-4"
            variant="primary"
            onClick={handleApplyFilters}
          >
            Apply
          </Button>
        </Form>
      </div>

      {/* Sell and Purchase Tabs */}
      <Tab.Container activeKey={tabKey} onSelect={(key) => setTabKey(key)}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="sell">Sell</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="purchase">Purchase</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Sell Tab Content */}
          <Tab.Pane eventKey="sell">
            {salesLoading ? (
              <p>Loading sales...</p>
            ) : (
              <div>
                <div className="card text-center mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Sales Summary</h5>
                    <p className="card-text">
                      Total Sales: <strong>{totalSales} ETB</strong>
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        handleDownload(convertSalesToCSV(), "sales.csv")
                      }
                    >
                      Download Sales CSV
                    </button>
                  </div>
                </div>

                {/* Sales Table */}
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Product Name</th>
                      <th scope="col">Selling Price</th>
                      <th scope="col">Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales?.map((sale) => (
                      <tr key={sale._id}>
                        <td>
                          {sale.saleDate
                            ? new Date(sale.saleDate)
                                .toISOString()
                                .split("T")[0]
                            : "Invalid Date"}
                        </td>
                        <td>{sale?.product?.name || "Unknown Product"}</td>
                        <td>{sale.sellingPrice} ETB</td>
                        <td>{sale.quantitySold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tab.Pane>

          {/* Purchase Tab Content */}
          <Tab.Pane eventKey="purchase">
            {purchasesLoading || productsLoading ? (
              <p>Loading purchases...</p>
            ) : (
              <div>
                <div className="card text-center mb-4">
                  <div className="card-body">
                    <h5 className="card-title">Purchase Summary</h5>
                    <p className="card-text">
                      Total Purchases: <strong>{totalPurchases} ETB</strong>
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        handleDownload(convertPurchasesToCSV(), "purchases.csv")
                      }
                    >
                      Download Purchases CSV
                    </button>
                  </div>
                </div>

                {/* Purchases Table */}
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Product Name</th>
                      <th scope="col">Buying Price</th>
                      <th scope="col">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases?.map((purchase) => (
                      <tr key={purchase._id}>
                        <td>
                          {purchase?.purchaseDate
                            ? new Date(purchase.purchaseDate)
                                .toISOString()
                                .split("T")[0]
                            : "Invalid Date"}
                        </td>
                        <td>{purchase?.product?.name || "Unknown Product"}</td>
                        <td>{purchase.buyingPrice} ETB</td>
                        <td>{purchase.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default SummaryPage;
