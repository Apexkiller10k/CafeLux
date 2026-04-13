import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postJson } from '../utils/api';
import { setCurrentUser } from '../utils/storage';

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [messageKind, setMessageKind] = useState('');

  const showMessage = (text, kind = '') => {
    setMessage(text);
    setMessageKind(kind);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const inputPassword = password;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    const nextFieldErrors = {
      name: '',
      email: '',
      password: ''
    };

    if (!trimmedName) {
      nextFieldErrors.name = 'Full name is required.';
    }

    if (!normalizedEmail) {
      nextFieldErrors.email = 'Email is required.';
    } else if (!isValidEmail) {
      nextFieldErrors.email = 'Please enter a valid email address.';
    }

    if (!inputPassword) {
      nextFieldErrors.password = 'Password is required.';
    } else if (inputPassword.length < 6) {
      nextFieldErrors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.name || nextFieldErrors.email || nextFieldErrors.password) {
      showMessage('Please fix the highlighted fields.', 'error');
      return;
    }

    try {
      const data = await postJson('/api/auth/signup', {
        name: trimmedName,
        email: normalizedEmail,
        password: inputPassword
      });

      setCurrentUser(data.user);

      showMessage('Account created. Redirecting to store...', 'success');
      setTimeout(() => navigate('/'), 900);
    } catch (error) {
      showMessage(error.message || 'Unable to create account right now.', 'error');
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-slate-900 to-slate-950 p-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl sm:p-6">
        <Link to="/" className="text-xl font-extrabold sm:text-2xl">
          <span>Cafe</span>
          <span className="text-amber-400">Lux</span>
        </Link>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Create account</h1>
        <p className="mt-2 text-slate-400">Join Cafe to save favorites and orders</p>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-3" noValidate>
          <label htmlFor="signupName" className="text-sm font-semibold">
            Full name
          </label>
          <input
            id="signupName"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (message) {
                setMessage('');
                setMessageKind('');
              }
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: '' }));
              }
            }}
            placeholder="Your full name"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
          />
          {fieldErrors.name && <p className="-mt-2 text-xs font-semibold text-rose-400">{fieldErrors.name}</p>}

          <label htmlFor="signupEmail" className="text-sm font-semibold">
            Email
          </label>
          <input
            id="signupEmail"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (message) {
                setMessage('');
                setMessageKind('');
              }
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: '' }));
              }
            }}
            placeholder="you@example.com"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
          />
          {fieldErrors.email && (
            <p className="-mt-2 text-xs font-semibold text-rose-400">{fieldErrors.email}</p>
          )}

          <label htmlFor="signupPassword" className="text-sm font-semibold">
            Password
          </label>
          <input
            id="signupPassword"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (message) {
                setMessage('');
                setMessageKind('');
              }
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: '' }));
              }
            }}
            placeholder="At least 6 characters"
            minLength={6}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-400"
          />
          {fieldErrors.password && (
            <p className="-mt-2 text-xs font-semibold text-rose-400">{fieldErrors.password}</p>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-amber-400 px-4 py-2.5 font-bold text-slate-900 hover:bg-amber-500"
          >
            Sign up
          </button>
        </form>

        <p
          className={`mt-4 min-h-5 text-sm font-semibold ${
            messageKind === 'success'
              ? 'text-emerald-400'
              : messageKind === 'error'
                ? 'text-rose-400'
                : 'text-slate-400'
          }`}
        >
          {message}
        </p>

        <p className="mt-3 text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:underline">
            Sign in
          </Link>
        </p>
        <Link to="/" className="mt-3 inline-block text-sm text-slate-400 hover:underline">
          ← Back to Store
        </Link>
      </section>
    </main>
  );
}