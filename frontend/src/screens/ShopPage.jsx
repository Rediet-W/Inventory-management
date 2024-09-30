import React, { useState } from "react";
import {
  useGetShopProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../slices/shopApiSlice";
import {
  Tab,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import SearchBar from "../components/SearchBar";
import { FaEdit, FaTrash } from "react-icons/fa"; // Importing icons
import { useSelector } from "react-redux";

const ShopPage = () => {
  const { data, error, isLoading } = useGetShopProductsQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("productName"); // State to handle search type
  const [activeTab, setActiveTab] = useState("all");
  const { userInfo } = useSelector((state) => state.auth);
  const [deleteProduct] = useDeleteProductMutation();

  const [editingProduct, setEditingProduct] = useState(null); // For product being edited
  const [showEditModal, setShowEditModal] = useState(false); // Edit modal visibility state

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  const handleSave = async () => {
    // Update the product when the form is submitted
    await updateProduct({
      id: editingProduct._id,
      updatedProduct: editingProduct,
    });
    setShowEditModal(false);
  };

  // Handle search filter
  const filteredProducts = (products) => {
    return products.filter((product) => {
      if (searchType === "productName") {
        return product.productName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      if (searchType === "batchNumber") {
        return product.batchNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      return true;
    });
  };

  const allProducts = data?.allProducts || [];
  const lowStockProducts = data?.lowStockProducts || [];
  return (
    <div className="container mt-4">
      {/* Row to align Shop Products heading and SearchBar on the same line */}
      <Row className="align-items-center mb-4">
        <Col md={6}>
          <h2>Shop Products</h2>
        </Col>
        <Col md={6} className="text-end">
          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
          />
        </Col>
      </Row>

      {/* Tabs for All Products and Low Stock */}
      <Tabs activeKey={activeTab} onSelect={(tabKey) => setActiveTab(tabKey)}>
        <Tab eventKey="all" title="All Products">
          {renderTable(filteredProducts(allProducts), handleDelete, userInfo)}
        </Tab>
        <Tab eventKey="lowStock" title="Low Stock">
          {renderTable(
            filteredProducts(lowStockProducts),
            handleDelete,
            userInfo
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

// Function to render table
const renderTable = (products, handleDelete, userInfo) => {
  if (!products || products.length === 0) {
    return <div>No products available</div>;
  }

  return (
    <Table striped bordered hover className="mt-3">
      <thead>
        <tr>
          <th>Date Added</th>
          <th>Product Name</th>
          <th>Batch Number</th>
          <th>Selling Price per unit</th>
          <th>Quantity Available</th>
          {userInfo?.role === "admin" && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product._id}>
            <td>{new Date(product.dateAdded).toLocaleDateString()}</td>
            <td>{product.productName}</td>
            <td>{product.batchNumber}</td>
            <td>{product.sellingPrice}</td>
            <td>{product.quantity}</td>
            {userInfo?.role === "admin" && (
              <td>
                <FaTrash
                  style={{ cursor: "pointer", color: "red" }}
                  onClick={() => handleDelete(product._id)}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ShopPage;
