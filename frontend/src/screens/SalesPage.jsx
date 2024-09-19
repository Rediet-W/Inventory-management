import React, { useState, useMemo } from "react";
import {
  useGetSalesByDateQuery,
  useAddSaleMutation,
  useDeleteSaleMutation,
  useEditSaleMutation,
} from "../slices/salesApiSlice";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { useSelector } from "react-redux";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Alert, // Add Alert from react-bootstrap
} from "react-bootstrap";

const SalesPage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [errorMessage, setErrorMessage] = useState(""); // State to store error message

  // Fetch all products
  const { data: products } = useGetProductsQuery();

  // Fetch sales for the specific date
  const { data: sales, refetch } = useGetSalesByDateQuery(saleDate);

  const [addSale] = useAddSaleMutation();
  const [deleteSale] = useDeleteSaleMutation();
  const [editSale] = useEditSaleMutation();

  // Handle adding sale
  const handleAddSale = async () => {
    setErrorMessage(""); // Reset error message before the action
    if (selectedProduct && quantity > 0) {
      try {
        await addSale({
          productId: selectedProduct._id, // Ensure _id exists and is valid
          quantitySold: quantity, // Ensure this is a valid number
          userName: userInfo?.name,
        }).unwrap();
        alert("Sale added successfully");
        refetch();
        setSelectedProduct(null);
        setQuantity(1);
      } catch (error) {
        // If error comes from backend, show the message
        setErrorMessage(error?.data?.message || "Error adding sale");
      }
    }
  };

  // Handle editing sale
  const handleEdit = (sale) => {
    const newQuantity = prompt(
      "Enter new quantity for the sale:",
      sale.quantitySold
    );
    if (newQuantity && newQuantity > 0) {
      editSale({
        saleId: sale._id,
        saleData: { quantitySold: newQuantity },
      })
        .unwrap()
        .then(() => {
          alert("Sale updated successfully");
          refetch();
        })
        .catch((error) => alert("Error updating sale"));
    }
  };

  // Handle deleting sale
  const handleDelete = async (saleId) => {
    try {
      await deleteSale(saleId).unwrap();
      alert("Sale deleted successfully");
      refetch();
    } catch (error) {
      alert("Error deleting sale");
    }
  };

  // Calculate total sales for the selected date
  const totalSalesETB = useMemo(() => {
    return sales?.reduce(
      (total, sale) => total + sale.sellingPrice * sale.quantitySold,
      0
    );
  }, [sales]);

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Sales Page</h1>

      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <Card.Title>Sales Summary</Card.Title>
              <Card.Text>
                Date:{" "}
                <strong>
                  {new Date(saleDate).toISOString().split("T")[0]}
                </strong>
              </Card.Text>
              <Card.Text>
                Total Sales:{" "}
                <strong>
                  {totalSalesETB ? `${totalSalesETB} ETB` : "No sales yet"}
                </strong>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Sale Section (Visible only to non-admin users) */}
      {userInfo?.role !== "admin" && (
        <Row className="justify-content-center mb-4">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <h2 className="text-center mb-4">Add Sale</h2>

                {/* Display the error message */}
                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                {/* Product Search */}
                <Form.Group className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Search product by name"
                    onChange={(e) => {
                      const searchValue = e.target.value.toLowerCase();
                      setSelectedProduct(
                        products?.find((product) =>
                          product.name.toLowerCase().startsWith(searchValue)
                        )
                      );
                    }}
                  />
                </Form.Group>

                {/* Selected Product Details */}
                {selectedProduct && (
                  <div className="selected-product-info">
                    <p>
                      <strong>Selected Product:</strong> {selectedProduct?.name}
                    </p>
                    <p>
                      <strong>Selling Price:</strong>{" "}
                      {selectedProduct?.sellingPrice} ETB
                    </p>
                    <Form.Group controlId="quantity" className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max={selectedProduct.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </Form.Group>

                    <Button
                      className="w-100"
                      variant="primary"
                      onClick={handleAddSale}
                    >
                      Add Sale
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Sales Date Picker */}
      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Form.Group className="text-center">
            <Form.Label>Select Date</Form.Label>
            <Form.Control
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="text-center"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Sales List */}
      <Row className="justify-content-center">
        <Col md={10}>
          <Table striped bordered hover className="shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>Date</th>
                <th>Product Name</th>
                <th>Selling Price</th>
                <th>Quantity Sold</th>
                {userInfo?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sales?.map((sale) => (
                <tr key={sale._id}>
                  <td>{new Date(saleDate).toISOString().split("T")[0]}</td>
                  <td>{sale?.productName}</td>
                  <td>{sale?.sellingPrice} ETB</td>
                  <td>{sale?.quantitySold}</td>
                  {userInfo?.role === "admin" && (
                    <td>
                      <Button
                        variant="warning"
                        className="btn-sm me-2"
                        onClick={() => handleEdit(sale)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="btn-sm"
                        onClick={() => handleDelete(sale._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default SalesPage;
