import React, { useState, useMemo, useEffect } from "react";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { Nav, Tab, Form, Button, Alert, Card, Row, Col } from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  // Load Amharic font in jsPDF
  const downloadPDF = async (id, fileName) => {
    try {
      const input = document.getElementById(id);
      if (!input) {
        throw new Error(`Element with id ${id} not found`);
      }

      // Convert the content of the table into a canvas image
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // Full page width
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add the image from '/image' at the top (logo or other relevant image)
      const logo = await loadImage("/image.png"); // Make sure to provide the correct path
      pdf.addImage(logo, "PNG", 10, 10, 40, 40); // Add image at the top left

      // Add the period next to the image
      pdf.setFontSize(12);
      pdf.text(`Period: ${startDate} to ${endDate}`, 55, 20);

      // Add some margin between the header and the table content
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const text = tabKey === "sell" ? "Sales Breakdown" : "Purchase Breakdown";
      const textWidth = pdf.getTextWidth(text);
      const textX = (pageWidth - textWidth) / 2;
      pdf.text(text, textX, 60); // Add header

      // Add the table content with padding/margin
      pdf.addImage(imgData, "PNG", 10, 70, imgWidth - 20, imgHeight); // Add some margin around the table

      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth - 20, imgHeight); // Add margin for subsequent pages
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Helper function to load the image
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
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
                onClick={() => downloadPDF("sales-section", "sales-report.pdf")}
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
                  downloadPDF("purchases-section", "purchases-report.pdf")
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
              <div id="sales-section">
                {/* Sales Table */}
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Product Name</th>
                      <th scope="col">Selling Price</th>
                      <th scope="col">Quantity Sold</th>
                      <th scope="col">Amount</th> {/* New column */}
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
                        <td>
                          {sale.quantitySold * sale.sellingPrice} ETB
                        </td>{" "}
                        {/* Amount */}
                        <td>{sale?.userName || "Unknown"}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td colSpan="4">Total</td>
                      <td>{totalSales} ETB</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Tab.Pane>

          {/* Purchases Summary */}
          <Tab.Pane eventKey="purchase">
            {purchasesLoading || productsLoading ? (
              <p>Loading purchases...</p>
            ) : (
              <div id="purchases-section">
                {/* Purchases Table */}
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Product Name</th>
                      <th scope="col">Buying Price</th>
                      <th scope="col">Quantity</th>
                      <th scope="col">Amount</th> {/* New column */}
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
                        <td>
                          {purchase.quantity * purchase.buyingPrice} ETB
                        </td>{" "}
                        {/* Amount */}
                        <td>{purchase?.userName || "Unknown"}</td>
                      </tr>
                    ))}
                    <tr className="fw-bold">
                      <td colSpan="4">Total</td>
                      <td>{totalPurchases} ETB</td>
                      <td></td>
                    </tr>
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
