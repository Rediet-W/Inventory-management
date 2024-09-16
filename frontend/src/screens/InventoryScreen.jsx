import React, { useState } from "react";
import { Table, Button, Nav, Form, Row, Col } from "react-bootstrap";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../slices/productApiSlice";
import { useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";

const InventoryPage = () => {
  const { data: products, isLoading, error } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const { userInfo } = useSelector((state) => state.auth);

  // State to track the selected filter: "all" or "lowStock"
  const [filter, setFilter] = useState("all");

  // State for search input
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error("Failed to delete the product", error);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  // Filter products based on the selected filter and search term
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filter === "lowStock") {
      return product.quantity < 3 && matchesSearch;
    }
    return matchesSearch;
  });

  return (
    <div className="container mt-5">
      {/* Navigation Tabs and Search Bar */}
      <Row className="align-items-center mb-4">
        <Col md={8}>
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                All Products
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                active={filter === "lowStock"}
                onClick={() => setFilter("lowStock")}
              >
                Nearly Out of Stock
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        {/* Search Bar */}
        <Col md={4} className="mt-3 mt-md-0">
          <Form>
            <Form.Control
              type="text"
              placeholder="Search products by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form>
        </Col>
      </Row>

      {/* Product List Table */}
      <h2>
        {filter === "all" ? "All Products" : "Nearly Out of Stock Products"}
      </h2>
      <Table striped bordered hover responsive className="table-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Selling Price</th>
            {userInfo?.role === "admin" && <th>Buying Price</th>}{" "}
            {/* Show Buying Price for Admins */}
            {userInfo?.role === "admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
              <td>{product.sellingPrice}</td>
              {userInfo?.role === "admin" && (
                <td>{product.buyingPrice}</td>
              )}{" "}
              {/* Admin only */}
              {userInfo?.role === "admin" && (
                <td>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => handleDelete(product._id)}
                    disabled={isDeleting}
                  >
                    <FaTrash />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InventoryPage;
