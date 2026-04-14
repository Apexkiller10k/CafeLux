import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getJson } from "../utils/api";
import { formatPrice, getStoredCart, saveCart } from "../utils/storage";
import backIcon from "../assets/back.png";

function createStars(rating) {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getJson("/api/products");
        const products = Array.isArray(data.products) ? data.products : [];
        const found = products.find((p) => p.id === parseInt(productId));

        if (!found) {
          setError("Product not found.");
          setProduct(null);
        } else {
          setProduct(found);
          setError("");
        }
      } catch (err) {
        setError("Unable to load product.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    const cart = getStoredCart();
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity,
      });
    }

    saveCart(cart);
    setMessage(`${quantity} × ${product.title} added to cart!`);
    setQuantity(1);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-slate-400">Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <header className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto flex w-[95%] max-w-[1400px] flex-wrap items-center justify-between gap-2 py-3">
            <Link to="/" className="text-xl font-extrabold sm:text-2xl">
              <span>Cafe</span>
              <span className="text-amber-400">Lux</span>
            </Link>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold hover:border-amber-400 sm:text-sm"
            >
              <img
                src={backIcon}
                alt=""
                aria-hidden="true"
                className="h-4 w-4"
              />
              <span>Back</span>
            </button>
          </div>
        </header>
        <main className="mx-auto w-[95%] max-w-[1400px] py-4 sm:py-6">
          <div className="rounded-xl border border-rose-700 bg-rose-950 p-5">
            <p className="text-rose-300">{error || "Product not found."}</p>
            <Link
              to="/"
              className="mt-3 inline-block rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold hover:border-amber-400"
            >
              Return to Store
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const categoryLabel =
    {
      coffee: "Coffee",
      drinks: "Cold Drinks",
      sandwiches: "Sandwiches",
      pastries: "Pastries",
      salads: "Salads",
    }[product.category] || product.category;

  return (
    <div>
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex w-[95%] max-w-[1400px] flex-wrap items-center justify-between gap-2 py-3">
          <Link to="/" className="text-xl font-extrabold sm:text-2xl">
            <span>Cafe</span>
            <span className="text-amber-400">Lux</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold hover:border-amber-400 sm:text-sm"
          >
            <img src={backIcon} alt="" aria-hidden="true" className="h-4 w-4" />
            <span>Back to Store</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-[95%] max-w-[1400px] py-4 sm:py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          <div className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 p-3 sm:p-4">
            <img
              src={product.image}
              alt={product.title}
              className="h-auto max-h-[360px] w-auto max-w-full rounded-lg sm:max-h-[500px]"
            />
          </div>

          <div className="grid gap-4">
            <section className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
              <p className="text-sm uppercase tracking-wide text-slate-400">
                {categoryLabel}
              </p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                {product.title}
              </h1>

              <div className="mt-4 flex items-center gap-4">
                <div className="text-lg font-bold text-amber-400 sm:text-2xl">
                  {createStars(product.rating)}
                </div>
                <p className="text-sm text-slate-400 sm:text-base">
                  ({product.rating.toFixed(1)} stars)
                </p>
              </div>

              <p className="mt-4 text-3xl font-bold text-amber-400 sm:text-4xl">
                {formatPrice(product.price)}
              </p>

              <hr className="my-4 border-slate-700" />

              <div>
                <p className="text-sm text-slate-300">Quantity</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded border border-slate-600 px-4 py-2 font-bold hover:border-amber-400"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded border border-slate-600 px-4 py-2 font-bold hover:border-amber-400"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="mt-4 w-full rounded-full bg-amber-400 py-3 font-bold text-slate-900 hover:bg-amber-500"
              >
                Add {quantity > 1 ? `${quantity} ×` : ""} to Cart
              </button>

              {message && (
                <p className="mt-3 text-center text-sm font-semibold text-emerald-400">
                  {message}
                </p>
              )}

              <Link
                to="/cart"
                className="mt-3 block rounded-full border border-slate-700 py-2 text-center font-semibold hover:border-amber-400"
              >
                Go to Cart
              </Link>
            </section>

            <section className="rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
              <h2 className="font-bold">Product Details</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>✓ Freshly prepared every day</li>
                <li>✓ Quality ingredients</li>
                <li>✓ Made to order</li>
                <li>✓ Fast pickup and delivery</li>
                <li>✓ Satisfaction guaranteed</li>
              </ul>
            </section>
          </div>
        </div>

        <section className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-5">
          <h2 className="text-lg font-bold sm:text-xl">About This Item</h2>
          <p className="mt-3 text-slate-300">
            This {product.title} is part of the Cafe menu. Prepared fresh with
            quality ingredients, it is crafted to give you a delicious cafe
            experience. Whether you want a quick breakfast, lunch, or snack,
            this item is a customer favorite.
          </p>
          <p className="mt-3 text-slate-300">
            Category:{" "}
            <span className="font-semibold text-amber-400">
              {categoryLabel}
            </span>
          </p>
          <p className="mt-2 text-slate-300">
            Rating:{" "}
            <span className="font-semibold text-amber-400">
              {product.rating.toFixed(1)} / 5.0
            </span>
          </p>
        </section>
      </main>
    </div>
  );
}
