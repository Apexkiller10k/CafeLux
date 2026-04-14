import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { getCurrentUser, formatPrice } from "../utils/storage";
import { postJson } from "../utils/api";
import backIcon from "../assets/back.png";

export default function OrdersPage() {
  const currentUser = getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedOrderNo, setCopiedOrderNo] = useState("");

  useEffect(() => {
    if (!currentUser?.email) {
      return undefined;
    }

    const fetchOrders = async (showInitialLoader = false) => {
      try {
        if (showInitialLoader) {
          setLoading(true);
        }

        const result = await postJson("/api/orders/my-orders", {
          userEmail: currentUser.email,
        });

        if (result.error) {
          setError(result.error);
          setOrders([]);
        } else {
          setOrders(result.orders || []);
          setError("");
        }
      } catch (err) {
        setError("Failed to load orders.");
      } finally {
        if (showInitialLoader) {
          setLoading(false);
        }
      }
    };

    fetchOrders(true);
    const intervalId = setInterval(() => {
      fetchOrders(false);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [currentUser?.email]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const name = currentUser.name || currentUser.email || "Member";

  const handleCopyOrderNo = async (orderNo) => {
    if (!orderNo) {
      return;
    }

    try {
      await navigator.clipboard.writeText(orderNo);
      setCopiedOrderNo(orderNo);
      setTimeout(() => setCopiedOrderNo(""), 1400);
    } catch {
      setCopiedOrderNo("");
    }
  };

  return (
    <div>
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex w-[95%] max-w-[1400px] flex-wrap items-center justify-between gap-2 py-3">
          <Link to="/" className="text-xl font-extrabold sm:text-2xl">
            <span>Cafe</span>
            <span className="text-amber-400">Lux</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold hover:border-amber-400 sm:text-sm"
          >
            <img src={backIcon} alt="" aria-hidden="true" className="h-4 w-4" />
            <span>Back to Store</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-[95%] max-w-[1400px] py-4 sm:py-6">
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
          <h1 className="text-2xl font-bold sm:text-3xl">Orders</h1>
          <p className="mt-2 text-slate-400">
            {name}, review your recent Cafe purchases.
          </p>
        </section>

        {error && (
          <section className="mt-4 rounded-xl border border-rose-700 bg-rose-950 p-4">
            <p className="text-rose-300">{error}</p>
          </section>
        )}

        {loading && (
          <section className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-slate-400">Loading your orders...</p>
          </section>
        )}

        {!loading && orders.length === 0 && !error && (
          <section className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-slate-400">You haven't placed any orders yet.</p>
            <Link
              to="/"
              className="mt-2 inline-block rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold hover:border-amber-400"
            >
              Browse Menu
            </Link>
          </section>
        )}

        {!loading && orders.length > 0 && (
          <section className="mt-4 grid gap-3">
            {orders.map((order) => {
              const orderDate = new Date(order.createdAt).toLocaleDateString();
              const displayOrderNo = order.orderNo || order._id;
              const itemsLabel =
                order.products && order.products.length > 1
                  ? `${order.products[0].title} + ${order.products.length - 1} more`
                  : order.products && order.products.length > 0
                    ? order.products[0].title
                    : "Order";

              return (
                <article
                  key={order._id}
                  className="grid gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Order #
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <h3 className="break-all text-lg font-semibold sm:text-xl">
                        {displayOrderNo}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleCopyOrderNo(displayOrderNo)}
                        className="rounded border border-slate-700 px-2 py-1 text-xs font-semibold hover:border-amber-400"
                      >
                        {copiedOrderNo === displayOrderNo ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-1 text-slate-300">{itemsLabel}</p>
                    <div className="mt-3 grid gap-1 text-sm text-slate-400">
                      {order.products &&
                        order.products.length > 0 &&
                        order.products.map((product, idx) => (
                          <p key={`${product.id}-${idx}`}>
                            {product.title} x{product.quantity} @{" "}
                            {formatPrice(product.price)}
                          </p>
                        ))}
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-slate-300">{orderDate}</p>
                    <p className="mt-1 text-sm font-semibold">{order.status}</p>
                    <strong className="mt-1 block text-base">
                      {formatPrice(order.total)}
                    </strong>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
