import React from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
import HomeTop from "../components/HomeTop";
import { useGetSalesByDateRangeQuery } from "../slices/salesApiSlice";
import { useGetPurchasesByDateRangeQuery } from "../slices/purchaseApiSlice";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import moment from "moment"; // Use moment.js to format dates

const HomePage = () => {
  // Get the last 7 days' sales and purchases data
  const today = new Date();
  const startDate = moment(today).subtract(6, "days").format("YYYY-MM-DD");
  const endDate = moment(today).format("YYYY-MM-DD");

  const {
    data: sales,
    isLoading: salesLoading,
    error: salesError,
  } = useGetSalesByDateRangeQuery({
    startDate,
    endDate,
  });

  const {
    data: purchases,
    isLoading: purchasesLoading,
    error: purchasesError,
  } = useGetPurchasesByDateRangeQuery({
    startDate,
    endDate,
  });

  if (salesLoading || purchasesLoading)
    return <div>Loading sales and purchases data...</div>;
  if (salesError || purchasesError) return <div>Error loading data</div>;

  // Create an array of the last 7 days in 'YYYY-MM-DD' format
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    moment(today).subtract(i, "days").format("YYYY-MM-DD")
  ).reverse();

  // Group sales and purchases by date
  const salesByDate = sales.reduce((acc, sale) => {
    const saleDate = moment(sale.saleDate).format("YYYY-MM-DD");
    acc[saleDate] = acc[saleDate]
      ? acc[saleDate] + sale.sellingPrice
      : sale.sellingPrice;
    return acc;
  }, {});

  const purchasesByDate = purchases.reduce((acc, purchase) => {
    const purchaseDate = moment(purchase.purchaseDate).format("YYYY-MM-DD");
    acc[purchaseDate] = acc[purchaseDate]
      ? acc[purchaseDate] + purchase.buyingPrice
      : purchase.buyingPrice;
    return acc;
  }, {});

  // Ensure all dates from the last 7 days have a value, defaulting to 0
  const salesAmounts = last7Days.map((date) => salesByDate[date] || 0);
  const purchasesAmounts = last7Days.map((date) => purchasesByDate[date] || 0);

  // Prepare data for the bar chart with new colors (blue and yellow)
  const chartData = {
    labels: last7Days, // Dates on the x-axis
    datasets: [
      {
        label: "Total Sales (ETB)",
        data: salesAmounts, // Sales amounts on the y-axis
        backgroundColor: "#0d6efd", // Blue
        borderColor: "#0d6efd",
        borderWidth: 1,
      },
      {
        label: "Total Purchases (ETB)",
        data: purchasesAmounts, // Purchases amounts on the y-axis
        backgroundColor: "#ffc107", // Yellow
        borderColor: "#ffc107",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        {/* Image and Welcome Text next to each other */}
        <Col md={6} className="text-center">
          <img
            src="/image.png" // Path to your logo
            alt="Shop Logo"
            style={{
              width: "200px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </Col>
        <Col md={6} className="text-center">
          <h1 className="mt-3">Welcome to Our Shop Dashboard</h1>
        </Col>
      </Row>

      <Row>
        {/* Left Column - Cards */}
        <Col md={4}>
          <HomeTop />
        </Col>

        {/* Right Column - Sales and Purchases Bar Graph */}
        <Col md={8}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Sales and Purchases for the Last 7 Days</Card.Title>
              <Bar data={chartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
