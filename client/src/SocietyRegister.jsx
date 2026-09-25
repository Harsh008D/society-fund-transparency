
import { useState } from "react";
import "./SocietyRegister.css";

function SocietyRegister({ onRegister, onBackToLogin }) {
  const [form, setForm] = useState({
    societyName: "",
    address: "",
    adminName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://society-fund-transparency.onrender.com/api/society/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Society registration failed"
        );
      }

      onRegister(data.token);
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="society-register-page">
      <div className="society-register-card">
        <h1>Create Your Society</h1>
        <p>
          Register your society and create its administrator
          account.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Society name</label>
          <input
            name="societyName"
            placeholder="e.g. Green Valley Society"
            value={form.societyName}
            onChange={handleChange}
            required
          />

          <label>Society address</label>
          <input
            name="address"
            placeholder="Enter society address"
            value={form.address}
            onChange={handleChange}
            required
          />

          <label>Admin full name</label>
          <input
            name="adminName"
            placeholder="Enter your full name"
            value={form.adminName}
            onChange={handleChange}
            required
          />

          <label>Admin email</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          {error && (
            <p className="society-register-error">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Creating society..."
              : "Create Society"}
          </button>
        </form>

        <button
          type="button"
          className="back-login-button"
          onClick={onBackToLogin}
        >
          Already registered? Sign in
        </button>
      </div>
    </div>
  );
}

export default SocietyRegister;