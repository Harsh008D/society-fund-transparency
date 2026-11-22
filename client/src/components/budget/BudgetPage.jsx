import { useEffect, useState } from "react";
import "../../styles/budget.css";

const API_URL = "http://https://society-fund-transparency.onrender.com/api/budgets";

const CATEGORIES = [
  "Maintenance",
  "Electricity",
  "Water",
  "Security",
  "Cleaning",
  "Repairs",
  "Events",
  "Other",
];

const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

function BudgetPage({ token, currentUser }) {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [financialYear, setFinancialYear] = useState(() => {
    const y = new Date().getFullYear();
    return new Date().getMonth() >= 3 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    category: "Maintenance",
    annualAllocation: "",
    monthlyAllocations: Array(12).fill(""),
    carryForwardEnabled: true,
  });

  const isAdmin = currentUser?.role === "admin";
  const canViewHistory = ["admin", "committee"].includes(currentUser?.role);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_URL}?financialYear=${financialYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to load budgets");
      setBudgets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBudgets();
  }, [token, financialYear]);

  const totalAllocated = budgets.reduce(
    (s, b) => s + Number(b.annualAllocation || 0),
    0
  );
  const totalSpent = budgets.reduce(
    (s, b) => s + Number(b.actualSpent || 0),
    0
  );
  const totalRemaining = totalAllocated - totalSpent;
  const percentage = totalAllocated
    ? Math.round((totalSpent / totalAllocated) * 100)
    : 0;

  const openCreate = () => {
    setEditing(null);
    setForm({
      category:
        CATEGORIES.find((c) => !budgets.some((b) => b.category === c)) ||
        "Maintenance",
      annualAllocation: "",
      monthlyAllocations: Array(12).fill(""),
      carryForwardEnabled: true,
    });
    setShowForm(true);
  };

  const openEdit = (budget) => {
    setEditing(budget);
    const monthly = Array(12).fill("");
    budget.monthlyAllocations.forEach((item) => {
      monthly[item.month - 1] = String(item.amount);
    });
    setForm({
      category: budget.category,
      annualAllocation: String(budget.annualAllocation),
      monthlyAllocations: monthly,
      carryForwardEnabled: budget.carryForwardEnabled,
    });
    setShowForm(true);
  };

  const updateMonth = (index, value) => {
    const updated = [...form.monthlyAllocations];
    updated[index] = value;
    setForm({ ...form, monthlyAllocations: updated });
  };

  const saveBudget = async (e) => {
    e.preventDefault();
    const annual = Number(form.annualAllocation);
    const monthly = form.monthlyAllocations.map((amount, index) => ({
      month: index + 1,
      amount: Number(amount || 0),
    }));
    if (!form.annualAllocation || monthly.some((m) => m.amount < 0)) {
      alert("Enter a valid annual and monthly allocation.");
      return;
    }
    const sum = monthly.reduce((s, m) => s + m.amount, 0);
    if (Math.abs(sum - annual) > 0.01) {
      alert("The total of all 12 months must equal the annual allocation.");
      return;
    }

    try {
      const res = await fetch(editing ? `${API_URL}/${editing._id}` : API_URL, {
        method: editing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            ...form,
            financialYear,
            annualAllocation: annual,
            monthlyAllocations: monthly,
          }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not save budget");
      setShowForm(false);
      await fetchBudgets();
      alert(data.message || "Budget saved successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteBudget = async (budget) => {
    if (!window.confirm(`Delete ${budget.category} budget?`)) return;
    try {
      const res = await fetch(`${API_URL}/${budget._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setSelected(null);
      await fetchBudgets();
    } catch (err) {
      alert(err.message);
    }
  };

  const showHistory = async (budget) => {
    try {
      const res = await fetch(`${API_URL}/${budget._id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "History unavailable");
      setHistory(data.history || []);
      setSelected(budget);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <section className="budget-page">
      <div className="budget-page-header">
        <div>
          <p className="budget-eyebrow">FINANCIAL MANAGEMENT</p>
          <h2>Budget Management</h2>
          <p>Plan, monitor and manage your society's annual budgets.</p>
        </div>
        <div className="budget-header-actions">
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
          >
            {[2025, 2026, 2027, 2028, 2029].map((y) => (
              <option key={y} value={`${y}-${y + 1}`}>
                {y}-{y + 1}
              </option>
            ))}
          </select>
          {isAdmin && (
            <button className="budget-primary-btn" onClick={openCreate}>
              + Create Budget
            </button>
          )}
        </div>
      </div>

      {error && <p className="budget-error">{error}</p>}
      {loading ? (
        <p>Loading budgets...</p>
      ) : (
        <>
          <div className="budget-summary-grid">
            <div className="budget-summary-card">
              <span>Total Allocation</span>
              <h3>{money(totalAllocated)}</h3>
            </div>
            <div className="budget-summary-card">
              <span>Actual Spending</span>
              <h3>{money(totalSpent)}</h3>
            </div>
            <div className="budget-summary-card">
              <span>Remaining Budget</span>
              <h3>{money(totalRemaining)}</h3>
            </div>
            <div className="budget-summary-card">
              <span>Budget Utilization</span>
              <h3>{percentage}%</h3>
              <div className="budget-progress">
                <div style={{ width: `${Math.min(percentage, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="budget-section-heading">
            <div>
              <h3>Category Budgets</h3>
              <p>Financial year {financialYear}</p>
            </div>
          </div>

          {budgets.length === 0 ? (
            <div className="budget-empty">
              <h3>No budgets found</h3>
              <p>No budgets have been created for {financialYear}.</p>
              {isAdmin && (
                <button className="budget-primary-btn" onClick={openCreate}>
                  Create your first budget
                </button>
              )}
            </div>
          ) : (
            <div className="budget-list">
              {budgets.map((budget) => (
                <div className="budget-card" key={budget._id}>
                  <div className="budget-card-top">
                    <h3>{budget.category}</h3>
                    <span>{Number(budget.spendingPercentage || 0)}% used</span>
                  </div>
                  <div className="budget-progress">
                    <div
                      style={{
                        width: `${Math.min(
                          budget.spendingPercentage || 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="budget-card-values">
                    <div>
                      <small>Allocated</small>
                      <strong>{money(budget.annualAllocation)}</strong>
                    </div>
                    <div>
                      <small>Spent</small>
                      <strong>{money(budget.actualSpent)}</strong>
                    </div>
                    <div>
                      <small>Remaining</small>
                      <strong>{money(budget.remainingBudget)}</strong>
                    </div>
                  </div>
                  <div className="budget-card-actions">
                    <button
                      onClick={() =>
                        setSelected(
                          selected?._id === budget._id ? null : budget
                        )
                      }
                    >
                      {selected?._id === budget._id
                        ? "Hide details"
                        : "Monthly details"}
                    </button>
                    {canViewHistory && (
                      <button onClick={() => showHistory(budget)}>
                        History
                      </button>
                    )}
                    {isAdmin && (
                      <>
                        <button onClick={() => openEdit(budget)}>Edit</button>
                        <button
                          className="budget-delete-btn"
                          onClick={() => deleteBudget(budget)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                  {selected?._id === budget._id && (
                    <div className="budget-monthly">
                      <h4>Monthly Breakdown</h4>
                      <div className="budget-table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Month</th>
                              <th>Allocated</th>
                              <th>Carry In</th>
                              <th>Available</th>
                              <th>Spent</th>
                              <th>Remaining</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(budget.monthlyBreakdown || []).map((m) => (
                              <tr key={m.month}>
                                <td>{m.monthName}</td>
                                <td>{money(m.allocated)}</td>
                                <td>{money(m.carryForwardIn)}</td>
                                <td>{money(m.availableBudget)}</td>
                                <td>{money(m.spent)}</td>
                                <td>{money(m.remaining)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="budget-note">
                        Carry-forward:{" "}
                        {budget.carryForwardEnabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="budget-modal-backdrop">
          <form className="budget-modal" onSubmit={saveBudget}>
            <div className="budget-modal-header">
              <h3>{editing ? "Edit Budget" : "Create Budget"}</h3>
              <button type="button" onClick={() => setShowForm(false)}>
                ✕
              </button>
            </div>
            <label>Category</label>
            <select
              value={form.category}
              disabled={!!editing}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <label>Annual Allocation (₹)</label>
            <input
              type="number"
              min="0"
              required
              value={form.annualAllocation}
              onChange={(e) =>
                setForm({ ...form, annualAllocation: e.target.value })
              }
            />
            <div className="budget-month-inputs">
              {MONTHS.map((month, i) => (
                <div key={month}>
                  <label>{month}</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.monthlyAllocations[(i + 3) % 12]}
                    onChange={(e) => updateMonth((i + 3) % 12, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <label className="budget-checkbox">
              <input
                type="checkbox"
                checked={form.carryForwardEnabled}
                onChange={(e) =>
                  setForm({ ...form, carryForwardEnabled: e.target.checked })
                }
              />
              Enable monthly carry-forward
            </label>
            <p className="budget-note">
              Monthly total:{" "}
              {money(
                form.monthlyAllocations.reduce((s, n) => s + Number(n || 0), 0)
              )}{" "}
              | Annual: {money(form.annualAllocation)}
            </p>
            <div className="budget-modal-actions">
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="budget-primary-btn">
                Save Budget
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && history.length > 0 && canViewHistory && (
        <div className="budget-history-panel">
          <div className="budget-section-heading">
            <h3>{selected.category} Allocation History</h3>
            <button
              onClick={() => {
                setHistory([]);
                setSelected(null);
              }}
            >
              Close
            </button>
          </div>
          {history.map((item, i) => (
            <div className="budget-history-item" key={i}>
              <strong>{item.action}</strong>
              <span>{new Date(item.changedAt).toLocaleString("en-IN")}</span>
              <p>
                {money(item.previousAnnualAllocation)} →{" "}
                {money(item.newAnnualAllocation)}
              </p>
              <small>Changed by: {item.changedBy?.name || "User"}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default BudgetPage;
