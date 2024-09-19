import React, { useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  useGetRequestedProductsQuery,
  useCreateRequestedProductMutation,
  useDeleteRequestedProductMutation,
  useUpdateRequestedProductMutation, // Add mutation for updating
} from "../slices/requestedProductApiSlice";
import { FaPlus } from "react-icons/fa"; // Import icons

const RequestedProductsPage = () => {
  const {
    data: requestedProducts,
    isLoading,
    error,
  } = useGetRequestedProductsQuery();

  const [createRequestedProduct] = useCreateRequestedProductMutation();
  const [deleteRequestedProduct] = useDeleteRequestedProductMutation();
  const [updateRequestedProduct] = useUpdateRequestedProductMutation(); // Mutation to update quantity
  const { userInfo } = useSelector((state) => state.auth);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1); // Add quantity state

  // Admin state to track selected products for deletion
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Handle modal show and hide
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setProductName("");
    setDescription("");
    setQuantity(1);
  };

  // Handle form submission
  const handleAddProduct = async () => {
    await createRequestedProduct({
      product: productName,
      description,
      quantity,
    });
    handleCloseModal();
  };

  // Handle product deletion (bulk for admin)
  const handleDelete = async () => {
    if (
      window.confirm("Are you sure you want to delete the selected products?")
    ) {
      for (const productId of selectedProducts) {
        await deleteRequestedProduct(productId);
      }
      setSelectedProducts([]); // Clear selected products after deletion
    }
  };

  // Handle quantity update for users
  const handleQuantityChange = async (productId, newQuantity) => {
    await updateRequestedProduct({ id: productId, quantity: newQuantity });
  };

  // Handle admin product selection for deletion
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h2 className="text-center">Requested Products</h2>
        </Col>

        {/* Add Requested Product Button for users (not admins) */}
        {userInfo?.role !== "admin" && (
          <Col className="text-end">
            <Button variant="primary" onClick={handleShowModal}>
              <FaPlus className="me-2" /> Add Requested Product
            </Button>
          </Col>
        )}

        {/* Delete Button for admins */}
        {userInfo?.role === "admin" && selectedProducts.length > 0 && (
          <Col className="text-end">
            <Button variant="danger" onClick={handleDelete}>
              Delete Selected Products
            </Button>
          </Col>
        )}
      </Row>

      {/* Loading and error handling */}
      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <Alert variant="danger" className="text-center">
          Error loading requested products
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="table-sm shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>Product Name</th>
              <th>Description</th>
              <th>Quantity</th>
              {userInfo?.role === "admin" && <th>Select for Deletion</th>}
            </tr>
          </thead>
          <tbody>
            {requestedProducts.map((product) => (
              <tr key={product._id}>
                <td>{product.product}</td>
                <td>{product.description}</td>
                <td>
                  <Form.Control
                    type="number"
                    value={product.quantity || 1}
                    min="1"
                    onChange={(e) =>
                      handleQuantityChange(product._id, e.target.value)
                    }
                  />
                </td>
                {userInfo?.role === "admin" && (
                  <td>
                    <Form.Check
                      type="checkbox"
                      onChange={() => handleSelectProduct(product._id)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for adding requested product */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Requested Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="productName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="description" className="mt-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="quantity" className="mt-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddProduct}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestedProductsPage;
