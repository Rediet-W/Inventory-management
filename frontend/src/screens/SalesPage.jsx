import React, { useState, useMemo } from "react";
import {
  useGetSalesByDateQuery, // Use the specific date query
  useAddSaleMutation,
  useDeleteSaleMutation,
  useEditSaleMutation,
} from "../slices/salesApiSlice";
import { useGetProductsQuery } from "../slices/productApiSlice";
import { useSelector } from "react-redux"; // To check if the user is an admin

const SalesPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Fetch all products (to choose from)
  const { data: products } = useGetProductsQuery();

  // Fetch sales for the specific date
  const { data: sales, refetch } = useGetSalesByDateQuery(saleDate);
  // console.log(sales);

  const [addSale] = useAddSaleMutation(); // Mutation for adding sales
  const [deleteSale] = useDeleteSaleMutation(); // Mutation for deleting sales
  const [editSale] = useEditSaleMutation(); // Mutation for editing sales
  const { userInfo } = useSelector((state) => state.auth); // Check if the user is admin

  // Function to handle adding a sale
  const handleAddSale = async () => {
    if (selectedProduct && quantity > 0) {
      try {
        await addSale({
          productId: selectedProduct._id,
          quantitySold: quantity,
        }).unwrap();
        alert("Sale added successfully");
        refetch(); // Fetch sales data again after adding sale
        setSelectedProduct(null); // Clear selection after sale
        setQuantity(1); // Reset quantity
      } catch (error) {
        alert("Error adding sale");
      }
    }
  };

  // Function to handle editing a sale
  const handleEdit = (sale) => {
    console.log(sale);
    const newQuantity = prompt(
      "Enter new quantity for the sale:",
      sale.quantitySold
    ); // Prompt the user for a new quantity
    if (newQuantity && newQuantity > 0) {
      editSale({
        saleId: sale._id,
        saleData: { quantitySold: newQuantity }, // Assuming we are only editing the quantity
      })
        .unwrap()
        .then(() => {
          alert("Sale updated successfully");
          refetch(); // Fetch updated sales
        })
        .catch((error) => alert("Error updating sale"));
    }
  };

  // Function to handle deleting a sale
  const handleDelete = async (saleId) => {
    try {
      await deleteSale(saleId).unwrap();
      alert("Sale deleted successfully");
      refetch(); // Fetch sales data again after deleting sale
    } catch (error) {
      alert("Error deleting sale");
    }
  };

  // Calculate the total sum of sales for the selected date
  const totalSalesETB = useMemo(() => {
    return sales?.reduce((total, sale) => {
      return total + sale.sellingPrice * sale.quantitySold;
    }, 0);
  }, [sales]);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Sales Page</h1>

      {/* Card showing the selected date and total sales */}
      <div className="card text-center mb-4">
        <div className="card-body">
          <h5 className="card-title">Sales Summary</h5>
          <p className="card-text">
            Date:{" "}
            <strong>{new Date(saleDate).toISOString().split("T")[0]}</strong>
          </p>
          <p className="card-text">
            Total Sales:{" "}
            <strong>
              {totalSalesETB ? `${totalSalesETB} ETB` : "No sales yet"}
            </strong>
          </p>
        </div>
      </div>

      {/* Add Sale Section (Visible only to non-admin users) */}
      {userInfo?.role !== "admin" && (
        <>
          <h2 className="text-center">Add Sale</h2>

          {/* Product Search */}
          <div className="mb-4">
            <input
              type="text"
              className="form-control"
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
          </div>

          {/* Selected Product Details */}
          {selectedProduct && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">
                  Selected Product: {selectedProduct?.name}
                </h5>
                <p className="card-text">
                  Selling Price: {selectedProduct?.sellingPrice} ETB
                </p>

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max={selectedProduct.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-primary mt-3"
                  onClick={handleAddSale}
                >
                  Add Sale
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sales Date Picker */}
      <h2>Sales for {saleDate}</h2>
      <div className="mb-4">
        <input
          type="date"
          className="form-control"
          value={saleDate}
          onChange={(e) => setSaleDate(e.target.value)}
        />
      </div>

      {/* Sales List in Table Format */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Product Name</th>
            <th scope="col">Selling Price</th>
            <th scope="col">Quantity Sold</th>
            {userInfo?.role === "admin" && <th scope="col">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sales?.map((sale) => (
            <tr key={sale._id}>
              <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
              <td>{sale?.product?.name}</td>
              <td>{sale?.sellingPrice} ETB</td>
              <td>{sale?.quantitySold}</td>
              {userInfo?.role === "admin" && (
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(sale)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(sale._id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesPage;
