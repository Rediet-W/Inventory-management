import React, { useState } from "react";
import { Button, Form, Container, Alert } from "react-bootstrap";
import { useCreateProductMutation } from "../slices/productApiSlice";
import { useNavigate } from "react-router-dom";

const AddProductPage = () => {
  const [name, setName] = useState("");
  const [buyingPrice, setBuyingPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");

  const [createProduct, { isLoading, error }] = useCreateProductMutation();
  const navigate = useNavigate();

  // Handle form submission to create a new product
  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      await createProduct({
        name,
        buyingPrice: Number(buyingPrice), // Ensure price is sent as a number
        sellingPrice: Number(sellingPrice),
        quantity: Number(quantity),
        date,
      }).unwrap();
      navigate("/"); // Redirect to home page or any other page after successful addition
    } catch (err) {
      // Handle error - It's already captured in the `error` state
    }
  };

  return (
    <Container className="mt-5">
      <h2>Add New Product</h2>

      <Form onSubmit={handleAddProduct}>
        {/* Product Name */}
        <Form.Group controlId="productName" className="mb-3">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        {/* Buying Price */}
        <Form.Group controlId="buyingPrice" className="mb-3">
          <Form.Label>Buying Price</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter buying price"
            value={buyingPrice}
            onChange={(e) => setBuyingPrice(e.target.value)}
            required
          />
        </Form.Group>

        {/* Selling Price */}
        <Form.Group controlId="sellingPrice" className="mb-3">
          <Form.Label>Selling Price</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter selling price"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
          />
        </Form.Group>

        {/* Quantity */}
        <Form.Group controlId="quantity" className="mb-3">
          <Form.Label>Quantity</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </Form.Group>

        {/* Date */}
        <Form.Group controlId="date" className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Form.Group>

        {/* Submit Button */}
        <Button variant="primary" type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Product"}
        </Button>

        {/* Display Error Message */}
        {error && (
          <Alert variant="danger" className="mt-3">
            {error.data?.message || error.error}
          </Alert>
        )}
      </Form>
    </Container>
  );
};

export default AddProductPage;
