const CART_STORAGE_KEY = 'cafeCart';
const ORDERS_STORAGE_KEY = 'cafeOrders';
const CURRENT_USER_KEY = 'cafeCurrentUser';
const ORDER_OVERRIDES_KEY = 'cafeOrderOverrides';

function parseJSON(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
}

function getStoredCart() {
  const cart = parseJSON(localStorage.getItem(CART_STORAGE_KEY), []);
  return Array.isArray(cart) ? cart : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getStoredOrders() {
  const orders = parseJSON(localStorage.getItem(ORDERS_STORAGE_KEY), []);
  return Array.isArray(orders) ? orders : [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function getCurrentUser() {
  return parseJSON(localStorage.getItem(CURRENT_USER_KEY), null);
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getOrderOverrides() {
  const overrides = parseJSON(localStorage.getItem(ORDER_OVERRIDES_KEY), {});
  return overrides && typeof overrides === 'object' ? overrides : {};
}

function saveOrderOverrides(overrides) {
  localStorage.setItem(ORDER_OVERRIDES_KEY, JSON.stringify(overrides));
}

function getCartQuantity() {
  return getStoredCart().reduce((sum, item) => sum + (item.quantity || 0), 0);
}

export {
  formatPrice,
  getCartQuantity,
  getCurrentUser,
  getOrderOverrides,
  getStoredCart,
  getStoredOrders,
  saveCart,
  saveOrderOverrides,
  saveOrders,
  setCurrentUser
};