import React from "react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "../slices/userApiSlice";
import { useSelector } from "react-redux";
import Loader from "../components/Loader"; // Ensure Loader component exists and is correctly imported
import { FaTrashAlt } from "react-icons/fa"; // Import an icon for delete

const EmployeesPage = () => {
  const { userInfo } = useSelector((state) => state.auth); // Fetch logged-in user's role and isPrimaryAdmin flag from the state

  const { data: users, isLoading, isError, error } = useGetUsersQuery(); // Fetch users

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation(); // Mutation for deleting a user

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId).unwrap(); // Unwrap for error handling
      } catch (err) {
        console.error(err); // Handle error appropriately
      }
    }
  };

  if (isLoading) return <Loader />; // Show loader while data is loading
  if (isError)
    return (
      <div className="alert alert-danger" role="alert">
        {error?.data?.message || error.error}
      </div>
    ); // Display error message using Bootstrap alert

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Employees Management</h2>

      {/* Show loader during delete */}
      {isDeleting && <Loader />}

      {/* Employees Table */}
      <table className="table table-striped table-hover table-bordered shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            {userInfo?.isPrimaryAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              {userInfo?.isPrimaryAdmin && (
                <td>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="btn btn-danger btn-sm"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <FaTrashAlt className="me-2" /> Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* No users message */}
      {users.length === 0 && (
        <div className="alert alert-warning text-center">
          No employees found.
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
