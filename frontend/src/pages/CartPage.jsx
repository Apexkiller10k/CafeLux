import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  formatPrice,
  getCurrentUser,
  getStoredCart,
  saveCart
} from '../utils/storage';
import { postJson } from '../utils/api';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(getStoredCart());
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState(false);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const updateItemQuantity = (productId, action) => {
    const nextCart = [...cart];
    const itemIndex = nextCart.findIndex((item) => item.id === productId);

    if (itemIndex < 0) {
      return;
    }

    if (action === 'increase') {
      nextCart[itemIndex].quantity += 1;
    }

    if (action === 'decrease') {
      nextCart[itemIndex].quantity -= 1;
    }

    if (action === 'remove' || nextCart[itemIndex].quantity <= 0) {
      nextCart.splice(itemIndex, 1);
    }

    saveCart(nextCart);
    setCart(nextCart);
  };

  const clearCart = () => {
    saveCart([]);
    setCart([]);
    setCheckoutMessage('');
    setIsSuccessMessage(false);
  };

  const handleCheckout = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setCheckoutMessage('Please log in to proceed to checkout.');
      setIsSuccessMessage(false);
      navigate('/login');
      return;
    }

    if (!totalItems) {
      setCheckoutMessage('Your cart is empty.');
      setIsSuccessMessage(false);
      return;
    }

    try {
      const result = await postJson('/api/orders', {
        userEmail: currentUser.email,
        products: cart
      });

      if (result.error) {
        setCheckoutMessage(result.error || 'Checkout failed. Please try again.');
        setIsSuccessMessage(false);
        return;
      }

      saveCart([]);
      setCart([]);
      const orderNo = result?.order?.orderNo;
      setCheckoutMessage(
        orderNo
          ? `Checkout successful. Your order number is ${orderNo}.`
          : 'Checkout successful. Your order has been placed.'
      );
      setIsSuccessMessage(true);
    } catch (err) {
      setCheckoutMessage('Checkout failed. Please try again.');
      setIsSuccessMessage(false);
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
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold hover:border-amber-400 sm:text-sm"
          >
            ← Continue Shopping
          </Link>
        </div>
      </header>

      <main className="mx-auto w-[95%] max-w-[1400px] py-4 sm:py-6">
        <section className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
          <section className="rounded-xl border border-slate-700 bg-slate-900 p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-xl font-bold sm:text-2xl">Your Cart</h1>
              <button
                type="button"
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-semibold hover:border-amber-400 sm:text-sm"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>

            {!cart.length ? (
              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-5">
                <strong>Your cart is empty.</strong>
                <p className="mt-2 text-slate-400">
                  Add Cafe menu items from the store to see them here.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {cart.map((item) => (
                  <article
                    key={item.id}
                    className="grid gap-3 rounded-xl border border-slate-700 bg-slate-950 p-3 sm:grid-cols-[100px_1fr_auto] sm:items-start"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1 text-slate-300">{formatPrice(item.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, 'decrease')}
                          className="rounded border border-slate-600 px-3 py-1"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, 'increase')}
                          className="rounded border border-slate-600 px-3 py-1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.id, 'remove')}
                      className="justify-self-start rounded border border-rose-500 px-3 py-1 text-sm text-rose-300 hover:bg-rose-950 sm:self-start"
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="rounded-xl border border-slate-700 bg-slate-900 p-3 sm:p-4">
            <p className="flex items-center justify-between py-2 text-sm">
              <span>Items</span>
              <strong>{totalItems}</strong>
            </p>
            <p className="flex items-center justify-between py-2 text-sm">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </p>
            <hr className="my-2 border-slate-700" />
            <p className="flex items-center justify-between py-2 text-base">
              <span>Total</span>
              <strong>{formatPrice(subtotal)}</strong>
            </p>

            <button
              type="button"
              disabled={!totalItems}
              onClick={handleCheckout}
              className="mt-3 w-full rounded-full bg-amber-400 py-2 font-bold text-slate-900 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Proceed to Checkout
            </button>

            <p
              className={`mt-3 min-h-5 text-sm font-semibold ${
                isSuccessMessage ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {checkoutMessage}
            </p>

            {isSuccessMessage && (
              <Link
                to="/orders"
                className="mt-2 inline-block rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold hover:border-amber-400"
              >
                View Orders
              </Link>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}