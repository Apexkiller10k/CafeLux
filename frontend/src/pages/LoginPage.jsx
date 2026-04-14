import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { postJson } from "../utils/api";
import { setCurrentUser } from "../utils/storage";
import backIcon from "../assets/back.png";

const ADMIN_EMAIL = "admin@xyz.com";
const ADMIN_PASSWORD = "123456";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState("");

  const showMessage = (text, kind = "") => {
    setMessage(text);
    setMessageKind(kind);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      showMessage("Please enter your email and password.", "error");
      return;
    }

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setCurrentUser({
        name: "Admin",
        email: ADMIN_EMAIL,
        address: "Head Office",
        isAdmin: true,
      });

      showMessage(
        "Admin login successful. Redirecting to dashboard...",
        "success",
      );
      setTimeout(() => navigate("/admin"), 700);
      return;
    }

    try {
      const data = await postJson("/api/auth/login", {
        email: normalizedEmail,
        password,
      });

      setCurrentUser(data.user);

      showMessage("Welcome back. Redirecting to store...", "success");
      setTimeout(() => navigate("/"), 900);
    } catch (error) {
      showMessage(error.message || "Unable to sign in right now.", "error");
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-slate-900 to-slate-950 p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:p-6">
        <Link to="/" className="text-xl font-extrabold sm:text-2xl">
          <span>Cafe</span>
          <span className="text-amber-400">Lux</span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Sign in</h1>
        <p className="mt-2 text-slate-400">Access your Cafe account</p>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
          <label htmlFor="loginEmail" className="text-sm font-semibold">
            Email
          </label>
          <input
            id="loginEmail"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
            required
          />

          <label htmlFor="loginPassword" className="text-sm font-semibold">
            Password
          </label>
          <input
            id="loginPassword"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
            required
          />

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-amber-400 px-4 py-2.5 font-bold text-slate-900 hover:bg-amber-500"
          >
            Login
          </button>
        </form>

        <p
          className={`mt-4 min-h-5 text-sm font-semibold ${
            messageKind === "success"
              ? "text-emerald-400"
              : messageKind === "error"
                ? "text-rose-400"
                : "text-slate-400"
          }`}
        >
          {message}
        </p>

        <p className="mt-3 text-sm text-slate-400">
          New to Cafe?{" "}
          <Link to="/signup" className="text-amber-400 hover:underline">
            Create account
          </Link>
        </p>
        <Link
          to="/"
          className="mt-3 inline-flex items-center gap-2 text-sm text-slate-400 hover:underline"
        >
          <img src={backIcon} alt="" aria-hidden="true" className="h-4 w-4" />
          <span>Back to Store</span>
        </Link>
      </section>
    </main>
  );
}
