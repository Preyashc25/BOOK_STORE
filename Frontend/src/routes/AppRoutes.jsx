// src/routes/AppRoutes.jsx
import { Routes, Route, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayOut";
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import ProductPage from "../pages/ProductPage";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import OrderHistory from "../pages/OrderHistory";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import AdminDashboard from "../pages/AdminDashboard";
import Checkout from "../pages/Checkout";
import AdminBooks from "../pages/AdminBooks";
import AdminCategories from "../pages/AdminCategories";
import AdminOrders from "../pages/AdminOrders";
import AdminUsers from "../pages/AdminUsers";
import Profile from "../pages/Profile";

// Wraps public pages with the main site chrome (Navbar/Footer)
const PublicLayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

// Wraps admin pages with AdminLayout instead — no public Navbar/Footer
const AdminLayoutWrapper = () => (
  <AdminRoute>
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  </AdminRoute>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* Public routes — get MainLayout */}
      <Route element={<PublicLayoutWrapper />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/book/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrderHistory />
            </PrivateRoute>
          }
        />
      </Route>
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      {/* Admin routes — get AdminLayout instead, no public chrome */}
      <Route element={<AdminLayoutWrapper />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<AdminBooks />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        {/* add more nested admin routes here, e.g. /admin/books, /admin/orders */}
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
