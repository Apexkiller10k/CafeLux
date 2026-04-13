import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SignupPage from './pages/SignupPage';
import StorePage from './pages/StorePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StorePage />} />
      <Route path="/product/:productId" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
