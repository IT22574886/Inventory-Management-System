// src/App.js
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./Components/Home/Home";
import AddItem from "./Components/AddItem/AddItem";
import DisplayItem from "./Components/DisplayItem/DisplayItem";
import UpdateItem from "./Components/UpdateItem/UpdateItem";
import Navbar from "./Components/Navbar/Navbar";

// Authentication Components
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";

// Shop Components
import ProductList from "./Components/Shop/ProductList";
import Cart from "./Components/Shop/Cart";

// Admin Components
import Dashboard from "./Components/Admin/Dashboard";
import AdminOrderManagement from "./Components/Admin/AdminOrderManagement";

// Order Management Component
import OrderManagement from "./Components/OrderManagement/OrderManagement";

function App() {
  return (
    <AuthProvider>
      <React.Fragment>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/shop" element={<ProductList />} />

          {/* Protected Customer Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute requireAuth={true} requireCustomer={true}>
                <Cart />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requireAuth={true} requireAdmin={true}>
                <DisplayItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AddItem"
            element={
              <ProtectedRoute requireAuth={true} requireAdmin={true}>
                <AddItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/AllItem"
            element={
              <ProtectedRoute requireAuth={true} requireAdmin={true}>
                <DisplayItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/updateItem/:id"
            element={
              <ProtectedRoute requireAuth={true} requireAdmin={true}>
                <UpdateItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAuth={true} requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAuth={true} requireAdmin={true}>
                <AdminOrderManagement />
              </ProtectedRoute>
            }
          />

          {/* Order Management Routes */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute requireAuth={true}>
                <OrderManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </React.Fragment>
    </AuthProvider>
  );
}

export default App;
