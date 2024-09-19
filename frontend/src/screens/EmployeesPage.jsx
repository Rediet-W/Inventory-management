import React from "react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "../slices/userApiSlice";
import { useSelector } from "react-redux";
import Loader from "../components/Loader"; // Ensure Loader component exists and is correctly imported

const EmployeesPage = () => {
  // Fetch logged-in user's role and isPrimaryAdmin flag from the state (assumes this is in your Redux store)
  const { userInfo } = useSelector((state) => state.auth);
  // Fetch users
  const { data: users, isLoading, isError, error } = useGetUsersQuery();

  // Mutation for deleting a user
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

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
    <div>
      <h2>Employees</h2>
      {isDeleting && <Loader />} {/* Show loader during delete */}
      <table className="table">
        <thead>
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

export default EmployeesPage;
