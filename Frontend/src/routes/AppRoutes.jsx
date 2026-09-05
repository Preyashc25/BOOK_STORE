// src/routes/AppRoutes.jsx
import { Routes, Route, Outlet } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import ProductPage from '../pages/ProductPage';
import Cart from '../pages/Cart';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import OrderHistory from '../pages/OrderHistory';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import AdminDashboard from '../pages/AdminDashboard';

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
      {/* Public routes — get MainLayout */}
      <Route element={<PublicLayoutWrapper />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/book/:id" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrderHistory />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Admin routes — get AdminLayout instead, no public chrome */}
      <Route element={<AdminLayoutWrapper />}>
        <Route path="/admin" element={<AdminDashboard />} />
        {/* add more nested admin routes here, e.g. /admin/books, /admin/orders */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;