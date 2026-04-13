import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { deleteJson, getJson, postJson, putJson } from '../utils/api';
import { formatPrice, getCurrentUser, setCurrentUser } from '../utils/storage';

const ADMIN_EMAIL = 'admin@xyz.com';
const ORDER_STATUSES = ['processing', 'making', 'ready', 'complete'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [productsMessage, setProductsMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersMessage, setOrdersMessage] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [activeView, setActiveView] = useState('users');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editRating, setEditRating] = useState('');
  const [editImage, setEditImage] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [image, setImage] = useState('');

  const isAdmin = currentUser?.isAdmin && currentUser?.email === ADMIN_EMAIL;

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await postJson('/api/admin/users', {
          email: ADMIN_EMAIL,
          password: '123456'
        });
        setUsers(data.users || []);
      } catch (error) {
        setMessage(error.message || 'Unable to load admin data.');
      }
    }

    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const totalUsers = useMemo(() => users.length, [users]);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };


  const handleViewAllProducts = async () => {
    setProductsMessage('');

    try {
      const data = await getJson('/api/products');
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (error) {
      setProductsMessage(error.message || 'Unable to load products right now.');
    }
  };

  const handleViewProductsClick = async () => {
    setActiveView('products');
    await handleViewAllProducts();
  };

  const handleViewUsersClick = () => {
    setActiveView('users');
    setShowAddProduct(false);
    setProductsMessage('');
    setOrdersMessage('');
  };

  const handleViewOrdersClick = async () => {
    setActiveView('orders');
    setShowAddProduct(false);
    setProductsMessage('');
    setOrdersMessage('');

    try {
      const data = await postJson('/api/admin/orders', {
        email: ADMIN_EMAIL,
        password: '123456'
      });
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (error) {
      setOrders([]);
      setOrdersMessage(error.message || 'Unable to load orders right now.');
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    setOrdersMessage('');

    try {
      const data = await putJson(`/api/admin/orders/${orderId}/status`, {
        email: ADMIN_EMAIL,
        password: '123456',
        status
      });

      const updatedOrder = data?.order;
      if (!updatedOrder) {
        return;
      }

      setOrders((prev) =>
        prev.map((item) => (item._id === updatedOrder._id ? { ...item, status: updatedOrder.status } : item))
      );
    } catch (error) {
      setOrdersMessage(error.message || 'Unable to update order status right now.');
    }
  };

  const clearProductForm = () => {
    setTitle('');
    setCategory('');
    setPrice('');
    setRating('');
    setImage('');
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    setProductsMessage('');

    try {
      await postJson('/api/admin/products', {
        email: ADMIN_EMAIL,
        password: '123456',
        title,
        category,
        price,
        rating,
        image
      });

      setProductsMessage('Product added successfully.');
      clearProductForm();
      await handleViewAllProducts();
      setShowAddProduct(false);
    } catch (error) {
      setProductsMessage(error.message || 'Unable to add product right now.');
    }
  };

  const startEditProduct = (product) => {
    setEditingProductId(product.id);
    setEditTitle(product.title);
    setEditCategory(product.category);
    setEditPrice(String(product.price));
    setEditRating(String(product.rating));
    setEditImage(product.image);
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditTitle('');
    setEditCategory('');
    setEditPrice('');
    setEditRating('');
    setEditImage('');
  };

  const handleSaveEditedProduct = async (productId) => {
    setProductsMessage('');

    try {
      await putJson(`/api/admin/products/${productId}`, {
        email: ADMIN_EMAIL,
        password: '123456',
        title: editTitle,
        category: editCategory,
        price: editPrice,
        rating: editRating,
        image: editImage
      });

      setProductsMessage('Product updated successfully.');
      cancelEditProduct();
      await handleViewAllProducts();
    } catch (error) {
      setProductsMessage(error.message || 'Unable to update product right now.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(`Are you sure you want to delete product #${productId}?`);
    if (!confirmed) {
      return;
    }

    setProductsMessage('');

    try {
      await deleteJson(`/api/admin/products/${productId}`, {
        email: ADMIN_EMAIL,
        password: '123456'
      });

      if (editingProductId === productId) {
        cancelEditProduct();
      }

      setProductsMessage('Product deleted successfully.');
      await handleViewAllProducts();
    } catch (error) {
      setProductsMessage(error.message || 'Unable to delete product right now.');
    }
  };

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex w-[95%] max-w-[1400px] flex-wrap items-center justify-between gap-2 py-3">
          <Link to="/" className="text-xl font-extrabold sm:text-2xl">
            <span>Cafe</span>
            <span className="text-amber-400">Lux</span>
          </Link>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Link
              to="/"
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold hover:border-amber-400 sm:text-sm"
            >
              ← Back to Store
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-slate-900 hover:bg-amber-500 sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-[95%] max-w-[1400px] py-4 sm:py-6">
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
          <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-2 text-slate-400">Manage Cafe users and monitor account activity.</p>
        </section>

        <section className="mt-4 grid gap-3 md:grid-cols-2">
          <article className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Registered Users</p>
            <p className="mt-1 text-3xl font-bold">{totalUsers}</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Admin Email</p>
            <p className="mt-1 text-lg font-bold">{ADMIN_EMAIL}</p>
          </article>
        </section>

        <section className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Management</h2>
            <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-3">
              <button
                type="button"
                onClick={handleViewUsersClick}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  activeView === 'users'
                    ? 'bg-amber-400 text-slate-900'
                    : 'border border-slate-700 hover:border-amber-400'
                }`}
              >
                View User
              </button>
              <button
                type="button"
                onClick={handleViewProductsClick}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  activeView === 'products'
                    ? 'bg-amber-400 text-slate-900'
                    : 'border border-slate-700 hover:border-amber-400'
                }`}
              >
                View Product
              </button>
              <button
                type="button"
                onClick={handleViewOrdersClick}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  activeView === 'orders'
                    ? 'bg-amber-400 text-slate-900'
                    : 'border border-slate-700 hover:border-amber-400'
                }`}
              >
                View Orders
              </button>
            </div>
          </div>

          {activeView === 'users' ? (
            <>
              <h3 className="mt-4 text-lg font-bold">User Accounts</h3>
              {message ? (
                <p className="mt-3 text-sm font-semibold text-rose-400">{message}</p>
              ) : users.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="px-2 py-2 font-semibold">Name</th>
                        <th className="px-2 py-2 font-semibold">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id || user.email} className="border-b border-slate-800">
                          <td className="px-2 py-2">{user.name}</td>
                          <td className="px-2 py-2">{user.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No registered users found.</p>
              )}
            </>
          ) : activeView === 'products' ? (
            <>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct((prev) => !prev)}
                  className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-slate-900 hover:bg-amber-500"
                >
                  Add Product
                </button>
              </div>

              {showAddProduct && (
                <form onSubmit={handleAddProduct} className="mt-4 grid gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Product title"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
                    required
                  />
                  <input
                    type="text"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="Category (e.g. coffee)"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
                    required
                  />
                  <input
                    type="number"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
                    required
                  />
                  <input
                    type="number"
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                    placeholder="Rating (0-5)"
                    min="0"
                    max="5"
                    step="0.1"
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
                    required
                  />
                  <input
                    type="url"
                    value={image}
                    onChange={(event) => setImage(event.target.value)}
                    placeholder="Image URL"
                    className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
                    required
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-bold text-slate-900 hover:bg-amber-500 md:col-span-2"
                  >
                    Save Product
                  </button>
                </form>
              )}

              {productsMessage && (
                <p className="mt-3 text-sm font-semibold text-emerald-400">{productsMessage}</p>
              )}

              {!!products.length && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="px-2 py-2 font-semibold">ID</th>
                        <th className="px-2 py-2 font-semibold">Title</th>
                        <th className="px-2 py-2 font-semibold">Category</th>
                        <th className="px-2 py-2 font-semibold">Price</th>
                        <th className="px-2 py-2 font-semibold">Rating</th>
                        <th className="px-2 py-2 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b border-slate-800">
                          <td className="px-2 py-2">{product.id}</td>
                          <td className="px-2 py-2">
                            {editingProductId === product.id ? (
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.target.value)}
                                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:border-amber-400"
                              />
                            ) : (
                              product.title
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {editingProductId === product.id ? (
                              <input
                                type="text"
                                value={editCategory}
                                onChange={(event) => setEditCategory(event.target.value)}
                                className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:border-amber-400"
                              />
                            ) : (
                              product.category
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {editingProductId === product.id ? (
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(event) => setEditPrice(event.target.value)}
                                min="0"
                                step="0.01"
                                className="w-28 rounded border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:border-amber-400"
                              />
                            ) : (
                              `$${Number(product.price).toFixed(2)}`
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {editingProductId === product.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={editRating}
                                  onChange={(event) => setEditRating(event.target.value)}
                                  min="0"
                                  max="5"
                                  step="0.1"
                                  className="w-24 rounded border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:border-amber-400"
                                />
                                <input
                                  type="url"
                                  value={editImage}
                                  onChange={(event) => setEditImage(event.target.value)}
                                  placeholder="Image URL"
                                  className="w-44 rounded border border-slate-700 bg-slate-950 px-2 py-1 outline-none focus:border-amber-400"
                                />
                              </div>
                            ) : (
                              product.rating
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {editingProductId === product.id ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditedProduct(product.id)}
                                  className="rounded bg-emerald-500 px-2 py-1 text-xs font-bold text-slate-900"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditProduct}
                                  className="rounded border border-slate-700 px-2 py-1 text-xs font-semibold"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEditProduct(product)}
                                  className="rounded border border-slate-700 px-2 py-1 text-xs font-semibold hover:border-amber-400"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="rounded border border-rose-500 px-2 py-1 text-xs font-semibold text-rose-300 hover:bg-rose-950"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              <h3 className="mt-4 text-lg font-bold">Orders</h3>

              {ordersMessage ? (
                <p className="mt-3 text-sm font-semibold text-rose-400">{ordersMessage}</p>
              ) : !orders.length ? (
                <p className="mt-3 text-sm text-slate-400">No orders found yet.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400">
                        <th className="px-2 py-2 font-semibold">Order #</th>
                        <th className="px-2 py-2 font-semibold">User</th>
                        <th className="px-2 py-2 font-semibold">Items</th>
                        <th className="px-2 py-2 font-semibold">Total</th>
                        <th className="px-2 py-2 font-semibold">Status</th>
                        <th className="px-2 py-2 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-b border-slate-800">
                          <td className="px-2 py-2 font-semibold">{order.orderNo || order._id}</td>
                          <td className="px-2 py-2">{order.userEmail}</td>
                          <td className="px-2 py-2">{order.products?.length || 0}</td>
                          <td className="px-2 py-2">{formatPrice(order.total || 0)}</td>
                          <td className="px-2 py-2">
                            <select
                              value={order.status}
                              onChange={(event) => handleOrderStatusChange(order._id, event.target.value)}
                              className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-amber-400"
                            >
                              {ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
