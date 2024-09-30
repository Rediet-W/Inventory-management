import React, { useState } from "react";
import { Table, Button, Nav, Form, Row, Col } from "react-bootstrap";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../slices/productApiSlice";
import { useSelector } from "react-redux";
import { useAddToShopMutation } from "../slices/shopApiSlice"; // Assuming you have this mutation
import SearchBar from "../components/SearchBar"; // Import your search bar component

const InventoryPage = () => {
  const { data: products, isLoading, error } = useGetProductsQuery();
  const { userInfo } = useSelector((state) => state.auth);

  const [addToShop] = useAddToShopMutation(); // Hook for adding product to the shop
  const [deleteProduct] = useDeleteProductMutation(); // Hook for deleting a product

  // State to track the selected filter: "all" or "lowStock"
  const [filter, setFilter] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("productName"); // State to handle search type

  // State to track the quantity to be added to the shop for each product
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (productId, value) => {
    setQuantities({ ...quantities, [productId]: value });
  };

  const handleAddToShop = async (productId, productName) => {
    const quantityToAdd = quantities[productId];
    const product = products.find((product) => product._id === productId);

    if (!quantityToAdd || quantityToAdd <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (quantityToAdd > product.quantity) {
      alert(
        `Cannot add more than available quantity. Available: ${product.quantity}`
      );
      return;
    }

    try {
      await addToShop({
        productId,
        batchNumber: product.batchNumber, // Use actual batch number
        quantity: parseInt(quantityToAdd),
        sellingPrice: product.sellingPrice,
        userName: userInfo.name, // Assuming user's name is passed
      });

      alert(`Added ${quantityToAdd} units of ${productName} to shop`);
    } catch (error) {
      console.error("Failed to add product to shop", error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        alert("Product deleted successfully");
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  // Filter products based on the selected filter and search term
  const filteredProducts = products.filter((product) => {
    const matchesSearchQuery =
      searchType === "productName"
        ? product.name?.toLowerCase().includes(searchQuery.toLowerCase())
        : product.batchNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());

    const matchesLowStock = filter === "lowStock" ? product.quantity < 3 : true; // Filter for low stock

    return matchesSearchQuery && matchesLowStock;
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
                Low Stock
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        {/* Search Bar */}
        <Col md={4} className="mt-3 mt-md-0">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
          />
        </Col>
      </Row>

      {/* Product List Table */}
      <h2>{filter === "all" ? "All Products" : "Low Stock Products"}</h2>
      <Table striped bordered hover responsive className="table-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Batch Number</th> {/* Add batch number column */}
            <th>Quantity</th>
            <th>Selling Price</th>
            {userInfo?.role === "admin" && <th>Buying Price</th>}{" "}
            {/* Show Buying Price for Admins */}
            {userInfo?.role === "admin" && <th>Select Quantity</th>}
            {userInfo?.role === "admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product._id}>
              <td>{product.name}</td>
              <td>{product.batchNumber}</td> {/* Display batch number */}
              <td>{product.quantity}</td>
              <td>{product.sellingPrice}</td>
              {userInfo?.role === "admin" && (
                <td>{product.buyingPrice}</td>
              )}{" "}
              {/* Admin only */}
              {userInfo?.role === "admin" && (
                <>
                  <td>
                    <Form.Control
                      type="number"
                      value={quantities[product._id] || ""}
                      onChange={(e) =>
                        handleQuantityChange(product._id, e.target.value)
                      }
                      placeholder="Quantity"
                      min="1"
                    />
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      className="btn-sm"
                      onClick={() => handleAddToShop(product._id, product.name)}
                    >
                      Add to Shop
                    </Button>
                    <Button
                      variant="danger"
                      className="btn-sm ml-2"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default InventoryPage;
