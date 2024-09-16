import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { useGetProductsQuery } from "../slices/productApiSlice";

const HomeTop = () => {
  const { data: products, isLoading, error } = useGetProductsQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  // Calculate total store value (sum of all buying prices)
  const totalStoreValue = products.reduce(
    (total, product) => total + product.buyingPrice * product.quantity,
    0
  );

  // Calculate total number of item types
  const totalItems = products.length;

  // Filter products with less than 3 in quantity
  const lowStockProducts = products.filter((product) => product.quantity < 3);

  return (
    <Row className="mb-4">
      {/* Total Store Value Card */}
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <Card.Title>Total Store Value</Card.Title>
            <Card.Text>{`${totalStoreValue} ETB`}</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Total Number of Items Card */}
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <Card.Title>Number of Item Types</Card.Title>
            <Card.Text>{totalItems}</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Low Stock Products Card */}
      <Col md={4}>
        <Card className="text-center">
          <Card.Body>
            <Card.Title>Products with Low Stock</Card.Title>
            <Card.Text>{lowStockProducts.length}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default HomeTop;
