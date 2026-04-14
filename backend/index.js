const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = Number(process.env.PORT || 5000);
const CORS_ORIGIN = String(process.env.CORS_ORIGIN || "*").trim();
const ADMIN_EMAIL = "admin@xyz.com";
const ADMIN_PASSWORD = "123456";
const ORDER_STATUSES = new Set(["processing", "making", "ready", "complete"]);

const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");
const productsFile = path.join(dataDir, "products.json");
const ordersFile = path.join(dataDir, "orders.json");

const seededProducts = [
  {
    id: 1,
    title: "Classic Cappuccino",
    category: "coffee",
    price: 149,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "Iced Caramel Latte",
    category: "drinks",
    price: 179,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "Mocha Hazelnut",
    category: "coffee",
    price: 189,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1494314671902-399b18174975?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "Cold Brew Tonic",
    category: "drinks",
    price: 159,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    title: "Paneer Club Sandwich",
    category: "sandwiches",
    price: 219,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    title: "Pesto Veg Sandwich",
    category: "sandwiches",
    price: 209,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    title: "Butter Croissant",
    category: "pastries",
    price: 129,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    title: "Chocolate Danish",
    category: "pastries",
    price: 139,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 9,
    title: "Greek Salad Bowl",
    category: "salads",
    price: 199,
    rating: 4.1,
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 10,
    title: "Caesar Crunch Salad",
    category: "salads",
    price: 229,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 11,
    title: "Vanilla Frappe",
    category: "drinks",
    price: 189,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 12,
    title: "Signature Espresso",
    category: "coffee",
    price: 119,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80",
  },
];

function ensureDataFile(filePath, initialValue) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(initialValue, null, 2));
  }
}

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function adminAuthorized(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: Boolean(user.isAdmin),
  };
}

function seed() {
  ensureDataFile(usersFile, []);
  ensureDataFile(productsFile, seededProducts);
  ensureDataFile(ordersFile, []);
}

seed();

const corsOrigins =
  CORS_ORIGIN === "*"
    ? "*"
    : CORS_ORIGIN.split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

app.use(cors({ origin: corsOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Cafe backend running" });
});

app.get("/api/products", (req, res) => {
  const products = readJson(productsFile);
  res.json({ products });
});

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body || {};
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const normalizedName = String(name || "").trim();

  if (!normalizedName || !normalizedEmail || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }

  if (String(password).length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  const users = readJson(usersFile);
  if (users.some((u) => u.email === normalizedEmail)) {
    return res
      .status(409)
      .json({ message: "An account with this email already exists." });
  }

  const user = {
    _id: `u_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    name: normalizedName,
    email: normalizedEmail,
    password: String(password),
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeJson(usersFile, users);

  return res.status(201).json({ user: publicUser(user) });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const users = readJson(usersFile);
  const user = users.find(
    (u) => u.email === normalizedEmail && u.password === String(password || ""),
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  return res.json({ user: publicUser(user) });
});

app.post("/api/orders", (req, res) => {
  const { userEmail, products } = req.body || {};
  const normalizedEmail = String(userEmail || "")
    .trim()
    .toLowerCase();
  const cartItems = Array.isArray(products) ? products : [];

  if (!normalizedEmail) {
    return res.status(400).json({ message: "User email is required." });
  }

  if (!cartItems.length) {
    return res.status(400).json({ message: "Cart is empty." });
  }

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  const orders = readJson(ordersFile);
  const orderNumber = `CLX-${1000 + orders.length + 1}`;

  const order = {
    _id: `o_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    orderNo: orderNumber,
    userEmail: normalizedEmail,
    products: cartItems,
    total,
    status: "processing",
    createdAt: new Date().toISOString(),
  };

  orders.unshift(order);
  writeJson(ordersFile, orders);

  return res.status(201).json({ order });
});

app.post("/api/orders/my-orders", (req, res) => {
  const { userEmail } = req.body || {};
  const normalizedEmail = String(userEmail || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "User email is required." });
  }

  const orders = readJson(ordersFile).filter(
    (order) => order.userEmail === normalizedEmail,
  );
  return res.json({ orders });
});

app.post("/api/admin/users", (req, res) => {
  const { email, password } = req.body || {};
  if (!adminAuthorized(email, password)) {
    return res.status(401).json({ message: "Unauthorized admin request." });
  }

  const users = readJson(usersFile).map(publicUser);
  return res.json({ users });
});

app.post("/api/admin/orders", (req, res) => {
  const { email, password } = req.body || {};
  if (!adminAuthorized(email, password)) {
    return res.status(401).json({ message: "Unauthorized admin request." });
  }

  const orders = readJson(ordersFile);
  return res.json({ orders });
});

app.put("/api/admin/orders/:orderId/status", (req, res) => {
  const { orderId } = req.params;
  const { email, password, status } = req.body || {};

  if (!adminAuthorized(email, password)) {
    return res.status(401).json({ message: "Unauthorized admin request." });
  }

  if (!ORDER_STATUSES.has(String(status || "").toLowerCase())) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  const orders = readJson(ordersFile);
  const index = orders.findIndex((item) => item._id === orderId);
  if (index < 0) {
    return res.status(404).json({ message: "Order not found." });
  }

  orders[index].status = String(status).toLowerCase();
  writeJson(ordersFile, orders);

  return res.json({ order: orders[index] });
});

app.post("/api/admin/products", (req, res) => {
  const { email, password, title, category, price, rating, image } =
    req.body || {};
  if (!adminAuthorized(email, password)) {
    return res.status(401).json({ message: "Unauthorized admin request." });
  }

  if (!title || !category) {
    return res
      .status(400)
      .json({ message: "Title and category are required." });
  }

  const products = readJson(productsFile);
  const nextId =
    products.reduce((max, item) => Math.max(max, Number(item.id || 0)), 0) + 1;

  const product = {
    id: nextId,
    title: String(title).trim(),
    category: String(category).trim().toLowerCase(),
    price: Number(price || 0),
    rating: Number(rating || 0),
    image: String(image || "").trim(),
  };

  products.push(product);
  writeJson(productsFile, products);

  return res.status(201).json({ product });
});

app.put("/api/admin/products/:productId", (req, res) => {
  const { productId } = req.params;
  const { email, password, title, category, price, rating, image } =
    req.body || {};

  if (!adminAuthorized(email, password)) {
    return res.status(401).json({ message: "Unauthorized admin request." });
  }

  const products = readJson(productsFile);
  const targetId = Number(productId);
  const index = products.findIndex((item) => Number(item.id) === targetId);

  if (index < 0) {
    return res.status(404).json({ message: "Product not found." });
  }

  products[index] = {
    ...products[index],
    title: String(title || products[index].title).trim(),
    category: String(category || products[index].category)
      .trim()
      .toLowerCase(),
    price: Number(price ?? products[index].price),
    rating: Number(rating ?? products[index].rating),
    image: String(image || products[index].image).trim(),
  };

  writeJson(productsFile, products);
  return res.json({ product: products[index] });
});

app.delete("/api/admin/products/:productId", (req, res) => {
  const { productId } = req.params;
  const { email, password } = req.body || {};

  if (!adminAuthorized(email, password)) {
    return res.status(401).json({ message: "Unauthorized admin request." });
  }

  const targetId = Number(productId);
  const products = readJson(productsFile);
  const exists = products.some((item) => Number(item.id) === targetId);

  if (!exists) {
    return res.status(404).json({ message: "Product not found." });
  }

  const filtered = products.filter((item) => Number(item.id) !== targetId);
  writeJson(productsFile, filtered);

  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
