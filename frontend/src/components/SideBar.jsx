import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaBox,
  FaUsers,
  FaClipboardList,
  FaMoneyCheckAlt,
  FaBars,
} from "react-icons/fa"; // Import icons

const Sidebar = () => {
  const { userInfo } = useSelector((state) => state.auth); // Fetch user info from Redux state
  const [isCollapsed, setIsCollapsed] = useState(false); // State to toggle collapse
  if (!userInfo) {
    return null;
  }
  return (
    <div
      className={`d-flex flex-column p-3 bg-light ${
        isCollapsed ? "collapsed-sidebar" : ""
      }`}
      style={{ width: isCollapsed ? "80px" : "250px", height: "100vh" }}
    >
      {/* Toggle button for sidebar */}
      <button
        className="btn btn-light mb-3 " // Visible only on small screens
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <FaBars />
      </button>

      {/* Common Dashboard Link */}
      <Link
        to="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none"
      >
        <FaHome className="me-2" />
        {!isCollapsed && <span className="fs-4">Dashboard</span>}
      </Link>
      <hr />

      <ul className="nav nav-pills flex-column mb-auto">
        {/* SuperAdmin-specific links */}
        {userInfo?.role === "superAdmin" && (
          <>
            <li className="nav-item">
              <Link to="/report" className="nav-link text-dark">
                <FaUsers className="me-2" />
                {!isCollapsed && <span>Report</span>}
              </Link>
            </li>
          </>
        )}

        {/* User and Admin Links */}
        {userInfo?.role !== "superAdmin" && (
          <>
            {/* Common links for both users and admins */}
            <li className="nav-item">
              <Link to="/requested" className="nav-link text-dark">
                <FaClipboardList className="me-2" />
                {!isCollapsed && <span>Requested</span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/sales" className="nav-link text-dark">
                <FaMoneyCheckAlt className="me-2" />
                {!isCollapsed && <span>Sales</span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/inventory" className="nav-link text-dark">
                <FaMoneyCheckAlt className="me-2" />
                {!isCollapsed && <span>Inventory</span>}
              </Link>
            </li>

            {/* Admin-specific links */}
            {userInfo?.role === "admin" && (
              <>
                <li className="nav-item">
                  <Link to="/add-products" className="nav-link text-dark">
                    <FaBox className="me-2" />
                    {!isCollapsed && <span>Add Products</span>}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/employees" className="nav-link text-dark">
                    <FaUsers className="me-2" />
                    {!isCollapsed && <span>Employees</span>}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/summary" className="nav-link text-dark">
                    <FaUsers className="me-2" />
                    {!isCollapsed && <span>Summary</span>}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/report" className="nav-link text-dark">
                    <FaUsers className="me-2" />
                    {!isCollapsed && <span>Report</span>}
                  </Link>
                </li>
              </>
            )}
          </>
        )}
      </ul>
      <hr />
    </div>
  );
};

export default Sidebar;
