import React from "react";
import { Table, Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
} from "../slices/userApiSlice";
import { FaTrash } from "react-icons/fa";

const EmployeesPage = () => {
  const { data: users, isLoading, error } = useGetUsersQuery(); // Fetch all users
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation(); // Mutation for deleting a user
  const { userInfo } = useSelector((state) => state.auth);

  // Handle user deletion
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(userId);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching users</div>;

  return (
    <div className="container mt-5">
      <h2>Employees</h2>

      {/* Employees Table */}
      <Table striped bordered hover responsive className="table-sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {userInfo._id !== user._id && ( // Prevent the admin from deleting themselves
                  <Button
                    variant="danger"
                    className="btn-sm"
                    onClick={() => handleDelete(user._id)}
                    disabled={isDeleting}
                  >
                    <FaTrash />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default EmployeesPage;
