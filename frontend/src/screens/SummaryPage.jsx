import React, { useState, useMemo, useEffect } from "react";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { Nav, Tab, Form, Button, Alert, Card, Row, Col } from "react-bootstrap";
import { saveAs } from "file-saver"; // A package to trigger file download
import { FaDownload } from "react-icons/fa";

const SummaryPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tabKey, setTabKey] = useState("sell");
  const [applyFilters, setApplyFilters] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: products, isLoading: productsLoading } = useGetProductsQuery();

  const { data: sales, isLoading: salesLoading } = useGetSalesByDateRangeQuery(
    applyFilters && startDate && endDate ? { startDate, endDate } : {},
    { skip: !applyFilters }
  );

  const { data: purchases, isLoading: purchasesLoading } =
    useGetPurchasesByDateRangeQuery(
      applyFilters && startDate && endDate ? { startDate, endDate } : {},
      { skip: !applyFilters }
    );

  const totalSales = useMemo(() => {
    return (
      sales?.reduce(
        (total, sale) => total + sale.sellingPrice * sale.quantitySold,
        0
      ) || 0
    );
  }, [sales]);

  const totalPurchases = useMemo(() => {
    return (
      purchases?.reduce(
        (total, product) => total + product.buyingPrice * product.quantity,
        0
      ) || 0
    );
  }, [purchases]);

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

  useEffect(() => {
    if (!startDate && !endDate) {
      setApplyFilters(false);
    }
  }, [startDate, endDate]);

  // Helper function to convert sales data to CSV format with the title and period
  // Helper function to convert sales data to CSV format with the title and period centered in the 3rd column
  const convertSalesToCSV = () => {
    const header = `,,,\n,,,\n"የአየር ጤና አንቀጸ ብርሃን ቅድስት ኪዳነምሕረት ቤተክርስቲያን የፍኖተ ጽድቅ ሰንበት ትምህርት ቤት ንዋየ ቅድሳት መሸጫ ሱቅ"\n,,,\nSales Report\n,,,\nPeriod: ${startDate} to ${endDate}\n\nDate,Product Name,Selling Price,Quantity Sold,Sold by\n`;

    const rows = sales
      .map((sale) => {
        const formattedDate = new Date(sale.saleDate)
          .toISOString()
          .split("T")[0];
        return `${formattedDate},${sale?.productName || "Unknown Product"},${
          sale.sellingPrice
        },${sale.quantitySold},${sale?.userName || "Unknown"}`;
      })
      .join("\n");

    return header + rows;
  };

  // Helper function to convert purchases data to CSV format with the title and period centered in the 3rd column
  const convertPurchasesToCSV = () => {
    const header = `,,,\n,,,\n"የአየር ጤና አንቀጸ ብርሃን ቅድስት ኪዳነምሕረት ቤተክርስቲያን የፍኖተ ጽድቅ ሰንበት ትምህርት ቤት ንዋየ ቅድሳት መሸጫ ሱቅ"\n,,,\nPurchases Report\n,,,\nPeriod: ${startDate} to ${endDate}\n\nDate,Product Name,Buying Price,Quantity,Purchased by\n`;

    const rows = purchases
      .map((purchase) => {
        const formattedDate = new Date(purchase.purchaseDate)
          .toISOString()
          .split("T")[0];
        return `${formattedDate},${
          purchase?.productName || "Unknown Product"
        },${purchase.buyingPrice},${purchase.quantity},${
          purchase?.userName || "Unknown"
        }`;
      })
      .join("\n");

    return header + rows;
  };

  // Helper function to handle file download
  const handleDownload = (csvContent, fileName) => {
    const utf8BOM = "\uFEFF"; // Add BOM for UTF-8 encoding
    const blob = new Blob([utf8BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, fileName);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4 fw-bold">Shop Summary</h1>

      {/* Date Filters */}
      <Card className="p-4 mb-4">
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

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {/* Tabs for Sales and Purchases */}
      <Tab.Container activeKey={tabKey} onSelect={(key) => setTabKey(key)}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="sell">
              Sales
              <Button
                variant="success"
                size="sm"
                className="ms-2"
                onClick={() => handleDownload(convertSalesToCSV(), "sales.csv")}
              >
                <FaDownload />
              </Button>
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="purchase">
              Purchases
              <Button
                variant="success"
                size="sm"
                className="ms-2"
                onClick={() =>
                  handleDownload(convertPurchasesToCSV(), "purchases.csv")
                }
              >
                <FaDownload />
              </Button>
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Sales Summary */}
          <Tab.Pane eventKey="sell">
            {salesLoading ? (
              <p>Loading sales...</p>
            ) : (
              <>
                {/* Sales Table */}
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Product Name</th>
                      <th scope="col">Selling Price</th>
                      <th scope="col">Quantity Sold</th>
                      <th scope="col">Sold by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales?.map((sale) => (
                      <tr key={sale._id}>
                        <td>
                          {new Date(sale.saleDate).toISOString().split("T")[0]}
                        </td>
                        <td>{sale?.productName || "Unknown Product"}</td>
                        <td>{sale.sellingPrice} ETB</td>
                        <td>{sale.quantitySold}</td>
                        <td>{sale?.userName || "Unknown"}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td colSpan="2">Total</td>
                      <td>{totalSales} ETB</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </Tab.Pane>

          {/* Purchases Summary */}
          <Tab.Pane eventKey="purchase">
            {purchasesLoading || productsLoading ? (
              <p>Loading purchases...</p>
            ) : (
              <>
                {/* Purchases Table */}
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Product Name</th>
                      <th scope="col">Buying Price</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Purchased by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases?.map((purchase) => (
                      <tr key={purchase._id}>
                        <td>
                          {
                            new Date(purchase.purchaseDate)
                              .toISOString()
                              .split("T")[0]
                          }
                        </td>
                        <td>{purchase?.productName || "Unknown Product"}</td>
                        <td>{purchase.buyingPrice} ETB</td>
                        <td>{purchase.quantity}</td>
                        <td>{purchase?.userName || "Unknown"}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td colSpan="2">Total</td>
                      <td>{totalPurchases} ETB</td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default SummaryPage;
