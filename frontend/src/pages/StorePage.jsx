import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getJson } from "../utils/api";
import {
  formatPrice,
  getCartQuantity,
  getCurrentUser,
  getStoredCart,
  saveCart,
  setCurrentUser,
} from "../utils/storage";

const categories = [
  { value: "all", label: "All" },
  { value: "coffee", label: "Coffee" },
  { value: "drinks", label: "Cold Drinks" },
  { value: "sandwiches", label: "Sandwiches" },
  { value: "pastries", label: "Pastries" },
  { value: "salads", label: "Salads" },
];

const categoryLabelByValue = categories.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

function createStars(rating) {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

export default function StorePage() {
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartCount, setCartCount] = useState(getCartQuantity());
  const [user, setUser] = useState(getCurrentUser());
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [addedProductId, setAddedProductId] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderResetKey, setSliderResetKey] = useState(0);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((item) => {
      const searchableText = `${item.title} ${item.category} ${
        categoryLabelByValue[item.category] || ""
      }`.toLowerCase();
      const matchesTerm = !term || searchableText.includes(term);
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesTerm && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const popularProducts = useMemo(() => {
    const categoryProducts =
      selectedCategory === "all"
        ? products
        : products.filter((item) => item.category === selectedCategory);

    return [...categoryProducts]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [products, selectedCategory]);

  const activePopularProduct =
    popularProducts[currentSlide] || popularProducts[0] || null;

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getJson("/api/products");
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
        setProductsError(error.message || "Unable to load products right now.");
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setToastMessage("");
    }, 1300);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!popularProducts.length) {
      setCurrentSlide(0);
      return undefined;
    }

    setCurrentSlide((prev) => (prev >= popularProducts.length ? 0 : prev));

    if (popularProducts.length === 1) {
      return undefined;
    }

    const sliderTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % popularProducts.length);
    }, 3500);

    return () => clearInterval(sliderTimer);
  }, [popularProducts, sliderResetKey]);

  const handleAddToCart = (productId) => {
    const selectedProduct = products.find((item) => item.id === productId);
    if (!selectedProduct) {
      return;
    }

    const cart = getStoredCart();
    const existingIndex = cart.findIndex((item) => item.id === productId);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: selectedProduct.id,
        title: selectedProduct.title,
        price: selectedProduct.price,
        image: selectedProduct.image,
        quantity: 1,
      });
    }

    saveCart(cart);
    setCartCount(getCartQuantity());
    setAddedProductId(productId);
    setToastMessage(`${selectedProduct.title} added to cart`);

    setTimeout(() => {
      setAddedProductId(null);
    }, 800);
  };

  const handleAccountClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsAccountOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    setIsAccountOpen(false);
    navigate("/login");
  };

  const handlePrevSlide = () => {
    if (!popularProducts.length) {
      return;
    }

    setCurrentSlide(
      (prev) => (prev - 1 + popularProducts.length) % popularProducts.length,
    );
    setSliderResetKey((prev) => prev + 1);
  };

  const handleNextSlide = () => {
    if (!popularProducts.length) {
      return;
    }

    setCurrentSlide((prev) => (prev + 1) % popularProducts.length);
    setSliderResetKey((prev) => prev + 1);
  };

  const handleGoToSlide = (index) => {
    setCurrentSlide(index);
    setSliderResetKey((prev) => prev + 1);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const productsSection = document.getElementById("products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const accountSmallText = user
    ? `Hello, ${user.name || user.email || "Member"}${user.isAdmin ? " (Admin)" : ""}`
    : "Hello, Cafe Guest";
  const accountBoldText = user ? "Account" : "Account & Lists";

  return (
    <div>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/35 backdrop-blur">
        <div className="mx-auto grid w-[95%] max-w-[1400px] grid-cols-2 gap-2 py-3 sm:gap-3 md:grid-cols-[180px_1fr_170px_90px] md:items-center md:gap-2">
          <Link
            to="/"
            className="order-1 text-xl font-extrabold tracking-wide sm:text-2xl md:order-none"
          >
            <span>Cafe</span>
            <span className="text-amber-400">Lux</span>
          </Link>

          <form
            className="order-3 col-span-2 grid h-10 grid-cols-[84px_1fr_44px] overflow-hidden rounded-md sm:h-11 sm:grid-cols-[90px_1fr_48px] md:order-none md:col-span-1"
            onSubmit={handleSearchSubmit}
          >
            <select
              className="border-0 bg-slate-800 px-2 text-sm text-slate-200 outline-none"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              aria-label="Search category"
            >
              {categories.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <input
              className="border-0 bg-slate-900 px-3 text-sm outline-none"
              type="text"
              placeholder="Search cafe food"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search cafe food"
            />
            <button
              type="submit"
              className="border-0 bg-amber-400 text-lg font-bold text-slate-900 hover:bg-amber-500"
              aria-label="Search"
            >
              🔍
            </button>
          </form>

          <div
            className="relative order-4 col-span-2 md:order-none md:col-span-1"
            ref={accountMenuRef}
          >
            <button
              type="button"
              className="w-full rounded border border-transparent px-2 py-1 text-left hover:border-slate-200"
              onClick={handleAccountClick}
            >
              <span className="block truncate text-[11px] text-slate-300">
                {accountSmallText}
              </span>
              <span className="block text-sm font-bold">{accountBoldText}</span>
            </button>

            {user && isAccountOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[60] rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl md:left-auto md:right-0 md:min-w-36">
                {user.isAdmin ? (
                  <Link
                    to="/admin"
                    className="mb-1 block rounded-md px-3 py-2 text-sm font-semibold hover:bg-slate-800"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountOpen(false);
                      navigate("/orders");
                    }}
                    className="mb-1 block w-full rounded-md px-3 py-2 text-left text-sm font-semibold hover:bg-slate-800"
                  >
                    Orders
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-md bg-amber-400 px-3 py-2 text-sm font-bold text-slate-900 hover:bg-amber-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="order-2 justify-self-end rounded border border-transparent px-2 py-1 text-center text-base font-bold hover:border-slate-200 sm:text-lg md:order-none md:justify-self-auto"
            aria-label="Shopping cart"
          >
            🛒 <span className="text-amber-400">{cartCount}</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="w-full">
          {!activePopularProduct ? (
            <div className="mx-auto w-[95%] max-w-[1400px] rounded-xl border border-slate-700 bg-slate-900 p-5">
              <strong>Loading popular products...</strong>
            </div>
          ) : (
            <article className="relative h-[68vh] min-h-[420px] overflow-hidden border-b border-slate-700 bg-slate-900 sm:h-[74vh] sm:min-h-[500px] md:h-[calc(100vh-76px)] md:min-h-[520px]">
              <img
                src={activePopularProduct.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 z-0 h-full w-full object-cover opacity-40 blur-sm"
              />
              <img
                src={activePopularProduct.image}
                alt={activePopularProduct.title}
                className="absolute inset-0 z-10 h-full w-full object-cover md:object-contain"
              />

              <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute inset-0 z-30 flex items-end">
                <div className="mx-auto w-[95%] max-w-[1400px] pb-10 sm:pb-16">
                  <p className="text-xs uppercase tracking-wide text-slate-100">
                    Popular Now
                  </p>
                  <h1 className="mt-1 max-w-2xl text-2xl font-extrabold text-slate-100 sm:text-4xl md:text-5xl">
                    {activePopularProduct.title}
                  </h1>
                  <p className="mt-2 text-sm text-slate-100 sm:text-base">
                    Category: {activePopularProduct.category} ·{" "}
                    {formatPrice(activePopularProduct.price)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(activePopularProduct.id)}
                    disabled={addedProductId === activePopularProduct.id}
                    className="mt-5 inline-block rounded-lg bg-amber-400 px-6 py-3 font-bold text-slate-900 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {addedProductId === activePopularProduct.id
                      ? "Added ✓"
                      : "Add to Cart"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-slate-300/70 bg-slate-950/60 px-3 py-2 text-base font-bold text-slate-100 hover:border-amber-400 sm:left-4 sm:px-4 sm:py-3 sm:text-xl"
                aria-label="Previous popular product"
              >
                ←
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-slate-300/70 bg-slate-950/60 px-3 py-2 text-base font-bold text-slate-100 hover:border-amber-400 sm:right-4 sm:px-4 sm:py-3 sm:text-xl"
                aria-label="Next popular product"
              >
                →
              </button>

              <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 sm:bottom-6">
                {popularProducts.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleGoToSlide(index)}
                    className={`h-2.5 w-2.5 rounded-full border ${
                      currentSlide === index
                        ? "border-amber-400 bg-amber-400"
                        : "border-slate-400 bg-slate-700/70 hover:border-slate-200"
                    }`}
                    aria-label={`Go to popular product ${index + 1}`}
                  />
                ))}
              </div>
            </article>
          )}
        </section>

        <section
          id="products"
          className="mx-auto mb-8 mt-5 w-[95%] max-w-[1400px]"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold sm:text-2xl">Cafe Menu</h2>
            <span className="text-sm text-slate-400 sm:text-base">
              {filteredProducts.length} item
              {filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {productsLoading ? (
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
              <strong>Loading products...</strong>
            </div>
          ) : productsError ? (
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
              <strong>Unable to load products.</strong>
              <p className="mt-2 text-rose-400">{productsError}</p>
            </div>
          ) : !filteredProducts.length ? (
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-5">
              <strong>No menu items found.</strong>
              <p className="mt-2 text-slate-400">
                Try changing your search term or category.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 transition hover:-translate-y-1 hover:shadow-lg cursor-pointer group"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-44 w-full object-cover grayscale-[28%] group-hover:grayscale-[15%] transition"
                      loading="lazy"
                    />
                  </Link>
                  <div className="p-3">
                    <Link
                      to={`/product/${product.id}`}
                      className="hover:text-amber-400 transition"
                    >
                      <h3 className="min-h-11 text-sm font-semibold">
                        {product.title}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold text-amber-400">
                        {createStars(product.rating)}
                      </span>
                      <span className="font-extrabold">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddToCart(product.id)}
                      className="mt-3 w-full rounded-full bg-amber-400 py-2 font-bold text-slate-900 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-80"
                      disabled={addedProductId === product.id}
                    >
                      {addedProductId === product.id
                        ? "Added ✓"
                        : "Add to Cart"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-slate-900 py-8">
        <div className="mx-auto grid w-[95%] max-w-[1400px] grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-base font-bold">About Cafe</h3>
            <Link
              to="/"
              className="mt-2 block text-sm text-slate-300 hover:underline"
            >
              Careers
            </Link>
            <Link
              to="/"
              className="mt-2 block text-sm text-slate-300 hover:underline"
            >
              Cafe Journal
            </Link>
            <Link
              to="/"
              className="mt-2 block text-sm text-slate-300 hover:underline"
            >
              Our Story
            </Link>
          </div>
          <div>
            <h3 className="text-base font-bold">Cafe Partners</h3>
            <Link
              to="/"
              className="mt-2 block text-sm text-slate-300 hover:underline"
            >
              Sell your products
            </Link>
            <Link
              to="/"
              className="mt-2 block text-sm text-slate-300 hover:underline"
            >
              Affiliate program
            </Link>
            <Link
              to="/"
              className="mt-2 block text-sm text-slate-300 hover:underline"
            >
              Advertise your brand
            </Link>
          </div>
          <div>
            <h3 className="text-base font-bold">Cafe Support</h3>
            <Link
              to="/"
              className="mt-2 block text-sm text-slate-300 hover:underline"
            >
              Your account
            </Link>
            <Link
              to="/"
              className="mt-2 block text-sm text-slate-300 hover:underline"
            >
              Shipping &amp; delivery
            </Link>
            <Link
              to="/"
              className="mt-2 block text-sm text-slate-300 hover:underline"
            >
              Returns
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-6 w-[95%] max-w-[1400px] border-t border-slate-700 pt-4 text-center text-sm text-slate-400">
          © 2026 Cafe. Demo storefront.
        </p>
      </footer>

      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold shadow-xl sm:bottom-5 sm:left-auto sm:right-5 sm:w-auto sm:translate-x-0">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
