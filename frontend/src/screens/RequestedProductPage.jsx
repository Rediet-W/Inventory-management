import React, { useState } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  useGetRequestedProductsQuery,
  useCreateRequestedProductMutation,
  useDeleteRequestedProductMutation,
} from "../slices/requestedProductApiSlice";
import { FaTrash } from "react-icons/fa";

const RequestedProductsPage = () => {
  const {
    data: requestedProducts,
    isLoading,
    error,
  } = useGetRequestedProductsQuery();
  console.log(requestedProducts);
  const [createRequestedProduct] = useCreateRequestedProductMutation();
  const [deleteRequestedProduct] = useDeleteRequestedProductMutation();
  const { userInfo } = useSelector((state) => state.auth);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");

  // Handle modal show and hide
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setProductName("");
    setDescription("");
  };

  // Handle form submission
  const handleAddProduct = async () => {
    await createRequestedProduct({ product: productName, description });
    handleCloseModal();
  };

  // Handle product deletion
  const handleDelete = async (productId) => {
    if (
      window.confirm("Are you sure you want to delete this requested product?")
    ) {
      await deleteRequestedProduct(productId);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading requested products</div>;

  return (
    <div className="container mt-5">
      <h2>Requested Products</h2>

      {/* Add Requested Product Button for users (not admins) */}
      {userInfo?.role !== "admin" && (
        <div className="d-flex justify-content-end mb-3">
          <Button variant="primary" onClick={handleShowModal}>
            Add Requested Product
          </Button>
        </div>
      )}

      {/* Requested Products Table */}
      <Table striped bordered hover responsive className="table-sm">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Description</th>
            {userInfo?.role !== "admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requestedProducts.map((product) => (
            <tr key={product._id}>
              <td>{product.product}</td>
              <td>{product.description}</td>
              {userInfo?.role !== "admin" && (
                <td>
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => handleDelete(product._id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for adding requested product */}
      <Modal show={showModal} onHide={handleCloseModal}>
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
    </div>
  );
};

export default RequestedProductsPage;
